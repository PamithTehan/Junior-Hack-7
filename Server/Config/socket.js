const jwt = require('jsonwebtoken');
const User = require('../Models/User');

// Socket.IO authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    // Try multiple ways to get the token
    const token = socket.handshake.auth?.token || 
                  (socket.handshake.headers?.authorization && socket.handshake.headers.authorization.startsWith('Bearer ') 
                    ? socket.handshake.headers.authorization.split(' ')[1] 
                    : null) ||
                  socket.handshake.query?.token;
    
    if (!token) {
      console.log('Socket authentication failed: No token provided');
      console.log('Handshake auth:', socket.handshake.auth);
      console.log('Handshake headers:', socket.handshake.headers);
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        console.log('Socket authentication failed: User not found');
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      console.log(`Socket authenticated: ${user.name} (${user._id})`);
      next();
    } catch (error) {
      console.log('Socket authentication failed: Invalid token', error.message);
      return next(new Error('Authentication error: Invalid token'));
    }
  } catch (error) {
    console.log('Socket authentication error:', error.message);
    next(new Error('Authentication error'));
  }
};

module.exports = { authenticateSocket };

