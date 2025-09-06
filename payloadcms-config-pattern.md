# PayloadCMS Configuration Import Pattern

## Summary of PayloadCMS Local API Outside Next.js Documentation

Based on the official PayloadCMS documentation and best practices, here's the correct pattern for importing and using PayloadCMS configuration in API routes:

## ✅ **Correct Pattern**

### 1. **Import Configuration**
```typescript
import { getPayload } from 'payload'
import config from '@payload-config'
```

### 2. **Get Payload Instance**
```typescript
const payload = await getPayload({
  config
})
```

### 3. **Complete API Route Example**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({
      config
    })
    
    // Use payload instance for operations
    const characters = await payload.find({
      collection: 'characters',
      limit: 10
    })
    
    return NextResponse.json(characters)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
      { status: 500 }
    )
  }
}
```

## ❌ **Incorrect Patterns to Avoid**

### 1. **Direct Config Import with Relative Paths**
```typescript
// DON'T DO THIS
import configPromise from '../../../../../payload.config'
import configPromise from '../../../../../../payload.config'
```

### 2. **Using configPromise Directly**
```typescript
// DON'T DO THIS
const payload = await getPayloadClient({
  config: configPromise
})
```

## 🔧 **Key Points**

1. **Use `@payload-config` alias** - This is a special alias that PayloadCMS provides to import the configuration from anywhere in your project without relative paths.

2. **Import `getPayload` function** - This is the modern way to get a Payload instance in v3.x.

3. **Pass config directly** - The config object (not a promise) should be passed to `getPayload()`.

4. **Async/Await Pattern** - Always use async/await when calling `getPayload()` as it returns a Promise.

## 📁 **File Structure Context**

The `@payload-config` alias resolves to your `payload.config.ts` file in the project root, regardless of where your API route is located in the file structure.

```
project-root/
├── payload.config.ts          # Main config file
├── src/
│   └── app/
│       └── api/
│           └── v1/
│               └── characters/
│                   └── route.ts   # Use @payload-config here
```

## 🚀 **Benefits of This Pattern**

1. **No relative path issues** - Works from any depth in the project structure
2. **Type safety** - Full TypeScript support
3. **Performance** - Efficient config loading
4. **Maintainability** - Easy to refactor and move files
5. **Official support** - Recommended by PayloadCMS team

## 📝 **Migration Notes**

When updating existing API routes:
1. Replace relative config imports with `@payload-config`
2. Replace `getPayloadClient()` with `getPayload()`
3. Remove `configPromise` and use `config` directly
4. Ensure proper error handling around `getPayload()` calls

This pattern ensures compatibility with PayloadCMS v3.x and follows the official documentation recommendations.
