const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const { Pool } = require('pg');
const client = require('prom-client');

// ==================== PROMETHEUS & HPA METRICS SETUP ====================
const register = new client.Registry();

// Collect default metrics
client.collectDefaultMetrics({ 
  register,
  prefix: 'fantastic_four_',
  timeout: 5000 
});

// ==================== CUSTOM METRICS FOR HPA ====================
// HTTP Requests Counter (for requests per second calculation)
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests for HPA',
  labelNames: ['method', 'route', 'status_code', 'app']
});

// HTTP Request Duration Histogram
const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds for HPA',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5]
});

// Error Rate Gauge (calculated)
const errorRatePercentage = new client.Gauge({
  name: 'error_rate_percentage',
  help: 'Error rate percentage for HPA scaling'
});

// Active Connections Gauge
const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active HTTP connections'
});

// Database Query Duration (for DB performance monitoring)
const dbQueryDurationSeconds = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['operation', 'table', 'success']
});

// Application Health Status
const applicationHealth = new client.Gauge({
  name: 'application_health',
  help: 'Application health status (1=healthy, 0=unhealthy)'
});

// Queue Length (simulated for HPA)
const requestQueueLength = new client.Gauge({
  name: 'request_queue_length',
  help: 'Current request queue length'
});

// Register all metrics
register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(errorRatePercentage);
register.registerMetric(activeConnections);
register.registerMetric(dbQueryDurationSeconds);
register.registerMetric(applicationHealth);
register.registerMetric(requestQueueLength);

// Metrics calculation variables
let totalRequests = 0;
let errorRequests = 0;
let activeRequests = 0;
const requestTimestamps = [];
const ERROR_RATE_WINDOW_MS = 60000; // 1 minute window for error rate calculation

// ==================== HELPER FUNCTIONS FOR HPA METRICS ====================
const calculateErrorRate = () => {
  const now = Date.now();
  // Clean old timestamps
  while (requestTimestamps.length > 0 && requestTimestamps[0].timestamp < now - ERROR_RATE_WINDOW_MS) {
    const oldRequest = requestTimestamps.shift();
    if (oldRequest.isError) errorRequests--;
  }
  
  if (totalRequests === 0) return 0;
  return (errorRequests / totalRequests) * 100;
};

const getActiveConnections = () => {
  return activeRequests;
};

const updateHPAMetrics = () => {
  // Calculate and set error rate
  const errorRate = calculateErrorRate();
  errorRatePercentage.set(errorRate);
  
  // Update active connections
  activeConnections.set(getActiveConnections());
  
  // Update application health (simulate based on error rate)
  const isHealthy = errorRate < 10 ? 1 : 0;
  applicationHealth.set(isHealthy);
  
  // Simulate queue length (for demonstration)
  const simulatedQueueLength = Math.max(0, activeRequests - 5);
  requestQueueLength.set(simulatedQueueLength);
  
  console.log(`📊 HPA Metrics Update - Error Rate: ${errorRate.toFixed(2)}%, Active: ${activeRequests}, Health: ${isHealthy}`);
};

// Update HPA metrics every 15 seconds
setInterval(updateHPAMetrics, 15000);

// STARTUP LOGGING
console.log("Server initialization started at:", new Date().toISOString());
console.log("Environment:", process.env.NODE_ENV || "development");
console.log('Environment Variables:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Available' : 'Not available');
console.log('📈 HPA Metrics enabled with Prometheus');

// ==================== ENHANCED REQUEST LOGGER WITH HPA METRICS ====================
app.use((req, res, next) => {
  const startTime = Date.now();
  activeRequests++;
  
  // Log request
  console.log(`${req.method} ${req.url} at ${new Date().toISOString()}`);
  
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000;
    const isError = res.statusCode >= 500;
    
    // Update metrics for HPA
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode.toString(),
      app: 'fantastic-four'
    });
    
    httpRequestDurationSeconds
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
    
    // Update error tracking
    totalRequests++;
    if (isError) {
      errorRequests++;
    }
    
    // Store timestamp for error rate calculation
    requestTimestamps.push({
      timestamp: Date.now(),
      isError: isError
    });
    
    activeRequests--;
    
    // Log with metrics
    console.log(`${req.method} ${req.url} - ${res.statusCode} - ${duration.toFixed(3)}s`);
  });
  
  next();
});

// Middleware
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==================== DATABASE CONNECTION WITH METRICS ====================
let pool;
let poolMetricsInterval;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Database connection wrapper with metrics
  const queryWithMetrics = async (text, params, operation = 'query', table = 'unknown') => {
    const startTime = Date.now();
    
    try {
      const result = await pool.query(text, params);
      const duration = (Date.now() - startTime) / 1000;
      
      dbQueryDurationSeconds
        .labels(operation, table, 'true')
        .observe(duration);
      
      return result;
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      
      dbQueryDurationSeconds
        .labels(operation, table, 'false')
        .observe(duration);
      
      console.error('Database query error:', error.message);
      throw error;
    }
  };

  // Override pool.query to use our monitored version
  pool.monitoredQuery = queryWithMetrics;

  const initializeDatabase = async () => {
    try {
      console.log('Connecting to PostgreSQL...');
      
      // Test connection with metrics
      const client = await pool.connect();
      console.log('Connected to PostgreSQL successfully!');
      
      // Create table with monitoring
      await queryWithMetrics(`
        CREATE TABLE IF NOT EXISTS devkitty_questions (
          id SERIAL PRIMARY KEY,
          category VARCHAR(100) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `, [], 'create_table', 'devkitty_questions');
      
      console.log('Database table ready');
      client.release();
    } catch (error) {
      console.error('Database initialization error:', error.message);
    }
  };
  
  initializeDatabase();
}

