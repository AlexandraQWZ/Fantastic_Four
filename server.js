const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const { Pool } = require('pg');

// Middleware
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

console.log('🔧 Environment Variables:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Available' : 'Not available');

// Setup PostgreSQL connection
let pool;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const initializeDatabase = async () => {
        try {
            const client = await pool.connect();
            console.log('✅ Connected to PostgreSQL successfully!');
            
            await client.query(`
                CREATE TABLE IF NOT EXISTS devkitty_questions (
                    id SERIAL PRIMARY KEY,
                    category VARCHAR(100) NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('📊 Database table ready');
            
            client.release();
        } catch (error) {
            console.error('❌ Database initialization error:', error.message);
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

// Routes
app.get('/', async (req, res) => {
    try {
        let items = sampleQuestions;
        let left = sampleQuestions.length;
        let dbStatus = 'disconnected';

        if (pool) {
            try {
                const result = await pool.query('SELECT * FROM devkitty_questions ORDER BY created_at DESC');
                items = result.rows;
                left = items.length;
                dbStatus = 'connected';
                console.log('📊 Data loaded from PostgreSQL');
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

// Route untuk handle form submission
app.post('/', async (req, res) => {
    console.log('📨 Received POST request to /');
    console.log('📦 Request body:', req.body);
    
    const { category, content } = req.body;
    
    if (!category || !content) {
        console.log('❌ Missing category or content');
        return res.redirect('/');
    }
    
    if (pool) {
        try {
            const result = await pool.query(
                'INSERT INTO devkitty_questions (category, content) VALUES ($1, $2) RETURNING *',
                [category, content]
            );
            console.log('✅ Question saved to PostgreSQL:', result.rows[0]);
        } catch (error) {
            console.error('❌ Failed to save to PostgreSQL:', error);
            // Fallback to sample data jika database error
            sampleQuestions.push({
                id: Date.now(),
                category: category,
                content: content,
                created_at: new Date()
            });
            console.log('💡 Question saved to fallback data due to DB error');
        }
    } else {
        // Add to sample data
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

// Juga keep route /addQuestion untuk compatibility
app.post('/addQuestion', async (req, res) => {
    console.log('📨 Received POST request to /addQuestion');
    console.log('📦 Request body:', req.body);
    
    const { category, content } = req.body;
    
    if (pool) {
        try {
            await pool.query(
                'INSERT INTO devkitty_questions (category, content) VALUES ($1, $2)',
                [category, content]
            );
            console.log('✅ Question saved to PostgreSQL via /addQuestion');
        } catch (error) {
            console.error('❌ Failed to save to PostgreSQL:', error);
        }
    } else {
        sampleQuestions.push({
            id: Date.now(),
            category: category,
            content: content,
            created_at: new Date()
        });
        console.log('💡 Question saved to fallback data via /addQuestion');
    }
    
    res.redirect('/');
});

// Health check endpoint
app.get('/health', async (req, res) => {
    let dbStatus = 'disconnected';
    let rowCount = 0;

    if (pool) {
        try {
            const result = await pool.query('SELECT COUNT(*) FROM devkitty_questions');
            rowCount = parseInt(result.rows[0].count);
            dbStatus = 'connected';
        } catch (error) {
            dbStatus = 'error';
        }
    }

    res.json({
        status: 'OK',
        database: dbStatus,
        questions_count: dbStatus === 'connected' ? rowCount : sampleQuestions.length,
        database_type: 'PostgreSQL',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    console.log('❌ Route not found:', req.method, req.url);
    res.status(404).send('Page not found');
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('💡 Application ready!');
    console.log('📝 POST routes: / and /addQuestion');
});
