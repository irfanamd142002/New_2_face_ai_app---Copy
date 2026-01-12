# Shopify Integration Guide for Face Skin Analysis Application

## Overview
This guide provides step-by-step instructions for integrating the Face Skin Analysis Application with Shopify to create a seamless e-commerce experience where customers can analyze their skin and receive personalized product recommendations.

## Table of Contents
1. [Integration Architecture](#integration-architecture)
2. [Prerequisites](#prerequisites)
3. [Shopify App Setup](#shopify-app-setup)
4. [API Integration](#api-integration)
5. [Frontend Integration](#frontend-integration)
6. [Product Recommendation System](#product-recommendation-system)
7. [Webhook Configuration](#webhook-configuration)
8. [Testing & Deployment](#testing--deployment)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

## Integration Architecture

### High-Level Flow
```
Customer → Skin Analysis App → AI Analysis → Product Recommendations → Shopify Store → Purchase
```

### Components
- **Face Analysis App**: React frontend with AI-powered skin analysis
- **Backend API**: Node.js/Express server handling analysis and recommendations
- **Shopify Store**: E-commerce platform for product sales
- **Shopify Admin API**: For product management and order processing
- **Shopify Storefront API**: For customer-facing product display

## Prerequisites

### Technical Requirements
- Shopify Partner Account
- Shopify Store (Development/Production)
- Node.js 16+ and npm/yarn
- MongoDB database
- SSL certificate for production

### Shopify Permissions Required
- `read_products`
- `write_products`
- `read_orders`
- `write_orders`
- `read_customers`
- `write_customers`
- `read_inventory`

## Shopify App Setup

### 1. Create Shopify Partner Account
1. Visit [partners.shopify.com](https://partners.shopify.com)
2. Sign up for a partner account
3. Create a new app in the Partner Dashboard

### 2. App Configuration
```javascript
// shopify.app.toml
name = "Face Skin Analysis"
client_id = "your_client_id"
application_url = "https://your-domain.com"
embedded = true

[access_scopes]
scopes = "read_products,write_products,read_orders,write_orders,read_customers,write_customers"

[auth]
redirect_urls = [
  "https://your-domain.com/auth/callback"
]

[webhooks]
api_version = "2023-10"
```

### 3. Install Shopify CLI
```bash
npm install -g @shopify/cli @shopify/theme
```

## API Integration

### 1. Install Shopify Dependencies
```bash
# In your server directory
npm install @shopify/shopify-api @shopify/admin-api-client
```

### 2. Shopify Configuration
```javascript
// server/config/shopify.js
import { shopifyApi } from '@shopify/shopify-api';
import { ApiVersion } from '@shopify/admin-api-client';

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['read_products', 'write_products', 'read_orders', 'write_orders'],
  hostName: process.env.SHOPIFY_APP_URL,
  apiVersion: ApiVersion.October23,
  isEmbeddedApp: true,
});

export default shopify;
```

### 3. Environment Variables
```bash
# server/.env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=https://your-domain.com
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
```

### 4. Authentication Middleware
```javascript
// server/middleware/shopifyAuth.js
import shopify from '../config/shopify.js';

export const verifyShopifyAuth = async (req, res, next) => {
  try {
    const session = await shopify.utils.loadCurrentSession(req, res);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.shopifySession = session;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
```

## Frontend Integration

### 1. Shopify App Bridge Setup
```bash
# In your client directory
npm install @shopify/app-bridge @shopify/app-bridge-react
```

### 2. App Bridge Provider
```javascript
// client/src/components/ShopifyProvider.jsx
import { Provider } from '@shopify/app-bridge-react';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';

const ShopifyProvider = ({ children }) => {
  const config = {
    apiKey: import.meta.env.VITE_SHOPIFY_API_KEY,
    host: new URLSearchParams(location.search).get('host'),
    forceRedirect: true,
  };

  return (
    <Provider config={config}>
      <AppProvider>
        {children}
      </AppProvider>
    </Provider>
  );
};

export default ShopifyProvider;
```

### 3. Product Recommendation Component
```javascript
// client/src/components/ShopifyProductRecommendations.jsx
import React, { useState, useEffect } from 'react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Redirect } from '@shopify/app-bridge/actions';

const ShopifyProductRecommendations = ({ skinAnalysisResults }) => {
  const app = useAppBridge();
  const redirect = Redirect.create(app);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendedProducts();
  }, [skinAnalysisResults]);

  const fetchRecommendedProducts = async () => {
    try {
      const response = await fetch('/api/shopify/recommended-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisResults: skinAnalysisResults })
      });
      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    redirect.dispatch(Redirect.Action.ADMIN_PATH, `/products/${productId}`);
  };

  if (loading) return <div>Loading recommendations...</div>;

  return (
    <div className="shopify-recommendations">
      <h3>Recommended Products for Your Skin</h3>
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card" onClick={() => handleProductClick(product.id)}>
            <img src={product.image} alt={product.title} />
            <h4>{product.title}</h4>
            <p>{product.description}</p>
            <span className="price">${product.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopifyProductRecommendations;
```

## Product Recommendation System

### 1. Product Mapping Service
```javascript
// server/services/shopifyProductService.js
import { GraphqlQueryError } from '@shopify/admin-api-client';

class ShopifyProductService {
  constructor(session) {
    this.session = session;
    this.client = new shopify.clients.Graphql({ session });
  }

  async getProductsByTags(tags) {
    const query = `
      query getProductsByTags($tags: [String!]!) {
        products(first: 20, query: $tags) {
          edges {
            node {
              id
              title
              description
              handle
              tags
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                    compareAtPrice
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await this.client.query({
        data: { query, variables: { tags } }
      });
      return response.body.data.products.edges.map(edge => edge.node);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getRecommendedProducts(skinAnalysis) {
    const tags = this.mapSkinIssueToTags(skinAnalysis);
    return await this.getProductsByTags(tags);
  }

  mapSkinIssueToTags(analysis) {
    const tagMapping = {
      'acne': ['acne-treatment', 'salicylic-acid', 'benzoyl-peroxide'],
      'dry-skin': ['moisturizer', 'hyaluronic-acid', 'ceramides'],
      'oily-skin': ['oil-control', 'niacinamide', 'clay-mask'],
      'sensitive-skin': ['gentle', 'fragrance-free', 'hypoallergenic'],
      'aging': ['anti-aging', 'retinol', 'vitamin-c', 'peptides'],
      'dark-spots': ['brightening', 'vitamin-c', 'kojic-acid'],
      'rosacea': ['rosacea-care', 'gentle', 'anti-inflammatory']
    };

    let tags = [];
    if (analysis.skinIssues) {
      analysis.skinIssues.forEach(issue => {
        if (tagMapping[issue]) {
          tags = [...tags, ...tagMapping[issue]];
        }
      });
    }

    return [...new Set(tags)]; // Remove duplicates
  }
}

export default ShopifyProductService;
```

### 2. Recommendation API Endpoint
```javascript
// server/routes/shopify.js
import express from 'express';
import ShopifyProductService from '../services/shopifyProductService.js';
import { verifyShopifyAuth } from '../middleware/shopifyAuth.js';

const router = express.Router();

router.post('/recommended-products', verifyShopifyAuth, async (req, res) => {
  try {
    const { analysisResults } = req.body;
    const productService = new ShopifyProductService(req.shopifySession);
    const products = await productService.getRecommendedProducts(analysisResults);
    
    res.json({ products });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get product recommendations' });
  }
});

router.post('/create-customer-analysis', verifyShopifyAuth, async (req, res) => {
  try {
    const { customerEmail, analysisResults } = req.body;
    
    // Store analysis in customer metafields
    const customerQuery = `
      mutation customerUpdate($input: CustomerInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            metafields(first: 10) {
              edges {
                node {
                  key
                  value
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
        email: customerEmail,
        metafields: [
          {
            key: 'skin_analysis',
            value: JSON.stringify(analysisResults),
            type: 'json'
          }
        ]
      }
    };

    const client = new shopify.clients.Graphql({ session: req.shopifySession });
    const response = await client.query({
      data: { query: customerQuery, variables }
    });

    res.json({ success: true, customer: response.body.data.customerUpdate.customer });
  } catch (error) {
    console.error('Error creating customer analysis:', error);
    res.status(500).json({ error: 'Failed to save customer analysis' });
  }
});

export default router;
```

## Webhook Configuration

### 1. Webhook Setup
```javascript
// server/routes/webhooks.js
import express from 'express';
import crypto from 'crypto';

const router = express.Router();

const verifyWebhook = (req, res, next) => {
  const hmac = req.get('X-Shopify-Hmac-Sha256');
  const body = req.body;
  const hash = crypto
    .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(body, 'utf8')
    .digest('base64');

  if (hash !== hmac) {
    return res.status(401).send('Unauthorized');
  }
  next();
};

router.post('/orders/create', verifyWebhook, (req, res) => {
  const order = req.body;
  console.log('New order created:', order.id);
  
  // Process order with skin analysis data
  processOrderWithAnalysis(order);
  
  res.status(200).send('OK');
});

router.post('/customers/create', verifyWebhook, (req, res) => {
  const customer = req.body;
  console.log('New customer created:', customer.id);
  
  // Initialize customer for skin analysis
  initializeCustomerAnalysis(customer);
  
  res.status(200).send('OK');
});

async function processOrderWithAnalysis(order) {
  // Check if customer has skin analysis data
  // Send personalized follow-up recommendations
}

async function initializeCustomerAnalysis(customer) {
  // Set up customer for future skin analysis
  // Send welcome email with analysis invitation
}

export default router;
```

### 2. Register Webhooks
```javascript
// server/utils/registerWebhooks.js
import shopify from '../config/shopify.js';

export const registerWebhooks = async (session) => {
  const webhooks = [
    {
      topic: 'orders/create',
      address: `${process.env.SHOPIFY_APP_URL}/webhooks/orders/create`,
      format: 'json'
    },
    {
      topic: 'customers/create',
      address: `${process.env.SHOPIFY_APP_URL}/webhooks/customers/create`,
      format: 'json'
    }
  ];

  for (const webhook of webhooks) {
    try {
      await shopify.rest.Webhook.save({
        session,
        ...webhook
      });
      console.log(`Webhook registered: ${webhook.topic}`);
    } catch (error) {
      console.error(`Failed to register webhook ${webhook.topic}:`, error);
    }
  }
};
```

## Testing & Deployment

### 1. Development Testing
```bash
# Start the application
npm run dev

# Use ngrok for webhook testing
npx ngrok http 3000

# Test with Shopify CLI
shopify app dev
```

### 2. Production Deployment
```bash
# Build the application
npm run build

# Deploy to your hosting platform (Heroku, AWS, etc.)
# Update Shopify app URLs in partner dashboard
```

### 3. Testing Checklist
- [ ] Authentication flow works
- [ ] Product recommendations display correctly
- [ ] Webhooks receive and process data
- [ ] Customer data is stored properly
- [ ] Orders integrate with analysis data
- [ ] Error handling works as expected

## Security Considerations

### 1. Data Protection
- Encrypt sensitive customer data
- Use HTTPS for all communications
- Implement proper session management
- Validate all webhook signatures

### 2. API Security
```javascript
// Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Environment Variables
```bash
# Production environment variables
SHOPIFY_API_KEY=your_production_api_key
SHOPIFY_API_SECRET=your_production_api_secret
SHOPIFY_WEBHOOK_SECRET=your_production_webhook_secret
DATABASE_URL=your_production_database_url
JWT_SECRET=your_jwt_secret
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API credentials
   - Check redirect URLs
   - Ensure proper scopes

2. **Webhook Failures**
   - Verify webhook signatures
   - Check endpoint accessibility
   - Review webhook logs

3. **Product Sync Issues**
   - Validate product tags
   - Check API rate limits
   - Review GraphQL queries

### Debug Tools
```javascript
// Enable debug logging
process.env.DEBUG = 'shopify:*';

// Log all API calls
shopify.config.logger = {
  level: 'debug',
  httpRequests: true
};
```

## Support & Resources

- [Shopify Partner Documentation](https://shopify.dev/)
- [Shopify Admin API Reference](https://shopify.dev/api/admin)
- [App Bridge Documentation](https://shopify.dev/apps/tools/app-bridge)
- [Webhook Documentation](https://shopify.dev/apps/webhooks)

## Next Steps

1. Set up Shopify Partner account
2. Configure development environment
3. Implement basic authentication
4. Create product recommendation logic
5. Set up webhooks
6. Test integration thoroughly
7. Deploy to production
8. Monitor and optimize

---

*This integration guide provides a comprehensive foundation for connecting your Face Skin Analysis Application with Shopify. Customize the implementation based on your specific business requirements and product catalog.*