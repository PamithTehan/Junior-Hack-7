# Sri Lankan Nutrition Advisor

A comprehensive MERN stack web application designed to help users manage diabetes, obesity, and heart disease through culturally appropriate meal plans and food tracking, focusing on traditional Sri Lankan foods.

## 🌟 Features

### Core Functionality
- **User Authentication** - Secure JWT-based authentication system
- **Food Database** - Searchable database of Sri Lankan traditional foods with multi-language support
- **Meal Planning** - AI-powered personalized meal plan generation based on health profile
- **Food Tracking** - Daily food intake logging with automatic nutrition calculation
- **Health Dashboard** - Visual progress tracking with charts and statistics
- **Profile Management** - Comprehensive health profile with BMI and calorie goal calculation
- **Recipe Collection** - Traditional Sri Lankan recipes with nutritional information

### Technical Features
- **Multi-language Support** - English, Sinhala, and Tamil
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Real-time Updates** - Redux state management for seamless user experience
- **Image Upload** - Cloudinary integration for food and recipe images
- **Protected Routes** - Secure access control for authenticated users

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Redux Toolkit** - State management
- **React Router DOM v6** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization library
- **date-fns** - Date manipulation utilities

### Backend
- **Node.js** - JavaScript runtime
- **Express 5** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **BCrypt** - Password hashing
- **Cloudinary** - Cloud-based image storage
- **Multer** - File upload middleware

## 📁 Project Structure

```
Junior Hack 7/
├── Client/
│   └── vite-project/
│       ├── src/
│       │   ├── Components/
│       │   │   ├── Common/          # Navbar, Footer, ThemeToggle, LanguageToggle
│       │   │   ├── Auth/            # Authentication components
│       │   │   ├── Dashboard/       # Dashboard components
│       │   │   ├── Food/            # Food-related components
│       │   │   ├── Health/          # Health profile components
│       │   │   └── Recipes/         # Recipe components
│       │   ├── Pages/               # Main page components
│       │   │   ├── Auth/
│       │   │   │   ├── Login.jsx
│       │   │   │   └── Register.jsx
│       │   │   ├── Dashboard.jsx
│       │   │   ├── FoodDatabase.jsx
│       │   │   ├── FoodTracker.jsx
│       │   │   ├── MealPlanner.jsx
│       │   │   ├── Recipes.jsx
│       │   │   └── Profile.jsx
│       │   ├── store/               # Redux store
│       │   │   ├── index.js
│       │   │   └── slices/
│       │   │       ├── authSlice.js
│       │   │       ├── foodSlice.js
│       │   │       ├── mealSlice.js
│       │   │       └── userSlice.js
│       │   ├── Contexts/            # React contexts
│       │   │   ├── ThemeContext.jsx
│       │   │   └── LanguageContext.jsx
│       │   ├── Hooks/               # Custom hooks
│       │   │   └── useTranslation.js
│       │   ├── i18n/                # Internationalization
│       │   │   └── translations.js
│       │   ├── Utils/               # Utility functions
│       │   │   └── ProtectedRoute.jsx
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── index.css
│       ├── vite.config.js
│       └── package.json
│
└── Server/
    ├── Config/
    │   ├── database.js              # MongoDB connection
    │   └── cloudinary.js            # Cloudinary configuration
    ├── Controllers/
    │   ├── authController.js        # Authentication logic
    │   ├── foodController.js        # Food CRUD operations
    │   ├── mealPlanController.js    # Meal plan generation
    │   ├── trackingController.js    # Food tracking operations
    │   └── uploadController.js      # Image upload handling
    ├── Middlewares/
    │   ├── auth.js                  # JWT authentication middleware
    │   └── errorHandler.js          # Global error handler
    ├── Models/
    │   ├── User.js                  # User schema
    │   ├── FoodItem.js              # Food item schema
    │   ├── MealPlan.js              # Meal plan schema
    │   └── DailyIntake.js           # Daily intake tracking schema
    ├── Routes/
    │   ├── authRoutes.js
    │   ├── foodRoutes.js
    │   ├── mealPlanRoutes.js
    │   ├── trackingRoutes.js
    │   └── uploadRoutes.js
    ├── Utils/
    │   └── seedFoods.js             # Database seeding script
    ├── Server.js                    # Express app entry point
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Junior Hack 7"
   ```

2. **Set up Backend**
   ```bash
   cd Server
   npm install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the `Server` folder:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/sri-lankan-nutrition
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLIENT_URL=http://localhost:5173
   ```

4. **Seed the Database**
   ```bash
   npm run seed
   ```
   This will populate the database with 20+ Sri Lankan foods including rice, curries, breads, and traditional dishes.

5. **Start Backend Server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

6. **Set up Frontend**
   ```bash
   cd ../Client/vite-project
   npm install
   ```

7. **Configure Frontend Environment**
   
   Create a `.env` file in the `Client/vite-project` folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

8. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```
   Application will be available at `http://localhost:5173`

## 📚 API Documentation

All API endpoints are prefixed with `/api`

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user and get JWT token
- `GET /api/auth/me` - Get current authenticated user
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

### Food Endpoints
- `GET /api/foods` - Get all foods (supports query params: search, category, page, limit)
- `GET /api/foods/:id` - Get single food item by ID
- `POST /api/foods` - Create new food item (Admin only)
- `PUT /api/foods/:id` - Update food item (Admin only)
- `DELETE /api/foods/:id` - Delete food item (Admin only)

