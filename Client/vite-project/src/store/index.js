import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import foodReducer from './slices/foodSlice';
import userReducer from './slices/userSlice';
import mealReducer from './slices/mealSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    food: foodReducer,
    user: userReducer,
    meal: mealReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// TypeScript types (for TypeScript projects)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

