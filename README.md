# 🏋️‍♂️ RedefineLab Gym Management System

A comprehensive gym management system built with Node.js, Express, and MongoDB, featuring user authentication, membership management, session booking, and nutrition planning.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based authentication with role-based access control
- **Membership Management** - Three-tier membership system (Standard, Premium, Elite)
- **Session Booking System** - Group classes, private coaching, and personal training sessions
- **Nutrition Planning** - Personalized nutrition plans for Elite members
- **Reservation Management** - Complete booking and cancellation system
- **Admin Dashboard** - Comprehensive admin tools for gym management

### Membership Tiers

#### 🥉 Standard Plan ($39/month)
- 24/7 gym access
- All equipment & facilities
- Locker room access
- Private sessions (extra payment required)

#### 🥈 Premium Plan ($59/month)
- Everything in Standard
- Group classes included
- 2 guest passes/month
- Nutrition tracking tools

#### 🥇 Elite Plan ($99/month)
- Everything in Premium
- 4 personal training sessions/month
- Personalized nutrition plan
- Priority class booking
- Unlimited guest passes

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt.js, Helmet, CORS, Rate Limiting
- **Validation**: express-validator
- **File Upload**: Multer

## 📁 Project Structure

```
gym-website/
├── models/                 # Database schemas
│   ├── User.js            # User model with membership data
│   ├── Session.js         # Session/class model
│   ├── Reservation.js     # Booking model
│   ├── NutritionPlan.js   # Nutrition plan model
│   ├── Membership.js      # Membership plans model
│   └── Contact.js         # Contact form model
├── controllers/           # Business logic
│   ├── authController.js  # Authentication logic
│   ├── sessionController.js # Session management
│   ├── reservationController.js # Booking management
│   ├── nutritionController.js # Nutrition planning
│   └── userController.js  # User management
├── routes/               # API endpoints
│   ├── auth.js          # Authentication routes
│   ├── sessions.js      # Session routes
│   ├── reservations.js  # Reservation routes
│   ├── nutrition.js     # Nutrition routes
│   └── users.js         # User management routes
├── middleware/          # Custom middleware
│   └── auth.js         # JWT authentication & authorization
├── public/             # Static files (HTML, images, etc.)
│   ├── index.html      # Home page
│   ├── login.html      # Login page
│   ├── join.html       # Registration page
│   ├── dashboard.html  # User dashboard
│   ├── admin.html      # Admin dashboard
│   ├── about.html      # About page
│   ├── contact.html    # Contact page
│   ├── services.html   # Services page
│   ├── test.html       # Test page
│   ├── favicon.svg     # Website icon
│   ├── hero.jpg        # Hero background image
│   └── Gemini_Generated_Image_wfkascwfkascwfka.png
├── css/                # Stylesheets
│   └── style.css       # Main stylesheet
├── js/                 # JavaScript files
│   ├── script.js       # Main JavaScript file
│   ├── dashboard.js    # Dashboard functionality
│   ├── admin.js        # Admin dashboard functionality
│   ├── join.js         # Registration functionality
│   └── test.js         # Test functionality
├── app.js              # Main application file
├── package.json        # Dependencies
└── .env               # Environment variables
```

## 🚀 Installation & Setup

### Quick Deploy to Production 🌐
For complete deployment guide with domain setup, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

**One-click Deploy Options**:
- **Vercel**: `npm run deploy:vercel`
- **Railway**: `npm run deploy:railway`
- **Render**: GitHub integration (see [DEPLOYMENT.md](./DEPLOYMENT.md))

### Development Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gym-website
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
HTTPS_PORT=3443
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/redefinelab

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Security
BCRYPT_ROUNDS=12

# SSL Configuration (for HTTPS development)
# Uncomment and set paths for SSL certificates
# SSL_KEY_PATH=./ssl/server.key
# SSL_CERT_PATH=./ssl/server.cert
```

### 4. Database Setup
#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# Start MongoDB service
mongod
```

#### Option B: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### 5. Start the Application

#### Option A: HTTP Only (Default)
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:3000`

#### Option B: HTTPS Development Setup
```bash
# Generate self-signed SSL certificates and start with HTTPS
npm run setup:ssl

# Or manually:
npm run generate-ssl
npm run dev:https
```

The application will be available at:
- **HTTPS**: `https://localhost:3443` (with self-signed certificate)
- **HTTP**: `http://localhost:3000` (fallback)

⚠️ **Note**: Self-signed certificates will show a security warning in browsers. This is normal for development.

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "age": 25,
  "gender": "male",
  "membershipType": "standard",
  "fitnessGoals": ["weight_loss", "muscle_gain"],
  "medicalConditions": []
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

### Session Management

#### Get All Sessions
```http
GET /api/sessions?type=group&date=2024-01-15&limit=10
```

#### Get Single Session
```http
GET /api/sessions/:id
```

#### Reserve Session
```http
POST /api/sessions/:id/reserve
Authorization: Bearer <jwt_token>
```

#### Create Session (Admin)
```http
POST /api/sessions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Yoga Class",
  "type": "group",
  "date": "2024-01-15",
  "time": "10:00 AM",
  "duration": 60,
  "maxCapacity": 20,
  "price": 0,
  "description": "Beginner-friendly yoga session",
  "difficulty": "beginner",
  "tags": ["yoga", "flexibility"],
  "equipment": ["yoga mat"]
}
```

