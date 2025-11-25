# Error Monitoring Guide

> **Version**: 1.0.0
> **Last Updated**: 2025-11-24

## Overview

This application implements a **free error monitoring solution** that doesn't rely on paid services like Sentry or LogRocket. The system provides:

- **Local Storage Persistence**: Errors are stored in browser localStorage
- **Batch Error Reporting**: Optional integration with custom API endpoint
- **Production-Ready**: SSR-safe with graceful degradation
- **Zero Cost**: No external services required

---

## Architecture

### Core Components

```typescript
// Singleton error logger instance
import { errorLogger } from '@/lib/errors/logger'

// React hook for components
import { useErrorLogger } from '@/lib/errors/logger'

// Decorator for async functions
import { withErrorLogging } from '@/lib/errors/logger'
```

### Error Flow

```
Error Occurs
    ↓
1. Log to Memory (last 100 errors)
    ↓
2. Development: Console Output
   Production: Continue to next step
    ↓
3. Serialize Error (timestamp, message, stack, context)
    ↓
4. Store in localStorage (last 50 errors)
    ↓
5. Add to Batch Queue
    ↓
6. Send to Optional API Endpoint
   - Batched every 5 seconds
   - Or when queue reaches 10 errors
```

---

## Usage

### Basic Error Logging

```typescript
import { errorLogger } from '@/lib/errors/logger'

// Log an error
try {
  await fetchData()
} catch (error) {
  errorLogger.error(error, {
    component: 'DataFetcher',
    action: 'fetchData',
    userId: user?.id,
  })
}

// Log a warning
errorLogger.warn(new Error('API rate limit approaching'), {
  component: 'ApiClient',
})

// Log info
errorLogger.info('User session started', {
  userId: user.id,
  timestamp: Date.now(),
})
```

### Using in React Components

```typescript
'use client'

import { useErrorLogger } from '@/lib/errors/logger'

export function MyComponent() {
  const { logError, logWarning, logInfo } = useErrorLogger()

  const handleSubmit = async () => {
    try {
      await submitForm()
      logInfo('Form submitted successfully')
    } catch (error) {
      logError(error, {
        component: 'MyComponent',
        action: 'handleSubmit',
      })
    }
  }

  return <button onClick={handleSubmit}>Submit</button>
}
```

### Using with Async Functions

```typescript
import { withErrorLogging } from '@/lib/errors/logger'

// Wrap an async function
const fetchUserData = withErrorLogging(
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  },
  {
    component: 'UserService',
    action: 'fetchUserData',
  }
)

// Use it normally - errors are automatically logged
const data = await fetchUserData('user-123')
```

---

## Configuration

### Optional API Endpoint

To enable batch error reporting to your custom backend:

1. **Set Environment Variable**:

```bash
# .env.local
NEXT_PUBLIC_ERROR_API_ENDPOINT=https://your-api.com/api/errors
```

2. **Backend API Requirements**:

```typescript
// POST /api/errors
// Expected request body:
{
  errors: [
    {
      timestamp: "2025-11-24T15:30:00.000Z",
      message: "Error message",
      stack: "Error stack trace",
      context: {
        component: "ComponentName",
        action: "actionName",
        userId: "user-id"
      },
      severity: "error" | "warning" | "info",
      userAgent: "Mozilla/5.0...",
      url: "https://your-app.com/page"
    }
  ],
  timestamp: "2025-11-24T15:30:00.000Z"
}
```

3. **Backend Response**: The API should return a 200 status on success. Errors are handled gracefully (logged to console but not thrown).

### Storage Limits

- **Memory**: Last 100 errors (in-memory, cleared on page refresh)
- **localStorage**: Last 50 errors (persistent across sessions)
- **Batch Queue**: Max 10 errors before auto-sending

### Batch Settings

```typescript
// lib/errors/logger.ts (internal configuration)
private readonly BATCH_DELAY = 5000 // 5 seconds
private readonly MAX_BATCH_SIZE = 10
private readonly MAX_STORED_ERRORS = 50
```

---

## Retrieving Stored Errors

### View Errors in Browser Console

```javascript
// Open browser console (F12) and run:
const errors = errorLogger.getStoredErrors()
console.table(errors)
```

### Export Errors

```javascript
// Get errors and download as JSON
const errors = errorLogger.getStoredErrors()
const blob = new Blob([JSON.stringify(errors, null, 2)], {
  type: 'application/json',
})
const url = URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
link.download = `errors-${Date.now()}.json`
link.click()
```

### Clear Stored Errors

```javascript
// Clear all stored errors
errorLogger.clearStoredErrors()
```

### Admin Dashboard (Future Enhancement)

Consider creating an admin page to view stored errors:

```typescript
// app/admin/errors/page.tsx
'use client'

import { errorLogger } from '@/lib/errors/logger'
import { useEffect, useState } from 'react'

export default function ErrorsDashboard() {
  const [errors, setErrors] = useState([])

  useEffect(() => {
    setErrors(errorLogger.getStoredErrors())
  }, [])

  return (
    <div>
      <h1>Error Logs ({errors.length})</h1>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Message</th>
            <th>Severity</th>
            <th>Component</th>
          </tr>
        </thead>
        <tbody>
          {errors.map((error, index) => (
            <tr key={index}>
              <td>{error.timestamp}</td>
              <td>{error.message}</td>
              <td>{error.severity}</td>
              <td>{error.context?.component}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Best Practices

### 1. **Always Provide Context**

```typescript
// ❌ Bad: No context
errorLogger.error(error)

