import zeshtoRecommendationsData from '../../../zeshto_recommendations.json';

class ZeshtoRecommendationService {
  constructor() {
    this.data = zeshtoRecommendationsData;
  }

  /**
   * Get all Zeshto products
   */
  getAllProducts() {
    return this.data.products || [];
  }

  /**
   * Get recommendations based on skin type and skin concern
   */
  getRecommendationsBySkinTypeAndConcern(skinType, skinConcern) {
    const recommendations = this.data.recommendations_by_skin_issue || {};
    
    // Normalize the skin concern key
    const concernKey = this.normalizeConcernKey(skinConcern);
    
    if (recommendations[concernKey]) {
      const concernRecommendations = recommendations[concernKey];
      
      // Find recommendations for the specific skin type
      const skinTypeKey = this.normalizeSkinTypeKey(skinType);
      
      if (concernRecommendations[skinTypeKey]) {
        return concernRecommendations[skinTypeKey];
      }
      
      // Fallback to general recommendations if specific skin type not found
      return concernRecommendations.general || concernRecommendations;
    }
    
    return null;
  }

  /**
   * Get normal skin general recommendations
   */
  getNormalSkinRecommendations() {
    return this.data.normal_skin_general_recommendations || [];
  }

  /**
   * Get lifestyle recommendations
   */
  getLifestyleRecommendations(lifestyle) {
    const lifestyleRecommendations = this.data.lifestyle_recommendations || {};
    const lifestyleKey = this.normalizeLifestyleKey(lifestyle);
    return lifestyleRecommendations[lifestyleKey] || null;
  }

  /**
   * Get ingredient profile
   */
  getIngredientProfile(ingredientName) {
    const ingredients = this.data.ingredient_profiles || {};
    const ingredientKey = this.normalizeIngredientKey(ingredientName);
    return ingredients[ingredientKey] || null;
  }

  /**
   * Get best product recommendations for given skin analysis
   */
  getBestRecommendations(skinType, skinConcerns = []) {
    // Primary concern - get the most relevant recommendation
    const primaryConcern = skinConcerns.length > 0 ? skinConcerns[0] : null;
    
    // If normal skin with no concerns, get general recommendations
    if (skinType?.toLowerCase().includes('normal') && !primaryConcern) {
      const normalRecommendations = this.getNormalSkinRecommendations();
      return this.formatDetailedRecommendation(normalRecommendations[0], skinType, [], 'General Care');
    }
    
    // Get recommendation for primary concern and skin type
    if (primaryConcern) {
      const concernRecommendations = this.getRecommendationsBySkinTypeAndConcern(skinType, primaryConcern);
      if (concernRecommendations) {
        return this.formatDetailedRecommendation(concernRecommendations, skinType, skinConcerns, primaryConcern);
      }
    }
    
    // Fallback to general product recommendations
    const allProducts = this.getAllProducts();
    const suitableProducts = this.findSuitableProducts(allProducts, skinType, skinConcerns);
    if (suitableProducts.length > 0) {
      return this.formatDetailedProductRecommendation(suitableProducts[0], skinType, skinConcerns, primaryConcern || 'General Care');
    }
    
    // Ultimate fallback - recommend Purity Guard as it's suitable for all skin types
    const purityGuard = allProducts.find(p => p.name === "Purity Guard");
    if (purityGuard) {
      return this.formatDetailedProductRecommendation(purityGuard, skinType, skinConcerns, primaryConcern || 'General Care');
    }
    
    return null;
  }

  /**
   * Format detailed recommendation with exact user-specified format
   */
  formatDetailedRecommendation(recommendation, skinType, skinConcerns, skinIssue) {
    if (!recommendation) return null;
    
    // Format skin issue name
    const formattedSkinIssue = this.formatSkinIssueName(skinIssue);
    
    // Format skin type name
    const formattedSkinType = this.formatSkinTypeName(skinType);
    
    return {
      skin_issue: formattedSkinIssue,
      skin_detail: formattedSkinType,
      product_name: recommendation.recommended_product || recommendation.product_name,
      primary_ingredients: recommendation.ingredients ? recommendation.ingredients.split(' + ') : (recommendation.primary_ingredients || []),
      key_benefits: recommendation.benefits_explanation ? [recommendation.benefits_explanation] : (recommendation.key_benefits || []),
      why_recommended: recommendation.benefits_explanation || recommendation.why_recommended || recommendation.benefits || `Perfect for ${skinType} skin`,
      usage_notes: recommendation.usage_notes || 'Use as directed for best results',
      summary: this.generateDetailedRecommendationSummary(recommendation, skinType, skinConcerns, formattedSkinIssue),
      brand_benefits: this.getBrandBenefits(),
      ecommerce_url: this.generateEcommerceUrl(recommendation.recommended_product || recommendation.product_name)
    };
  }

