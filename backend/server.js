require('dotenv').config();


// Validate essential environment variables
/* if (!process.env.MONGODB_URI) {
    console.error('Fatal Error: MONGODB_URI is not defined in .env file');
    process.exit(1);
} */

if (!process.env.JWT_SECRET) {
    console.error('Fatal Error: JWT_SECRET is not defined in .env file');
    process.exit(1);
}

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const activityReportRoutes = require('./routes/activityReportRoutes');
const devRoutes = require('./routes/devRoutes'); // Import the dev routes
const friendsRoutes = require('./routes/friendsRoutes'); // Make sure friendsRoutes is imported at the top
const authRoutes = require('./routes/auth'); // Add this line to import auth routes
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/db');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Log requests to console in development mode

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activityRepo', activityReportRoutes);
app.use('/api/dev', devRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/auth', authRoutes); // Add this line to register auth routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Any routes not caught by API will be redirected to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

// Basic route for testing
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Error handling middleware (should be last)
app.use(errorHandler);

module.exports = app;

/* const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); */
