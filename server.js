const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;

let db;
// Railway menggunakan MONGO_URL (bukan MONGODB_URI)
const dbConnectionStr = process.env.MONGO_URL;

// Middleware
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

console.log('🔧 Environment check:');
console.log('- PORT:', process.env.PORT);
console.log('- MONGO_URL:', process.env.MONGO_URL ? 'Available' : 'Not available');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Available' : 'Not available');

// Connect to MongoDB
if (dbConnectionStr) {
    console.log('🔗 Connecting to MongoDB...');
    
    MongoClient.connect(dbConnectionStr, { 
        useUnifiedTopology: true,
        useNewUrlParser: true,
        serverSelectionTimeoutMS: 15000
    })
    .then(client => {
        console.log('✅ Connected to MongoDB successfully!');
        db = client.db();
        
        // Create collection jika belum ada
        db.listCollections({name: 'devkittyquestions'}).toArray()
            .then(collections => {
                if (collections.length === 0) {
                    console.log('📁 Creating devkittyquestions collection');
                    return db.createCollection('devkittyquestions');
                }
            })
            .catch(console.error);
    })
    .catch(error => {
        console.error('❌ MongoDB connection failed:', error.message);
    });
}

// Sample data
const sampleQuestions = [
    { 
        _id: '1', 
        category: "JavaScript", 
        content: "Apa perbedaan let, const, dan var?",
        createdAt: new Date() 
    }
];

// Routes
app.get('/', async (req, res) => {
    try {
        let items = sampleQuestions;
        let left = sampleQuestions.length;
        let dbStatus = 'disconnected';

        if (db) {
            try {
                items = await db.collection('devkittyquestions').find().toArray();
                left = items.length;
                dbStatus = 'connected';
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

app.post('/addQuestion', async (req, res) => {
    const { category, content } = req.body;
    
    if (db) {
        try {
            await db.collection('devkittyquestions').insertOne({
                category: category,
                content: content,
                createdAt: new Date()
            });
            console.log('✅ Question saved to MongoDB');
        } catch (error) {
            console.error('❌ Failed to save to MongoDB:', error);
        }
    }
    
    res.redirect('/');
});

// Health check dengan info database
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        database: db ? 'connected' : 'disconnected',
        connection_string: process.env.MONGO_URL ? 'available' : 'not available',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
