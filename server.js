const { Pool } = require('pg');
const express = require('express');
const cors = require("cors"); // Import CORS middleware
const app = express();

// Enable CORS
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'password',
    port: 5432, // Default PostgreSQL port
});

app.get('/api/postgres/user_info', async (req, res) => {

  
    try { 
        const result = await pool.query("SELECT * FROM user_info WHERE user_id = '1'");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/postgres/search_history', async (req, res) => {

  
    try { 
        const result = await pool.query("SELECT * FROM search_history WHERE user_id = '1'");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/postgres/user_rating', async (req, res) => {

  
    try { 
        const result = await pool.query("SELECT ur.user_id, ur.rating, ur.annotation, ur.rated_date, ur.is_bookmarked, ur.tconst, tb.primarytitle FROM user_rating ur JOIN title_basics tb ON ur.tconst = tb.tconst WHERE ur.user_id = '1';");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/postgres/genres', async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM genres');
      res.json(result.rows);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));