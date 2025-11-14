const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./Config/database');
const errorHandler = require('./Middlewares/errorHandler');
const { authenticateSocket } = require('./Config/socket');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'https://nutritionadvisor-plum.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type']
  },
  allowEIO3: true, // Allow Engine.IO v3 clients
  transports: ['websocket', 'polling']
});

// Socket.IO authentication middleware
io.use(authenticateSocket);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId} (${socket.user.name})`);

  // Join user's personal room for private updates
  socket.join(`user:${socket.userId}`);

  // Handle food tracking updates
  socket.on('food:added', (data) => {
    // Broadcast to user's room
    io.to(`user:${socket.userId}`).emit('food:added', data);
  });

  socket.on('food:removed', (data) => {
    io.to(`user:${socket.userId}`).emit('food:removed', data);
  });

  // Handle meal plan updates
  socket.on('mealplan:generated', (data) => {
    io.to(`user:${socket.userId}`).emit('mealplan:generated', data);
  });

  // Handle profile updates
  socket.on('profile:updated', (data) => {
    io.to(`user:${socket.userId}`).emit('profile:updated', data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Make io available to routes
app.set('io', io);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'https://nutritionadvisor-plum.vercel.app'
  ],
  credentials: true,
}));

// Routes
app.use('/api/auth', require('./Routes/authRoutes'));
app.use('/api/foods', require('./Routes/foodRoutes'));
app.use('/api/mealplans', require('./Routes/mealPlanRoutes'));
app.use('/api/tracking', require('./Routes/trackingRoutes'));
app.use('/api/upload', require('./Routes/uploadRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
});

