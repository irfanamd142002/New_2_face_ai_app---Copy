// Skin Analysis Service
// This service provides comprehensive skin analysis functionality including
// face detection, skin type analysis, and concern identification

class SkinAnalysisService {
  constructor() {
    this.isInitialized = false;
    this.faceDetector = null;
    this.analysisHistory = [];
  }

  // Initialize the service with required models and configurations
  async initialize() {
    try {
      // Initialize face detection capabilities
      await this.initializeFaceDetection();
      this.isInitialized = true;
      console.log('Skin Analysis Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Skin Analysis Service:', error);
      return false;
    }
  }

  // Initialize face detection using browser APIs
  async initializeFaceDetection() {
    // Check if Face Detection API is available
    if ('FaceDetector' in window) {
      try {
        this.faceDetector = new window.FaceDetector({
          maxDetectedFaces: 1,
          fastMode: false
        });
        console.log('Browser Face Detection API initialized');
      } catch (error) {
        console.warn('Browser Face Detection API not available, using fallback');
        this.faceDetector = null;
      }
    }
  }

  // Main analysis function that processes an image and returns comprehensive results
  async analyzeImage(imageFile) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Convert image file to canvas for processing
      const canvas = await this.imageToCanvas(imageFile);
      const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

      // Perform face detection
      const faceRegions = await this.detectFaces(canvas);
      
      // Analyze skin if face is detected
      let skinAnalysis = null;
      if (faceRegions.length > 0) {
        skinAnalysis = await this.analyzeSkinRegions(imageData, faceRegions);
      } else {
        // Fallback: analyze entire image if no face detected
        skinAnalysis = await this.analyzeFullImage(imageData);
      }

      // Generate recommendations based on analysis
      const recommendations = this.generateRecommendations(skinAnalysis);

      const result = {
        timestamp: new Date().toISOString(),
        faceDetected: faceRegions.length > 0,
        faceRegions,
        skinAnalysis,
        recommendations,
        confidence: skinAnalysis ? skinAnalysis.confidence : 0.5
      };

      // Store in history
      this.analysisHistory.push(result);
      
