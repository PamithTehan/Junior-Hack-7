# Sri Lankan Nutrition Advisor - Setup Guide

## Environment Variables

### Backend (.env file in Server folder)

Create a `.env` file in the `Server` folder with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/sri-lankan-nutrition

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### Frontend (.env file in Client/vite-project folder)

Create a `.env` file in the `Client/vite-project` folder with:

```env
VITE_API_URL=http://localhost:5000/api
```

## Installation Steps

### 1. Backend Setup

```bash
cd Server
npm install
npm run seed  # Pre-populate database with Sri Lankan foods
npm run dev   # Start development server
```

### 2. Frontend Setup

```bash
cd Client/vite-project
npm install
npm run dev   # Start development server
```

## Features

- ✅ User Authentication (JWT)
- ✅ Food Database with Sri Lankan foods
- ✅ Personalized Meal Planning
- ✅ Daily Food Tracking
- ✅ Health Profile Management
- ✅ Cloudinary Image Upload
- ✅ Responsive Design with Tailwind CSS
- ✅ Redux State Management
- ✅ Multi-language support structure (English, Sinhala, Tamil)

## Database Seeding

The database includes pre-populated Sri Lankan foods:
- Rice varieties (White, Red)
- Traditional curries (Dhal, Chicken, Fish, Vegetables)
- Breads (Hoppers, String Hoppers, Roti, Kottu)
- Sambols and sides
- Traditional beverages
- Desserts (Kiribath, Pittu)

Run `npm run seed` in the Server folder to populate the database.

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user
- PUT `/api/auth/profile` - Update profile
- POST `/api/auth/logout` - Logout

### Foods
- GET `/api/foods` - Get all foods (with search & filter)
- GET `/api/foods/:id` - Get single food
- POST `/api/foods` - Create food (Admin)
- PUT `/api/foods/:id` - Update food (Admin)
- DELETE `/api/foods/:id` - Delete food (Admin)

### Meal Plans
- GET `/api/mealplans` - Get meal plans
- POST `/api/mealplans/generate` - Generate meal plan
- POST `/api/mealplans` - Create meal plan
- GET `/api/mealplans/:id` - Get single meal plan

### Tracking
- GET `/api/tracking` - Get daily intakes
- GET `/api/tracking/:date` - Get intake for date
- POST `/api/tracking` - Add food to intake
- DELETE `/api/tracking/food?intakeId=xxx&foodItemId=xxx` - Remove food from intake

### Upload
- POST `/api/upload` - Upload image to Cloudinary

## Notes

- Make sure MongoDB is running before starting the server
- Update Cloudinary credentials in .env for image uploads
- JWT_SECRET should be a strong random string in production
- The meal planner requires a complete health profile (age, weight, height, activity level)

