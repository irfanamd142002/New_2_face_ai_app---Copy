import React from 'react';
import { 
  BeakerIcon, 
  HeartIcon, 
  ShieldCheckIcon, 
  SparklesIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import Card from '../components/common/Card';

const About = () => {
  const values = [
    {
      icon: BeakerIcon,
      title: 'Scientific Excellence',
      description: 'Our formulations are backed by dermatological research and proven ingredients.'
    },
    {
      icon: HeartIcon,
      title: 'Customer Care',
      description: 'We prioritize your skin health and satisfaction above everything else.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Safety First',
      description: 'All our products undergo rigorous testing to ensure safety and efficacy.'
    },
    {
      icon: SparklesIcon,
      title: 'Innovation',
      description: 'We continuously innovate to bring you the latest in skincare technology.'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Chief Dermatologist',
      description: 'Board-certified dermatologist with 15+ years of experience in skincare research.'
    },
    {
      name: 'Michael Chen',
      role: 'AI Technology Lead',
      description: 'Expert in computer vision and machine learning applications for healthcare.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Development',
      description: 'Cosmetic chemist specializing in natural and organic skincare formulations.'
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Zeshto
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing skincare through the perfect blend of traditional soap-making 
            expertise and cutting-edge AI technology to help you achieve your best skin.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At Zeshto, we believe that everyone deserves to feel confident in their skin. 
                Our mission is to democratize access to personalized skincare by combining 
                the wisdom of traditional soap-making with the precision of artificial intelligence.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We've developed an advanced AI-powered skin analysis system that can identify 
                your unique skin type and concerns, then recommend the perfect Zeshto soap 
                formulation tailored specifically for your needs.
              </p>
              <p className="text-lg text-gray-600">
                Our commitment extends beyond just products – we're building a community 
                where skincare knowledge is shared, progress is celebrated, and everyone 
                can achieve their skin goals.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <AcademicCapIcon className="h-24 w-24 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Science-Backed Solutions
                  </h3>
                  <p className="text-gray-600">
                    Every recommendation is based on dermatological research and proven results
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do, from product development to customer service.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Technology Section */}
        <section className="mb-20 bg-white/50 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-secondary-100 to-primary-100 rounded-2xl flex items-center justify-center">
                <div className="text-center p-8">
                  <SparklesIcon className="h-24 w-24 text-secondary-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    AI-Powered Analysis
                  </h3>
                  <p className="text-gray-600">
                    Advanced computer vision technology for accurate skin assessment
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Cutting-Edge Technology
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Our proprietary AI system has been trained on thousands of skin images 
                and validated by dermatologists to ensure accurate analysis and recommendations.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Computer Vision Analysis</h4>
                    <p className="text-gray-600">Advanced image processing to detect skin characteristics</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Machine Learning Recommendations</h4>
                    <p className="text-gray-600">Personalized product suggestions based on your unique profile</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-3 mr-4 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Continuous Learning</h4>
                    <p className="text-gray-600">Our AI improves with every analysis to provide better results</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our diverse team of experts combines decades of experience in dermatology, 
              technology, and product development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center p-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600">
                  {member.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Commitment Section */}
        <section className="text-center bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 lg:p-12 text-white">
          <h2 className="text-3xl font-bold mb-6">Our Commitment to You</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            We're committed to providing safe, effective, and personalized skincare solutions 
            that help you achieve your best skin. Your trust is our most valuable asset.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="text-primary-100">Natural Ingredients</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">30-Day</div>
              <div className="text-primary-100">Money-Back Guarantee</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-primary-100">Customer Support</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;