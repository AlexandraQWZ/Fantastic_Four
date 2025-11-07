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

// Add new question
app.post('/', async (req, res) => {
    console.log('📨 Received POST request to /');
    const { category, content } = req.body;
    
    if (pool) {
        try {
            await pool.query(
                'INSERT INTO devkitty_questions (category, content) VALUES ($1, $2)',
                [category, content]
            );
            console.log('✅ Question saved to PostgreSQL');
        } catch (error) {
            console.error('❌ Failed to save to PostgreSQL:', error);
            // Fallback to sample data
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

// 🆕 EDIT QUESTION - Show edit form
app.get('/edit/:id', async (req, res) => {
    const id = req.params.id;
    console.log('✏️ Edit request for question:', id);
    
    try {
        let question = null;
        
        if (pool) {
            const result = await pool.query('SELECT * FROM devkitty_questions WHERE id = $1', [id]);
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

// 🆕 UPDATE QUESTION - Process edit form
app.post('/update/:id', async (req, res) => {
    const id = req.params.id;
    const { category, content } = req.body;
    console.log('🔄 Update request for question:', id);
    
    if (pool) {
        try {
            await pool.query(
                'UPDATE devkitty_questions SET category = $1, content = $2 WHERE id = $3',
                [category, content, id]
            );
            console.log('✅ Question updated in PostgreSQL');
        } catch (error) {
            console.error('❌ Failed to update question:', error);
        }
    } else {
        const index = sampleQuestions.findIndex(q => q.id == id);
        if (index !== -1) {
            sampleQuestions[index] = {
                ...sampleQuestions[index],
                category: category,
                content: content
            };
            console.log('💡 Question updated in fallback data');
        }
    }
    
    res.redirect('/');
});

// 🆕 DELETE QUESTION
app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;
    console.log('🗑️ Delete request for question:', id);
    
    if (pool) {
        try {
            await pool.query('DELETE FROM devkitty_questions WHERE id = $1', [id]);
            console.log('✅ Question deleted from PostgreSQL');
        } catch (error) {
            console.error('❌ Failed to delete from PostgreSQL:', error);
        }
    } else {
        const index = sampleQuestions.findIndex(q => q.id == id);
        if (index !== -1) {
            sampleQuestions.splice(index, 1);
            console.log('💡 Question deleted from fallback data');
        }
    }
    
    res.redirect('/');
});

// Health check
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

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('💡 Edit & Delete features added!');
});