  /**
   * Format detailed product recommendation with exact user-specified format
   */
  formatDetailedProductRecommendation(product, skinType, skinConcerns, skinIssue) {
    if (!product) return null;
    
    // Format skin issue name
    const formattedSkinIssue = this.formatSkinIssueName(skinIssue);
    
    // Format skin type name
    const formattedSkinType = this.formatSkinTypeName(skinType);
    
    // Generate detailed explanation based on product ingredients and benefits
    const detailedExplanation = this.generateDetailedProductExplanation(product, skinType, skinConcerns);
    
    return {
      skin_issue: formattedSkinIssue,
      skin_detail: formattedSkinType,
      product_name: product.name,
      primary_ingredients: product.primary_ingredients || [],
      key_benefits: product.key_benefits || [],
      why_recommended: detailedExplanation,
      usage_notes: this.generateUsageNotes(product, skinType),
      summary: this.generateDetailedProductSummary(product, skinType, skinConcerns, formattedSkinIssue),
      brand_benefits: this.getBrandBenefits(),
      ecommerce_url: this.generateEcommerceUrl(product.name)
    };
  }

  /**
   * Format the best single recommendation for immediate display (legacy support)
   */
  formatBestRecommendation(recommendation, skinType, skinConcerns) {
    const brandBenefits = this.getBrandBenefits();
    
    return {
      product_name: recommendation.product_name,
      primary_ingredients: recommendation.primary_ingredients,
      key_benefits: recommendation.key_benefits,
      why_recommended: recommendation.why_recommended || recommendation.benefits,
      usage_notes: recommendation.usage_notes || 'Use daily for best results',
      brand_benefits: brandBenefits,
      ecommerce_url: this.getEcommerceUrl(recommendation.product_name),
      skin_type: skinType,
      concerns_addressed: skinConcerns,
      recommendation_summary: this.generateRecommendationSummary(recommendation, skinType, skinConcerns)
    };
  }

  /**
   * Format the best product recommendation for immediate display
   */
  formatBestProductRecommendation(product, skinType, skinConcerns) {
    const brandBenefits = this.getBrandBenefits();
    
    return {
      product_name: product.name,
      primary_ingredients: product.primary_ingredients,
      key_benefits: product.key_benefits,
      why_recommended: `Perfect for ${skinType} skin${skinConcerns.length > 0 ? ` with ${skinConcerns.join(', ')} concerns` : ''}`,
      usage_notes: 'Use daily for best results',
      brand_benefits: brandBenefits,
      ecommerce_url: this.getEcommerceUrl(product.name),
      skin_type: skinType,
      concerns_addressed: skinConcerns,
      recommendation_summary: this.generateProductRecommendationSummary(product, skinType, skinConcerns)
    };
  }

  /**
   * Generate a comprehensive recommendation summary
   */
  generateRecommendationSummary(recommendation, skinType, skinConcerns) {
    const concernText = skinConcerns.length > 0 ? ` targeting ${skinConcerns.join(' and ')}` : '';
    return `Based on your ${skinType} skin${concernText}, we recommend ${recommendation.product_name}. This soap contains ${recommendation.primary_ingredients?.slice(0, 3).join(', ')} which are specifically beneficial for your skin needs.`;
  }

  /**
   * Generate a comprehensive product recommendation summary
   */
  generateProductRecommendationSummary(product, skinType, skinConcerns) {
    const concernText = skinConcerns.length > 0 ? ` and ${skinConcerns.join(' & ')} concerns` : '';
    return `Perfect for your ${skinType} skin${concernText}! ${product.name} contains ${product.primary_ingredients?.slice(0, 3).join(', ')} - natural ingredients that will help improve your skin's health and appearance.`;
  }

