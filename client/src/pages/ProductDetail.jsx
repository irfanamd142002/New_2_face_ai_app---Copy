import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  ArrowTopRightOnSquareIcon,
  ChevronLeftIcon,
  CheckIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  TruckIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    fetchProduct();
    if (user) {
      checkFavoriteStatus();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
      
      // Fetch related products
      if (response.data.targetSkinTypes?.length > 0) {
        const relatedResponse = await api.get(`/products?skinType=${response.data.targetSkinTypes[0]}&limit=4`);
        setRelatedProducts(relatedResponse.data.filter(p => p._id !== id));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await api.get('/users/favorites');
      setIsFavorite(response.data.some(fav => fav._id === id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please login to add favorites');
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/users/favorites/${id}`);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await api.post(`/users/favorites/${id}`);
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getSkinTypeColor = (skinType) => {
    const colors = {
      'dry': 'bg-orange-100 text-orange-800',
      'oily': 'bg-blue-100 text-blue-800',
      'combination': 'bg-purple-100 text-purple-800',
      'sensitive': 'bg-red-100 text-red-800',
      'normal': 'bg-green-100 text-green-800'
    };
    return colors[skinType?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getConcernColor = (concern) => {
    const colors = {
      'acne': 'bg-red-100 text-red-800',
      'dark_spots': 'bg-yellow-100 text-yellow-800',
      'wrinkles': 'bg-purple-100 text-purple-800',
      'dryness': 'bg-orange-100 text-orange-800',
      'oiliness': 'bg-blue-100 text-blue-800',
      'sensitivity': 'bg-pink-100 text-pink-800'
    };
    return colors[concern?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading product details..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product Not Found</h3>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button as={Link} to="/products" variant="primary">
            Browse Products
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/products" className="hover:text-primary-600 flex items-center">
            <ChevronLeftIcon className="h-4 w-4 mr-1" />
            Back to Products
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={product.images?.[selectedImage] || '/api/placeholder/600/600'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              {renderStars(product.rating)}
              <span className="text-sm text-gray-500">
                Based on {product.reviewCount || 0} reviews
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="text-sm text-green-600 font-medium">
                  Save {formatPrice(product.originalPrice - product.price)} 
                  ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off)
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {product.stock > 0 ? (
                <>
                  <CheckIcon className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">In Stock</span>
                  {product.stock <= 5 && (
                    <span className="text-orange-600 text-sm">
                      (Only {product.stock} left)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Skin Types */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Suitable for:</h3>
              <div className="flex flex-wrap gap-2">
                {product.targetSkinTypes?.map((type, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getSkinTypeColor(type)}`}
                  >
                    {type} Skin
                  </span>
                ))}
              </div>
            </div>

            {/* Skin Concerns */}
            {product.targetSkinConcerns && product.targetSkinConcerns.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Addresses:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.targetSkinConcerns.map((concern, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getConcernColor(concern)}`}
                    >
                      {concern.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={toggleFavorite}
                  variant="outline"
                  icon={isFavorite ? HeartIconSolid : HeartIcon}
                  className={isFavorite ? 'text-red-500 border-red-500' : ''}
                >
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </Button>
                
                {product.stock > 0 ? (
                  <Button
                    onClick={() => addToCart(product)}
                    variant={isInCart(product._id) ? "secondary" : "primary"}
                    icon={ShoppingCartIcon}
                    className="flex-1"
                  >
                    {isInCart(product._id) ? `In Cart (${getItemQuantity(product._id)})` : 'Add to Cart'}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    className="flex-1"
                  >
                    Out of Stock
                  </Button>
                )}
                
                {product.ecommerceUrl && (
                  <Button
                    as="a"
                    href={product.ecommerceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    icon={ArrowTopRightOnSquareIcon}
                    className="flex-1"
                  >
                    Buy Now
                  </Button>
                )}
              </div>

              {/* Shipping Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <TruckIcon className="h-4 w-4" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ShieldCheckIcon className="h-4 w-4" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'ingredients', label: 'Ingredients' },
                { id: 'benefits', label: 'Benefits' },
                { id: 'usage', label: 'How to Use' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{product.detailedDescription || product.description}</p>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Ingredients</h3>
                {product.ingredients && product.ingredients.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.ingredients.map((ingredient, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-1">{ingredient.name}</h4>
                        <p className="text-sm text-gray-600">{ingredient.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Ingredient information not available.</p>
                )}
              </div>
            )}

            {activeTab === 'benefits' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Benefits</h3>
                {product.benefits && product.benefits.length > 0 ? (
                  <ul className="space-y-2">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Benefit information not available.</p>
                )}
              </div>
            )}

            {activeTab === 'usage' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 font-medium mb-2">Usage Instructions:</p>
                      <p className="text-blue-700">
                        {product.usage || 'Apply to clean skin as directed. For best results, use consistently as part of your daily skincare routine.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct._id} className="group hover:shadow-lg transition-shadow">
                  <Link to={`/products/${relatedProduct._id}`} className="block space-y-4">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={relatedProduct.images?.[0] || '/api/placeholder/300/300'}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {relatedProduct.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(relatedProduct.price)}
                        </span>
                        {renderStars(relatedProduct.rating)}
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;