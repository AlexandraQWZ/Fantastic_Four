const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

let db;

// Middleware
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

console.log('🔧 Environment Variables:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Available' : 'Not available');
console.log('- MONGO_URL:', process.env.MONGO_URL ? 'Available' : 'Not available');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Available' : 'Not available');

// Sample data - akan digunakan jika MongoDB tidak tersedia
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
    },
    { 
        _id: '3', 
        category: "Database", 
        content: "Apa itu MongoDB dan kelebihannya?",
        createdAt: new Date() 
    }
];

// Try to connect to MongoDB jika connection string valid
const connectToDatabase = async () => {
    const connectionStr = process.env.DATABASE_URL || process.env.MONGO_URL || process.env.MONGODB_URI;
    
    if (!connectionStr) {
        console.log('💡 No MongoDB connection string found');
        return null;
    }

    // Skip connection jika menggunakan mongo:27017 (internal Railway yang tidak work)
    if (connectionStr.includes('mongo:27017')) {
        console.log('⚠️  Skipping internal Railway MongoDB connection');
        return null;
    }

    try {
        console.log('🔗 Attempting to connect to MongoDB...');
        const MongoClient = require('mongodb').MongoClient;
        const client = await MongoClient.connect(connectionStr, { 
            useUnifiedTopology: true,
            useNewUrlParser: true,
            serverSelectionTimeoutMS: 5000
        });
        
        console.log('✅ Connected to MongoDB successfully!');
        return client.db();
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        return null;
    }
};

// Initialize database connection
connectToDatabase().then(database => {
    db = database;
});

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        database: db ? 'connected' : 'disconnected',
        mode: db ? 'production' : 'demo',
        questions_count: db ? 'from database' : sampleQuestions.length,
        environment: {
            DATABASE_URL: !!process.env.DATABASE_URL,
            MONGO_URL: !!process.env.MONGO_URL,
            MONGODB_URI: !!process.env.MONGODB_URI
        },
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('💡 Application ready with fallback data!');
    console.log('📝 Add questions via the web interface');
});
