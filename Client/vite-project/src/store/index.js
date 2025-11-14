import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import ingredientReducer from './slices/ingredientSlice';
import recipeReducer from './slices/recipeSlice';
import articleReducer from './slices/articleSlice';
import userReducer from './slices/userSlice';
import mealReducer from './slices/mealSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    ingredient: ingredientReducer,
    food: ingredientReducer, // Alias for backward compatibility
    recipe: recipeReducer,
    article: articleReducer,
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