### Meal Plan Endpoints
- `GET /api/mealplans` - Get meal plans (supports query params: startDate, endDate)
- `GET /api/mealplans/:id` - Get single meal plan by ID
- `POST /api/mealplans/generate` - Generate personalized meal plan for a date
- `POST /api/mealplans` - Create or update meal plan

### Tracking Endpoints
- `GET /api/tracking` - Get daily intakes (supports query params: startDate, endDate)
- `GET /api/tracking/:date` - Get intake for specific date (format: YYYY-MM-DD)
- `POST /api/tracking` - Add food to daily intake
  ```json
  {
    "foodId": "food_item_id",
    "quantity": 1.5,
    "mealType": "breakfast",
    "date": "2024-01-15"
  }
  ```
- `DELETE /api/tracking/food?intakeId=xxx&foodItemId=xxx` - Remove food from intake

### Upload Endpoints
- `POST /api/upload` - Upload image to Cloudinary (multipart/form-data)

## 🎨 Design System

### Color Palette

The application uses a Sri Lankan-inspired color palette:

**Primary (Green - Tea Fields)**
- Main: `#38966e` (primary-600)
- Range: primary-50 to primary-900

**Secondary (Orange - Spices)**
- Main: `#f97316` (secondary-500)
- Range: secondary-50 to secondary-900

**Accent (Brown - Cinnamon)**
- Main: `#b87333` (accent-500)
- Range: accent-50 to accent-900

### Typography
- Font family: System fonts (sans-serif)
- Responsive text sizing with Tailwind CSS

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  healthProfile: {
    age: Number,
    weight: Number,
    height: Number,
    bmi: Number,
    healthConditions: [String],
    goals: [String],
    activityLevel: String,
    dailyCalorieGoal: Number
  },
  avatar: String,
  role: String (default: 'user')
}
```

### FoodItem Model
```javascript
{
  name: {
    en: String,
    si: String,
    ta: String
  },
  description: String,
  category: String (enum),
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  },
  servingSize: String,
  image: String,
  cloudinaryId: String,
  isTraditional: Boolean,
  tags: [String]
}
```

### MealPlan Model
```javascript
{
  userId: ObjectId (ref: User),
  date: Date,
  meals: [{
    mealType: String,
    items: [Object],
    totalNutrition: Object
  }],
  totalNutrition: Object,
  notes: String
}
```

### DailyIntake Model
```javascript
{
  userId: ObjectId (ref: User),
  date: Date,
  foods: [{
    foodId: ObjectId (ref: FoodItem),
    foodName: String,
    quantity: Number,
    mealType: String,
    nutrition: Object,
    loggedAt: Date
  }],
  totalNutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },
  totalCalories: Number
}
```

## 🔧 Development

### Available Scripts

**Backend (Server directory)**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with initial food data

**Frontend (Client/vite-project directory)**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Structure

- **Components** - Reusable UI components organized by feature
- **Pages** - Full page components for routes
- **Store** - Redux slices for state management
- **Contexts** - React contexts for theme and language
- **Utils** - Helper functions and utilities

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or check your MongoDB Atlas connection string
   - Verify `MONGODB_URI` in `.env` file

2. **Port Already in Use**
   - Change `PORT` in Server `.env` file
   - Or kill the process using the port: `npx kill-port 5000`

3. **CORS Errors**
   - Verify `CLIENT_URL` in Server `.env` matches your frontend URL
   - Check that both servers are running

4. **JWT Token Errors**
   - Clear browser localStorage
   - Logout and login again
   - Check `JWT_SECRET` is set in `.env`

5. **Image Upload Fails**
   - Verify Cloudinary credentials in `.env`
   - Check file size limits
   - Ensure proper file format (jpg, png, etc.)

6. **Food Tracking Delete Error**
   - Ensure you're using the correct endpoint: `DELETE /api/tracking/food?intakeId=xxx&foodItemId=xxx`
   - Check server logs for detailed error messages
   - Verify both IDs are valid MongoDB ObjectIds

### Debug Mode

Enable detailed logging by setting `NODE_ENV=development` in Server `.env` file.

## 📝 Recent Updates

### Bug Fixes
- ✅ Fixed food item deletion from daily intake (404 error resolved)
- ✅ Improved route handling for DELETE requests
- ✅ Enhanced error handling and debugging logs
- ✅ Fixed Mongoose subdocument removal method

### Improvements
- ✅ Added comprehensive logging for debugging
- ✅ Improved food item matching logic
- ✅ Better error messages with debug information
- ✅ Enhanced API response structure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Development Team - Junior Hack 7

## 🙏 Acknowledgments

- Traditional Sri Lankan food data and nutritional information
- Tailwind CSS for the design system
- MongoDB for database solutions
- Cloudinary for image hosting

## 🚀 Deployment

### Frontend (Vercel)

The frontend is configured for easy deployment to Vercel. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy to Vercel:**
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set root directory to `Client/vite-project`
4. Add environment variable: `VITE_API_URL`
5. Deploy

### Backend

The backend should be deployed separately to Railway, Render, or Heroku. See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for backend deployment options.

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

**Note**: This application is designed specifically for Sri Lankan traditional foods and cultural dietary preferences. Make sure to have a complete health profile before using meal planning features.

