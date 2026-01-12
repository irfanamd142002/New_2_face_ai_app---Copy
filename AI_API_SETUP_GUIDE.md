# AI API Setup Guide for Face Skin Analysis

This guide explains how to set up real AI APIs for face detection and skin analysis in your application.

## Overview

The application supports multiple AI providers with automatic fallback:
1. **Google Vision API** (Primary)
2. **Azure Face API** (Secondary)
3. **Mock Analysis** (Fallback)

## Google Vision API Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Vision API:
   - Go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

### 2. Create Service Account
1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Fill in details:
   - Name: `face-analysis-service`
   - Description: `Service account for face detection and analysis`
4. Grant roles:
   - `Cloud Vision API Service Agent`
   - `Storage Object Viewer` (if using Cloud Storage)

### 3. Generate Credentials
1. Click on the created service account
2. Go to "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Download the JSON file

### 4. Configure Environment
Add to your `.env` file:
```env
# Google Vision API
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
```

## Azure Face API Setup

### 1. Create Azure Account
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create a new account or sign in

### 2. Create Face API Resource
1. Click "Create a resource"
2. Search for "Face"
3. Select "Face" service
4. Configure:
   - Subscription: Your subscription
   - Resource group: Create new or use existing
   - Region: Choose closest to your users
   - Name: `face-analysis-api`
   - Pricing tier: F0 (free) or S0 (standard)

### 3. Get API Keys
1. Go to your Face API resource
2. Click "Keys and Endpoint"
3. Copy Key 1 and Endpoint

### 4. Configure Environment
Add to your `.env` file:
```env
# Azure Face API
AZURE_FACE_API_KEY=your_azure_face_api_key
AZURE_FACE_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
```

## Complete Environment Configuration

Your `.env` file should include:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/zeshto_face_analyzer
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# AI APIs
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
AZURE_FACE_API_KEY=your_azure_face_api_key
AZURE_FACE_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/

# Server Configuration
PORT=5000
NODE_ENV=development
```

## API Features

### Google Vision API Features
- Face detection with bounding boxes
- Facial landmarks detection
- Emotion detection
- Age estimation
- High accuracy face detection

### Azure Face API Features
- Face detection and recognition
- Age and gender estimation
- Emotion analysis
- Facial hair and accessories detection
- Smile detection

### Fallback Mock Analysis
- Simulated face detection
- Random but realistic skin metrics
- Always available when APIs are not configured

## Usage in Application

The application automatically:
1. Tries Google Vision API first (if configured)
2. Falls back to Azure Face API (if configured)
3. Uses mock analysis as final fallback

## Cost Considerations

### Google Vision API Pricing
- First 1,000 face detections per month: Free
- Additional detections: $1.50 per 1,000 images

### Azure Face API Pricing
- F0 (Free): 20 transactions per minute, 30,000 per month
- S0 (Standard): $1.00 per 1,000 transactions

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables for all credentials**
3. **Rotate API keys regularly**
4. **Monitor API usage and costs**
5. **Implement rate limiting**
6. **Use HTTPS for all API calls**

## Testing the Setup

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

3. Test face analysis endpoint:
   ```bash
   curl -X POST http://localhost:5000/api/analysis/ai-analysis \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "faceImage=@path/to/test/image.jpg"
   ```

## Troubleshooting

### Google Vision API Issues
- **Authentication Error**: Check GOOGLE_APPLICATION_CREDENTIALS path
- **Permission Denied**: Verify service account roles
- **API Not Enabled**: Enable Vision API in Google Cloud Console

### Azure Face API Issues
- **Invalid Key**: Verify AZURE_FACE_API_KEY is correct
- **Wrong Endpoint**: Check AZURE_FACE_ENDPOINT format
- **Rate Limit**: Check your pricing tier limits

### General Issues
- **No Face Detected**: Ensure image contains a clear human face
- **Image Too Large**: Resize images to under 10MB
- **Network Issues**: Check internet connectivity and firewall settings

## Advanced Configuration

### Custom Skin Analysis
You can enhance the skin analysis by:
1. Training custom ML models
2. Integrating specialized dermatology APIs
3. Adding image preprocessing
4. Implementing texture analysis

### Performance Optimization
- Implement image compression
- Use CDN for image storage
- Cache analysis results
- Implement request queuing

## Support

For technical support:
1. Check the application logs
2. Verify environment configuration
3. Test API connectivity
4. Review API documentation:
   - [Google Vision API Docs](https://cloud.google.com/vision/docs)
   - [Azure Face API Docs](https://docs.microsoft.com/en-us/azure/cognitive-services/face/)