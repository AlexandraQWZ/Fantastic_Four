const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;

let db;
// Railway akan provide DATABASE_URL atau MONGODB_URI
const dbConnectionStr = process.env.DATABASE_URL || process.env.MONGO_URL || process.env.MONGODB_URI;

// Middleware
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

console.log('🔧 Environment Check:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Available' : 'Not available');
console.log('- MONGO_URL:', process.env.MONGO_URL ? 'Available' : 'Not available');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Available' : 'Not available');

// Sample data untuk fallback
const sampleQuestions = [
    { 
        _id: '1', 
        category: "JavaScript", 
        content: "Apa perbedaan let, const, dan var?",
        createdAt: new Date() 
    },
    { 
        _id: '2', 
        category: "Node.js", 
        content: "Bagaimana cara kerja event loop?",
        createdAt: new Date() 
    }
];

// Connect to MongoDB hanya jika connection string ada
if (dbConnectionStr) {
    console.log('🔗 Connecting to MongoDB...');
    console.log('📡 Connection string:', dbConnectionStr);
    
    MongoClient.connect(dbConnectionStr, { 
        useUnifiedTopology: true,
        useNewUrlParser: true,
        serverSelectionTimeoutMS: 10000
    })
    .then(client => {
        console.log('✅ Connected to MongoDB successfully!');
        db = client.db();
    })
    .catch(error => {
        console.error('❌ MongoDB connection failed:', error.message);
        console.log('💡 Using fallback data mode');
    });
} else {
    console.log('💡 No MongoDB connection string found');
    console.log('💡 Using fallback data mode');
}

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
                console.log('📊 Data loaded from MongoDB');
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
    } else {
        // Add to sample data
        sampleQuestions.push({
            _id: Date.now().toString(),
            category: category,
            content: content,
            createdAt: new Date()
        });
        console.log('💡 Question saved to fallback data');
    }
    
    res.redirect('/');
});

// Health check dengan info detail
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        database: db ? 'connected' : 'disconnected',
        environment_variables: {
            DATABASE_URL: process.env.DATABASE_URL ? 'available' : 'not available',
            MONGO_URL: process.env.MONGO_URL ? 'available' : 'not available', 
            MONGODB_URI: process.env.MONGODB_URI ? 'available' : 'not available'
        },
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('💡 Application ready!');
});
