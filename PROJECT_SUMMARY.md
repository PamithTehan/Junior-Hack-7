# Sri Lankan Nutrition Advisor - Complete MERN Stack Application

## Project Overview

A complete MERN stack web application focusing on Sri Lankan traditional foods for managing diabetes, obesity, and heart disease through culturally appropriate meal plans and food tracking.

## Project Structure

```
Junior Hack 7/
├── Client/
│   └── vite-project/
│       ├── src/
│       │   ├── Components/
│       │   │   ├── Common/
│       │   │   │   ├── Navbar.jsx
│       │   │   │   └── Footer.jsx
│       │   │   ├── Auth/
│       │   │   ├── Dashboard/
│       │   │   ├── Food/
│       │   │   ├── Health/
│       │   │   └── Recipes/
│       │   ├── Pages/
│       │   │   ├── HomePage.jsx
│       │   │   ├── Auth/
│       │   │   │   ├── Login.jsx
│       │   │   │   └── Register.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── FoodDatabase.jsx
│       │   │   ├── MealPlanner.jsx
│       │   │   ├── FoodTracker.jsx
│       │   │   ├── Recipes.jsx
│       │   │   └── Profile.jsx
│       │   ├── store/
│       │   │   ├── index.js
│       │   │   └── slices/
│       │   │       ├── authSlice.js
│       │   │       ├── foodSlice.js
│       │   │       ├── userSlice.js
│       │   │       └── mealSlice.js
│       │   ├── utils/
│       │   │   └── ProtectedRoute.jsx
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── index.css
│       ├── tailwind.config.js
│       ├── vite.config.js
│       └── package.json
│
└── Server/
    ├── Config/
    │   ├── database.js
    │   └── cloudinary.js
    ├── Controllers/
    │   ├── authController.js
    │   ├── foodController.js
    │   ├── mealPlanController.js
    │   ├── trackingController.js
    │   └── uploadController.js
    ├── Middlewares/
    │   ├── auth.js
    │   └── errorHandler.js
    ├── Models/
    │   ├── User.js
    │   ├── FoodItem.js
    │   ├── MealPlan.js
    │   └── DailyIntake.js
    ├── Routes/
    │   ├── authRoutes.js
    │   ├── foodRoutes.js
    │   ├── mealPlanRoutes.js
    │   ├── trackingRoutes.js
    │   └── uploadRoutes.js
    ├── Utils/
    │   └── seedFoods.js
    ├── Server.js
    └── package.json
```

## Technology Stack

### Frontend
- **React 19** - UI Library
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **React Router DOM** - Routing
- **Tailwind CSS** - Styling (Sri Lankan color palette)
- **React Hook Form** - Form validation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **date-fns** - Date utilities

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **BCrypt** - Password hashing
- **Cloudinary** - Image storage
- **Multer** - File upload handling

## Features Implemented

### 1. Authentication System
- ✅ User registration with validation
- ✅ Login with JWT tokens
- ✅ Protected routes middleware
- ✅ Token refresh mechanism
- ✅ Profile management

### 2. Food Database
- ✅ Searchable Sri Lankan food items
- ✅ Multi-language support (English, Sinhala, Tamil)
- ✅ Category filtering
- ✅ Nutritional information
- ✅ Pagination
- ✅ Tags (diabetes-friendly, heart-healthy, etc.)

### 3. Meal Planning
- ✅ Personalized meal plan generation
- ✅ Based on health profile and goals
- ✅ Weekly view
- ✅ Daily nutrition breakdown
- ✅ Meal plan customization

### 4. Food Tracking
- ✅ Daily food intake logging
- ✅ Meal-based organization (breakfast, lunch, dinner, snack)
- ✅ Automatic calorie calculation
- ✅ Nutrition tracking (protein, carbs, fat)
- ✅ Date-based viewing

### 5. Dashboard
- ✅ Daily nutrition overview
- ✅ Progress charts
- ✅ Health profile summary
- ✅ Quick action buttons

### 6. Profile Management
- ✅ Health profile setup
- ✅ BMI calculation
- ✅ Calorie goal calculation
- ✅ Health conditions tracking
- ✅ Goal setting

### 7. Recipes
- ✅ Traditional Sri Lankan recipes
- ✅ Category filtering
- ✅ Nutritional information
- ✅ Recipe descriptions

## Database Models

### User Model
- name, email, password
- healthProfile: { age, weight, height, bmi, healthConditions, goals, activityLevel, dailyCalorieGoal }
- avatar, role

### FoodItem Model
- name: { en, si, ta }
- description, category
- nutrition: { calories, protein, carbs, fat, fiber, sugar, sodium }
- servingSize, image, tags

### MealPlan Model
- userId, date
- meals: [{ mealType, items, totalNutrition }]
- totalNutrition, notes

### DailyIntake Model
- userId, date
- foods: [{ foodId, foodName, quantity, mealType, nutrition }]
- totalNutrition

## API Endpoints

All endpoints are prefixed with `/api`

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `POST /auth/logout` - Logout

### Foods
- `GET /foods` - Get all foods (with search, category, pagination)
- `GET /foods/:id` - Get single food
- `POST /foods` - Create food (Admin only)
- `PUT /foods/:id` - Update food (Admin only)
- `DELETE /foods/:id` - Delete food (Admin only)

### Meal Plans
- `GET /mealplans` - Get meal plans (with date range)
- `GET /mealplans/:id` - Get single meal plan
- `POST /mealplans/generate` - Generate meal plan for date
- `POST /mealplans` - Create/update meal plan

### Tracking
- `GET /tracking` - Get daily intakes (with date range)
- `GET /tracking/:date` - Get intake for specific date
- `POST /tracking` - Add food to daily intake
- `DELETE /tracking/food?intakeId=xxx&foodItemId=xxx` - Remove food from intake

### Upload
- `POST /upload` - Upload image to Cloudinary

## Color Palette (Tailwind)

### Primary (Green - Tea Fields)
- primary-50 to primary-900
- Main: primary-600 (#38966e)

### Secondary (Orange - Spices)
- secondary-50 to secondary-900
- Main: secondary-500 (#f97316)

### Accent (Brown - Cinnamon)
- accent-50 to accent-900
- Main: accent-500 (#b87333)

## Getting Started

1. Set up environment variables (see SETUP.md)
2. Install dependencies: `npm install` in both Server and Client/vite-project
3. Seed database: `npm run seed` in Server folder
4. Start backend: `npm run dev` in Server folder
5. Start frontend: `npm run dev` in Client/vite-project folder
6. Access application at http://localhost:5173

## Pre-populated Data

The seed script includes 20+ Sri Lankan foods:
- Rice varieties (White, Red)
- Traditional curries (Dhal, Chicken, Fish, Vegetables)
- Breads (Hoppers, String Hoppers, Roti, Kottu)
- Sambols (Pol Sambol, Lunu Miris)
- Traditional beverages (King Coconut)
- Fruits (Jackfruit)
- Leafy greens (Gotu Kola, Mallum)

All foods include:
- Multi-language names (English, Sinhala, Tamil)
- Detailed nutritional information
- Categories and tags
- Descriptions

## Notes

- JWT tokens are stored in localStorage and axios headers
- Protected routes redirect to login if not authenticated
- Meal plan generation requires complete health profile
- Cloudinary credentials needed for image uploads
- MongoDB connection string should be configured in .env

