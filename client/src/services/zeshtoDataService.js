import zeshtoData from '../../../zeshto_recommendations.json';

class ZeshtoDataService {
  constructor() {
    this.data = zeshtoData.zeshto_soap_recommendations;
  }

  /**
   * Get recommendation based on skin type and skin issue
   */
  getRecommendation(skinType, skinIssue) {
    try {
      // Map skin types to match JSON structure
      const skinTypeMap = {
        'oily': 'oily_skin',
        'dry': 'dry_skin',
        'normal': 'normal_skin',
        'combination': 'oily_skin', // Use oily for combination
        'sensitive': 'sensitive_skin'
      };

      // Map skin issues to match JSON structure
      const skinIssueMap = {
        'acne_pimple': 'acne_pimple',
        'dark_spots_marks': 'dark_spots_pigmentation',
        'acne_scars': 'acne_scars',
        'pigmentation': 'dark_spots_pigmentation',
        'dullness': 'dull_skin',
        'wrinkles': 'anti_aging',
        'sensitivity': 'dull_skin', // Default for sensitivity
        'under_eye_circles': 'under_eye_dark_circle'
      };

      const mappedSkinType = skinTypeMap[skinType.toLowerCase()] || 'oily_skin';
      const mappedSkinIssue = skinIssueMap[skinIssue.toLowerCase()] || 'acne_pimple';

      // Get recommendations for the skin issue
      const issueRecommendations = this.data.recommendations_by_skin_issue[mappedSkinIssue];
      
      if (!issueRecommendations) {
        return this.getDefaultRecommendation(skinType, skinIssue);
      }

      // Get recommendation for specific skin type
      let recommendation = issueRecommendations.by_skin_type[mappedSkinType];
      
      // If no specific recommendation for skin type, try alternatives
      if (!recommendation) {
        // Try other skin types as fallback
        const fallbackTypes = ['oily_skin', 'dry_skin', 'sensitive_skin', 'dull_skin'];
        for (const fallbackType of fallbackTypes) {
          if (issueRecommendations.by_skin_type[fallbackType]) {
            recommendation = issueRecommendations.by_skin_type[fallbackType];
            break;
          }
        }
      }

      if (!recommendation) {
        return this.getDefaultRecommendation(skinType, skinIssue);
      }

      return {
        skinIssue: this.formatSkinIssue(skinIssue),
        skinDetail: this.formatSkinType(skinType),
        recommendedSoap: recommendation.recommended_product,
        ingredients: recommendation.ingredients,
        explanation: recommendation.benefits_explanation,
        usageNotes: recommendation.usage_notes || '',
        precautions: recommendation.precautions || []
      };

    } catch (error) {
      console.error('Error getting recommendation:', error);
      return this.getDefaultRecommendation(skinType, skinIssue);
    }
  }

  /**
   * Format skin issue for display
   */
  formatSkinIssue(skinIssue) {
    const issueMap = {
      'acne_pimple': 'Acne/Pimple',
      'dark_spots_marks': 'Dark Spots/Marks',
      'acne_scars': 'Acne Scars',
      'pigmentation': 'Pigmentation',
      'dullness': 'Dull Skin',
      'wrinkles': 'Wrinkles/Anti-aging',
      'sensitivity': 'Skin Sensitivity',
      'under_eye_circles': 'Under Eye Dark Circles'
    };
    return issueMap[skinIssue] || skinIssue;
  }

  /**
   * Format skin type for display
   */
  formatSkinType(skinType) {
    const typeMap = {
      'oily': 'Oily Skin',
      'dry': 'Dry Skin',
      'normal': 'Normal Skin',
      'combination': 'Combination Skin',
      'sensitive': 'Sensitive Skin'
    };
    return typeMap[skinType] || skinType;
  }

  /**
   * Get default recommendation when data is not available
   */
  getDefaultRecommendation(skinType, skinIssue) {
    return {
      skinIssue: this.formatSkinIssue(skinIssue),
      skinDetail: this.formatSkinType(skinType),
      recommendedSoap: 'Zeshto Purity Guard',
      ingredients: 'Tulsi + Neem',
      explanation: 'Both are highly regarded in Ayurveda for their antimicrobial, antibacterial, and anti-inflammatory properties. Neem helps control excess oil production and is potent against acne-causing bacteria. Tulsi further purifies the skin, helps soothe inflammation and redness associated with breakouts, and aids in reducing blemishes for a clear complexion.',
      usageNotes: 'Ideal for daily use',
      precautions: []
    };
  }

  /**
   * Get all available skin types
   */
  getAvailableSkinTypes() {
    return [
      { value: 'oily', label: 'Oily' },
      { value: 'dry', label: 'Dry' },
      { value: 'normal', label: 'Normal' },
      { value: 'combination', label: 'Combination' },
      { value: 'sensitive', label: 'Sensitive' }
    ];
  }

  /**
   * Get all available skin issues
   */
  getAvailableSkinIssues() {
    return [
      { value: 'acne_pimple', label: 'Acne/Pimple' },
      { value: 'dark_spots_marks', label: 'Dark Spots/Marks' },
      { value: 'acne_scars', label: 'Acne Scars' },
      { value: 'pigmentation', label: 'Pigmentation' },
      { value: 'dullness', label: 'Dullness' },
      { value: 'wrinkles', label: 'Wrinkles/Anti-aging' },
      { value: 'sensitivity', label: 'Skin Sensitivity' },
      { value: 'under_eye_circles', label: 'Under Eye Dark Circles' }
    ];
  }

  /**
   * Get product details by name
   */
  getProductDetails(productName) {
    const products = this.data.products;
    for (const productKey in products) {
      const product = products[productKey];
      if (product.name === productName) {
        return product;
      }
    }
    return null;
  }

  /**
   * Helper function to format product name
   */
  formatProductName(productName) {
    if (!productName) return 'Zeshto Soap';
    return productName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

export default new ZeshtoDataService();