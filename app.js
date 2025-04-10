const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
// const socketIo = require('socket.io');  // Komentar untuk sementara
const morgan = require('morgan');
const fs = require('fs');
require('dotenv').config();
const helmet = require('helmet');

// Import dependencies
const connectDB = require('./config/database');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { requireAuth } = require('./middlewares/authMiddleware');

// Initialize app
const app = express();
const server = http.createServer(app);
// const io = socketIo(server);  // Komentar untuk sementara

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-eval'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "https://via.placeholder.com", "https://*"],
    connectSrc: ["'self'", "https://*", "http://localhost:9000"]
  }
}));

app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Setup logging
if (process.env.NODE_ENV === 'production') {
  // Log to file in production
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'server-log.txt'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
} else {
  // Log to console in development
  app.use(morgan('dev'));
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL, 'https://wwplawfirm.onrender.com'] 
    : true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes - menggunakan jalur yang benar sesuai struktur folder
app.use('/api/auth', require('./routes/auth'));
// app.use('/api/crm', require('./routes/crm'));
app.use('/api/cases', require('./routes/admin/cases'));  // Tambahkan ini
app.use('/api/appointments', require('./routes/appointment'));  // Tambahkan ini
// app.use('/api/documents', require('./routes/document'));

// Membuat API endpoint sederhana untuk notifikasi
app.get('/api/notifications', requireAuth, (req, res) => {
  // Implementasi placeholder sementara
  res.json([]);
});

// Membuat API endpoint sederhana untuk statistik dashboard
app.get('/api/statistics/dashboard', requireAuth, (req, res) => {
  try {
    // Format data yang sesuai dengan ekspektasi frontend
    res.json({
      caseStatistic: {
        open: 8,  // Jumlah yang diinginkan
        close: 12 // Jumlah yang diinginkan
      },
      userStatistic: {
        admins: 3,
        partners: 5,
        associates: 8,
        paralegals: 4,
        clients: 32
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Route khusus untuk login.html
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Root path sudah benar, arahkan ke login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ubah regex fallback agar tidak menangkap login.html
app.get(/^(?!\/api)(?!\/)(?!\/login\.html).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use(errorHandler);

// Komentar kode WebSocket
// const socketHandlers = require('./socketHandler');

// io.on('connection', (socket) => {
//   console.log('New client connected');
//   
//   socket.on('join-room', (data) => socketHandlers.joinRoomHandlers(io, socket, data));
//   socket.on('case-message', (data) => socketHandlers.caseMessageHandlers(io, socket, data));
//   socket.on('disconnect', () => socketHandlers.disconnectHandlers(io, socket));
//   
//   socket.on('error', (error) => {
//     console.error('Socket error:', error);
//   });
// });

// Connect to MongoDB dan jalankan server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    const PORT = process.env.PORT || 9000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

module.exports = { app, server };