  /**
   * Find suitable products based on skin type and concerns
   */
  findSuitableProducts(products, skinType, skinConcerns) {
    return products.filter(product => {
      // Check if product targets the skin concerns
      const productConcerns = product.target_concerns || [];
      const hasMatchingConcern = skinConcerns.some(concern => 
        productConcerns.some(targetConcern => 
          targetConcern.toLowerCase().includes(concern.toLowerCase()) ||
          concern.toLowerCase().includes(targetConcern.toLowerCase())
        )
      );
      
      // For normal skin, include products that are gentle and suitable for all skin types
      if (skinType?.toLowerCase().includes('normal')) {
        return hasMatchingConcern || productConcerns.includes('general care');
      }
      
      return hasMatchingConcern;
    });
  }

  /**
   * Format product recommendations
   */
  formatProductRecommendations(products, skinType, skinConcerns) {
    return products.map(product => ({
      product_name: product.name,
      primary_ingredients: product.primary_ingredients,
      key_benefits: product.key_benefits,
      why_recommended: `Perfect for ${skinType} skin with ${skinConcerns.join(', ')} concerns`,
      usage_notes: `Use as directed for best results with ${skinType} skin`,
      product_details: product
    }));
  }

  /**
   * Format general recommendations
   */
  formatRecommendations(recommendations) {
    return recommendations.map(rec => ({
      product_name: rec.product_name,
      primary_ingredients: rec.primary_ingredients,
      key_benefits: rec.key_benefits,
      why_recommended: rec.why_recommended || rec.benefits,
      usage_notes: rec.usage_notes || 'Use as directed for best results',
      target_concerns: rec.target_concerns
    }));
  }

  /**
   * Get brand benefits explanation
   */
  getBrandBenefits() {
    return {
      brand_name: "Zeshto",
      why_essential: [
        "100% Natural and Organic Ingredients",
        "Traditional Ayurvedic Formulations",
        "Chemical-Free and Safe for All Skin Types",
        "Scientifically Proven Active Compounds",
        "Sustainable and Eco-Friendly Production",
        "Dermatologically Tested and Approved"
      ],
      key_advantages: [
        "Deep cleansing without stripping natural oils",
        "Nourishing and moisturizing properties",
        "Anti-inflammatory and healing benefits",
        "Suitable for sensitive skin",
        "Long-lasting and cost-effective",
        "Supports local and traditional practices"
      ]
    };
  }

