const express = require("express");
const cors = require("cors");
const sequelize = require("./src/config/mariadb.conf");
const initMongoDB = require("./src/databases/mongodb");
const { authenticateJWT } = require('./src/middlewares/jwt.middleware');
require('dotenv').config();

// Khởi tạo kết nối Redis
require('./src/services/redis.service');

const app = express();

// Bật cors cho phép frontend gọi API
app.use(cors({
  origin: "http://localhost:5173", // domain React (vite)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // nếu cần gửi cookie/token
  // preflightContinue: false,
  // optionsSuccessStatus: 200
}));

// // Middleware xử lý empty body trước JSON parser
// app.use((req, res, next) => {
//   if (req.method === 'POST' && req.get('content-length') === '0') {
//     req.body = {};
//   }
//   next();
// });

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
async function startServer() {
  try {
    // Kết nối MariaDB
    await sequelize.authenticate();
    console.log("✅ Connected to MariaDB successfully!");
    await sequelize.sync();
    console.log("✅ MariaDB tables synced");
    await sequelize.sync({ alter: true }); 
    console.log("✅ MariaDB tables updated");
    
    // Kết nối MongoDB
    const mongoModels = await initMongoDB();
    console.log("✅ Connected to MongoDB successfully!");
    
    // Khởi động server sau khi kết nối cả hai database
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
}

startServer();
