# Shopify Technical Implementation - Code Examples & Configuration

## Quick Start Implementation

### 1. Package.json Dependencies
```json
{
  "dependencies": {
    "@shopify/shopify-api": "^7.5.0",
    "@shopify/admin-api-client": "^0.2.2",
    "@shopify/app-bridge": "^3.7.9",
    "@shopify/app-bridge-react": "^3.7.9",
    "@shopify/polaris": "^11.0.0",
    "express-rate-limit": "^6.7.0",
    "helmet": "^6.1.5"
  }
}
```

### 2. Environment Configuration Template
```bash
# .env.example
# Shopify Configuration
SHOPIFY_API_KEY=your_shopify_api_key_here
SHOPIFY_API_SECRET=your_shopify_api_secret_here
SHOPIFY_APP_URL=https://your-domain.com
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here
SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_customers,write_customers

# Application Configuration
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/faceapp
JWT_SECRET=your_jwt_secret_here

# Frontend Configuration (for Vite)
VITE_SHOPIFY_API_KEY=your_shopify_api_key_here
VITE_API_BASE_URL=http://localhost:3000/api
```

## Complete Server Implementation

### 1. Main Server Setup with Shopify
```javascript
// server/index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { shopifyApi } from '@shopify/shopify-api';
import { ApiVersion } from '@shopify/admin-api-client';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import analysisRoutes from './routes/analysis.js';
import shopifyRoutes from './routes/shopify.js';
import webhookRoutes from './routes/webhooks.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Shopify API Configuration
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.SHOPIFY_APP_URL,
  apiVersion: ApiVersion.October23,
  isEmbeddedApp: true,
  logger: {
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.shopify.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.shopify.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.shopify.com"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Shopify middleware
app.use(shopify.cspHeaders());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// Shopify OAuth routes
app.get('/auth', shopify.auth.begin());
app.get('/auth/callback', shopify.auth.callback(), (req, res) => {
  res.redirect(`/?shop=${req.query.shop}&host=${req.query.host}`);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { shopify };
```

