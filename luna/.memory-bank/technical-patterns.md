# Technical Patterns - Luna (Frontend)

## React Development Patterns

### Component Architecture

#### Functional Components with Hooks
```jsx
// Preferred pattern for all components
import { useState, useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';

const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  return (
    <Box>
      <Text>{state}</Text>
    </Box>
  );
};

export default ComponentName;
```

#### Custom Hooks Pattern
```jsx
// Custom hooks for reusable logic
const useSocketConnection = () => {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Socket setup logic
    return () => {
      // Cleanup logic
    };
  }, []);

  return { connected, socket };
};
```

### State Management Patterns

#### Local State for UI
- Use `useState` for component-specific UI state
- Use `useReducer` for complex state logic
- Keep state as close to where it's used as possible

#### Context for Global State
```jsx
// Configuration context pattern
const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);

  const updateConfig = useCallback((newConfig) => {
    setConfig(newConfig);
  }, []);

  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};
```

## Chakra UI Patterns

### Responsive Design
```jsx
// Use Chakra's responsive props
<Box
  width={{ base: "100%", md: "50%", lg: "25%" }}
  padding={{ base: 4, md: 6, lg: 8 }}
>
  <Text fontSize={{ base: "md", md: "lg", lg: "xl" }}>
    Responsive text
  </Text>
</Box>
```

### Theme Integration
```jsx
// Use theme tokens consistently
<Button
  colorScheme="blue"
  size="md"
  variant="solid"
>
  Themed Button
</Button>
```

### Layout Patterns
```jsx
// Consistent layout structure
<VStack spacing={4} align="stretch">
  <HStack justify="space-between">
    <Heading size="lg">Page Title</Heading>
    <Button>Action</Button>
  </HStack>
  <Divider />
  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
    {items.map(item => (
      <Card key={item.id}>
        <CardBody>
          {/* Content */}
        </CardBody>
      </Card>
    ))}
  </SimpleGrid>
</VStack>
```

## Socket.IO Integration Patterns

### Connection Management
```jsx
const useSocketConnection = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Environment-specific Socket.IO URLs
    const SOCKET_URL = process.env.NODE_ENV === 'production'
      ? 'wss://api.pulsarinteractive.xyz'
      : 'ws://localhost:3000';

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      upgrade: true,
      rememberUpgrade: true
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return { socket, connected };
};
```

### Event Handling
```jsx
const useSocketEvents = (socket) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handleDataUpdate = (newData) => {
      setData(newData);
    };

    socket.on('data-update', handleDataUpdate);

    return () => {
      socket.off('data-update', handleDataUpdate);
    };
  }, [socket]);

  return data;
};
```

## Configuration Management Patterns

### YAML Configuration Loading
```jsx
import yaml from 'js-yaml';

const useConfiguration = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Environment-specific API URLs
        const API_BASE = process.env.NODE_ENV === 'production'
          ? 'https://api.pulsarinteractive.xyz'
          : 'http://localhost:3000';

        const response = await fetch(`${API_BASE}/api/v1/config`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const yamlText = await response.text();
        const parsedConfig = yaml.load(yamlText);
        setConfig(parsedConfig);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return { config, loading, error };
};
```

### Real-time Configuration Updates
```jsx
const useRealtimeConfig = () => {
  const { socket } = useSocketConnection();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('config-update', (newConfig) => {
      setConfig(newConfig);
    });

    return () => {
      socket.off('config-update');
    };
  }, [socket]);

  return config;
};
```

## Error Handling Patterns

### Error Boundaries
```jsx
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert status="error">
          <AlertIcon />
          Something went wrong. Please refresh the page.
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

### Async Error Handling
```jsx
const useAsyncError = () => {
  const [error, setError] = useState(null);

  const executeAsync = useCallback(async (asyncFunction) => {
    try {
      setError(null);
      return await asyncFunction();
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  return { error, executeAsync };
};
```

## File Organization Patterns

### Component Structure
```
components/
├── common/           # Shared components
│   ├── Button/
│   ├── Modal/
│   └── Layout/
├── features/         # Feature-specific components
│   ├── Configuration/
│   ├── Dashboard/
│   └── Settings/
└── pages/           # Page-level components
    ├── HomePage/
    ├── ConfigPage/
    └── SettingsPage/
```

### Hook Organization
```
hooks/
├── api/             # API-related hooks
├── socket/          # Socket.IO hooks
├── config/          # Configuration hooks
└── utils/           # Utility hooks
```

## Import Patterns

### Module Aliases
```jsx
// Use @ for src/ directory
import { ComponentName } from '@/components/common';
import { useConfig } from '@/hooks/config';
import { apiClient } from '@/utils/api';
```

### External Dependencies
```jsx
// Group imports logically
import React, { useState, useEffect } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import { io } from 'socket.io-client';
import yaml from 'js-yaml';

import { useConfig } from '@/hooks/config';
import { ComponentName } from '@/components/common';
```

## Testing Patterns

### Component Testing
```jsx
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ComponentName from './ComponentName';

const renderWithChakra = (component) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

test('renders component correctly', () => {
  renderWithChakra(<ComponentName />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});
```

### Hook Testing
```jsx
import { renderHook } from '@testing-library/react';
import { useCustomHook } from './useCustomHook';

test('custom hook returns expected value', () => {
  const { result } = renderHook(() => useCustomHook());
  expect(result.current).toBeDefined();
});
```

## Performance Patterns

### Memoization
```jsx
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// Memoize components
const MemoizedComponent = memo(({ prop1, prop2 }) => {
  return <div>{prop1} - {prop2}</div>;
});
```

### Code Splitting
```jsx
// Lazy load components
const LazyComponent = lazy(() => import('./LazyComponent'));

// Use with Suspense
<Suspense fallback={<Spinner />}>
  <LazyComponent />
</Suspense>
```