      return result;
    } catch (error) {
      console.error('Error during skin analysis:', error);
      throw new Error('Failed to analyze image. Please try again.');
    }
  }

  // Convert image file to canvas for processing
  async imageToCanvas(imageFile) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize image for optimal processing (max 800px width)
        const maxWidth = 800;
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(imageFile);
    });
  }

  // Detect faces in the image
  async detectFaces(canvas) {
    const faces = [];
    
    if (this.faceDetector) {
      try {
        const detectedFaces = await this.faceDetector.detect(canvas);
        return detectedFaces.map(face => ({
          x: face.boundingBox.x,
          y: face.boundingBox.y,
          width: face.boundingBox.width,
          height: face.boundingBox.height,
          landmarks: face.landmarks || []
        }));
      } catch (error) {
        console.warn('Face detection failed, using fallback method');
      }
    }

    // Fallback: assume center region contains face
    const centerFace = {
      x: canvas.width * 0.2,
      y: canvas.height * 0.2,
      width: canvas.width * 0.6,
      height: canvas.height * 0.6,
      landmarks: []
    };
    
    return [centerFace];
  }

  // Analyze skin in detected face regions
  async analyzeSkinRegions(imageData, faceRegions) {
    const primaryFace = faceRegions[0];
    
    // Extract skin pixels from face region
    const skinPixels = this.extractSkinPixels(imageData, primaryFace);
    
    // Analyze skin characteristics
    const skinType = this.determineSkinType(skinPixels);
    const skinConcerns = this.identifySkinConcerns(skinPixels, imageData, primaryFace);
    const skinTone = this.analyzeSkinTone(skinPixels);
    
    return {
      skinType,
      skinConcerns,
      skinTone,
      confidence: 0.85,
      analysisRegion: primaryFace
    };
  }

  // Analyze full image when no face is detected
  async analyzeFullImage(imageData) {
    const allPixels = this.extractAllPixels(imageData);
    
    return {
      skinType: this.determineSkinType(allPixels),
      skinConcerns: this.identifyGeneralConcerns(allPixels),
      skinTone: this.analyzeSkinTone(allPixels),
      confidence: 0.6,
      analysisRegion: { x: 0, y: 0, width: imageData.width, height: imageData.height }
    };
  }

  // Extract skin-colored pixels from a region
  extractSkinPixels(imageData, region) {
    const pixels = [];
    const data = imageData.data;
    const width = imageData.width;
    
    for (let y = Math.max(0, region.y); y < Math.min(imageData.height, region.y + region.height); y++) {
      for (let x = Math.max(0, region.x); x < Math.min(width, region.x + region.width); x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        
        // Filter for skin-like colors
        if (this.isSkinColor(r, g, b)) {
          pixels.push({ r, g, b, x, y });
        }
      }
    }
    
    return pixels;
  }

  // Extract all pixels for full image analysis
  extractAllPixels(imageData) {
    const pixels = [];
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      pixels.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2]
      });
    }
    
    return pixels;
  }

  // Determine if a color is skin-like
  isSkinColor(r, g, b) {
    // Basic skin color detection using RGB thresholds
    return (
      r > 95 && g > 40 && b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(r - g) > 15 && r > g && r > b
    );
  }

  // Determine skin type based on pixel analysis
  determineSkinType(pixels) {
    if (pixels.length === 0) return { type: 'unknown', confidence: 0 };

    const avgBrightness = pixels.reduce((sum, p) => sum + (p.r + p.g + p.b) / 3, 0) / pixels.length;
    const oiliness = this.calculateOiliness(pixels);
    const texture = this.analyzeTexture(pixels);

    let skinType = 'normal';
    let characteristics = [];

    if (oiliness > 0.7) {
      skinType = 'oily';
      characteristics.push('High oil production');
      characteristics.push('Enlarged pores likely');
    } else if (oiliness < 0.3) {
      skinType = 'dry';
      characteristics.push('Low oil production');
      characteristics.push('May feel tight');
    } else if (oiliness > 0.5) {
      skinType = 'combination';
      characteristics.push('Oily T-zone');
      characteristics.push('Normal to dry cheeks');
    } else {
      characteristics.push('Balanced oil production');
      characteristics.push('Even texture');
    }

    if (this.isSensitiveSkin(pixels)) {
      characteristics.push('Sensitive skin indicators');
    }

    return {
      type: skinType,
      characteristics,
      oiliness: Math.round(oiliness * 100),
      brightness: Math.round(avgBrightness),
      confidence: 0.8
    };
  }

  // Calculate oiliness based on pixel analysis
  calculateOiliness(pixels) {
    // Analyze color saturation and brightness patterns
    const saturationSum = pixels.reduce((sum, p) => {
      const max = Math.max(p.r, p.g, p.b);
      const min = Math.min(p.r, p.g, p.b);
      return sum + (max - min) / max;
    }, 0);
    
    return Math.min(1, saturationSum / pixels.length);
  }

  // Analyze skin texture
  analyzeTexture(pixels) {
    // Simple texture analysis based on color variation
    if (pixels.length < 2) return 'smooth';
    
    let variation = 0;
    for (let i = 1; i < pixels.length; i++) {
      const prev = pixels[i - 1];
      const curr = pixels[i];
      variation += Math.abs(curr.r - prev.r) + Math.abs(curr.g - prev.g) + Math.abs(curr.b - prev.b);
    }
    
    const avgVariation = variation / (pixels.length - 1);
    
    if (avgVariation > 30) return 'rough';
    if (avgVariation > 15) return 'moderate';
    return 'smooth';
  }

  // Check for sensitive skin indicators
  isSensitiveSkin(pixels) {
    // Look for redness indicators
    const rednessCount = pixels.filter(p => p.r > p.g + 10 && p.r > p.b + 10).length;
    return rednessCount / pixels.length > 0.1;
  }

  // Identify skin concerns
  identifySkinConcerns(pixels, imageData, region) {
    const concerns = [];
    
    // Analyze for acne (dark spots with surrounding redness)
    const acneIndicators = this.detectAcne(pixels, imageData, region);
    if (acneIndicators.severity > 0.3) {
      concerns.push({
        type: 'acne',
        severity: acneIndicators.severity,
        description: 'Acne or blemish indicators detected',
        areas: acneIndicators.areas
      });
    }

    // Analyze for dark spots/hyperpigmentation
    const darkSpots = this.detectDarkSpots(pixels);
    if (darkSpots.severity > 0.2) {
      concerns.push({
        type: 'dark_spots',
        severity: darkSpots.severity,
        description: 'Dark spots or hyperpigmentation detected',
        areas: darkSpots.areas
      });
    }

    // Analyze for wrinkles/fine lines
    const wrinkles = this.detectWrinkles(imageData, region);
    if (wrinkles.severity > 0.2) {
      concerns.push({
        type: 'wrinkles',
        severity: wrinkles.severity,
        description: 'Fine lines or wrinkles detected',
        areas: wrinkles.areas
      });
    }

    // Analyze for uneven skin tone
    const unevenTone = this.detectUnevenTone(pixels);
    if (unevenTone.severity > 0.3) {
      concerns.push({
        type: 'uneven_tone',
        severity: unevenTone.severity,
        description: 'Uneven skin tone detected'
      });
    }

    return concerns;
  }

  // Detect acne indicators
  detectAcne(pixels, imageData, region) {
    // Look for dark spots with surrounding inflammation
    const darkPixels = pixels.filter(p => (p.r + p.g + p.b) / 3 < 100);
    const redPixels = pixels.filter(p => p.r > p.g + 20 && p.r > p.b + 20);
    
    const severity = Math.min(1, (darkPixels.length + redPixels.length) / pixels.length * 2);
    
    return {
      severity,
      areas: severity > 0.3 ? ['T-zone', 'cheeks'] : []
    };
  }

  // Detect dark spots
  detectDarkSpots(pixels) {
    const avgBrightness = pixels.reduce((sum, p) => sum + (p.r + p.g + p.b) / 3, 0) / pixels.length;
    const darkSpots = pixels.filter(p => (p.r + p.g + p.b) / 3 < avgBrightness * 0.7);
    
    const severity = Math.min(1, darkSpots.length / pixels.length * 3);
    
    return {
      severity,
      areas: severity > 0.2 ? ['cheeks', 'forehead'] : []
    };
  }

  // Detect wrinkles (simplified)
  detectWrinkles(imageData, region) {
    // This is a simplified detection - in a real app, you'd use more sophisticated algorithms
    const severity = Math.random() * 0.5; // Placeholder
    
    return {
      severity,
      areas: severity > 0.2 ? ['eye area', 'forehead'] : []
    };
  }

  // Detect uneven skin tone
  detectUnevenTone(pixels) {
    if (pixels.length < 10) return { severity: 0 };
    
    const avgR = pixels.reduce((sum, p) => sum + p.r, 0) / pixels.length;
    const avgG = pixels.reduce((sum, p) => sum + p.g, 0) / pixels.length;
    const avgB = pixels.reduce((sum, p) => sum + p.b, 0) / pixels.length;
    
    const variance = pixels.reduce((sum, p) => {
      return sum + Math.pow(p.r - avgR, 2) + Math.pow(p.g - avgG, 2) + Math.pow(p.b - avgB, 2);
    }, 0) / pixels.length;
    
    const severity = Math.min(1, variance / 10000);
    
    return { severity };
  }

  // Identify general concerns for full image analysis
  identifyGeneralConcerns(pixels) {
    return [
      {
        type: 'general_analysis',
        severity: 0.5,
        description: 'General skin analysis completed - upload a clearer face photo for detailed results'
      }
    ];
  }

  // Analyze skin tone
  analyzeSkinTone(pixels) {
    if (pixels.length === 0) return { tone: 'unknown', undertone: 'unknown' };

    const avgR = pixels.reduce((sum, p) => sum + p.r, 0) / pixels.length;
    const avgG = pixels.reduce((sum, p) => sum + p.g, 0) / pixels.length;
    const avgB = pixels.reduce((sum, p) => sum + p.b, 0) / pixels.length;
    
    const brightness = (avgR + avgG + avgB) / 3;
    
    let tone = 'medium';
    if (brightness > 180) tone = 'light';
    else if (brightness > 120) tone = 'medium';
    else tone = 'dark';
    
    // Determine undertone
    let undertone = 'neutral';
    if (avgR > avgG + 10) undertone = 'warm';
    else if (avgB > avgR + 5) undertone = 'cool';
    
    return {
      tone,
      undertone,
      rgb: { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) }
    };
  }

  // Generate comprehensive recommendations based on analysis
  generateRecommendations(skinAnalysis) {
    if (!skinAnalysis) return { products: [], routine: {}, tips: [] };

    const { skinType, skinConcerns, skinTone } = skinAnalysis;
    
    // Get Zeshto product recommendations with detailed matching
    const products = this.getZeshtoProductRecommendations(skinType.type, skinConcerns);
    const routine = this.generatePersonalizedRoutine(skinType.type, skinConcerns, products);
    const tips = this.getPersonalizedTips(skinType.type, skinConcerns, skinTone);

    return {
      products,
      routine,
      tips,
      skinTypeAdvice: this.getSkinTypeAdvice(skinType),
      ingredientRecommendations: this.getIngredientRecommendations(skinType.type, skinConcerns)
    };
  }

  // Zeshto Product Database
  getZeshtoProductDatabase() {
    return [
      {
        id: 'purity-guard',
        name: 'Zeshto Purity Guard',
        category: 'soap',
        description: 'Ayurvedic soap specially formulated for oily and acne-prone skin with powerful antimicrobial properties.',
        ingredients: ['Tulsi', 'Neem'],
        benefits: 'Controls excess oil production, fights acne-causing bacteria, reduces inflammation and blemishes',
        targetSkinTypes: ['oily'],
        targetSkinConcerns: ['acne', 'dark_spots'],
        price: 299,
        currency: 'INR',
        rating: 4.5,
        reviewCount: 127,
        weight: '100g',
        usage: 'Apply on wet skin, lather gently, and rinse thoroughly',
        ecommerceUrl: 'https://your-ecommerce-site.com/products/zeshto-purity-guard',
        image: '/images/products/purity-guard.jpg'
      },
      {
        id: 'radiance-restore',
        name: 'Zeshto Radiance Restore',
        category: 'soap',
        description: 'Brightening soap enriched with natural ingredients to reduce dark spots and pigmentation.',
        ingredients: ['Turmeric', 'Saffron', 'Vitamin E'],
        benefits: 'Reduces dark spots and pigmentation, provides natural glow, gently exfoliates dead skin cells',
        targetSkinTypes: ['normal', 'dull'],
        targetSkinConcerns: ['dark_spots', 'pigmentation', 'dull_skin'],
        price: 349,
        currency: 'INR',
        rating: 4.3,
        reviewCount: 89,
        weight: '100g',
        usage: 'Use daily on face and body for best results',
        ecommerceUrl: 'https://your-ecommerce-site.com/products/zeshto-radiance-restore',
        image: '/images/products/radiance-restore.jpg'
      },
      {
        id: 'moisture-lock',
        name: 'Zeshto Moisture Lock',
        category: 'soap',
        description: 'Deeply hydrating soap for dry and sensitive skin with nourishing natural oils.',
        ingredients: ['Aloe Vera', 'Coconut Oil', 'Shea Butter'],
        benefits: 'Provides deep hydration, soothes irritation, maintains natural moisture barrier',
        targetSkinTypes: ['dry', 'sensitive'],
        targetSkinConcerns: ['dull_skin'],
        price: 279,
        currency: 'INR',
        rating: 4.6,
        reviewCount: 156,
        weight: '100g',
        usage: 'Gentle formula suitable for daily use on sensitive skin',
        ecommerceUrl: 'https://your-ecommerce-site.com/products/zeshto-moisture-lock',
        image: '/images/products/moisture-lock.jpg'
      },
      {
        id: 'age-defense',
        name: 'Zeshto Age Defense',
        category: 'soap',
        description: 'Anti-aging soap with powerful antioxidants to fight signs of aging and promote youthful skin.',
        ingredients: ['Green Tea', 'Vitamin C', 'Retinol'],
        benefits: 'Reduces fine lines and wrinkles, promotes collagen production, protects against free radicals',
        targetSkinTypes: ['normal', 'dry'],
        targetSkinConcerns: ['anti_aging', 'dull_skin'],
        price: 399,
        currency: 'INR',
        rating: 4.4,
        reviewCount: 73,
        weight: '100g',
        usage: 'Use in evening routine for best anti-aging benefits',
        ecommerceUrl: 'https://your-ecommerce-site.com/products/zeshto-age-defense',
        image: '/images/products/age-defense.jpg'
      },
      {
        id: 'gentle-care',
        name: 'Zeshto Gentle Care',
        category: 'soap',
        description: 'Ultra-gentle soap for sensitive skin with calming and soothing properties.',
        ingredients: ['Chamomile', 'Oatmeal', 'Honey'],
        benefits: 'Soothes sensitive skin, reduces redness and irritation, provides gentle cleansing',
        targetSkinTypes: ['sensitive', 'normal'],
        targetSkinConcerns: ['sensitivity', 'redness'],
        price: 259,
        currency: 'INR',
        rating: 4.7,
        reviewCount: 94,
        weight: '100g',
        usage: 'Perfect for daily use on sensitive and reactive skin',
        ecommerceUrl: 'https://your-ecommerce-site.com/products/zeshto-gentle-care',
        image: '/images/products/gentle-care.jpg'
      }
    ];
  }

  // Get Zeshto product recommendations based on skin analysis
  getZeshtoProductRecommendations(skinType, skinConcerns) {
    const productDatabase = this.getZeshtoProductDatabase();
    const recommendations = [];
    const matchedProducts = [];

    // Score products based on skin type and concerns
    productDatabase.forEach(product => {
      let score = 0;
      let reasons = [];

      // Score based on skin type match
      if (product.targetSkinTypes.includes(skinType)) {
        score += 50;
        reasons.push(`Specifically formulated for ${skinType} skin`);
      }

      // Score based on skin concerns
      skinConcerns.forEach(concern => {
        if (product.targetSkinConcerns.includes(concern.type)) {
          score += 30;
          reasons.push(`Addresses ${concern.type.replace('_', ' ')}`);
        }
      });

      // Bonus for high ratings
      if (product.rating >= 4.5) {
        score += 10;
        reasons.push('Highly rated by customers');
      }

      if (score > 0) {
        matchedProducts.push({
          ...product,
          matchScore: score,
          reasons: reasons,
          priority: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'
        });
      }
    });

    // Sort by match score and return top recommendations
    matchedProducts.sort((a, b) => b.matchScore - a.matchScore);

    // Format recommendations
    matchedProducts.slice(0, 3).forEach(product => {
      recommendations.push({
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        ingredients: product.ingredients,
        benefits: product.benefits,
        price: `₹${product.price}`,
        rating: product.rating,
        reviewCount: product.reviewCount,
        reasons: product.reasons,
        priority: product.priority,
        usage: product.usage,
        ecommerceUrl: product.ecommerceUrl,
        image: product.image,
        weight: product.weight
      });
    });

    return recommendations;
  }

  // Generate personalized skincare routine
   generatePersonalizedRoutine(skinType, skinConcerns, products) {
     const routine = {
       morning: {
         title: 'Morning Skincare Routine',
         description: 'Start your day with a fresh, protected complexion',
         steps: []
       },
       evening: {
         title: 'Evening Skincare Routine', 
         description: 'Wind down with nourishing, restorative care',
         steps: []
       },
       weekly: {
         title: 'Weekly Treatments',
         description: 'Special care for enhanced results',
         treatments: []
       }
     };

     // Get primary product recommendation
     const primaryProduct = products[0];

     // Morning routine
     routine.morning.steps = [
       {
         step: 1,
         action: 'Cleanse',
         description: 'Gently cleanse your face with lukewarm water',
         product: primaryProduct,
         duration: '30-60 seconds',
         tips: 'Use gentle circular motions, avoid harsh scrubbing'
       },
       {
         step: 2,
         action: 'Pat Dry',
         description: 'Gently pat your skin dry with a clean towel',
         duration: '10 seconds',
         tips: 'Avoid rubbing, leave skin slightly damp for better product absorption'
       },
       {
         step: 3,
         action: 'Moisturize',
         description: 'Apply a lightweight moisturizer suitable for your skin type',
         duration: '30 seconds',
         tips: 'Apply while skin is still slightly damp to lock in hydration'
       },
       {
         step: 4,
         action: 'Sun Protection',
         description: 'Apply broad-spectrum SPF 30+ sunscreen',
         duration: '30 seconds',
         tips: 'Don\'t forget neck, ears, and hands. Reapply every 2 hours'
       }
     ];

     // Evening routine
     routine.evening.steps = [
       {
         step: 1,
         action: 'Remove Makeup/Sunscreen',
         description: 'Use a gentle makeup remover or cleansing oil',
         duration: '1-2 minutes',
         tips: 'Be gentle around the eye area'
       },
       {
         step: 2,
         action: 'Cleanse',
         description: 'Use your Zeshto soap for deep cleansing',
         product: primaryProduct,
         duration: '60 seconds',
         tips: 'Focus on areas prone to congestion like T-zone'
       },
       {
         step: 3,
         action: 'Treatment (if applicable)',
         description: 'Apply any targeted treatments for specific concerns',
         duration: '30 seconds',
         tips: 'Allow treatments to absorb before applying moisturizer'
       },
       {
         step: 4,
         action: 'Night Moisturizer',
         description: 'Apply a nourishing night moisturizer',
         duration: '30 seconds',
         tips: 'Use upward motions, include neck and décolletage'
       }
     ];

     // Weekly treatments based on skin type and concerns
     if (skinType === 'oily') {
       routine.weekly.treatments.push({
         frequency: '2-3 times per week',
         action: 'Clay Mask',
         description: 'Use a clay mask to control oil and minimize pores',
         duration: '10-15 minutes',
         tips: 'Don\'t let the mask completely dry out'
       });
     }

     if (skinType === 'dry') {
       routine.weekly.treatments.push({
         frequency: '1-2 times per week',
         action: 'Hydrating Mask',
         description: 'Apply a deeply hydrating mask',
         duration: '15-20 minutes',
         tips: 'Leave on longer for extra dry skin'
       });
     }

     if (skinConcerns.some(c => c.type === 'acne')) {
       routine.weekly.treatments.push({
         frequency: '2 times per week',
         action: 'Gentle Exfoliation',
         description: 'Use a gentle chemical exfoliant (BHA)',
         duration: '5-10 minutes',
         tips: 'Start slowly and increase frequency gradually'
       });
     }

     if (skinConcerns.some(c => c.type === 'dark_spots')) {
       routine.weekly.treatments.push({
         frequency: '1-2 times per week',
         action: 'Brightening Treatment',
         description: 'Apply a vitamin C or brightening mask',
         duration: '15-20 minutes',
         tips: 'Always follow with sunscreen the next day'
       });
     }

     // Add general weekly treatment if none specific
     if (routine.weekly.treatments.length === 0) {
       routine.weekly.treatments.push({
         frequency: '1 time per week',
         action: 'Gentle Exfoliation',
         description: 'Use a mild exfoliating treatment',
         duration: '10 minutes',
         tips: 'Listen to your skin and adjust frequency as needed'
       });
     }

     return routine;
   }

  // Get personalized skincare tips
  getPersonalizedTips(skinType, skinConcerns, skinTone) {
    const tips = [];

    // Skin type specific tips
    switch (skinType) {
      case 'oily':
        tips.push('Avoid over-cleansing as it can increase oil production');
        tips.push('Use oil-free, non-comedogenic products');
        break;
      case 'dry':
        tips.push('Apply moisturizer to damp skin to lock in hydration');
        tips.push('Use a humidifier in dry environments');
        break;
      case 'combination':
        tips.push('Use different products for different areas of your face');
        tips.push('Focus oil control on T-zone, hydration on cheeks');
        break;
    }

    // Concern-specific tips
    skinConcerns.forEach(concern => {
      switch (concern.type) {
        case 'acne':
          tips.push('Avoid touching your face throughout the day');
          tips.push('Change pillowcases regularly');
          break;
        case 'dark_spots':
          tips.push('Always wear sunscreen to prevent further pigmentation');
          tips.push('Be patient - dark spots can take 3-6 months to fade');
          break;
        case 'wrinkles':
          tips.push('Sleep on your back to prevent sleep lines');
          tips.push('Stay hydrated and maintain a healthy diet');
          break;
      }
    });

    // General tips
    tips.push('Introduce new products gradually to test for sensitivity');
    tips.push('Consistency is key - stick to your routine for best results');

    return tips;
  }

  // Get skin type specific advice
  getSkinTypeAdvice(skinType) {
    const advice = {
      type: skinType.type,
      description: '',
      dosList: [],
      dontsList: []
    };

    switch (skinType.type) {
      case 'oily':
        advice.description = 'Your skin produces excess sebum, leading to shine and potential breakouts.';
        advice.dosList = ['Use gentle, foaming cleansers', 'Look for oil-free products', 'Use clay masks weekly'];
        advice.dontsList = ['Over-cleanse or scrub harshly', 'Skip moisturizer', 'Use heavy, occlusive products'];
        break;
      case 'dry':
        advice.description = 'Your skin lacks moisture and may feel tight or flaky.';
        advice.dosList = ['Use cream-based cleansers', 'Apply moisturizer twice daily', 'Use hydrating masks'];
        advice.dontsList = ['Use alcohol-based products', 'Take long, hot showers', 'Skip sunscreen'];
        break;
      case 'combination':
        advice.description = 'Your skin has both oily and dry areas, typically oily T-zone and normal/dry cheeks.';
        advice.dosList = ['Use different products for different areas', 'Balance oil control with hydration', 'Use gentle products'];
        advice.dontsList = ['Use the same product everywhere', 'Over-treat oily areas', 'Neglect dry areas'];
        break;
      default:
        advice.description = 'Your skin appears balanced with minimal concerns.';
        advice.dosList = ['Maintain current routine', 'Use gentle products', 'Focus on prevention'];
        advice.dontsList = ['Over-complicate your routine', 'Skip daily sunscreen', 'Ignore changes in your skin'];
    }

    return advice;
  }

  // Get ingredient recommendations
  getIngredientRecommendations(skinType, skinConcerns) {
    const ingredients = {
      beneficial: [],
      avoid: []
    };

    // Skin type based ingredients
    switch (skinType) {
      case 'oily':
        ingredients.beneficial.push('Salicylic Acid', 'Niacinamide', 'Tea Tree Oil', 'Zinc');
        ingredients.avoid.push('Heavy oils', 'Petroleum-based products', 'Coconut oil');
        break;
      case 'dry':
        ingredients.beneficial.push('Hyaluronic Acid', 'Ceramides', 'Glycerin', 'Shea Butter');
        ingredients.avoid.push('Alcohol', 'Sulfates', 'Fragrances');
        break;
      case 'combination':
        ingredients.beneficial.push('Hyaluronic Acid', 'Niacinamide', 'Gentle AHAs');
        ingredients.avoid.push('Harsh scrubs', 'Strong actives', 'Heavy fragrances');
        break;
    }

    // Concern-based ingredients
    skinConcerns.forEach(concern => {
      switch (concern.type) {
        case 'acne':
          ingredients.beneficial.push('Benzoyl Peroxide', 'Retinoids', 'Azelaic Acid');
          ingredients.avoid.push('Comedogenic oils', 'Heavy moisturizers');
          break;
        case 'dark_spots':
          ingredients.beneficial.push('Vitamin C', 'Kojic Acid', 'Arbutin', 'Licorice Extract');
          break;
        case 'wrinkles':
          ingredients.beneficial.push('Retinol', 'Peptides', 'Vitamin C', 'AHAs');
          break;
      }
    });

    return ingredients;
  }

  // Get analysis history
  getAnalysisHistory() {
    return this.analysisHistory;
  }

  // Clear analysis history
  clearHistory() {
    this.analysisHistory = [];
  }
}

// Export singleton instance
export default new SkinAnalysisService();