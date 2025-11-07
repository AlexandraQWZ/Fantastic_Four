const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;

let db;
// Railway akan provide PORT otomatis
// Gunakan MONGODB_URI untuk connection string MongoDB Atlas
const dbConnectionStr = process.env.MONGODB_URI || "mongodb://localhost:27017/devkitty";

// Middleware
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
MongoClient.connect(dbConnectionStr, { 
    useUnifiedTopology: true,
    useNewUrlParser: true,
    serverSelectionTimeoutMS: 30000
})
.then(client => {
    console.log('✅ Connected to MongoDB');
    db = client.db('devkitty');
})
.catch(error => {
    console.error('❌ MongoDB connection error:', error);
});

// Routes
app.get('/', async (req, res) => {
    try {
        if (!db) {
            // Fallback data jika DB tidak connected
            return res.render('index.ejs', { 
                items: [
                    { category: "Info", content: "Database connecting...", createdAt: new Date() },
                    { category: "Setup", content: "Check MongoDB connection", createdAt: new Date() }
                ], 
                left: 2 
            });
        }

        const todoItems = await db.collection('DevKittyQuestions').find().toArray();
        const itemsLeft = await db.collection('DevKittyQuestions').countDocuments();
        res.render('index.ejs', { items: todoItems, left: itemsLeft });
    } catch (error) {
        console.error('Error:', error);
        res.render('index.ejs', { 
            items: [{ category: "Error", content: "Failed to load data", createdAt: new Date() }], 
            left: 1 
        });
    }
});

app.post('/addQuestion', (req, res) => {
    if (!db) {
        return res.redirect('/');
    }

    db.collection('DevKittyQuestions').insertOne({
        category: req.body.category,
        content: req.body.content,
        createdAt: new Date()
    })
    .then(result => {
        console.log('Question Added');
        res.redirect('/');
    })
    .catch(error => {
        console.error('Error adding question:', error);
        res.redirect('/');
    });
});

// Health check untuk Railway
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        database: db ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 MongoDB URI: ${process.env.MONGODB_URI ? 'Set' : 'Not set'}`);
});