### Reservation Management

#### Get User Reservations
```http
GET /api/reservations?status=confirmed&limit=10
Authorization: Bearer <jwt_token>
```

#### Cancel Reservation
```http
PUT /api/reservations/:id/cancel
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "reason": "Schedule conflict"
}
```

#### Mark Attendance (Admin)
```http
PUT /api/reservations/:id/attend
Authorization: Bearer <jwt_token>
```

### Nutrition Planning (Elite Members Only)

#### Get User's Nutrition Plan
```http
GET /api/nutrition/me
Authorization: Bearer <jwt_token>
```

#### Create Nutrition Plan (Admin)
```http
POST /api/nutrition/admin
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Weight Loss Plan",
  "description": "High-protein, low-carb diet for weight loss",
  "category": "weight_loss",
  "difficulty": "intermediate",
  "duration": 30,
  "dailyCalories": 1800,
  "macronutrients": {
    "protein": 30,
    "carbohydrates": 40,
    "fats": 30
  },
  "meals": [
    {
      "name": "breakfast",
      "time": "8:00 AM",
      "calories": 400,
      "foods": [
        {
          "name": "Oatmeal",
          "quantity": "1 cup",
          "calories": 150,
          "protein": 6,
          "carbs": 27,
          "fats": 3
        }
      ]
    }
  ],
  "restrictions": ["gluten_free"],
  "supplements": [
    {
      "name": "Whey Protein",
      "dosage": "30g",
      "timing": "after_workout"
    }
  ],
  "hydration": {
    "dailyWater": 2500,
    "notes": "Drink 8 glasses of water daily"
  }
}
```

### User Management (Admin Only)

#### Get All Users
```http
GET /api/users?membershipType=elite&limit=20
Authorization: Bearer <jwt_token>
```

#### Update User Membership
```http
PUT /api/users/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "membershipType": "premium",
  "guestPassesRemaining": 2,
  "personalTrainingSessionsRemaining": 0
}
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt.js for password security
- **Input Validation** - express-validator for data validation
- **Rate Limiting** - Protection against brute force attacks
- **CORS Protection** - Cross-origin resource sharing security
- **Helmet** - Security headers for Express
- **Role-based Authorization** - Admin, Trainer, and User roles

## 🎯 Business Logic

### Membership Benefits

#### Standard Members
- Can book private sessions (extra payment required)
- Must pay for group classes
- No guest passes included

#### Premium Members
- Group classes included
- 2 guest passes per month
- Private sessions require extra payment

#### Elite Members
- All Premium benefits
- 4 personal training sessions per month
- Unlimited guest passes
- Personalized nutrition plan
- Priority booking for classes

### Session Booking Rules
- Users cannot double-book sessions
- Cancellations allowed up to 2 hours before session
- Session capacity is automatically managed
- Payment status tracked for paid sessions

### Reservation Management
- Automatic session capacity updates
- Attendance tracking
- Payment status management
- Cancellation with refund logic

## 🧪 Testing

### Manual Testing
```bash
# Test authentication
curl -X POST https://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","membershipType":"standard"}'

# Test session creation (requires admin token)
curl -X POST https://localhost:3000/api/sessions \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Class","type":"group","date":"2024-01-15","time":"10:00 AM","maxCapacity":10}'
```

## 📊 Database Models

### User Model
- Basic info (name, email, phone, age, gender)
- Membership details (type, status, expiry)
- Benefits tracking (guest passes, training sessions)
- Nutrition plan reference
- Authentication data (password hash, last login)

### Session Model
- Session details (name, type, date, time, duration)
- Capacity management (max capacity, current bookings)
- Trainer assignment
- Pricing and difficulty levels
- Equipment and tags

### Reservation Model
- User and session references
- Booking status and payment info
- Attendance tracking
- Cancellation data

### NutritionPlan Model
- Plan details (name, category, difficulty)
- Nutritional data (calories, macronutrients)
- Meal planning (meals, foods, supplements)
- User assignments and restrictions

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
HTTPS_PORT=3443
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/redefinelab
JWT_SECRET=your-very-secure-jwt-secret-key
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# SSL Configuration (for HTTPS)
SSL_KEY_PATH=/path/to/private.key
SSL_CERT_PATH=/path/to/certificate.crt
```

### HTTPS in Production

For production HTTPS, you have several options:

#### Option 1: Direct SSL Configuration
1. Obtain SSL certificates from a Certificate Authority (CA)
2. Set environment variables:
   ```env
   SSL_KEY_PATH=/path/to/your/private.key
   SSL_CERT_PATH=/path/to/your/certificate.crt
   ```

#### Option 2: Reverse Proxy (Recommended)
Use nginx or Apache as a reverse proxy with SSL termination:
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Option 3: Platform SSL
Deploy to platforms that provide automatic SSL:
- Heroku (automatic SSL)
- Vercel (automatic SSL)
- AWS with Load Balancer
- CloudFlare (SSL termination)

### PM2 Deployment
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start app.js --name "gym-website"

# Monitor
pm2 monit

# Logs
pm2 logs gym-website
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with basic authentication and membership management
- **v1.1.0** - Added session booking and reservation system
- **v1.2.0** - Added nutrition planning for Elite members
- **v1.3.0** - Enhanced admin features and reporting

---

**Built with ❤️ by RedefineLab Team** 