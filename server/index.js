require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));

// Return errors (e.g. file too big, wrong file type) as JSON
app.use((err, req, res, next) => {
  const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 50 MB)' : err.message;
  res.status(400).json({ message });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log('Server running on port ' + (process.env.PORT || 5000))
    );
  })
  .catch((err) => console.error('DB connection failed:', err.message));
