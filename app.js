// app.js
process.on('uncaughtException', (error) => {
  console.error('FATAL ERROR:', error.message, error.stack);
});
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
dotenv.config();

// Import modules
const getUserInfo = require('./helpers/getUserInfo');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Import routes
const appointment = require('./routes/appointment');
const cases = require('./routes/case');
const document = require('./routes/document');
const auth = require('./routes/auth');
const taskRoutes = require('./routes/task');
const statistic = require('./routes/statistic');
const crmRoute = require('./routes/crm');

// Cek apakah dalam lingkungan Vercel
const isVercel = process.env.VERCEL === 'true';
const isDev = process.env.NODE_ENV !== 'production';

// Initialize Express
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://wwplawfirm.vercel.app', // Tambahkan domain Vercel Anda
      'https://wwpmanage.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:9000'
    ];
    
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: true
};

app.use(cors(corsOptions));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Database connected');
  })
  .catch((e) => {
    console.error('DATABASE CONNECTION ERROR:', e.message, e.stack);
    // Jangan crash aplikasi di Vercel
    if (!isVercel) {
      process.exit(1);
    }
  });

  app.get('/api/debug', (req, res) => {
    res.json({
      environment: {
        isVercel: process.env.VERCEL === 'true',
        nodeEnv: process.env.NODE_ENV,
        mongoDbUriExists: !!process.env.MONGODB_URI,
        jwtSecretExists: !!process.env.JWT_SECRET
      },
      versions: {
        node: process.version,
        express: require('express/package.json').version,
        mongoose: require('mongoose/package.json').version
      },
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    });
  });

  app.get('/api/mongo-debug', async (req, res) => {
    try {
      // Test koneksi MongoDB dengan operasi sederhana
      const dbStatus = {
        readyState: mongoose.connection.readyState,
        connected: mongoose.connection.readyState === 1,
        error: null
      };
      
      // Coba melakukan operasi sederhana untuk memastikan koneksi berfungsi
      if (dbStatus.connected) {
        try {
          // Dapatkan jumlah user (operasi DB ringan)
          const userCount = await User.countDocuments();
          dbStatus.userCount = userCount;
          dbStatus.testOperation = 'success';
        } catch (dbOpError) {
          dbStatus.testOperation = 'failed';
          dbStatus.operationError = dbOpError.message;
        }
      }
      
      res.json({
        status: 'ok',
        database: dbStatus,
        env: {
          nodeEnv: process.env.NODE_ENV,
          hasJwtSecret: !!process.env.JWT_SECRET,
          isVercel: process.env.VERCEL === 'true',
          mongoUriConfigured: !!process.env.MONGODB_URI
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
        stack: isDev ? error.stack : undefined
      });
    }
  });

// Routes
app.use('/api/appointments', appointment);
app.use('/api/documents', document);
app.use('/api/cases', cases);
app.use('/api/statistics', statistic);
app.use('/auth', auth);
app.use('/api/crm', crmRoute);
app.use('/api/tasks', taskRoutes);

// Endpoint untuk memeriksa status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    environment: isVercel ? 'vercel' : 'local',
    dbConnected: mongoose.connection.readyState === 1
  });
});

// Socket.io status endpoint
app.get('/api/socket-status', (req, res) => {
  res.json({
    available: !isVercel,
    message: isVercel 
      ? "Real-time features are not available in demo mode."
      : "Socket.io is available"
  });
});

// Serve static HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Fallback route handler untuk SPA
app.get('*', (req, res) => {
  // Coba kirim file statis jika ada
  const filePath = path.join(__dirname, 'public', req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      // Jika file tidak ditemukan, coba cek jika ada .html extension
      const htmlPath = path.join(__dirname, 'public', `${req.path}.html`);
      res.sendFile(htmlPath, (err2) => {
        if (err2) {
          // Jika masih tidak ditemukan, kirim index.html
          res.sendFile(path.join(__dirname, 'public', 'index.html'));
        }
      });
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message 
  });
});

// Server hanya berjalan di lingkungan lokal
if (!isVercel) {
  const PORT = process.env.SERVER_PORT || 9000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Socket.io
  const io = require('socket.io')(server, {
    cors: {
      origin: corsOptions.origin,
      methods: corsOptions.methods,
      allowedHeaders: corsOptions.allowedHeaders,
      credentials: true
    }
  });

  // Socket handlers
  const { caseMessageHandlers, writeMessageBatchToDB } = require('./socketHandler/caseMessageHandlers');

  const onConnection = (socket) => {
    caseMessageHandlers(io, socket);
  }

  io.use(function (socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(socket.handshake.query.token, process.env.JWT_SECRET, function (err, decoded) {
        if (err) return next(new Error('Authentication error'));
        socket.decoded = decoded;
        next();
      });
    }
    else {
      next(new Error('Authentication error'));
    }
  }).on('connection', onConnection);

  // Set up periodic batch write
  setInterval(writeMessageBatchToDB, 5000);
}

// Export untuk Vercel
module.exports = app;