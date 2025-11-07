const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;

let db;
const dbConnectionStr = process.env.MONGODB_URI || process.env.DB_STRING || "mongodb://localhost:27017/devkitty";
const dbName = process.env.DB_NAME || 'devkitty';

// Set middleware
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
MongoClient.connect(dbConnectionStr, { 
    useUnifiedTopology: true,
    useNewUrlParser: true,
    serverSelectionTimeoutMS: 30000 // 30 seconds timeout for Railway
})
.then(client => {
    console.log(`✅ Connected to MongoDB Database`);
    db = client.db(dbName);
    
    // Start server after DB connection
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📊 Database: ${dbConnectionStr}`);
    });
})
.catch(error => {
    console.error('❌ Database connection failed:', error);
    console.log('💡 Starting server without database...');
    
    // Start server anyway (for demo purposes)
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} (without database)`);
    });
});

// Routes
app.get('/', async (req, res) => {
    try {
        if (!db) {
            // Fallback data jika database tidak connected
            const fallbackItems = [
                { category: "General", content: "Database not connected - using fallback data" },
                { category: "Setup", content: "Please check your MongoDB connection string" }
            ];
            return res.render('index.ejs', { 
                items: fallbackItems, 
                left: fallbackItems.length 
            });
        }

        const todoItems = await db.collection('DevKittyQuestions').find().toArray();
        const itemsLeft = await db.collection('DevKittyQuestions').countDocuments();
        res.render('index.ejs', { items: todoItems, left: itemsLeft });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).render('error.ejs', { error: 'Database error' });
    }
});

app.post('/addQuestion', async (req, res) => {
    try {
        if (!db) {
            return res.redirect('/');
        }

        await db.collection('DevKittyQuestions').insertOne({
            category: req.body.category,
            content: req.body.content,
            createdAt: new Date()
        });
        
        console.log('✅ Question added to database');
        res.redirect('/');
    } catch (error) {
        console.error('❌ Error adding question:', error);
        res.redirect('/');
    }
});

// Health check endpoint untuk Railway
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        database: db ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/api', (req, res) => {
    res.json({ 
        message: 'DevKitty API is running!',
        database: db ? 'connected' : 'disconnected'
    });
});
