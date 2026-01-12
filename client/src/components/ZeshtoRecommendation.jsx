import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Leaf, Award, Heart, ExternalLink, Sparkles } from 'lucide-react';

const ZeshtoRecommendation = ({ recommendation, onShopNow }) => {
  if (!recommendation) {
    return null;
  }

  const {
    product_name,
    primary_ingredients,
    key_benefits,
    why_recommended,
    brand_benefits,
    ecommerce_url,
    recommendation_summary
  } = recommendation;

  const handleShopNow = () => {
    if (onShopNow) {
      onShopNow(ecommerce_url, product_name);
    } else {
      window.open(ecommerce_url, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <Leaf className="text-green-600 mr-2" size={28} />
          <h2 className="text-2xl font-bold text-green-800">Zeshto Recommendation</h2>
          <Award className="text-green-600 ml-2" size={28} />
        </div>
        <p className="text-green-700 text-lg font-medium">{recommendation_summary}</p>
      </div>

      {/* Product Highlight */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-emerald-100">
        <div className="flex items-start space-x-6">
          {/* Product Icon */}
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Star className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          {/* Product Details */}
          <div className="flex-1 space-y-4">
            {/* Analysis Results Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
              <h3 className="text-xl font-bold text-emerald-900 mb-3">Your Personalized Analysis Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-emerald-800">Skin Issue:</span>
                  <span className="ml-2 text-emerald-700">{recommendation.skin_issue}</span>
                </div>
                <div>
                  <span className="font-semibold text-emerald-800">Skin Detail:</span>
                  <span className="ml-2 text-emerald-700">{recommendation.skin_detail}</span>
                </div>
              </div>
            </div>

            {/* Recommended Product */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h4 className="text-lg font-semibold text-emerald-900">Recommended Zeshto Soap:</h4>
                <span className="text-xl font-bold text-emerald-800">{product_name}</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                  RECOMMENDED
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShopNow}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors duration-200 shadow-md"
              >
                <ShoppingBag className="mr-2" size={20} />
                Shop Now
                <ExternalLink className="ml-2" size={16} />
              </motion.button>
            </div>

            {/* Why This Zeshto Soap Recommended */}
            <div className="bg-emerald-50 rounded-xl p-4 border-l-4 border-emerald-400">
              <h4 className="font-semibold text-emerald-900 mb-2 flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Why This Zeshto Soap Recommended
              </h4>
              <p className="text-emerald-700 leading-relaxed">
                {why_recommended}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Ingredients */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Leaf className="text-green-600 mr-2" size={18} />
              Natural Ingredients
            </h4>
            <div className="space-y-2">
              {primary_ingredients?.slice(0, 4).map((ingredient, index) => (
                <div key={index} className="bg-green-50 px-3 py-2 rounded-lg text-sm text-green-800 border border-green-100">
                  {ingredient}
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Heart className="text-red-500 mr-2" size={18} />
              Key Benefits
            </h4>
            <div className="space-y-2">
              {key_benefits?.slice(0, 4).map((benefit, index) => (
                <div key={index} className="bg-blue-50 px-3 py-2 rounded-lg text-sm text-blue-800 border border-blue-100">
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Brand Benefits */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 text-center">Why Choose Zeshto Brand?</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <Award className="mr-2" size={18} />
              Why Essential:
            </h4>
            <ul className="space-y-1 text-sm">
              {brand_benefits?.why_essential?.slice(0, 3).map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-200 mr-2">•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <Star className="mr-2" size={18} />
              Key Advantages:
            </h4>
            <ul className="space-y-1 text-sm">
              {brand_benefits?.key_advantages?.slice(0, 3).map((advantage, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-200 mr-2">•</span>
                  {advantage}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShopNow}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center mx-auto transition-all duration-200 shadow-lg"
        >
          <ShoppingBag className="mr-3" size={24} />
          Get Your {product_name} Now
          <ExternalLink className="ml-3" size={20} />
        </motion.button>
        <p className="text-gray-600 mt-3 text-sm">
          Transform your skin with natural, Ayurvedic skincare
        </p>
      </div>
    </motion.div>
  );
};

export default ZeshtoRecommendation;