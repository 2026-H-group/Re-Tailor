const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Re-tailor backend is running');
});

//test route- check supabase connection
app.get('/test-connection', async (req, res) => {
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
  res.json({ success: true, message: 'Connected to Supabase!', data });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});