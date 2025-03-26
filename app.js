// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path'); // Pindahkan ke atas
dotenv.config();
const getUserInfo = require('./helpers/getUserInfo');
const jwt = require('jsonwebtoken');
const { caseMessageHandlers, writeMessageBatchToDB } = require('./socketHandler/caseMessageHandlers')
const appointment = require('./routes/appointment');
const cases = require('./routes/case');
const document = require('./routes/document');
const auth = require('./routes/auth');
const taskRoutes = require('./routes/task');
const statistic = require('./routes/statistic');
const Notification = require('./models/notification');

const mongoose = require('mongoose');
const Message = require('./models/message')
const User = require('./models/user')
const crmRoute = require('./routes/crm');
const { requireAuth } = require('./middlewares/authMiddleware');

// PENTING: Inisialisasi app SEBELUM menggunakannya
const app = express();

// Konfigurasi middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
app.use(express.static(path.join(__dirname, 'public'))); // Pindahkan ke sini


mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Database connected');
  })
  .catch((e) => {
    console.log('Database not connected due to error, ', e);
  });
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://wwpmanage.vercel.app']
      : ['http://localhost:3000', 'http://localhost:5173'], // tambahkan port frontend lokal Anda
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  };

  app.use(cors(corsOptions));

  const PORT = process.env.NODE_ENV === 'production' 
  ? process.env.PORT || 3000 
  : process.env.SERVER_PORT || 9000;


const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// All routes
app.use('/api/appointments', appointment);
app.use('/api/documents', document);
app.use('/api/cases', cases);
app.use('/api/statistics', statistic);
app.use('/auth', auth);
app.use('/api/crm', crmRoute);
app.use('/api/tasks', taskRoutes);

// Pilih HANYA SATU dari dua route berikut (hapus yang tidak dibutuhkan)
// Opsi 1: Jika ingin menyajikan file HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


// Opsi 2: Jika ingin mengarahkan ke dokumentasi API
// app.get('/', (req, res) => {
//   res.redirect('/api-docs');
// });

const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

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

// Set up periodic batch write (adjust the interval as needed)
setInterval(writeMessageBatchToDB, 5000); // 5000 milliseconds (5 seconds) as an example interval