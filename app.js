// app.js - Dioptimalkan untuk environment Vercel Serverless
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

// Deteksi environment
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
      'https://wwplawfirm.vercel.app',
      'https://wwpmanage.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:9000'
    ];
    
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

// Koneksi Database Teroptimasi untuk Serverless
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }
  
  try {
    // Pastikan URI ada dan valid
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI tidak ditemukan di environment variables');
    }
    
    // Coba validasi format URI
    new URL(process.env.MONGODB_URI);
    
    const client = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout setelah 5 detik
    });
    
    cachedDb = client;
    console.log('Database connected successfully');
    return client;
  } catch (error) {
    console.error('Database connection error:', error.message);
    throw error;
  }
}

// Koneksi database hanya dibuat saat diperlukan
if (isVercel) {
  // Di Vercel, buat koneksi pada permintaan pertama
  app.use(async (req, res, next) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        await connectToDatabase();
      }
      next();
    } catch (error) {
      console.error('Middleware database connection error:', error);
      res.status(500).json({ error: 'Database connection error', message: error.message });
    }
  });
} else {
  // Di lingkungan lokal, koneksi sekali pada startup
  connectToDatabase()
    .then(() => console.log('Database connected'))
    .catch((e) => {
      console.error('DATABASE CONNECTION ERROR:', e.message, e.stack);
      if (!isVercel) {
        process.exit(1);
      }
    });
}

// Debugging route
app.get('/api/debug', (req, res) => {
  res.json({
    environment: {
      isVercel: process.env.VERCEL === 'true',
      nodeEnv: process.env.NODE_ENV,
      mongoDbUriExists: !!process.env.MONGODB_URI,
      jwtSecretExists: !!process.env.JWT_SECRET
    },
    mongoStatus: mongoose.connection.readyState,
    versions: {
      node: process.version,
      express: require('express/package.json').version,
      mongoose: require('mongoose/package.json').version
    },
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// Import routes
console.log('Importing routes...');
const appointment = require('./routes/appointment');
const cases = require('./routes/case');
const document = require('./routes/document');
const auth = require('./routes/auth');
const taskRoutes = require('./routes/task');
const statistic = require('./routes/statistic');
const crmRoute = require('./routes/crm');
console.log('Routes imported successfully');

// Register routes
console.log('Registering routes...');
app.use('/api/appointments', appointment);
app.use('/api/documents', document);
app.use('/api/cases', cases);
app.use('/api/statistics', statistic);
app.use('/auth', auth); 
app.use('/api/crm', crmRoute);
app.use('/api/tasks', taskRoutes);
console.log('Routes registered successfully');

// Endpoint untuk memeriksa status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    environment: isVercel ? 'vercel' : 'local',
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString()
  });
});

// Serve static HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Explicit auth route handler untuk fallback
app.post('/direct-auth-login', async (req, res) => {
  try {
    console.log('Direct auth login hit');
    if (mongoose.connection.readyState !== 1) {
      await connectToDatabase();
    }
    require('./controllers/authController').loginUser(req, res);
  } catch (err) {
    console.error('Direct auth login error:', err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: isDev ? err.message : 'An unexpected error occurred'
  });
});

// Fallback route handler untuk SPA
app.get('*', (req, res) => {
  // Coba kirim file statis jika ada
  const filePath = path.join(__dirname, 'public', req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      // Jika file tidak ditemukan, cek jika ada .html extension
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

// Server hanya berjalan di lingkungan lokal
if (!isVercel) {
  const PORT = process.env.SERVER_PORT || 9000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Socket.io setup (code unchanged)
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