// ✅ Good: With meaningful context
errorLogger.error(error, {
  component: 'TransactionList',
  action: 'loadTransactions',
  userId: currentUser?.id,
  transactionId: tx.id,
})
```

### 2. **Use Appropriate Severity Levels**

- **error**: Critical failures, exceptions, bugs
- **warning**: Potential issues, deprecations, rate limits
- **info**: Informational logs, user actions, metrics

### 3. **Don't Log Sensitive Data**

```typescript
// ❌ Bad: Logging sensitive data
errorLogger.error(error, {
  password: user.password, // Never log passwords
  apiKey: config.apiKey, // Never log API keys
})

// ✅ Good: Log only necessary data
errorLogger.error(error, {
  userId: user.id,
  action: 'login',
})
```

### 4. **Use with Error Boundaries**

```typescript
// components/common/ErrorBoundary.tsx
import { errorLogger } from '@/lib/errors/logger'

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorLogger.error(error, {
      component: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
    })
  }
}
```

### 5. **Monitor Production Errors**

Set up a cron job or admin dashboard to periodically review stored errors:

```typescript
// Example: Send daily error summary
async function sendDailyErrorReport() {
  const errors = errorLogger.getStoredErrors()
  const criticalErrors = errors.filter((e) => e.severity === 'error')

  if (criticalErrors.length > 0) {
    await sendEmailAlert({
      to: 'dev-team@company.com',
      subject: `${criticalErrors.length} errors detected`,
      body: JSON.stringify(criticalErrors, null, 2),
    })
  }
}
```

---

## Monitoring Strategy

### Development Environment

- Errors are logged to browser console
- Full stack traces available
- Use Chrome DevTools for debugging

### Production Environment

- Errors stored in localStorage (user's browser)
- Optional batch sending to custom API
- Critical errors still logged to console
- No external dependencies

### Custom API Integration (Recommended)

For production monitoring, consider setting up a simple backend endpoint:

```typescript
// pages/api/errors.ts (Next.js API route)
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { errors, timestamp } = await request.json()

  // Store in database
  await db.errorLogs.insertMany(
    errors.map((error) => ({
      ...error,
      receivedAt: new Date(),
      environment: process.env.NODE_ENV,
    }))
  )

  // Send critical alerts
  const criticalErrors = errors.filter((e) => e.severity === 'error')
  if (criticalErrors.length > 0) {
    await sendSlackAlert(criticalErrors)
  }

  return Response.json({ success: true })
}
```

---

## Troubleshooting

### Errors Not Stored

**Problem**: Errors are not appearing in localStorage.

**Solution**:
1. Check browser console for errors
2. Verify localStorage is not disabled or full
3. Ensure `NODE_ENV=production` is set
4. Check browser privacy settings (localStorage may be blocked in incognito mode)

### Batch Sending Fails

**Problem**: Errors are not sent to API endpoint.

**Solution**:
1. Verify `NEXT_PUBLIC_ERROR_API_ENDPOINT` is set correctly
2. Check network tab in DevTools for failed requests
3. Ensure API endpoint accepts POST requests with JSON body
4. Check CORS settings on API server

### localStorage Full

**Problem**: "QuotaExceededError" when storing errors.

**Solution**:
- The system automatically limits to last 50 errors
- Manually clear stored errors: `errorLogger.clearStoredErrors()`
- Consider implementing auto-cleanup based on age

### SSR Issues

**Problem**: "window is not defined" or "localStorage is not defined" errors.

**Solution**:
- The error logger is already SSR-safe
- Errors are caught and handled gracefully
- If issues persist, ensure you're using the logger in client components only:

```typescript
'use client' // Add this directive

import { errorLogger } from '@/lib/errors/logger'
```

---

## Performance Considerations

### Impact

- **Memory**: Minimal (last 100 errors, ~50KB)
- **Storage**: ~100KB in localStorage (last 50 errors)
- **Network**: Batched requests every 5 seconds (minimal overhead)
- **CPU**: Negligible (serialization and storage)

### Optimization Tips

1. **Avoid Logging in Loops**: Don't log errors inside tight loops
2. **Debounce Frequent Errors**: Log only the first occurrence
3. **Use Info Level Sparingly**: Reserve for truly important events

---

## Migration from Paid Services

### From Sentry

Replace:
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.captureException(error)
```

With:
```typescript
import { errorLogger } from '@/lib/errors/logger'

errorLogger.error(error, { component: 'MyComponent' })
```

### From LogRocket

Replace:
```typescript
import LogRocket from 'logrocket'

LogRocket.captureException(error)
```

With:
```typescript
import { errorLogger } from '@/lib/errors/logger'

errorLogger.error(error, { component: 'MyComponent' })
```

---

## Future Enhancements

Potential improvements for the error monitoring system:

1. **Source Maps Support**: Decode minified stack traces in production
2. **Error Grouping**: Group similar errors to reduce noise
3. **User Session Tracking**: Link errors to user sessions
4. **Performance Metrics**: Track error frequency and trends
5. **Admin Dashboard**: Web UI to view and manage errors
6. **Email Alerts**: Automatic notifications for critical errors
7. **Error Search**: Full-text search across error logs
8. **Integration with Analytics**: Correlate errors with user behavior

---

## Support

For questions or issues:

- Check [backend-api-requirements.md](./backend-api-requirements.md) for API integration details
- Review test files in `lib/errors/logger.test.ts` for usage examples
- Consult the team for custom backend endpoint setup

---

**© 2025 Stable Net Indexer Frontend**