  /**
   * Normalize concern key for lookup
   */
  normalizeConcernKey(concern) {
    const concernMap = {
      'acne': 'acne_pimple',
      'pimples': 'acne_pimple',
      'acne_pimple': 'acne_pimple',
      'dark spots': 'dark_spots_pigmentation',
      'pigmentation': 'dark_spots_pigmentation',
      'dark_spots_pigmentation': 'dark_spots_pigmentation',
      'dryness': 'dryness_dehydration',
      'dehydration': 'dryness_dehydration',
      'dryness_dehydration': 'dryness_dehydration',
      'aging': 'aging_wrinkles',
      'wrinkles': 'aging_wrinkles',
      'aging_wrinkles': 'aging_wrinkles',
      'sensitivity': 'sensitivity_irritation',
      'irritation': 'sensitivity_irritation',
      'sensitivity_irritation': 'sensitivity_irritation'
    };
    
    return concernMap[concern?.toLowerCase()] || concern?.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Normalize skin type key for lookup
   */
  normalizeSkinTypeKey(skinType) {
    const typeMap = {
      'oily': 'oily_skin',
      'dry': 'dry_skin',
      'combination': 'combination_skin',
      'sensitive': 'sensitive_skin',
      'normal': 'normal_skin',
      'dull': 'dull_skin'
    };
    
    return typeMap[skinType?.toLowerCase()] || skinType?.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Normalize lifestyle key for lookup
   */
  normalizeLifestyleKey(lifestyle) {
    return lifestyle?.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Normalize ingredient key for lookup
   */
  normalizeIngredientKey(ingredient) {
    return ingredient?.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Get ecommerce URL for Zeshto products
   */
  getEcommerceUrl(productName = '') {
    // This would be the actual Zeshto ecommerce website URL
    const baseUrl = 'https://zeshto.com/products';
    
    if (productName) {
      const productSlug = productName.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      return `${baseUrl}/${productSlug}`;
    }
    
    return baseUrl;
  }

  /**
   * Format skin issue name for display
   */
  formatSkinIssueName(skinIssue) {
    if (!skinIssue) return 'General Care';
    
    const issueMap = {
      'acne': 'Acne / Pimple',
      'acne_pimple': 'Acne / Pimple',
      'dark_spots': 'Dark Spots / Marks',
      'dark_spots_pigmentation': 'Dark Spots / Marks',
      'acne_scars': 'Acne Scars',
      'dull_skin': 'Dull Skin',
      'under_eye_dark_circle': 'Under Eye Dark Circles',
      'anti_aging': 'Anti Aging',
      'general_care': 'General Care'
    };
    
    const normalizedKey = skinIssue.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return issueMap[normalizedKey] || skinIssue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format skin type name for display
   */
  formatSkinTypeName(skinType) {
    if (!skinType) return 'Normal Skin';
    
    return skinType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Generate detailed product explanation based on ingredients and benefits
   */
  generateDetailedProductExplanation(product, skinType, skinConcerns) {
    if (!product) return 'Premium natural skincare solution specially formulated for your skin type and concerns.';
    
    const ingredients = product.primary_ingredients || [];
    const benefits = product.key_benefits || [];
    
    if (ingredients.length === 0) {
      return `${product.name} is specially formulated for ${skinType} skin to address your specific concerns with natural ingredients.`;
    }
    
    // Create detailed explanation similar to the JSON format
    let explanation = `Ingredients: ${ingredients.join(' + ')}. `;
    
    if (benefits.length > 0) {
      explanation += benefits.slice(0, 3).join(', ') + '. ';
    }
    
    explanation += `This combination is specially formulated for ${skinType} skin to provide effective care and visible results.`;
    
    return explanation;
  }

  /**
   * Generate usage notes based on product and skin type
   */
  generateUsageNotes(product, skinType) {
    if (!product || !skinType) return 'Use as directed for best results';
    
    const skinTypeLower = skinType.toLowerCase();
    
    if (skinTypeLower.includes('sensitive')) {
      return 'Gentle formula suitable for sensitive skin - patch test recommended';
    } else if (skinTypeLower.includes('oily')) {
      return 'Ideal for daily use on oily skin without over-drying';
    } else if (skinTypeLower.includes('dry')) {
      return 'Nourishing formula perfect for dry skin - follow with moisturizer if needed';
    } else {
      return 'Perfect for daily use on all skin types';
    }
  }

  /**
   * Generate detailed recommendation summary
   */
  generateDetailedRecommendationSummary(recommendation, skinType, skinConcerns, skinIssue) {
    const productName = recommendation.recommended_product || recommendation.product_name;
    const concernText = skinConcerns.length > 0 ? ` targeting ${skinConcerns.join(' & ')}` : '';
    return `${productName} is specifically recommended for your ${skinType} skin${concernText}. This Ayurvedic formulation provides targeted care for ${skinIssue} with proven natural ingredients.`;
  }

  /**
   * Generate detailed product summary
   */
  generateDetailedProductSummary(product, skinType, skinConcerns, skinIssue) {
    const concernText = skinConcerns.length > 0 ? ` and ${skinConcerns.join(' & ')} concerns` : '';
    return `${product.name} is perfect for your ${skinType} skin${concernText}. This premium Zeshto formulation addresses ${skinIssue} with natural ingredients for visible results.`;
  }

  /**
   * Generate e-commerce URL for Zeshto products
   */
  generateEcommerceUrl(productName) {
    if (!productName) return 'https://zeshto.com/products';
    
    // Convert product name to URL-friendly format
    const urlSlug = productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return `https://zeshto.com/products/${urlSlug}`;
  }
}

// Export singleton instance
export default new ZeshtoRecommendationService();