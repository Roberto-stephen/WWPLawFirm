// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
dotenv.config();

const appointment = require('./routes/appointment');
const cases = require('./routes/case');
const document = require('./routes/document');
const auth = require('./routes/auth');
const taskRoutes = require('./routes/task');
const statistic = require('./routes/statistic');
const crmRoute = require('./routes/crm');

const mongoose = require('mongoose');

// Deteksi apakah berjalan di Vercel
const isVercel = process.env.VERCEL || false;

// Inisialisasi app
const app = express();

// Konfigurasi middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi CORS yang bekerja di kedua lingkungan
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://wwpmanage.vercel.app', 
      'http://localhost:3000', 
      'http://localhost:5173'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));

// Koneksi database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Database connected');
  })
  .catch((e) => {
    console.log('Database not connected due to error, ', e);
  });

// Routes
app.use('/api/appointments', appointment);
app.use('/api/documents', document);
app.use('/api/cases', cases);
app.use('/api/statistics', statistic);
app.use('/auth', auth);
app.use('/api/crm', crmRoute);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Inisiasi Socket.io dan server hanya untuk lingkungan lokal
let server;
if (!isVercel) {
  const PORT = process.env.SERVER_PORT || 9000;
  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  // Socket.io untuk lingkungan lokal
  const io = require('socket.io')(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      allowedHeaders: ["my-custom-header"],
      credentials: true
    }
  });
  
  // Socket.io handlers
  const { caseMessageHandlers, writeMessageBatchToDB } = require('./socketHandler/caseMessageHandlers');
  const jwt = require('jsonwebtoken');
  
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
} else {
  // Endpoint khusus untuk memberi tahu klien bahwa Socket.io tidak tersedia di demo
  app.get('/api/socket-status', (req, res) => {
    res.json({ 
      available: false, 
      message: "Socket.io tidak tersedia di versi demo. Gunakan versi lokal untuk fitur lengkap." 
    });
  });
}

// Untuk Vercel
module.exports = app;