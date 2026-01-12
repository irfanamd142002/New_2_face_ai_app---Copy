# 🚀 Developer Setup Guide - Zeshto Face Skin Analyzer

## ✅ **CONFIRMATION: Project Folder Sharing**

**YES**, sharing this project folder will allow another developer to access and run the application. However, they will need to install some prerequisites and follow the setup steps below.

---

## 📋 **PREREQUISITE CHECKLIST**

### **Required Software Installation**

#### 1. **Node.js** (REQUIRED)
- **Version**: v16.0.0 or higher (recommended: v18.x or v20.x)
- **Download**: [https://nodejs.org/](https://nodejs.org/)
- **Verification**: Run `node --version` in terminal
- **Purpose**: JavaScript runtime for both frontend and backend

#### 2. **npm** (INCLUDED WITH NODE.JS)
- **Version**: v8.0.0 or higher
- **Verification**: Run `npm --version` in terminal
- **Purpose**: Package manager for installing dependencies

#### 3. **Git** (RECOMMENDED)
- **Download**: [https://git-scm.com/](https://git-scm.com/)
- **Verification**: Run `git --version` in terminal
- **Purpose**: Version control (optional but recommended)

#### 4. **MongoDB** (OPTIONAL)
- **Version**: v4.4 or higher
- **Download**: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- **Note**: Application includes fallback to in-memory database if MongoDB is not available
- **Purpose**: Database for storing user data and analysis results

---

## 🛠️ **SETUP INSTRUCTIONS**

### **Step 1: Extract/Copy Project Folder**
1. Extract the shared project folder to your desired location
2. Open terminal/command prompt in the project root directory

### **Step 2: Automated Setup (RECOMMENDED)**

#### **For Windows Users:**
```bash
# Option A: Run PowerShell script (recommended)
.\start.ps1

# Option B: Run batch file
.\start.bat
```

#### **For Mac/Linux Users:**
```bash
# Install dependencies
npm run install-all

# Start the application
npm run dev
```

### **Step 3: Manual Setup (If Automated Fails)**

#### **Install Dependencies:**
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root
cd ..
```

#### **Environment Configuration:**
1. The `.env` file is already included in `server/.env`
2. **No additional configuration needed** for basic functionality
3. For email features, update email credentials in `server/.env`

#### **Start the Application:**
```bash
npm run dev
```

---

## 🌐 **ACCESS INFORMATION**

Once the application starts successfully:

- **Frontend (User Interface)**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues & Solutions:**

#### **1. Node.js Not Found**
```bash
# Download and install Node.js from nodejs.org
# Restart terminal after installation
node --version
```

#### **2. Permission Errors (Windows)**
```bash
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### **3. Port Already in Use**
```bash
# Kill processes on ports 5173 and 5000
npx kill-port 5173
npx kill-port 5000
```

#### **4. "start.bat is not recognized" Error**
```bash
# Use the correct PowerShell syntax with .\ prefix
.\start.bat

# Or run the PowerShell script directly
.\start.ps1
```

#### **5. Dependencies Installation Fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **6. MongoDB Connection Issues**
- **Solution**: Application automatically falls back to in-memory database
- **No action required** - the app will work without MongoDB

---

## 📁 **WHAT'S INCLUDED IN THE PROJECT FOLDER**

### **Essential Files:**
- ✅ Complete source code (client & server)
- ✅ All dependencies configuration (package.json files)
- ✅ Environment configuration (.env file)
- ✅ Startup scripts (start.bat, start.ps1)
- ✅ Documentation (README.md, integration guides)
- ✅ Sample data and configurations

### **Ready-to-Use Features:**
- ✅ AI-powered face skin analysis
- ✅ Product recommendation system
- ✅ User authentication & profiles
- ✅ Responsive web interface
- ✅ Database integration (with fallback)
- ✅ E-commerce integration ready

---

## ⚡ **QUICK START SUMMARY**

1. **Install Node.js** (if not already installed)
2. **Extract project folder** to desired location
3. **Open terminal** in project root
4. **Run**: `.\start.ps1` (Windows) or `npm run dev` (Mac/Linux)
5. **Access**: [http://localhost:5173](http://localhost:5173)

---

## 📞 **SUPPORT**

If the developer encounters any issues:

1. **Check Prerequisites**: Ensure Node.js v16+ is installed
2. **Run Diagnostics**: Use `npm run install-all` to verify setup
3. **Check Logs**: Terminal output will show specific error messages
4. **Fallback Method**: Use manual setup instructions above

---

## 🎯 **INTEGRATION NOTES**

For e-commerce website integration:
- Review `INTEGRATION_GUIDE.md` for detailed integration steps
- Check `INTEGRATION_FILES_LIST.md` for required files
- API endpoints are documented and ready for integration
- Frontend components can be embedded or used as reference

---

**✨ The application is designed to work out-of-the-box with minimal setup required!**