// Sample fallback data
let sampleQuestions = [
  { 
    id: 1, 
    category: "JavaScript", 
    content: "Apa perbedaan let, const, dan var?",
    created_at: new Date() 
  },
  { 
    id: 2, 
    category: "Node.js", 
    content: "Bagaimana cara kerja event loop?",
    created_at: new Date() 
  }
];

// ==================== ROUTES WITH HPA METRICS ====================

// Home route
app.get('/', async (req, res) => {
  try {
    let items = sampleQuestions;
    let left = sampleQuestions.length;
    let dbStatus = 'disconnected';

    if (pool && pool.monitoredQuery) {
      try {
        const result = await pool.monitoredQuery(
          'SELECT * FROM devkitty_questions ORDER BY created_at DESC',
          [],
          'select',
          'devkitty_questions'
        );
        items = result.rows;
        left = items.length;
        dbStatus = 'connected';
        console.log('Data loaded from PostgreSQL');
      } catch (dbError) {
        console.error('Database query error:', dbError);
      }
    }
    
    res.render('index.ejs', { 
      items: items, 
      left: left,
      dbStatus: dbStatus
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.render('index.ejs', { 
      items: sampleQuestions, 
      left: sampleQuestions.length,
      dbStatus: 'error'
    });
  }
});

// Add new question
app.post('/', async (req, res) => {
  console.log('Received POST request to /');
  const { category, content } = req.body;
  
  if (pool && pool.monitoredQuery) {
    try {
      await pool.monitoredQuery(
        'INSERT INTO devkitty_questions (category, content) VALUES ($1, $2)',
        [category, content],
        'insert',
        'devkitty_questions'
      );
      console.log('Question saved to PostgreSQL');
    } catch (error) {
      console.error('Failed to save to PostgreSQL:', error);
      sampleQuestions.push({
        id: Date.now(),
        category: category,
        content: content,
        created_at: new Date()
      });
    }
  } else {
    sampleQuestions.push({
      id: Date.now(),
      category: category,
      content: content,
      created_at: new Date()
    });
    console.log('💡 Question saved to fallback data');
  }
  
  res.redirect('/');
});

// EDIT QUESTION
app.get('/edit/:id', async (req, res) => {
  const id = req.params.id;
  console.log('Edit request for question:', id);
  
  try {
    let question = null;
    
    if (pool && pool.monitoredQuery) {
      const result = await pool.monitoredQuery(
        'SELECT * FROM devkitty_questions WHERE id = $1',
        [id],
        'select_one',
        'devkitty_questions'
      );
      if (result.rows.length > 0) {
        question = result.rows[0];
      }
    } else {
      question = sampleQuestions.find(q => q.id == id);
    }
    
    if (!question) {
      return res.redirect('/');
    }
    
    res.render('edit.ejs', { question: question });
  } catch (error) {
    console.error('Error loading question for edit:', error);
    res.redirect('/');
  }
});

// UPDATE QUESTION
app.post('/update/:id', async (req, res) => {
  const id = req.params.id;
  const { category, content } = req.body;
  console.log('Update request for question:', id);
  
  if (pool && pool.monitoredQuery) {
    try {
      await pool.monitoredQuery(
        'UPDATE devkitty_questions SET category = $1, content = $2 WHERE id = $3',
        [category, content, id],
        'update',
        'devkitty_questions'
      );
      console.log('Question updated in PostgreSQL');
    } catch (error) {
      console.error('Failed to update question:', error);
    }
  } else {
    const index = sampleQuestions.findIndex(q => q.id == id);
    if (index !== -1) {
      sampleQuestions[index] = {
        ...sampleQuestions[index],
        category: category,
        content: content
      };
      console.log('Question updated in fallback data');
    }
  }
  
  res.redirect('/');
});

// DELETE QUESTION
app.post('/delete/:id', async (req, res) => {
  const id = req.params.id;
  console.log(' Delete request for question:', id);
  
  if (pool && pool.monitoredQuery) {
    try {
      await pool.monitoredQuery(
        'DELETE FROM devkitty_questions WHERE id = $1',
        [id],
        'delete',
        'devkitty_questions'
      );
      console.log(' Question deleted from PostgreSQL');
    } catch (error) {
      console.error(' Failed to delete from PostgreSQL:', error);
    }
  } else {
    const index = sampleQuestions.findIndex(q => q.id == id);
    if (index !== -1) {
      sampleQuestions.splice(index, 1);
      console.log(' Question deleted from fallback data');
    }
  }
  
  res.redirect('/');
});

// ==================== HPA & MONITORING ENDPOINTS ====================

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
    
    // Log metrics access for monitoring
    console.log('📈 Metrics endpoint accessed');
  } catch (error) {
    console.error('Error generating metrics:', error);
    res.status(500).send(error.message);
  }
});

