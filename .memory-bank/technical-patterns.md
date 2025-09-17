# Implementation Patterns - Pulsar Interactive

## Core Implementation Standards

### API Response Pattern (Pulsar)
```javascript
// Consistent success/error response structure
router.get('/api/v1/config', async (ctx) => {
  try {
    const config = await configService.getConfig();
    ctx.body = { success: true, data: config };
  } catch (error) {
    logger.error('Config fetch failed', { error: error.message });
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
});
```

### React Component Pattern (Luna/Planet)
```javascript
import { useState, useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';

const ComponentName = ({ config, onUpdate }) => {
  const [localState, setLocalState] = useState(null);

  useEffect(() => {
    // Initialize with config, setup Socket.IO listeners
    if (config) setLocalState(config);
  }, [config]);

  return (
    <Box p={4}>
      <Text>{localState?.displayValue}</Text>
    </Box>
  );
};
```

### Configuration Flow Pattern
```yaml
# API-first configuration loading sequence
1. Primary: GET /api/v1/config → Pulsar backend
2. Fallback: Local YAML files if API unavailable
3. Cache: In-memory with TTL for performance
4. Updates: Real-time via Socket.IO events

# Standard config structure
server:
  port: 3001
  host: localhost
features:
  realtime: true
  analytics: false
```

### Real-time Event Pattern
```javascript
// Server broadcasts (Pulsar)
io.emit('config:updated', {
  section: 'features',
  data: updatedFeatures,
  timestamp: Date.now()
});

// Client handlers (Luna/Planet)
socket.on('config:updated', (update) => {
  setConfig(prev => ({
    ...prev,
    [update.section]: update.data
  }));
  logger.info('Config updated', update.section);
});
```

### Authentication & Security Pattern
```javascript
// JWT middleware with error handling
const authMiddleware = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  onError: (error, ctx) => {
    ctx.status = 401;
    ctx.body = { success: false, error: 'Invalid token' };
  }
});

// Input validation with Joi
const validateConfig = (schema) => async (ctx, next) => {
  const { error } = schema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      error: error.details[0].message
    };
    return;
  }
  await next();
};
```

### Testing Implementation Pattern
```javascript
// Backend API testing (Mocha/Chai)
describe('Configuration API', () => {
  beforeEach(async () => {
    await configService.reset();
  });

  it('should return current configuration', async () => {
    const response = await request(app)
      .get('/api/v1/config')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).to.have.property('success', true);
    expect(response.body.data).to.be.an('object');
  });
});
```

### Error Handling & Logging Pattern
```javascript
// Structured error handling with Pino
const errorHandler = (error, ctx) => {
  const errorId = uuid();

  logger.error('Request failed', {
    errorId,
    error: error.message,
    stack: error.stack,
    path: ctx.path,
    method: ctx.method
  });

  ctx.body = {
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : error.message,
    errorId
  };
};
```

### Performance Optimization Pattern
```javascript
// Configuration caching with TTL
const configCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCachedConfig = async (key) => {
  const cached = configCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const fresh = await configService.load(key);
  configCache.set(key, { data: fresh, timestamp: Date.now() });
  return fresh;
};
```

### Module Organization Pattern
```javascript
// Barrel exports for clean imports
// src/components/index.js
export { default as Header } from './Header';
export { default as Footer } from './Footer';
export { default as ConfigPanel } from './ConfigPanel';

// Usage
import { Header, Footer, ConfigPanel } from '@/components';
```

These patterns ensure consistency across all Pulsar Interactive services while maintaining clear separation of concerns and robust error handling.