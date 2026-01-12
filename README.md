# Zeshto Face Skin Analyzer

A comprehensive AI-powered skincare application that analyzes facial skin conditions and recommends personalized Zeshto soap products based on individual skin types and concerns.

## 🌟 Features

### Core Functionality
- **AI Face Analysis**: Upload photos for automated skin type and concern detection
- **Manual Assessment**: Input skin information manually for personalized recommendations
- **Product Recommendations**: Get tailored Zeshto soap suggestions based on analysis results
- **Progress Tracking**: Monitor skin improvement over time with before/after comparisons
- **User Dashboard**: Comprehensive overview of skin health metrics and trends

### User Management
- **Authentication System**: Secure login, registration, and password reset
- **Profile Management**: Detailed user profiles with skin preferences and history
- **Analysis History**: Track and compare past skin analyses
- **Favorites**: Save preferred products for easy access

### Product Catalog
- **Comprehensive Product Database**: Complete Zeshto soap collection
- **Advanced Filtering**: Search by skin type, concerns, ingredients, and price
- **Detailed Product Pages**: In-depth information, ingredients, benefits, and usage instructions
- **E-commerce Integration**: Direct links to purchase products

### Modern UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Beautiful Animations**: Smooth transitions and micro-interactions
- **Accessibility**: WCAG compliant design with keyboard navigation
- **Dark/Light Theme**: Adaptive color schemes for user preference

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FaceApp_Ecommerce2
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create `.env` file in the `server` directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/zeshto_skin_analyzer
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   
   # Email Configuration (for password reset)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=noreply@zeshto.com
   
   # AI Service (optional - for enhanced analysis)
   AI_API_KEY=your_ai_service_api_key
   AI_API_URL=https://api.your-ai-service.com
   
   # File Upload
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   
   # Environment
   NODE_ENV=development
   PORT=5000
   ```

4. **Start the application**
   
   **Option A: Using batch files (Windows)**
   ```bash
   start.bat
   ```
   
   **Option B: Using npm commands**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Stopping the Application

**Option A: Using batch file (Windows)**
```bash
stop.bat
```

**Option B: Manual stop**
Press `Ctrl+C` in the terminal running the application

## 📁 Project Structure

```
FaceApp_Ecommerce2/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── common/    # Generic components (Button, Input, etc.)
│   │   │   └── layout/    # Layout components (Navbar, Layout)
│   │   ├── contexts/      # React Context providers
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # Application entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
├── server/                # Node.js backend application
│   ├── models/           # MongoDB data models
│   ├── routes/           # API route handlers
│   ├── middleware/       # Custom middleware
│   ├── utils/            # Utility functions
│   ├── uploads/          # File upload directory
│   ├── index.js          # Server entry point
│   ├── package.json      # Backend dependencies
│   └── seedData.js       # Database seeding script
├── start.bat             # Windows startup script
├── stop.bat              # Windows stop script
├── package.json          # Root package.json for scripts
└── README.md             # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests
- **React Hot Toast** - Beautiful notifications
- **Heroicons** - Beautiful SVG icons
- **Date-fns** - Date manipulation library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email sending
- **Express Validator** - Input validation

### Development Tools
- **Concurrently** - Run multiple commands simultaneously
- **Nodemon** - Auto-restart server on changes
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🔧 Configuration

### Database Setup

1. **Install MongoDB**
   - Download and install MongoDB Community Edition
   - Start MongoDB service

2. **Seed Database** (Optional)
   ```bash
   cd server
   node seedData.js
   ```

### Email Configuration

For password reset functionality, configure email settings in `.env`:

1. **Gmail Setup**
   - Enable 2-factor authentication
   - Generate an app password
   - Use the app password in `EMAIL_PASS`

2. **Other Email Providers**
   - Update `EMAIL_HOST` and `EMAIL_PORT` accordingly
   - Ensure SMTP authentication is enabled

### AI Integration (Optional)

For enhanced skin analysis, integrate with AI services:

1. **OpenAI Vision API**
   - Get API key from OpenAI
   - Add to `AI_API_KEY` in `.env`

2. **Custom AI Service**
   - Update `AI_API_URL` with your service endpoint
   - Modify analysis logic in `routes/analysis.js`

## 📱 Usage Guide

### For Users

1. **Registration/Login**
   - Create account with email and password
   - Complete profile with skin information

2. **Skin Analysis**
   - Upload clear facial photos
   - Or manually input skin type and concerns
   - Review analysis results and recommendations

3. **Product Discovery**
   - Browse Zeshto soap collection
   - Filter by skin type and concerns
   - View detailed product information

4. **Progress Tracking**
   - Regular skin analyses
   - Compare results over time
   - Monitor improvement trends

### For Developers

1. **Adding New Products**
   ```javascript
   // Add to server/seedData.js or use admin API
   const newProduct = {
     name: "Product Name",
     description: "Product description",
     price: 29.99,
     targetSkinTypes: ["Dry", "Sensitive"],
     targetSkinConcerns: ["Dryness", "Sensitivity"],
     ingredients: [
       { name: "Ingredient", description: "Benefit" }
     ],
     benefits: ["Benefit 1", "Benefit 2"],
     images: ["image1.jpg", "image2.jpg"]
   };
   ```

2. **Customizing Analysis Logic**
   - Modify `server/routes/analysis.js`
   - Update AI integration in `analyzeImageWithAI()`
   - Adjust recommendation algorithm

3. **UI Customization**
   - Update Tailwind config in `client/tailwind.config.js`
   - Modify components in `client/src/components/`
   - Add new pages in `client/src/pages/`

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt encryption for passwords
- **Input Validation** - Server-side validation for all inputs
- **File Upload Security** - Type and size validation for uploads
- **CORS Protection** - Cross-origin request security
- **Rate Limiting** - API request rate limiting (configurable)

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db-url
JWT_SECRET=your-production-jwt-secret
# ... other production configs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - AI-powered skin analysis
  - Product recommendation system
  - User authentication and profiles
  - Responsive web interface

## 🙏 Acknowledgments

- **Zeshto** - For the premium skincare product line
- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **MongoDB** - For the flexible NoSQL database
- **All Contributors** - For making this project possible

---

**Built with ❤️ for better skincare through technology**