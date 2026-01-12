import React from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const Disclaimer = ({ type = 'analysis', className = '' }) => {
  // Color schemes for different disclaimer types
  const colorSchemes = {
    analysis: {
      bg: 'from-red-50 via-orange-50 to-amber-50',
      border: 'border-red-200/60',
      iconBg: 'from-red-500 to-orange-600',
      titleGradient: 'from-red-800 via-orange-700 to-amber-700',
      bulletGradient: 'from-red-500 to-orange-500',
      accentBorder: 'border-red-200/50',
      dots: ['bg-red-400', 'bg-orange-400', 'bg-amber-400']
    },
    aiAccuracy: {
      bg: 'from-blue-50 via-indigo-50 to-purple-50',
      border: 'border-blue-200/60',
      iconBg: 'from-blue-500 to-indigo-600',
      titleGradient: 'from-blue-800 via-indigo-700 to-purple-700',
      bulletGradient: 'from-blue-500 to-indigo-500',
      accentBorder: 'border-blue-200/50',
      dots: ['bg-blue-400', 'bg-indigo-400', 'bg-purple-400']
    },
    products: {
      bg: 'from-emerald-50 via-teal-50 to-cyan-50',
      border: 'border-emerald-200/60',
      iconBg: 'from-emerald-500 to-teal-600',
      titleGradient: 'from-emerald-800 via-teal-700 to-cyan-700',
      bulletGradient: 'from-emerald-500 to-teal-500',
      accentBorder: 'border-emerald-200/50',
      dots: ['bg-emerald-400', 'bg-teal-400', 'bg-cyan-400']
    },
    checkout: {
      bg: 'from-violet-50 via-purple-50 to-fuchsia-50',
      border: 'border-violet-200/60',
      iconBg: 'from-violet-500 to-purple-600',
      titleGradient: 'from-violet-800 via-purple-700 to-fuchsia-700',
      bulletGradient: 'from-violet-500 to-purple-500',
      accentBorder: 'border-violet-200/50',
      dots: ['bg-violet-400', 'bg-purple-400', 'bg-fuchsia-400']
    }
  };

  const disclaimers = {
    analysis: {
      icon: ExclamationTriangleIcon,
      title: 'Important Medical Disclaimer',
      content: [
        'This AI-powered skin analysis is for informational and educational purposes only.',
        'Results are not intended to diagnose, treat, cure, or prevent any skin condition or disease.',
        'Always consult with a qualified dermatologist or healthcare professional for proper medical advice.',
        'Individual skin types and conditions vary significantly. What works for others may not work for you.',
        'Discontinue use of any recommended products if you experience irritation or adverse reactions.'
      ]
    },
    aiAccuracy: {
      icon: InformationCircleIcon,
      title: 'AI Analysis Guidance',
      content: [
        'Our AI technology provides thoughtful insights to guide your skincare journey, though results may vary based on individual factors.',
        'For the most comprehensive understanding of your skin, we gently recommend consulting with a dermatologist alongside our AI analysis.',
        'Camera quality, lighting conditions, and positioning can influence the analysis - we encourage taking photos in natural, well-lit environments.',
        'Your privacy is precious to us - all webcam images are processed securely and never stored or shared with anyone. Feel confident using our analysis.',
        'Think of our AI as a helpful companion in your skincare routine, designed to complement professional dermatological care.',
        'Your skin is beautifully unique, and the most accurate assessment comes from combining technology with expert medical guidance.'
      ]
    },
    products: {
      icon: InformationCircleIcon,
      title: 'Product Recommendation Notice',
      content: [
        'Product recommendations are generated based on AI analysis and general skin care principles.',
        'Results may vary based on individual skin type, sensitivity, and existing conditions.',
        'Always perform a patch test before using new skincare products.',
        'Consult a dermatologist if you have sensitive skin, allergies, or existing skin conditions.',
        'We are not responsible for any adverse reactions to recommended products.'
      ]
    },
    checkout: {
      icon: InformationCircleIcon,
      title: 'Purchase Terms & Conditions',
      content: [
        'By proceeding with this purchase, you acknowledge that you have read and understood our terms.',
        'Product recommendations are based on AI analysis and are not medical advice.',
        'Returns and exchanges are subject to our return policy.',
        'Please review product ingredients for any known allergies before use.',
        'For questions about products or orders, please contact our customer support.'
      ]
    }
  };

  const disclaimer = disclaimers[type];
  const colors = colorSchemes[type] || colorSchemes.aiAccuracy; // fallback to aiAccuracy colors
  const Icon = disclaimer.icon;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-500 backdrop-blur-sm ${className}`}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-current to-current rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-current to-current rounded-full translate-x-12 translate-y-12"></div>
      </div>
      
      {/* Main content */}
      <div className="relative p-6">
        <div className="flex items-start space-x-4">
          {/* Enhanced icon with gradient background */}
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 bg-gradient-to-br ${colors.iconBg} rounded-xl flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 ring-2 ring-white/20`}>
              <Icon className="h-6 w-6 text-white drop-shadow-sm" />
            </div>
          </div>
          
          {/* Content area */}
          <div className="flex-1 min-w-0">
            {/* Beautiful title with gradient text */}
            <h4 className={`text-xl font-display font-bold bg-gradient-to-r ${colors.titleGradient} bg-clip-text text-transparent mb-5 leading-tight tracking-tight`}>
              {disclaimer.title}
            </h4>
            
            {/* Enhanced content list */}
            <div className="space-y-4">
              {disclaimer.content.map((item, index) => (
                <div key={index} className="flex items-start group">
                  {/* Beautiful bullet point with enhanced styling */}
                  <div className="flex-shrink-0 mt-2.5 mr-4">
                    <div className={`w-2.5 h-2.5 bg-gradient-to-r ${colors.bulletGradient} rounded-full shadow-md group-hover:scale-125 group-hover:shadow-lg transition-all duration-300`}></div>
                  </div>
                  
                  {/* Content text with enhanced typography */}
                  <p className="text-sm leading-loose text-slate-700 font-medium group-hover:text-slate-800 transition-colors duration-200 font-sans tracking-wide">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Subtle bottom accent */}
        <div className={`mt-6 pt-4 border-t ${colors.accentBorder}`}>
          <div className="flex items-center justify-center">
            <div className="flex space-x-1">
              <div className={`w-1 h-1 ${colors.dots[0]} rounded-full animate-pulse`}></div>
              <div className={`w-1 h-1 ${colors.dots[1]} rounded-full animate-pulse`} style={{animationDelay: '0.2s'}}></div>
              <div className={`w-1 h-1 ${colors.dots[2]} rounded-full animate-pulse`} style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;