### 2. Shopify Service Layer
```javascript
// server/services/ShopifyIntegrationService.js
import { GraphqlQueryError } from '@shopify/admin-api-client';
import { shopify } from '../index.js';

class ShopifyIntegrationService {
  constructor(session) {
    this.session = session;
    this.graphqlClient = new shopify.clients.Graphql({ session });
    this.restClient = new shopify.clients.Rest({ session });
  }

  // Product Management
  async createProduct(productData) {
    const mutation = `
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        title: productData.title,
        descriptionHtml: productData.description,
        productType: productData.type,
        vendor: productData.vendor,
        tags: productData.tags,
        status: 'ACTIVE'
      }
    };

    try {
      const response = await this.graphqlClient.query({
        data: { query: mutation, variables }
      });
      return response.body.data.productCreate;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async getProductsByTags(tags, limit = 20) {
    const tagQuery = tags.map(tag => `tag:${tag}`).join(' OR ');
    
    const query = `
      query getProducts($query: String!, $first: Int!) {
        products(first: $first, query: $query) {
          edges {
            node {
              id
              title
              description
              handle
              tags
              productType
              vendor
              images(first: 3) {
                edges {
                  node {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
              }
              variants(first: 5) {
                edges {
                  node {
                    id
                    title
                    price
                    compareAtPrice
                    availableForSale
                    inventoryQuantity
                    sku
                  }
                }
              }
              metafields(first: 10) {
                edges {
                  node {
                    key
                    value
                    type
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    try {
      const response = await this.graphqlClient.query({
        data: { 
          query, 
          variables: { 
            query: tagQuery, 
            first: limit 
          } 
        }
      });
      return response.body.data.products.edges.map(edge => edge.node);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Customer Management
  async createOrUpdateCustomer(customerData) {
    const mutation = `
      mutation customerCreate($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
            firstName
            lastName
            phone
            metafields(first: 10) {
              edges {
                node {
                  key
                  value
                  type
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        email: customerData.email,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        phone: customerData.phone,
        metafields: customerData.metafields || []
      }
    };

    try {
      const response = await this.graphqlClient.query({
        data: { query: mutation, variables }
      });
      return response.body.data.customerCreate;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  async updateCustomerMetafields(customerId, metafields) {
    const mutation = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            metafields(first: 20) {
              edges {
                node {
                  key
                  value
                  type
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        id: customerId,
        metafields: metafields
      }
    };

    try {
      const response = await this.graphqlClient.query({
        data: { query: mutation, variables }
      });
      return response.body.data.customerUpdate;
    } catch (error) {
      console.error('Error updating customer metafields:', error);
      throw error;
    }
  }

  // Order Management
  async createDraftOrder(orderData) {
    const mutation = `
      mutation draftOrderCreate($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            id
            name
            email
            phone
            totalPrice
            subtotalPrice
            totalTax
            lineItems(first: 10) {
              edges {
                node {
                  id
                  title
                  quantity
                  originalUnitPrice
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    try {
      const response = await this.graphqlClient.query({
        data: { query: mutation, variables: { input: orderData } }
      });
      return response.body.data.draftOrderCreate;
    } catch (error) {
      console.error('Error creating draft order:', error);
      throw error;
    }
  }

  // Analytics and Reporting
  async getOrderAnalytics(dateRange) {
    const query = `
      query getOrders($first: Int!, $query: String) {
        orders(first: $first, query: $query) {
          edges {
            node {
              id
              name
              email
              createdAt
              totalPrice
              lineItems(first: 20) {
                edges {
                  node {
                    title
                    quantity
                    product {
                      tags
                      productType
                    }
                  }
                }
              }
              customer {
                id
                email
                metafields(first: 10) {
                  edges {
                    node {
                      key
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await this.graphqlClient.query({
        data: { 
          query, 
          variables: { 
            first: 250,
            query: `created_at:>=${dateRange.start} created_at:<=${dateRange.end}`
          } 
        }
      });
      return response.body.data.orders.edges.map(edge => edge.node);
    } catch (error) {
      console.error('Error fetching order analytics:', error);
      throw error;
    }
  }
}

export default ShopifyIntegrationService;
```

### 3. Skin Analysis to Product Mapping
```javascript
// server/services/ProductRecommendationService.js
import ShopifyIntegrationService from './ShopifyIntegrationService.js';

class ProductRecommendationService {
  constructor(session) {
    this.shopifyService = new ShopifyIntegrationService(session);
  }

  async getRecommendationsForAnalysis(analysisData) {
    try {
      // Extract skin concerns and characteristics
      const skinConcerns = this.extractSkinConcerns(analysisData);
      const skinType = this.determineSkinType(analysisData);
      const ageRange = this.determineAgeRange(analysisData);

      // Generate product tags based on analysis
      const productTags = this.generateProductTags(skinConcerns, skinType, ageRange);

      // Fetch products from Shopify
      const products = await this.shopifyService.getProductsByTags(productTags);

      // Score and rank products
      const rankedProducts = this.rankProducts(products, analysisData);

      // Return top recommendations
      return {
        recommendations: rankedProducts.slice(0, 8),
        skinProfile: {
          type: skinType,
          concerns: skinConcerns,
          ageRange: ageRange
        },
        confidence: this.calculateConfidence(analysisData)
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  extractSkinConcerns(analysisData) {
    const concerns = [];
    
    if (analysisData.acneScore > 0.3) concerns.push('acne');
    if (analysisData.wrinkleScore > 0.4) concerns.push('aging');
    if (analysisData.darkSpotScore > 0.3) concerns.push('hyperpigmentation');
    if (analysisData.rednessScore > 0.3) concerns.push('sensitivity');
    if (analysisData.oilinessScore > 0.6) concerns.push('excess-oil');
    if (analysisData.drynessScore > 0.5) concerns.push('dryness');

    return concerns;
  }

  determineSkinType(analysisData) {
    const oiliness = analysisData.oilinessScore || 0;
    const dryness = analysisData.drynessScore || 0;
    const sensitivity = analysisData.rednessScore || 0;

    if (sensitivity > 0.4) return 'sensitive';
    if (oiliness > 0.6) return 'oily';
    if (dryness > 0.5) return 'dry';
    if (oiliness > 0.3 && dryness > 0.3) return 'combination';
    return 'normal';
  }

  determineAgeRange(analysisData) {
    const wrinkleScore = analysisData.wrinkleScore || 0;
    const elasticityScore = analysisData.elasticityScore || 0;

    if (wrinkleScore < 0.2 && elasticityScore > 0.8) return '20s';
    if (wrinkleScore < 0.4 && elasticityScore > 0.6) return '30s';
    if (wrinkleScore < 0.6) return '40s';
    return '50plus';
  }

  generateProductTags(concerns, skinType, ageRange) {
    const tags = [];

    // Skin type tags
    tags.push(`skin-type-${skinType}`);

    // Concern-specific tags
    const concernTagMap = {
      'acne': ['acne-treatment', 'salicylic-acid', 'benzoyl-peroxide', 'tea-tree'],
      'aging': ['anti-aging', 'retinol', 'peptides', 'collagen'],
      'hyperpigmentation': ['brightening', 'vitamin-c', 'kojic-acid', 'arbutin'],
      'sensitivity': ['gentle', 'fragrance-free', 'hypoallergenic', 'soothing'],
      'excess-oil': ['oil-control', 'niacinamide', 'clay', 'mattifying'],
      'dryness': ['moisturizing', 'hyaluronic-acid', 'ceramides', 'glycerin']
    };

    concerns.forEach(concern => {
      if (concernTagMap[concern]) {
        tags.push(...concernTagMap[concern]);
      }
    });

    // Age-specific tags
    const ageTagMap = {
      '20s': ['prevention', 'gentle-care', 'basic-routine'],
      '30s': ['early-prevention', 'antioxidants', 'maintenance'],
      '40s': ['targeted-treatment', 'intensive-care', 'firming'],
      '50plus': ['advanced-treatment', 'deep-repair', 'restoration']
    };

    if (ageTagMap[ageRange]) {
      tags.push(...ageTagMap[ageRange]);
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  rankProducts(products, analysisData) {
    return products.map(product => {
      const score = this.calculateProductScore(product, analysisData);
      return {
        ...product,
        recommendationScore: score,
        matchReasons: this.getMatchReasons(product, analysisData)
      };
    }).sort((a, b) => b.recommendationScore - a.recommendationScore);
  }

  calculateProductScore(product, analysisData) {
    let score = 0;
    const tags = product.tags || [];

    // Score based on skin concerns
    if (analysisData.acneScore > 0.3 && tags.some(tag => 
      ['acne-treatment', 'salicylic-acid', 'benzoyl-peroxide'].includes(tag))) {
      score += analysisData.acneScore * 30;
    }

    if (analysisData.wrinkleScore > 0.4 && tags.some(tag => 
      ['anti-aging', 'retinol', 'peptides'].includes(tag))) {
      score += analysisData.wrinkleScore * 25;
    }

    if (analysisData.darkSpotScore > 0.3 && tags.some(tag => 
      ['brightening', 'vitamin-c', 'kojic-acid'].includes(tag))) {
      score += analysisData.darkSpotScore * 20;
    }

    // Bonus for product rating and reviews (if available in metafields)
    const ratingMetafield = product.metafields?.find(m => m.key === 'rating');
    if (ratingMetafield) {
      const rating = parseFloat(ratingMetafield.value);
      score += rating * 5;
    }

    return Math.min(score, 100); // Cap at 100
  }

  getMatchReasons(product, analysisData) {
    const reasons = [];
    const tags = product.tags || [];

    if (analysisData.acneScore > 0.3 && tags.includes('acne-treatment')) {
      reasons.push('Targets acne concerns');
    }
    if (analysisData.wrinkleScore > 0.4 && tags.includes('anti-aging')) {
      reasons.push('Anti-aging benefits');
    }
    if (analysisData.darkSpotScore > 0.3 && tags.includes('brightening')) {
      reasons.push('Brightening properties');
    }

    return reasons;
  }

  calculateConfidence(analysisData) {
    // Calculate confidence based on analysis quality
    const factors = [
      analysisData.imageQuality || 0.5,
      analysisData.faceDetectionConfidence || 0.5,
      analysisData.analysisCompleteness || 0.5
    ];

    return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }
}

export default ProductRecommendationService;
```

## Frontend Integration Components

### 1. Shopify App Provider
```javascript
// client/src/providers/ShopifyProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Provider } from '@shopify/app-bridge-react';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

const ShopifyContext = createContext();

export const useShopify = () => {
  const context = useContext(ShopifyContext);
  if (!context) {
    throw new Error('useShopify must be used within ShopifyProvider');
  }
  return context;
};

const ShopifyProvider = ({ children }) => {
  const [isShopifyApp, setIsShopifyApp] = useState(false);
  const [shopDomain, setShopDomain] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shop = urlParams.get('shop');
    const host = urlParams.get('host');

    if (shop && host) {
      setIsShopifyApp(true);
      setShopDomain(shop);
    }
  }, []);

  const config = {
    apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
    host: new URLSearchParams(location.search).get('host'),
    forceRedirect: true,
  };

  const shopifyContextValue = {
    isShopifyApp,
    shopDomain,
    config
  };

  if (isShopifyApp) {
    return (
      <Provider config={config}>
        <AppProvider>
          <ShopifyContext.Provider value={shopifyContextValue}>
            {children}
          </ShopifyContext.Provider>
        </AppProvider>
      </Provider>
    );
  }

  return (
    <ShopifyContext.Provider value={shopifyContextValue}>
      {children}
    </ShopifyContext.Provider>
  );
};

export default ShopifyProvider;
```

### 2. Product Recommendation Component
```javascript
// client/src/components/ShopifyRecommendations.jsx
import React, { useState, useEffect } from 'react';
import { useShopify } from '../providers/ShopifyProvider';
import { Card, Button, Badge, Stack, Text, Image } from '@shopify/polaris';

const ShopifyRecommendations = ({ analysisResults }) => {
  const { isShopifyApp } = useShopify();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (analysisResults && isShopifyApp) {
      fetchRecommendations();
    }
  }, [analysisResults, isShopifyApp]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shopify/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ analysisData: analysisResults })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (product) => {
    if (isShopifyApp) {
      // Navigate to product in Shopify admin
      const productId = product.id.split('/').pop();
      window.open(`/admin/products/${productId}`, '_blank');
    } else {
      // Open product page in new tab
      window.open(`https://your-store.myshopify.com/products/${product.handle}`, '_blank');
    }
  };

  const addToCart = async (variantId) => {
    try {
      const response = await fetch('/api/shopify/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variantId, quantity: 1 })
      });

      if (response.ok) {
        // Show success message
        console.log('Product added to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  if (!isShopifyApp) {
    return (
      <div className="shopify-recommendations">
        <h3>Recommended Products</h3>
        <p>Connect with Shopify to see personalized product recommendations.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <Card>
        <Card.Section>
          <Text>Loading personalized recommendations...</Text>
        </Card.Section>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <Card.Section>
          <Text color="critical">Error loading recommendations: {error}</Text>
          <Button onClick={fetchRecommendations}>Retry</Button>
        </Card.Section>
      </Card>
    );
  }

  return (
    <div className="shopify-recommendations">
      <Card>
        <Card.Header>
          <Text variant="headingMd">Recommended Products for Your Skin</Text>
        </Card.Header>
        <Card.Section>
          <Stack vertical spacing="loose">
            {recommendations.map((product, index) => (
              <Card key={product.id} sectioned>
                <Stack alignment="center">
                  {product.images?.edges?.[0] && (
                    <Image
                      source={product.images.edges[0].node.url}
                      alt={product.title}
                      width={80}
                      height={80}
                    />
                  )}
                  <Stack.Item fill>
                    <Stack vertical spacing="tight">
                      <Text variant="headingSm">{product.title}</Text>
                      <Text color="subdued">{product.description}</Text>
                      <Stack>
                        {product.matchReasons?.map((reason, idx) => (
                          <Badge key={idx} status="info">{reason}</Badge>
                        ))}
                      </Stack>
                      {product.variants?.edges?.[0] && (
                        <Text variant="bodyMd" fontWeight="bold">
                          ${product.variants.edges[0].node.price}
                        </Text>
                      )}
                    </Stack>
                  </Stack.Item>
                  <Stack vertical spacing="tight">
                    <Button 
                      primary 
                      onClick={() => handleProductClick(product)}
                    >
                      View Product
                    </Button>
                    {product.variants?.edges?.[0] && (
                      <Button 
                        onClick={() => addToCart(product.variants.edges[0].node.id)}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Card.Section>
      </Card>
    </div>
  );
};

export default ShopifyRecommendations;
```

## Deployment Configuration

### 1. Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### 2. Production Environment Setup
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SHOPIFY_API_KEY=${SHOPIFY_API_KEY}
      - SHOPIFY_API_SECRET=${SHOPIFY_API_SECRET}
      - SHOPIFY_APP_URL=${SHOPIFY_APP_URL}
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:5
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_PASSWORD}

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  mongodb_data:
  redis_data:
```

This technical implementation provides a complete foundation for integrating your Face Skin Analysis Application with Shopify, including all necessary code examples, configurations, and deployment setups.