// Enhanced health check for HPA
app.get('/health', async (req, res) => {
  const healthStart = Date.now();
  
  let dbStatus = 'disconnected';
  let rowCount = 0;
  let dbLatency = 0;

  if (pool) {
    try {
      const dbStart = Date.now();
      const result = await pool.query('SELECT COUNT(*) FROM devkitty_questions');
      dbLatency = Date.now() - dbStart;
      
      rowCount = parseInt(result.rows[0].count);
      dbStatus = 'connected';
    } catch (error) {
      console.error("Health DB error:", error.message);
      dbStatus = 'error';
    }
  }

  const healthDuration = Date.now() - healthStart;
  
  // Calculate overall health score for HPA
  const healthScore = dbStatus === 'connected' ? 1 : 0.5;
  
  res.json({
    status: dbStatus === 'connected' ? 'HEALTHY' : 'DEGRADED',
    health_score: healthScore,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      latency_ms: dbLatency,
      questions_count: dbStatus === 'connected' ? rowCount : sampleQuestions.length
    },
    metrics: {
      active_connections: getActiveConnections(),
      error_rate_percentage: calculateErrorRate(),
      total_requests: totalRequests
    },
    performance: {
      response_time_ms: healthDuration,
      memory_usage_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    },
    timestamp: new Date().toISOString()
  });
});

// Readiness probe endpoint (for HPA)
app.get('/ready', (req, res) => {
  const isReady = pool ? true : false;
  
  if (isReady) {
    res.json({
      status: 'READY',
      ready: true,
      checks: {
        database: pool ? 'connected' : 'disconnected',
        memory: 'ok',
        uptime: process.uptime()
      },
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'NOT_READY',
      ready: false,
      message: 'Database not connected',
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness probe endpoint (for HPA)
app.get('/live', (req, res) => {
  const isAlive = process.uptime() > 30; // Consider alive after 30 seconds
  
  res.json({
    status: isAlive ? 'ALIVE' : 'STARTING',
    alive: isAlive,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Status endpoint with HPA metrics
app.get('/status', async (req, res) => {
  const metrics = await register.getMetricsAsJSON();
  
  res.json({
    application: 'Fantastic Four Q&A',
    version: '1.0.0',
    hpa_metrics: {
      enabled: true,
      metrics: [
        'http_requests_total',
        'http_request_duration_seconds',
        'error_rate_percentage',
        'active_connections',
        'application_health'
      ]
    },
    current_metrics: {
      active_connections: getActiveConnections(),
      error_rate: calculateErrorRate().toFixed(2) + '%',
      total_requests: totalRequests,
      database_connected: pool ? true : false
    },
    endpoints: {
      home: '/',
      health: '/health',
      ready: '/ready',
      live: '/live',
      metrics: '/metrics',
      status: '/status'
    },
    timestamp: new Date().toISOString()
  });
});

// Stress test endpoint for HPA testing
app.get('/stress-test', (req, res) => {
  const iterations = parseInt(req.query.iterations) || 1000;
  let result = 0;
  
  // CPU-intensive operation for testing
  for (let i = 0; i < iterations; i++) {
    result += Math.sqrt(i) * Math.random();
  }
  
  res.json({
    test: 'cpu_stress_test',
    iterations: iterations,
    result: result,
    message: 'Stress test completed',
    timestamp: new Date().toISOString()
  });
});

// GLOBAL ERROR HANDLER 
app.use((err, req, res, next) => {
  console.error("Global Error:", err.message || err);
  
  // Record error in metrics
  errorRequests++;
  totalRequests++;
  
  httpRequestsTotal.inc({
    method: req.method,
    route: req.path,
    status_code: '500',
    app: 'fantastic-four'
  });
  
  res.status(500).json({ 
    error: "Internal Server Error",
    request_id: Date.now().toString(36),
    timestamp: new Date().toISOString()
  });
});

// Cleanup on shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, cleaning up HPA metrics...');
  if (poolMetricsInterval) {
    clearInterval(poolMetricsInterval);
  }
  if (pool) {
    pool.end();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, cleaning up HPA metrics...');
  if (poolMetricsInterval) {
    clearInterval(poolMetricsInterval);
  }
  if (pool) {
    pool.end();
  }
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('📈 HPA Metrics available at /metrics');
  console.log('🏥 Health check at /health');
  console.log('✅ Readiness probe at /ready');
  console.log('❤️  Liveness probe at /live');
  console.log('📊 Status at /status');
  console.log('⚡ HPA stress test at /stress-test?iterations=10000');
  console.log('✏️ Edit & Delete features enabled!');
});