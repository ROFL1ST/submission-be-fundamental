require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

// Routes
app.use('/users', require('./routes/users'));
app.use('/authentications', require('./routes/authentications'));
app.use('/companies', require('./routes/companies'));
app.use('/categories', require('./routes/categories'));
app.use('/jobs', require('./routes/jobs'));
app.use('/applications', require('./routes/applications'));
app.use('/bookmarks', require('./routes/bookmarks'));
app.use('/profile', require('./routes/profile'));
app.use('/documents', require('./routes/documents'));

// Error handler
app.use(require('./middleware/errorHandler'));

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
