# Technical Patterns - Pulsar Interactive

## Code Organization Patterns

### Module Structure
- **Module Aliases**: All projects use `@/` alias for src/ directory
- **Barrel Exports**: Index files export multiple related components
- **Feature-based Folders**: Group related functionality together
- **Separation of Concerns**: Clear boundaries between data, logic, and presentation

### API Patterns

#### Pulsar Backend (Koa.js)
```javascript
// Standard route pattern
router.get('/api/v1/config', async (ctx) => {
  try {
    const config = await configService.getConfig();
    ctx.body = { success: true, data: config };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, error: error.message };
  }
});
```

#### Error Handling
- Consistent error response format
- Structured logging with Pino
- HTTP status codes follow REST conventions
- Client-friendly error messages

### Frontend Patterns (Luna)

#### React Component Structure
```javascript
// Standard component pattern
import { useState, useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  return (
    <Box>
      <Text>{state}</Text>
    </Box>
  );
};

export default ComponentName;
```

#### State Management
- React Context API for global state
- Local component state for UI-specific data
- Custom hooks for reusable logic
- Socket.IO integration for real-time updates

### Configuration Management Patterns

#### API-First Approach
1. **Primary**: Load from Pulsar API endpoints
2. **Fallback**: Load from local YAML files
3. **Cache**: In-memory caching for performance
4. **Updates**: Real-time via Socket.IO

#### Configuration Structure
```yaml
# Standard config format
server:
  port: 3001
  host: localhost

database:
  type: postgresql
  host: localhost
  port: 5432

features:
  realtime: true
  analytics: false
```

### Real-time Communication Patterns

#### Socket.IO Events
```javascript
// Server-side (Pulsar)
io.emit('config:updated', {
  section: 'server',
  data: newConfig
});

// Client-side (Luna)
socket.on('config:updated', (update) => {
  setConfig(prev => ({
    ...prev,
    [update.section]: update.data
  }));
});
```

### Security Patterns

#### JWT Authentication
```javascript
// Token validation middleware
const authMiddleware = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256']
});

// Protected route
router.get('/api/v1/protected', authMiddleware, async (ctx) => {
  // Access user info from ctx.state.user
});
```

#### Input Validation (Joi)
```javascript
const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  age: Joi.number().min(0).max(120)
});

const validationMiddleware = (schema) => {
  return async (ctx, next) => {
    const { error } = schema.validate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { success: false, error: error.details[0].message };
      return;
    }
    await next();
  };
};
```

### Testing Patterns

#### Backend Testing (Mocha)
```javascript
describe('Config API', () => {
  beforeEach(async () => {
    // Setup test data
  });
  
  it('should return configuration', async () => {
    const response = await request(app)
      .get('/api/v1/config')
      .expect(200);
    
    expect(response.body).to.have.property('success', true);
    expect(response.body.data).to.be.an('object');
  });
});
```

#### Mocking with Sinon
```javascript
const sinon = require('sinon');
const configService = require('../src/services/config');

describe('Config Service', () => {
  let stub;
  
  beforeEach(() => {
    stub = sinon.stub(configService, 'loadFromFile');
  });
  
  afterEach(() => {
    stub.restore();
  });
});
```


### Performance Patterns

#### Caching Strategy
- Configuration cached in memory
- API responses cached with appropriate TTL
- Static assets served with proper cache headers
- Database query optimization with proper indexing

#### Connection Management
```javascript
// Database connection pooling
const pool = {
  min: 2,
  max: 10,
  acquireTimeoutMillis: 60000,
  idleTimeoutMillis: 30000
};
```

### Error Handling Patterns

#### Structured Error Responses
```javascript
const errorHandler = (error, ctx) => {
  const errorResponse = {
    success: false,
    error: {
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    }
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = error.stack;
  }
  
  ctx.body = errorResponse;
};
```

### Deployment Patterns

#### Environment Configuration
- `.env` files for environment-specific settings
- Environment validation at startup
- Graceful degradation for missing optional configs
- Health check endpoints for monitoring

#### Docker Integration
```dockerfile
# Standard Dockerfile pattern for Node.js services
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

These patterns ensure consistency across the Pulsar Interactive ecosystem while maintaining flexibility for each component's specific needs.