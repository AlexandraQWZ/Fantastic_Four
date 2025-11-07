// Declare variables 
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

let db;
const dbConnectionStr = process.env.DB_STRING || "mongodb://127.0.0.1:27017/devkitty";
const dbName = 'devkitty';

// Set middleware
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
MongoClient.connect(dbConnectionStr, { 
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(client => {
    console.log(`Connected to ${dbName} Database`);
    db = client.db(dbName);
    
    // Start server only after DB connection
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch(error => {
    console.error('Database connection error:', error);
    process.exit(1);
});

// Routes
app.get('/', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).send('Database not connected');
        }
        
        const todoItems = await db.collection('DevKittyQuestions').find().toArray();
        const itemsLeft = await db.collection('DevKittyQuestions').countDocuments();
        res.render('index.ejs', { items: todoItems, left: itemsLeft });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error loading page');
    }
});

app.post('/addQuestion', (req, res) => {
    if (!db) {
        return res.status(500).json({ error: 'Database not connected' });
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
        res.status(500).send('Error adding question');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// 404 handler
app.use((req, res) => {
    res.status(404).send('Page not found');
});
