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
- **Weather Integration** - Real-time weather data with workout recommendations
- **Responsive Design** - Mobile-first, fully responsive UI

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
- **Weather API**: Open-Meteo API
- **Frontend**: EJS, HTML5, CSS3, JavaScript

## 📁 Project Structure

```
gym-website/
├── models/                 # Database schemas
│   ├── User.js            # User model with membership data
│   ├── Session.js         # Gym session model
│   ├── Reservation.js     # Booking model
│   ├── NutritionPlan.js   # Nutrition plan model
│   ├── Membership.js      # Membership model
│   └── Contact.js         # Contact form model
├── routes/                # Express routes
│   ├── auth.js           # Authentication routes
│   ├── users.js          # User management routes
│   ├── sessions.js       # Session booking routes
│   ├── reservations.js   # Reservation management
│   ├── nutrition.js      # Nutrition plan routes
│   ├── memberships.js    # Membership routes
│   ├── contact.js        # Contact form routes
│   └── admin.js          # Admin routes
├── controllers/           # Route controllers
│   ├── authController.js
│   ├── sessionController.js
│   ├── reservationController.js
│   ├── nutritionController.js
│   └── adminController.js
├── middleware/            # Custom middleware
│   ├── auth.js           # Authentication middleware
│   └── admin.js          # Admin authorization
├── views/                 # EJS templates
│   ├── index.ejs         # Homepage
│   ├── about.ejs         # About page
│   ├── services.ejs      # Services page
│   ├── join.ejs          # Membership signup
│   ├── login.ejs         # Login page
│   ├── dashboard.ejs     # User dashboard
│   ├── admin.ejs         # Admin panel
│   └── contact.ejs       # Contact page
├── public/                # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side JavaScript
│   └── images/           # Image assets
├── scripts/               # Utility scripts
│   ├── create-admin.js   # Admin user creation
│   ├── generate-ssl.js   # SSL certificate generation
│   └── generate-ssl-node.js
└── ssl/                   # SSL certificates (development)
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/gym-website.git
cd gym-website
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/redefinelab
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/redefinelab

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
NODE_ENV=development
PORT=3000
HTTPS_PORT=3443

# SSL Certificates (for HTTPS development)
SSL_KEY_PATH=./ssl/server.key
SSL_CERT_PATH=./ssl/server.cert
```

### 4. Set Up SSL for HTTPS (Development)

#### Option 1: Using Node.js Built-in Generation
```bash
npm run generate-ssl:node
```

#### Option 2: Using mkcert (Recommended)
```bash
# Install mkcert first, then:
npm run generate-ssl
```

#### Option 3: Quick HTTPS Setup
```bash
npm run setup:ssl
```

### 5. Create Admin User
```bash
npm run create-admin
```

### 6. Start the Server

#### Development with HTTP only:
```bash
npm run dev
```

#### Development with HTTPS:
```bash
npm run dev:https
```

#### Production:
```bash
npm start
```

## 🌐 Server Availability

After starting the server, the application will be available at:

- **HTTP**: http://localhost:3000
- **HTTPS**: https://localhost:3443 (if SSL is configured)

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `DELETE /users/profile` - Delete user account

### Memberships
- `GET /memberships` - Get available memberships
- `POST /memberships/purchase` - Purchase membership
- `GET /memberships/my` - Get user's membership

### Sessions
- `GET /sessions` - Get available sessions
- `GET /sessions/:id` - Get session details
- `POST /sessions` - Create new session (admin)
- `PUT /sessions/:id` - Update session (admin)
- `DELETE /sessions/:id` - Delete session (admin)

### Reservations
- `GET /reservations` - Get user's reservations
- `POST /reservations` - Make a reservation
- `DELETE /reservations/:id` - Cancel reservation

### Nutrition Plans
- `GET /nutrition/plans` - Get nutrition plans (Elite members)
- `POST /nutrition/plans` - Create nutrition plan (admin)

### Contact
- `POST /contact` - Submit contact form

## 🔒 Security Features

- **Helmet.js** - Security headers and XSS protection
- **CORS** - Cross-origin resource sharing configuration
- **Rate Limiting** - Prevents brute force attacks
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt for secure password storage
- **Input Validation** - express-validator for request validation
- **Content Security Policy** - CSP headers for XSS protection

## 🎨 Frontend Features

- **Responsive Design** - Mobile-first approach with breakpoints
- **Weather Widget** - Real-time weather with workout recommendations
- **Enhanced Forms** - Floating labels and real-time validation
- **Interactive Navigation** - Mobile hamburger menu
- **Smooth Animations** - CSS transitions and hover effects

## 📱 Responsive Breakpoints

- **Mobile Portrait**: ≤ 480px
- **Mobile Landscape**: 481px - 768px
- **Tablet**: 769px - 1024px
- **Desktop**: 1025px - 1440px
- **Ultra-wide**: ≥ 1441px

## 🧪 Testing

### API Testing
Use tools like Postman or Insomnia to test the API endpoints:

1. Register a new user
2. Login to get JWT token
3. Use token in Authorization header for protected routes
4. Test various CRUD operations

### Browser Testing
1. Navigate to http://localhost:3000
2. Test user registration and login
3. Try booking sessions and managing reservations
4. Test responsive design on different screen sizes

## 🛡️ Admin Features

Access the admin panel at `/admin` with admin credentials:

- User management
- Session management
- Reservation monitoring
- Membership analytics
- System health monitoring

## 📝 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run dev:https` - Start HTTPS development server
- `npm run generate-ssl` - Generate SSL certificates with mkcert
- `npm run generate-ssl:node` - Generate SSL with Node.js crypto
- `npm run setup:ssl` - Complete HTTPS setup
- `npm run create-admin` - Create admin user
- `npm test` - Run tests (when implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@example.com]

---

**Built with ❤️ by RedefineLab Team**