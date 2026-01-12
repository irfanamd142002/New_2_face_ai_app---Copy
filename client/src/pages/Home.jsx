import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CameraIcon, 
  SparklesIcon, 
  ShieldCheckIcon, 
  HeartIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import PremiumLogoAnimation from '../components/PremiumLogoAnimation';

const Home = () => {
  const features = [
    {
      icon: CameraIcon,
      title: 'AI-Powered Analysis',
      description: 'Upload your photo and get instant skin analysis using advanced AI technology.'
    },
    {
      icon: SparklesIcon,
      title: 'Personalized Recommendations',
      description: 'Receive tailored Zeshto soap recommendations based on your unique skin profile.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Safe & Secure',
      description: 'Your photos and data are processed securely and never stored permanently.'
    },
    {
      icon: HeartIcon,
      title: 'Track Progress',
      description: 'Monitor your skin improvement journey with before and after comparisons.'
    }
  ];

  const benefits = [
    'Identify skin type (dry, oily, combination, sensitive)',
    'Detect skin concerns (acne, dark spots, wrinkles, etc.)',
    'Get personalized product recommendations',
    'Track skin improvement over time',
    'Access expert skincare tips and advice'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Shining background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-l from-transparent via-yellow-300/5 to-transparent animate-ping"></div>
      
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            {/* Zeshto Premium Logo Showcase */}
            <div className="flex justify-center mb-16">
              <PremiumLogoAnimation>
                <div className="relative">
                  {/* Elegant backdrop with black and yellow theme */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-yellow-900/30 rounded-2xl shadow-xl border border-yellow-400/50 transform -rotate-1"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/40 via-black to-gray-900 rounded-2xl shadow-lg border border-yellow-300/30 transform rotate-1"></div>
                  
                  {/* Main brand container */}
                  <div className="relative bg-black/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-yellow-400/50">
                    {/* Shining overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent rounded-2xl animate-pulse"></div>
                    
                    <div className="text-center transform hover:scale-105 transition-all duration-700 ease-out relative z-10">
                      <h1 className="text-5xl font-extrabold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent mb-4 animate-pulse drop-shadow-lg">
                        ZESHTO
                      </h1>
                      <div className="h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 rounded-full mb-3 shadow-lg shadow-yellow-400/50 animate-pulse"></div>
                      <p className="text-2xl font-bold bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
                        NATURAL SKINCARE
                      </p>
                      <p className="text-lg font-medium text-yellow-200 italic mt-2 drop-shadow-lg">
                        Ayurvedic Heritage
                      </p>
                    </div>
                    
                    {/* Shining accents */}
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full opacity-80 animate-pulse shadow-lg shadow-yellow-400/50"></div>
                    <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full opacity-70 animate-pulse delay-1000 shadow-lg shadow-yellow-300/50"></div>
                  </div>
                  
                  {/* Premium brand statement */}
                  <div className="text-center mt-8">
                    <h2 className="text-2xl font-serif text-yellow-300 mb-2 tracking-wide drop-shadow-lg">
                      Premium Natural Skincare
                    </h2>
                    <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mb-3 shadow-lg shadow-yellow-400/50 animate-pulse"></div>
                    <p className="text-yellow-200 text-sm font-light tracking-wider uppercase drop-shadow-lg">
                      Crafted with Ancient Wisdom
                    </p>
                  </div>
                </div>
              </PremiumLogoAnimation>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-yellow-300 mb-8 font-display leading-tight drop-shadow-2xl relative">
              <span className="relative">
                Discover Your
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent animate-pulse opacity-75"></div>
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 animate-pulse drop-shadow-2xl">
                {' '}Perfect Skin
              </span>
            </h1>
            <p className="text-xl text-yellow-200 mb-10 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-lg">
              Advanced AI-powered skin analysis to help you find the perfect Zeshto soap 
              for your unique skin type and concerns. Get personalized recommendations in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/analysis">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold shadow-lg shadow-yellow-400/50 transform hover:scale-105 transition-all duration-300 hover:shadow-yellow-400/70 animate-pulse border-2 border-yellow-300">
                  Start Analysis
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 border-yellow-400 text-yellow-300 hover:bg-yellow-400/10 hover:text-yellow-200 shadow-lg shadow-yellow-400/30 transform hover:scale-105 transition-all duration-300">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-black/80 to-gray-900/80 backdrop-blur-sm relative">
        {/* Shining overlay for features section */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/5 to-transparent animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-yellow-300 mb-6 font-display drop-shadow-2xl animate-pulse">
              Why Choose Our Skin Analyzer?
            </h2>
            <p className="text-xl text-yellow-200 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-lg">
              Our advanced technology combines dermatological expertise with AI to provide 
              accurate skin analysis and personalized recommendations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-2 border-yellow-400 hover:border-yellow-300 transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-black/80 to-gray-900/80 backdrop-blur-sm shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40" variant="elevated" padding="lg">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-400/50 animate-pulse">
                  <feature.icon className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-yellow-300 mb-3 font-display drop-shadow-lg">
                  {feature.title}
                </h3>
                <p className="text-yellow-200 font-medium leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-l from-gray-900/80 to-black/80 relative">
        {/* Shining overlay for benefits section */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-yellow-400/5 to-transparent animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-yellow-300 mb-8 font-display drop-shadow-2xl animate-pulse">
                Comprehensive Skin Analysis
              </h2>
              <p className="text-xl text-yellow-200 mb-10 font-medium leading-relaxed drop-shadow-lg">
                Our AI technology analyzes multiple aspects of your skin to provide 
                detailed insights and recommendations tailored specifically for you.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-yellow-400 mt-0.5 mr-3 flex-shrink-0 animate-pulse" />
                    <span className="text-yellow-200">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold shadow-lg shadow-yellow-400/50 hover:shadow-yellow-400/70 animate-pulse border-2 border-yellow-300">
                    Get Started Free
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 border-2 border-yellow-400 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg shadow-yellow-400/30 relative">
                {/* Shining overlay for visual element */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-yellow-400/10 to-transparent animate-pulse rounded-2xl"></div>
                
                <div className="text-center p-8 relative z-10">
                  <CameraIcon className="h-24 w-24 text-yellow-400 mx-auto mb-4 animate-pulse drop-shadow-lg" />
                  <h3 className="text-xl font-semibold text-yellow-300 mb-2 drop-shadow-lg">
                    Upload Your Photo
                  </h3>
                  <p className="text-yellow-200">
                    Take a clear selfie and let our AI analyze your skin in seconds
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-black to-gray-900 relative">
        {/* Shining overlay for CTA section */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-pulse"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-yellow-300 mb-6 drop-shadow-2xl animate-pulse">
            Ready to Transform Your Skincare Routine?
          </h2>
          <p className="text-xl text-yellow-200 mb-8 drop-shadow-lg">
            Join thousands of users who have discovered their perfect skincare match with our AI-powered analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/analysis">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold shadow-lg shadow-yellow-400/50 hover:shadow-yellow-400/70 animate-pulse border-2 border-yellow-300">
                Start Free Analysis
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-yellow-300 border-2 border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-200 shadow-lg shadow-yellow-400/30">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;