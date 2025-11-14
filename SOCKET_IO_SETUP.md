# Socket.IO Real-time Updates Setup

This document explains the Socket.IO implementation for real-time updates in the Sri Lankan Nutrition Advisor application.

## Overview

Socket.IO has been integrated to provide real-time updates for:
- Food tracking (add/remove food items)
- Meal plan generation
- Profile updates
- Dashboard statistics

## Installation

### Backend
```bash
cd Server
npm install socket.io
```

### Frontend
```bash
cd Client/vite-project
npm install socket.io-client
```

## Architecture

### Server-Side (Backend)

1. **Socket.IO Server Setup** (`Server/Server.js`)
   - Integrated with Express HTTP server
   - JWT authentication middleware for socket connections
   - User-specific rooms for private updates

2. **Socket Authentication** (`Server/Config/socket.js`)
   - Validates JWT tokens for socket connections
   - Attaches user information to socket instance

3. **Real-time Events**
   - `food:added` - When food is added to daily intake
   - `food:removed` - When food is removed from daily intake
   - `mealplan:generated` - When a meal plan is generated
   - `profile:updated` - When user profile is updated

### Client-Side (Frontend)

1. **Socket Service** (`Client/vite-project/src/Services/socket.js`)
   - Handles socket connection initialization
   - Manages connection lifecycle
   - Provides helper functions for emitting events

2. **Socket Context** (`Client/vite-project/src/Contexts/SocketContext.jsx`)
   - React context for socket access throughout the app
   - Automatically connects/disconnects based on authentication
   - Provides socket instance and connection status

3. **Component Integration**
   - `FoodTracker.jsx` - Listens for real-time food updates
   - Other components can use `useSocket()` hook for real-time features

## Usage

### In Components

```javascript
import { useSocket } from '../Contexts/SocketContext';

const MyComponent = () => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleUpdate = (data) => {
      // Handle real-time update
      console.log('Update received:', data);
    };

    socket.on('food:added', handleUpdate);

    return () => {
      socket.off('food:added', handleUpdate);
    };
  }, [socket, isConnected]);

  return <div>Component content</div>;
};
```

### Emitting Events

```javascript
const { emitFoodAdded } = useSocket();

// Emit event
emitFoodAdded({
  intake: intakeData,
  food: foodData
});
```

## Events Reference

### Client → Server

- `food:added` - Notify server about food addition
- `food:removed` - Notify server about food removal
- `mealplan:generated` - Notify server about meal plan generation
- `profile:updated` - Notify server about profile update

### Server → Client

- `food:added` - Broadcast food addition to user's room
- `food:removed` - Broadcast food removal to user's room
- `mealplan:generated` - Broadcast meal plan generation to user's room
- `profile:updated` - Broadcast profile update to user's room

## Features

### 1. Real-time Food Tracking
- When a user adds/removes food, all their open tabs/devices receive instant updates
- No need to refresh the page to see changes

### 2. User-Specific Rooms
- Each user joins their own room: `user:${userId}`
- Updates are only sent to the specific user
- Privacy and security maintained

### 3. Automatic Reconnection
- Socket.IO automatically handles reconnection
- Connection status is tracked in the context

### 4. Authentication
- Socket connections require valid JWT tokens
- Unauthorized connections are rejected

## Configuration

### Environment Variables

No additional environment variables needed. Socket.IO uses the same:
- `CLIENT_URL` for CORS configuration
- `JWT_SECRET` for authentication

### CORS

Socket.IO CORS is configured in `Server.js`:
```javascript
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'https://nutritionadvisor-plum.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
});
```

## Testing

### Local Development

1. Start backend server:
   ```bash
   cd Server
   npm run dev
   ```

2. Start frontend:
   ```bash
   cd Client/vite-project
   npm run dev
   ```

3. Open browser console to see socket connection logs
4. Test by adding/removing food items and watching for real-time updates

### Production

- Ensure WebSocket support on your hosting platform
- Railway, Render, and Heroku support WebSockets
- Vercel (frontend) works with any backend that supports WebSockets

## Troubleshooting

### Socket Not Connecting

1. Check browser console for connection errors
2. Verify JWT token is valid
3. Check CORS configuration
4. Ensure backend is running and accessible

### Events Not Received

1. Verify socket is connected (`isConnected` should be `true`)
2. Check event names match exactly
3. Verify user is in the correct room
4. Check server logs for emitted events

### Authentication Errors

1. Ensure token is sent in socket handshake
2. Verify `JWT_SECRET` matches between client and server
3. Check token expiration

## Future Enhancements

Potential improvements:
- Real-time notifications system
- Live activity feed
- Collaborative meal planning
- Real-time chat support
- Push notifications integration

## Security Considerations

- All socket connections require authentication
- User-specific rooms prevent cross-user data leaks
- JWT tokens are validated on every connection
- CORS is properly configured

---

**Note**: Socket.IO automatically falls back to polling if WebSockets are not available, ensuring compatibility across all environments.

