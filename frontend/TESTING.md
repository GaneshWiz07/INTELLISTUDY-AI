# Testing Guide

This document outlines the testing strategy and implementation for the Neuroadaptive Learning Frontend application.

## Testing Stack

- **Unit/Integration Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright (Firefox & WebKit)
- **Performance Monitoring**: Custom performance utilities
- **Accessibility Testing**: Custom accessibility validator + Playwright

## Test Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── **/__tests__/          # Component tests
│   ├── hooks/
│   │   └── __tests__/             # Custom hook tests
│   ├── services/
│   │   └── __tests__/             # Service/API tests
│   ├── contexts/
│   │   └── __tests__/             # Context provider tests
│   ├── utils/
│   │   └── __tests__/             # Utility function tests
│   └── test/
│       ├── setup.ts               # Test setup configuration
│       └── testUtils.tsx          # Common test utilities
├── e2e/                           # End-to-end tests
│   ├── auth.spec.ts              # Authentication flow tests
│   ├── dashboard.spec.ts         # Dashboard functionality tests
│   ├── accessibility.spec.ts     # Accessibility compliance tests
│   └── performance.spec.ts       # Performance benchmark tests
└── playwright.config.ts          # Playwright configuration
```

## Running Tests

### Unit and Integration Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- LoginForm.test.tsx
```

### End-to-End Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test suite
npm run test:accessibility
npm run test:performance

# Run tests in specific browser
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Categories

### 1. Unit Tests

Test individual components, hooks, and utilities in isolation.

**Coverage Areas:**
- Component rendering and props
- User interactions (clicks, form inputs)
- State management
- Custom hook behavior
- Utility function logic
- Service layer functionality

**Example:**
```typescript
// LoginForm.test.tsx
test('should validate email format', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  
  await user.type(screen.getByLabelText(/email/i), 'invalid-email');
  await user.click(screen.getByRole('button', { name: /sign in/i }));
  
  expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
});
```

### 2. Integration Tests

Test component interactions and data flow between multiple components.

**Coverage Areas:**
- Context provider integration
- API service integration
- Component communication
- State synchronization
- Error boundary behavior

**Example:**
```typescript
// AuthContext.test.tsx
test('should handle login flow', async () => {
  const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
  
  await act(async () => {
    await result.current.login({ email: 'test@example.com', password: 'password123' });
  });
  
  expect(result.current.user).toBeDefined();
  expect(result.current.isAuthenticated).toBe(true);
});
```

### 3. End-to-End Tests

Test complete user workflows across the entire application.

**Coverage Areas:**
- Authentication flows
- Dashboard navigation
- Learning session management
- Form submissions
- Error handling
- Cross-browser compatibility

**Example:**
```typescript
// auth.spec.ts
test('should successfully login with valid credentials', async ({ page }) => {
  await page.goto('/');
  await page.getByLabelText(/email/i).fill('test@example.com');
  await page.getByLabelText(/password/i).fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(/student dashboard/i)).toBeVisible();
});
```

### 4. Accessibility Tests

Ensure the application meets WCAG 2.1 AA standards.

**Coverage Areas:**
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Focus management
- ARIA attributes
- Semantic HTML structure

**Example:**
```typescript
// accessibility.spec.ts
test('should support keyboard navigation', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  
  const focusedElement = await page.locator(':focus').first();
  await expect(focusedElement).toBeVisible();
});
```

### 5. Performance Tests

Validate application performance and resource usage.

**Coverage Areas:**
- Page load times
- Component render performance
- Memory usage
- Bundle size optimization
- Network request efficiency
- Real-time feature performance

**Example:**
```typescript
// performance.spec.ts
test('should load initial page within performance budget', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(2000);
});
```

## Performance Monitoring

### Built-in Performance Utilities

The application includes custom performance monitoring utilities:

```typescript
import { performanceMonitor, usePerformanceMonitor } from '../utils/performance';

// Component-level monitoring
function MyComponent() {
  const { measureRender, measureAsync } = usePerformanceMonitor('MyComponent');
  
  const handleClick = () => {
    measureRender(() => {
      // Expensive operation
    });
  };
  
  const fetchData = () => {
    return measureAsync(async () => {
      return await api.getData();
    });
  };
}
```

### Performance Benchmarks

- **Initial page load**: < 2 seconds
- **Dashboard load**: < 3 seconds
- **Component render**: < 16ms (60fps)
- **API responses**: < 1 second
- **Bundle size**: < 500KB (gzipped)

## Accessibility Standards

### WCAG 2.1 AA Compliance

The application follows WCAG 2.1 AA guidelines:

- **Perceivable**: Color contrast ratios ≥ 4.5:1
- **Operable**: Full keyboard navigation support
- **Understandable**: Clear labels and instructions
- **Robust**: Valid HTML and ARIA attributes

### Accessibility Validation

```typescript
import { accessibilityValidator } from '../utils/accessibility';

// Manual validation
const report = accessibilityValidator.validate(document.body);
console.log(`Accessibility Score: ${report.score}/100`);

// React hook for component validation
function MyComponent() {
  const ref = useRef<HTMLDivElement>(null);
  useAccessibilityValidator(ref);
  
  return <div ref={ref}>...</div>;
}
```

## Test Data Management

### Mock Data

Test data is managed through:
- Mock API responses in service tests
- Fixture data for E2E tests
- Factory functions for generating test objects

### Test Environment

- **Unit/Integration**: jsdom environment
- **E2E**: Real browser environments (Firefox, WebKit)
- **CI/CD**: Headless browser execution

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:run
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

## Best Practices

### Writing Tests

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use descriptive test names**: Describe what the test does
3. **Test behavior, not implementation**: Focus on user interactions
4. **Keep tests isolated**: Each test should be independent
5. **Use proper selectors**: Prefer semantic queries over CSS selectors

### Performance Testing

1. **Set realistic budgets**: Based on user expectations
2. **Test on various devices**: Different CPU/memory constraints
3. **Monitor real-world metrics**: Core Web Vitals
4. **Test edge cases**: Slow networks, low memory

### Accessibility Testing

1. **Test with keyboard only**: Ensure full functionality
2. **Use screen reader testing**: VoiceOver, NVDA, JAWS
3. **Validate color contrast**: Use automated tools
4. **Test with real users**: Include users with disabilities

## Debugging Tests

### Common Issues

1. **Flaky E2E tests**: Add proper waits and assertions
2. **Memory leaks**: Clean up event listeners and timers
3. **Timing issues**: Use proper async/await patterns
4. **Browser differences**: Test across multiple browsers

### Debugging Tools

- **Playwright Inspector**: Visual debugging for E2E tests
- **React DevTools**: Component state inspection
- **Performance DevTools**: Profiling and optimization
- **Accessibility DevTools**: ARIA and semantic validation

## Reporting

### Test Coverage

Minimum coverage requirements:
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Performance Reports

- **Lighthouse scores**: Generated in CI/CD
- **Bundle analysis**: Size and composition reports
- **Performance metrics**: Load times and resource usage

### Accessibility Reports

- **WCAG compliance**: Automated validation results
- **Manual testing**: User testing session reports
- **Issue tracking**: Accessibility bug reports and fixes