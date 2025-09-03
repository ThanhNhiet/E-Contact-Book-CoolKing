const express = require("express");
const sequelize = require("./src/config/mariadb.conf");
const { authenticateJWT } = require('./src/middlewares/jwt.middleware');
require('dotenv').config();

// Khởi tạo kết nối Redis
require('./src/services/redis.service');

const app = express();
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Hello E-Contact Book 🚀');
});

// Import routes
const routes = require('./src/routes');
const authRoutes = require('./src/routes/auth.route');

// Public routes - không cần xác thực
app.use('/api/public', authRoutes);

// Protected routes - cần xác thực JWT
app.use('/api', authenticateJWT, routes);

const PORT = process.env.PORT || 3000;

// Kết nối DB trước khi start server

sequelize.authenticate()
  .then(async () => {
    console.log("Connected to MariaDB successfully!");
    await sequelize.sync();
    console.log("Database synced");
    await sequelize.sync({ alter: true }); 
    console.log("Tables updated");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Unable to connect to MariaDB:", err);
  });
