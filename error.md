# Character Library Service Error Log

This file tracks errors from the Character Library Service (https://character.ft.tc) that require attention or fixes in the external service. Errors are automatically logged by the character-library-error-logger service.

## Error Categories

### Server Errors (HTTP 5xx)
Issues with the character library service itself that need to be fixed on their end.

### Client Errors (HTTP 4xx)
Request issues that may indicate problems with our implementation or data.

### Network/Connectivity Issues
Problems reaching the character library service.

### Data Processing Errors
Issues with image generation, processing, or metadata handling.

## Character ID: 68c3293162d9ca1841358f09 Testing

### Test Session Errors
*Errors from testing the enhanced 360° generation system will be logged here*

---

## ✅ ERROR ANALYSIS COMPLETE - September 14, 2025

### 🔍 **ISSUE IDENTIFIED: Wrong Endpoint Usage**

**Status:** ❌ **EXTERNAL APP ERROR** - Not a Character Library Service issue

**Root Cause:** External app is calling the wrong endpoint for 27-shot generation.

**Details:**
- **Character Exists:** ✅ Maya Chen (68bc1741-maya-chen-1757620529368-108323-e4b5348f-098) is valid
- **Wrong Endpoint:** ❌ `/api/v1/characters/{id}/generate-360-set`
- **Correct Endpoint:** ✅ `/api/v1/characters/{id}/generate-core-set`

**Fix Required:** External app needs to update their API integration.

### 📋 **Correct API Usage:**

```bash
# ✅ CORRECT - Use this endpoint for 27-shot generation
curl -X POST "https://character.ft.tc/api/v1/characters/{id}/generate-core-set" \
  -H "Content-Type: application/json" \
  -d '{
    "qualityThreshold": 70,
    "maxRetries": 3,
    "customSeed": 12345
  }'
```

**All 6 errors (18:39-18:41) resolved by using correct endpoint.**

### 🔍 **ADDITIONAL ISSUE DISCOVERED:**

**Character ID Mismatch:**
- **External app uses:** `68bc1741-maya-chen-1757620529368-108323-e4b5348f-098` ❌
- **Actual database ID:** `68c32931957ccd9d1edcccd2` ✅

**Resolution:** External app needs to use the correct character ID from the database.

### ✅ **VERIFICATION RESULTS:**

1. **Correct endpoint works:** `/generate-core-set` accepts requests ✅
2. **Character exists:** Maya Chen is in database ✅
3. **Master reference exists:** Character has valid master reference image ✅
4. **Service operational:** Core set generation starts successfully ✅

**Final Status:** ❌ **EXTERNAL APP INTEGRATION ERROR** - Not a Character Library Service issue

---

## Error Format Template

```
### [TIMESTAMP] - [ERROR_TYPE]
**Character ID:** [character_id]
**Endpoint:** [api_endpoint]
**HTTP Status:** [status_code]
**Error Message:** [error_message]
**Request Details:** [request_body_or_params]
**Response Details:** [response_body]
**Impact:** [description_of_impact]
**Status:** [OPEN/INVESTIGATING/RESOLVED]
```

## Common Issues & Solutions

### HTTP 500 Internal Server Error
- **Cause:** Character library service experiencing internal issues
- **Solution:** Wait and retry, or contact character library service team
- **Workaround:** None - requires service-side fix

### HTTP 429 Rate Limit Exceeded
- **Cause:** Too many requests in a short time period
- **Solution:** Implement request throttling or backoff strategy
- **Workaround:** Wait before retrying requests

### HTTP 404 Character Not Found
- **Cause:** Character doesn't exist in the character library
- **Solution:** Verify character was properly created/synced to library
- **Workaround:** Create character in library first

### Image Generation Failures
- **Cause:** Various issues with AI image generation service
- **Solution:** Review prompt quality and generation parameters
- **Workaround:** Retry with modified parameters

## Contact Information

For issues that require fixes in the Character Library Service:
- **Service URL:** https://character.ft.tc
- **Documentation:** Check docs/externalServices/character-library
- **Issue Reporting:** Document issues here with full details for external team

## Monitoring

This error log is automatically populated by:
- `src/lib/services/character-library-error-logger.ts`
- Character generation API routes
- Frontend error handlers

Check this file regularly during development and testing phases.## Character Library Service Error

**Timestamp:** 2025-09-14T18:39:25.560Z
**Character ID:** 68bc1741-maya-chen-1757620529368-108323-e4b5348f-098
**Endpoint:** /api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set
**Request Payload:**
```json
{
  "imageCount": 27,
  "style": "character_turnaround",
  "qualityThreshold": 70,
  "guaranteeAllShots": true,
  "comprehensiveCoverage": true
}
```
**Response Status:** 500
**Response Body:**
```json
"{\"success\":false,\"status\":\"failed\",\"processingTime\":15,\"error\":\"Not Found\"}"
```
**Error Message:** HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":15,"error":"Not Found"}
**Stack Trace:**
```
Error: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":15,"error":"Not Found"}
    at CharacterLibraryClient.makeRequest (webpack-internal:///(rsc)/./src/lib/services/character-library-client.ts:266:39)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST$1 (webpack-internal:///(rsc)/./src/app/v1/characters/[id]/generate-360-set/route.ts:117:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@sentry+nextjs@10.5.0_@opentelemetry+context-async-hooks@2.0.1_@opentelemetry+api@1.9.0__@ope_ftcfdzawwhac32sheyvyc734ny/node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js:36:30)
    at async AppRouteRouteModule.do (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:38782)
    at async AppRouteRouteModule.handle (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:45984)
    at async responseGenerator (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:206:38)
    at async AppRouteRouteModule.handleResponse (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:1:183647)
    at async handleResponse (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:268:32)
    at async handler (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:318:13)
    at async doRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1586:34)
    at async DevServer.renderToResponseWithComponentsImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1928:13)
    at async DevServer.renderPageComponent (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2394:24)
    at async DevServer.renderToResponseImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2434:32)
    at async DevServer.pipeImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1034:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\next-server.js:393:17)
    at async DevServer.handleRequestImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:925:17)
    at async D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:398:20
    at async Span.traceAsyncFn (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:394:24)
    at async invokeRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:239:21)
    at async handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:436:24)
    at async requestHandlerImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:464:13)
    at async Server.requestListener (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\start-server.js:218:13)
```
**Additional Context:**
```json
{
  "errorType": "HTTP_ERROR",
  "isServerSideError": true,
  "source": "character-library-client",
  "method": "POST",
  "url": "https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set",
  "attempt": 1,
  "maxAttempts": 1
}
```

---

## Character Library Service Error

**Timestamp:** 2025-09-14T18:39:30.507Z
**Character ID:** 68bc1741-maya-chen-1757620529368-108323-e4b5348f-098
**Endpoint:** /api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set
**Request Payload:**
```json
{
  "imageCount": 27,
  "style": "character_turnaround",
  "qualityThreshold": 70,
  "guaranteeAllShots": true,
  "comprehensiveCoverage": true,
  "enhanced": true
}
```
**Response Status:** 500
**Response Body:**
```json
"{\"success\":false,\"status\":\"failed\",\"processingTime\":8,\"error\":\"Not Found\"}"
```
**Error Message:** HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":8,"error":"Not Found"}
**Stack Trace:**
```
Error: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":8,"error":"Not Found"}
    at CharacterLibraryClient.makeRequest (webpack-internal:///(rsc)/./src/lib/services/character-library-client.ts:266:39)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST$1 (webpack-internal:///(rsc)/./src/app/v1/characters/[id]/generate-enhanced-360-set/route.ts:119:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@sentry+nextjs@10.5.0_@opentelemetry+context-async-hooks@2.0.1_@opentelemetry+api@1.9.0__@ope_ftcfdzawwhac32sheyvyc734ny/node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js:36:30)
    at async AppRouteRouteModule.do (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:38782)
    at async AppRouteRouteModule.handle (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:45984)
    at async responseGenerator (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:206:38)
    at async AppRouteRouteModule.handleResponse (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:1:183647)
    at async handleResponse (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:268:32)
    at async handler (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:318:13)
    at async doRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1586:34)
    at async DevServer.renderToResponseWithComponentsImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1928:13)
    at async DevServer.renderPageComponent (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2394:24)
    at async DevServer.renderToResponseImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2434:32)
    at async DevServer.pipeImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1034:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\next-server.js:393:17)
    at async DevServer.handleRequestImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:925:17)
    at async D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:398:20
    at async Span.traceAsyncFn (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:394:24)
    at async invokeRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:239:21)
    at async handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:436:24)
    at async requestHandlerImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:464:13)
    at async Server.requestListener (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\start-server.js:218:13)
```
**Additional Context:**
```json
{
  "errorType": "HTTP_ERROR",
  "isServerSideError": true,
  "source": "character-library-client",
  "method": "POST",
  "url": "https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set",
  "attempt": 1,
  "maxAttempts": 1
}
```

---

## Character Library Service Error

**Timestamp:** 2025-09-14T18:40:22.926Z
**Character ID:** 68bc1741-maya-chen-1757620529368-108323-e4b5348f-098
**Endpoint:** /api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set
**Request Payload:**
```json
{
  "imageCount": 27,
  "style": "character_turnaround",
  "qualityThreshold": 70,
  "guaranteeAllShots": true,
  "comprehensiveCoverage": true
}
```
**Response Status:** 500
**Response Body:**
```json
"{\"success\":false,\"status\":\"failed\",\"processingTime\":4,\"error\":\"Not Found\"}"
```
**Error Message:** HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":4,"error":"Not Found"}
**Stack Trace:**
```
Error: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":4,"error":"Not Found"}
    at CharacterLibraryClient.makeRequest (webpack-internal:///(rsc)/./src/lib/services/character-library-client.ts:266:39)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST$1 (webpack-internal:///(rsc)/./src/app/v1/characters/[id]/generate-360-set/route.ts:117:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@sentry+nextjs@10.5.0_@opentelemetry+context-async-hooks@2.0.1_@opentelemetry+api@1.9.0__@ope_ftcfdzawwhac32sheyvyc734ny/node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js:36:30)
    at async AppRouteRouteModule.do (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:38782)
    at async AppRouteRouteModule.handle (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:45984)
    at async responseGenerator (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:206:38)
    at async AppRouteRouteModule.handleResponse (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:1:183647)
    at async handleResponse (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:268:32)
    at async handler (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:318:13)
    at async doRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1586:34)
    at async DevServer.renderToResponseWithComponentsImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1928:13)
    at async DevServer.renderPageComponent (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2394:24)
    at async DevServer.renderToResponseImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2434:32)
    at async DevServer.pipeImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1034:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\next-server.js:393:17)
    at async DevServer.handleRequestImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:925:17)
    at async D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:398:20
    at async Span.traceAsyncFn (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:394:24)
    at async invokeRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:239:21)
    at async handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:436:24)
    at async requestHandlerImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:464:13)
    at async Server.requestListener (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\start-server.js:218:13)
```
**Additional Context:**
```json
{
  "errorType": "HTTP_ERROR",
  "isServerSideError": true,
  "source": "character-library-client",
  "method": "POST",
  "url": "https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set",
  "attempt": 1,
  "maxAttempts": 1
}
```

---

## Character Library Service Error

**Timestamp:** 2025-09-14T18:40:27.673Z
**Character ID:** 68bc1741-maya-chen-1757620529368-108323-e4b5348f-098
**Endpoint:** /api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set
**Request Payload:**
```json
{
  "imageCount": 27,
  "style": "character_turnaround",
  "qualityThreshold": 70,
  "guaranteeAllShots": true,
  "comprehensiveCoverage": true,
  "enhanced": true
}
```
**Response Status:** 500
**Response Body:**
```json
"{\"success\":false,\"status\":\"failed\",\"processingTime\":6,\"error\":\"Not Found\"}"
```
**Error Message:** HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":6,"error":"Not Found"}
**Stack Trace:**
```
Error: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":6,"error":"Not Found"}
    at CharacterLibraryClient.makeRequest (webpack-internal:///(rsc)/./src/lib/services/character-library-client.ts:266:39)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST$1 (webpack-internal:///(rsc)/./src/app/v1/characters/[id]/generate-enhanced-360-set/route.ts:119:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@sentry+nextjs@10.5.0_@opentelemetry+context-async-hooks@2.0.1_@opentelemetry+api@1.9.0__@ope_ftcfdzawwhac32sheyvyc734ny/node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js:36:30)
    at async AppRouteRouteModule.do (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:38782)
    at async AppRouteRouteModule.handle (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:45984)
    at async responseGenerator (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:206:38)
    at async AppRouteRouteModule.handleResponse (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:1:183647)
    at async handleResponse (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:268:32)
    at async handler (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:318:13)
    at async doRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1586:34)
    at async DevServer.renderToResponseWithComponentsImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1928:13)
    at async DevServer.renderPageComponent (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2394:24)
    at async DevServer.renderToResponseImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2434:32)
    at async DevServer.pipeImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1034:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\next-server.js:393:17)
    at async DevServer.handleRequestImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:925:17)
    at async D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:398:20
    at async Span.traceAsyncFn (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:394:24)
    at async invokeRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:239:21)
    at async handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:436:24)
    at async requestHandlerImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:464:13)
    at async Server.requestListener (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\start-server.js:218:13)
```
**Additional Context:**
```json
{
  "errorType": "HTTP_ERROR",
  "isServerSideError": true,
  "source": "character-library-client",
  "method": "POST",
  "url": "https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set",
  "attempt": 1,
  "maxAttempts": 1
}
```

---

## Character Library Service Error

**Timestamp:** 2025-09-14T18:41:43.420Z
**Character ID:** 68bc1741-maya-chen-1757620529368-108323-e4b5348f-098
**Endpoint:** /api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set
**Request Payload:**
```json
{
  "imageCount": 27,
  "style": "character_turnaround",
  "qualityThreshold": 70,
  "guaranteeAllShots": true,
  "comprehensiveCoverage": true
}
```
**Response Status:** 500
**Response Body:**
```json
"{\"success\":false,\"status\":\"failed\",\"processingTime\":7,\"error\":\"Not Found\"}"
```
**Error Message:** HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":7,"error":"Not Found"}
**Stack Trace:**
```
Error: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":7,"error":"Not Found"}
    at CharacterLibraryClient.makeRequest (webpack-internal:///(rsc)/./src/lib/services/character-library-client.ts:266:39)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST$1 (webpack-internal:///(rsc)/./src/app/v1/characters/[id]/generate-360-set/route.ts:117:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@sentry+nextjs@10.5.0_@opentelemetry+context-async-hooks@2.0.1_@opentelemetry+api@1.9.0__@ope_ftcfdzawwhac32sheyvyc734ny/node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js:36:30)
    at async AppRouteRouteModule.do (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:38782)
    at async AppRouteRouteModule.handle (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:45984)
    at async responseGenerator (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:206:38)
    at async AppRouteRouteModule.handleResponse (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:1:183647)
    at async handleResponse (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:268:32)
    at async handler (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:318:13)
    at async doRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1586:34)
    at async DevServer.renderToResponseWithComponentsImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1928:13)
    at async DevServer.renderPageComponent (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2394:24)
    at async DevServer.renderToResponseImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2434:32)
    at async DevServer.pipeImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1034:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\next-server.js:393:17)
    at async DevServer.handleRequestImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:925:17)
    at async D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:398:20
    at async Span.traceAsyncFn (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:394:24)
    at async invokeRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:239:21)
    at async handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:436:24)
    at async requestHandlerImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:464:13)
    at async Server.requestListener (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\start-server.js:218:13)
```
**Additional Context:**
```json
{
  "errorType": "HTTP_ERROR",
  "isServerSideError": true,
  "source": "character-library-client",
  "method": "POST",
  "url": "https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set",
  "attempt": 1,
  "maxAttempts": 1
}
```

---

## Character Library Service Error

**Timestamp:** 2025-09-14T18:41:48.671Z
**Character ID:** 68bc1741-maya-chen-1757620529368-108323-e4b5348f-098
**Endpoint:** /api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set
**Request Payload:**
```json
{
  "imageCount": 27,
  "style": "character_turnaround",
  "qualityThreshold": 70,
  "guaranteeAllShots": true,
  "comprehensiveCoverage": true,
  "enhanced": true
}
```
**Response Status:** 500
**Response Body:**
```json
"{\"success\":false,\"status\":\"failed\",\"processingTime\":6,\"error\":\"Not Found\"}"
```
**Error Message:** HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":6,"error":"Not Found"}
**Stack Trace:**
```
Error: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":6,"error":"Not Found"}
    at CharacterLibraryClient.makeRequest (webpack-internal:///(rsc)/./src/lib/services/character-library-client.ts:266:39)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST$1 (webpack-internal:///(rsc)/./src/app/v1/characters/[id]/generate-enhanced-360-set/route.ts:119:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@sentry+nextjs@10.5.0_@opentelemetry+context-async-hooks@2.0.1_@opentelemetry+api@1.9.0__@ope_ftcfdzawwhac32sheyvyc734ny/node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js:36:30)
    at async AppRouteRouteModule.do (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:38782)
    at async AppRouteRouteModule.handle (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:45984)
    at async responseGenerator (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:206:38)
    at async AppRouteRouteModule.handleResponse (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:1:183647)
    at async handleResponse (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:268:32)
    at async handler (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:318:13)
    at async doRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1586:34)
    at async DevServer.renderToResponseWithComponentsImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1928:13)
    at async DevServer.renderPageComponent (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2394:24)
    at async DevServer.renderToResponseImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2434:32)
    at async DevServer.pipeImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1034:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\next-server.js:393:17)
    at async DevServer.handleRequestImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:925:17)
    at async D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:398:20
    at async Span.traceAsyncFn (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:394:24)
    at async invokeRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:239:21)
    at async handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:436:24)
    at async requestHandlerImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:464:13)
    at async Server.requestListener (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\start-server.js:218:13)
```
**Additional Context:**
```json
{
  "errorType": "HTTP_ERROR",
  "isServerSideError": true,
  "source": "character-library-client",
  "method": "POST",
  "url": "https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set",
  "attempt": 1,
  "maxAttempts": 1
}
```

---

## Character Library Service Error

**Timestamp:** 2025-09-14T18:43:05.358Z
**Character ID:** 68bc1741-maya-chen-1757620529368-108323-e4b5348f-098
**Endpoint:** /api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set
**Request Payload:**
```json
{
  "imageCount": 27,
  "style": "character_turnaround",
  "qualityThreshold": 70,
  "guaranteeAllShots": true,
  "comprehensiveCoverage": true
}
```
**Response Status:** 500
**Response Body:**
```json
"{\"success\":false,\"status\":\"failed\",\"processingTime\":7,\"error\":\"Not Found\"}"
```
**Error Message:** HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":7,"error":"Not Found"}
**Stack Trace:**
```
Error: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":7,"error":"Not Found"}
    at CharacterLibraryClient.makeRequest (webpack-internal:///(rsc)/./src/lib/services/character-library-client.ts:266:39)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST$1 (webpack-internal:///(rsc)/./src/app/v1/characters/[id]/generate-360-set/route.ts:117:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@sentry+nextjs@10.5.0_@opentelemetry+context-async-hooks@2.0.1_@opentelemetry+api@1.9.0__@ope_ftcfdzawwhac32sheyvyc734ny/node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js:36:30)
    at async AppRouteRouteModule.do (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:38782)
    at async AppRouteRouteModule.handle (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:45984)
    at async responseGenerator (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:206:38)
    at async AppRouteRouteModule.handleResponse (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:1:183647)
    at async handleResponse (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:268:32)
    at async handler (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:318:13)
    at async doRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1586:34)
    at async DevServer.renderToResponseWithComponentsImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1928:13)
    at async DevServer.renderPageComponent (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2394:24)
    at async DevServer.renderToResponseImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2434:32)
    at async DevServer.pipeImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1034:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\next-server.js:393:17)
    at async DevServer.handleRequestImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:925:17)
    at async D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:398:20
    at async Span.traceAsyncFn (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:394:24)
    at async invokeRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:239:21)
    at async handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:436:24)
    at async requestHandlerImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:464:13)
    at async Server.requestListener (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\start-server.js:218:13)
```
**Additional Context:**
```json
{
  "errorType": "HTTP_ERROR",
  "isServerSideError": true,
  "source": "character-library-client",
  "method": "POST",
  "url": "https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set",
  "attempt": 1,
  "maxAttempts": 1
}
```

---

## Character Library Service Error

**Timestamp:** 2025-09-14T18:43:10.292Z
**Character ID:** 68bc1741-maya-chen-1757620529368-108323-e4b5348f-098
**Endpoint:** /api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set
**Request Payload:**
```json
{
  "imageCount": 27,
  "style": "character_turnaround",
  "qualityThreshold": 70,
  "guaranteeAllShots": true,
  "comprehensiveCoverage": true,
  "enhanced": true
}
```
**Response Status:** 500
**Response Body:**
```json
"{\"success\":false,\"status\":\"failed\",\"processingTime\":4,\"error\":\"Not Found\"}"
```
**Error Message:** HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":4,"error":"Not Found"}
**Stack Trace:**
```
Error: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":4,"error":"Not Found"}
    at CharacterLibraryClient.makeRequest (webpack-internal:///(rsc)/./src/lib/services/character-library-client.ts:266:39)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST$1 (webpack-internal:///(rsc)/./src/app/v1/characters/[id]/generate-enhanced-360-set/route.ts:119:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@sentry+nextjs@10.5.0_@opentelemetry+context-async-hooks@2.0.1_@opentelemetry+api@1.9.0__@ope_ftcfdzawwhac32sheyvyc734ny/node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js:36:30)
    at async AppRouteRouteModule.do (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:38782)
    at async AppRouteRouteModule.handle (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:45984)
    at async responseGenerator (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:206:38)
    at async AppRouteRouteModule.handleResponse (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:1:183647)
    at async handleResponse (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:268:32)
    at async handler (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:318:13)
    at async doRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1586:34)
    at async DevServer.renderToResponseWithComponentsImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1928:13)
    at async DevServer.renderPageComponent (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2394:24)
    at async DevServer.renderToResponseImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2434:32)
    at async DevServer.pipeImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1034:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\next-server.js:393:17)
    at async DevServer.handleRequestImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:925:17)
    at async D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:398:20
    at async Span.traceAsyncFn (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:394:24)
    at async invokeRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:239:21)
    at async handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:436:24)
    at async requestHandlerImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:464:13)
    at async Server.requestListener (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\start-server.js:218:13)
```
**Additional Context:**
```json
{
  "errorType": "HTTP_ERROR",
  "isServerSideError": true,
  "source": "character-library-client",
  "method": "POST",
  "url": "https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set",
  "attempt": 1,
  "maxAttempts": 1
}
```

---

## Character Library Service Error

**Timestamp:** 2025-09-14T18:43:21.809Z
**Character ID:** 68bc1741-maya-chen-1757620529368-108323-e4b5348f-098
**Endpoint:** /api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set
**Request Payload:**
```json
{
  "imageCount": 27,
  "style": "character_turnaround",
  "qualityThreshold": 70,
  "guaranteeAllShots": true,
  "comprehensiveCoverage": true,
  "enhanced": true
}
```
**Response Status:** 500
**Response Body:**
```json
"{\"success\":false,\"status\":\"failed\",\"processingTime\":5,\"error\":\"Not Found\"}"
```
**Error Message:** HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":5,"error":"Not Found"}
**Stack Trace:**
```
Error: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":5,"error":"Not Found"}
    at CharacterLibraryClient.makeRequest (webpack-internal:///(rsc)/./src/lib/services/character-library-client.ts:266:39)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST$1 (webpack-internal:///(rsc)/./src/app/v1/characters/[id]/generate-enhanced-360-set/route.ts:119:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@sentry+nextjs@10.5.0_@opentelemetry+context-async-hooks@2.0.1_@opentelemetry+api@1.9.0__@ope_ftcfdzawwhac32sheyvyc734ny/node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js:36:30)
    at async AppRouteRouteModule.do (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:38782)
    at async AppRouteRouteModule.handle (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:45984)
    at async responseGenerator (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:206:38)
    at async AppRouteRouteModule.handleResponse (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:1:183647)
    at async handleResponse (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:268:32)
    at async handler (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:318:13)
    at async doRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1586:34)
    at async DevServer.renderToResponseWithComponentsImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1928:13)
    at async DevServer.renderPageComponent (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2394:24)
    at async DevServer.renderToResponseImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2434:32)
    at async DevServer.pipeImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1034:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\next-server.js:393:17)
    at async DevServer.handleRequestImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:925:17)
    at async D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:398:20
    at async Span.traceAsyncFn (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:394:24)
    at async invokeRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:239:21)
    at async handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:436:24)
    at async requestHandlerImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:464:13)
    at async Server.requestListener (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\start-server.js:218:13)
```
**Additional Context:**
```json
{
  "errorType": "HTTP_ERROR",
  "isServerSideError": true,
  "source": "character-library-client",
  "method": "POST",
  "url": "https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set",
  "attempt": 1,
  "maxAttempts": 1
}
```

---

## Character Library Service Error

**Timestamp:** 2025-09-14T18:43:43.629Z
**Character ID:** 68bc1741-maya-chen-1757620529368-108323-e4b5348f-098
**Endpoint:** /api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set
**Request Payload:**
```json
{
  "imageCount": 27,
  "style": "character_turnaround",
  "qualityThreshold": 70,
  "guaranteeAllShots": true,
  "comprehensiveCoverage": true,
  "enhanced": true
}
```
**Response Status:** 500
**Response Body:**
```json
"{\"success\":false,\"status\":\"failed\",\"processingTime\":6,\"error\":\"Not Found\"}"
```
**Error Message:** HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":6,"error":"Not Found"}
**Stack Trace:**
```
Error: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":6,"error":"Not Found"}
    at CharacterLibraryClient.makeRequest (webpack-internal:///(rsc)/./src/lib/services/character-library-client.ts:266:39)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST$1 (webpack-internal:///(rsc)/./src/app/v1/characters/[id]/generate-enhanced-360-set/route.ts:119:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@sentry+nextjs@10.5.0_@opentelemetry+context-async-hooks@2.0.1_@opentelemetry+api@1.9.0__@ope_ftcfdzawwhac32sheyvyc734ny/node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js:36:30)
    at async AppRouteRouteModule.do (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:38782)
    at async AppRouteRouteModule.handle (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:45984)
    at async responseGenerator (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:206:38)
    at async AppRouteRouteModule.handleResponse (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:1:183647)
    at async handleResponse (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:268:32)
    at async handler (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:318:13)
    at async doRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1586:34)
    at async DevServer.renderToResponseWithComponentsImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1928:13)
    at async DevServer.renderPageComponent (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2394:24)
    at async DevServer.renderToResponseImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2434:32)
    at async DevServer.pipeImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1034:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\next-server.js:393:17)
    at async DevServer.handleRequestImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:925:17)
    at async D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:398:20
    at async Span.traceAsyncFn (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:394:24)
    at async invokeRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:239:21)
    at async handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:436:24)
    at async requestHandlerImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:464:13)
    at async Server.requestListener (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\start-server.js:218:13)
```
**Additional Context:**
```json
{
  "errorType": "HTTP_ERROR",
  "isServerSideError": true,
  "source": "character-library-client",
  "method": "POST",
  "url": "https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set",
  "attempt": 1,
  "maxAttempts": 1
}
```

---

## Character Library Service Error

**Timestamp:** 2025-09-14T18:45:13.989Z
**Character ID:** 68bc1741-maya-chen-1757620529368-108323-e4b5348f-098
**Endpoint:** /api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set
**Request Payload:**
```json
{
  "imageCount": 27,
  "style": "character_turnaround",
  "qualityThreshold": 70,
  "guaranteeAllShots": true,
  "comprehensiveCoverage": true
}
```
**Response Status:** 500
**Response Body:**
```json
"{\"success\":false,\"status\":\"failed\",\"processingTime\":8,\"error\":\"Not Found\"}"
```
**Error Message:** HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":8,"error":"Not Found"}
**Stack Trace:**
```
Error: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":8,"error":"Not Found"}
    at CharacterLibraryClient.makeRequest (webpack-internal:///(rsc)/./src/lib/services/character-library-client.ts:266:39)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST$1 (webpack-internal:///(rsc)/./src/app/v1/characters/[id]/generate-360-set/route.ts:117:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@sentry+nextjs@10.5.0_@opentelemetry+context-async-hooks@2.0.1_@opentelemetry+api@1.9.0__@ope_ftcfdzawwhac32sheyvyc734ny/node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js:36:30)
    at async AppRouteRouteModule.do (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:38782)
    at async AppRouteRouteModule.handle (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:45984)
    at async responseGenerator (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:206:38)
    at async AppRouteRouteModule.handleResponse (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:1:183647)
    at async handleResponse (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:268:32)
    at async handler (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:318:13)
    at async doRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1586:34)
    at async DevServer.renderToResponseWithComponentsImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1928:13)
    at async DevServer.renderPageComponent (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2394:24)
    at async DevServer.renderToResponseImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2434:32)
    at async DevServer.pipeImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1034:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\next-server.js:393:17)
    at async DevServer.handleRequestImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:925:17)
    at async D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:398:20
    at async Span.traceAsyncFn (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:394:24)
    at async invokeRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:239:21)
    at async handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:436:24)
    at async requestHandlerImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:464:13)
    at async Server.requestListener (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\start-server.js:218:13)
```
**Additional Context:**
```json
{
  "errorType": "HTTP_ERROR",
  "isServerSideError": true,
  "source": "character-library-client",
  "method": "POST",
  "url": "https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set",
  "attempt": 1,
  "maxAttempts": 1
}
```

---

## Character Library Service Error

**Timestamp:** 2025-09-14T18:45:19.174Z
**Character ID:** 68bc1741-maya-chen-1757620529368-108323-e4b5348f-098
**Endpoint:** /api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set
**Request Payload:**
```json
{
  "imageCount": 27,
  "style": "character_turnaround",
  "qualityThreshold": 70,
  "guaranteeAllShots": true,
  "comprehensiveCoverage": true,
  "enhanced": true
}
```
**Response Status:** 500
**Response Body:**
```json
"{\"success\":false,\"status\":\"failed\",\"processingTime\":5,\"error\":\"Not Found\"}"
```
**Error Message:** HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":5,"error":"Not Found"}
**Stack Trace:**
```
Error: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":5,"error":"Not Found"}
    at CharacterLibraryClient.makeRequest (webpack-internal:///(rsc)/./src/lib/services/character-library-client.ts:266:39)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST$1 (webpack-internal:///(rsc)/./src/app/v1/characters/[id]/generate-enhanced-360-set/route.ts:119:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@sentry+nextjs@10.5.0_@opentelemetry+context-async-hooks@2.0.1_@opentelemetry+api@1.9.0__@ope_ftcfdzawwhac32sheyvyc734ny/node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js:36:30)
    at async AppRouteRouteModule.do (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:38782)
    at async AppRouteRouteModule.handle (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:45984)
    at async responseGenerator (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:206:38)
    at async AppRouteRouteModule.handleResponse (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:1:183647)
    at async handleResponse (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:268:32)
    at async handler (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-enhanced-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:318:13)
    at async doRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1586:34)
    at async DevServer.renderToResponseWithComponentsImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1928:13)
    at async DevServer.renderPageComponent (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2394:24)
    at async DevServer.renderToResponseImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2434:32)
    at async DevServer.pipeImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1034:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\next-server.js:393:17)
    at async DevServer.handleRequestImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:925:17)
    at async D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:398:20
    at async Span.traceAsyncFn (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:394:24)
    at async invokeRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:239:21)
    at async handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:436:24)
    at async requestHandlerImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:464:13)
    at async Server.requestListener (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\start-server.js:218:13)
```
**Additional Context:**
```json
{
  "errorType": "HTTP_ERROR",
  "isServerSideError": true,
  "source": "character-library-client",
  "method": "POST",
  "url": "https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set",
  "attempt": 1,
  "maxAttempts": 1
}
```

---

## Character Library Service Error

**Timestamp:** 2025-09-14T18:52:04.670Z
**Character ID:** 68bc1741-maya-chen-1757620529368-108323-e4b5348f-098
**Endpoint:** /api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set
**Request Payload:**
```json
{
  "imageCount": 27,
  "style": "character_turnaround",
  "qualityThreshold": 70,
  "guaranteeAllShots": true,
  "comprehensiveCoverage": true
}
```
**Response Status:** 500
**Response Body:**
```json
"{\"success\":false,\"status\":\"failed\",\"processingTime\":7,\"error\":\"Not Found\"}"
```
**Error Message:** HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":7,"error":"Not Found"}
**Stack Trace:**
```
Error: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":7,"error":"Not Found"}
    at CharacterLibraryClient.makeRequest (webpack-internal:///(rsc)/./src/lib/services/character-library-client.ts:266:39)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async POST$1 (webpack-internal:///(rsc)/./src/app/v1/characters/[id]/generate-360-set/route.ts:117:24)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@sentry+nextjs@10.5.0_@opentelemetry+context-async-hooks@2.0.1_@opentelemetry+api@1.9.0__@ope_ftcfdzawwhac32sheyvyc734ny/node_modules/@sentry/nextjs/build/cjs/common/wrapRouteHandlerWithSentry.js:36:30)
    at async AppRouteRouteModule.do (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:38782)
    at async AppRouteRouteModule.handle (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:5:45984)
    at async responseGenerator (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:206:38)
    at async AppRouteRouteModule.handleResponse (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:1:183647)
    at async handleResponse (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:268:32)
    at async handler (webpack-internal:///(rsc)/./node_modules/.pnpm/next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma/node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&page=%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute&appPaths=&pagePath=private-next-app-dir%2Fv1%2Fcharacters%2F%5Bid%5D%2Fgenerate-360-set%2Froute.ts&appDir=D%3A%5CProjects%5Cnovel-movie%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5Cnovel-movie&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D&isGlobalNotFoundEnabled=!:318:13)
    at async doRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1586:34)
    at async DevServer.renderToResponseWithComponentsImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1928:13)
    at async DevServer.renderPageComponent (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2394:24)
    at async DevServer.renderToResponseImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:2434:32)
    at async DevServer.pipeImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:1034:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\next-server.js:393:17)
    at async DevServer.handleRequestImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\base-server.js:925:17)
    at async D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:398:20
    at async Span.traceAsyncFn (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\dev\next-dev-server.js:394:24)
    at async invokeRender (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:239:21)
    at async handleRequest (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:436:24)
    at async requestHandlerImpl (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\router-server.js:464:13)
    at async Server.requestListener (D:\Projects\novel-movie\node_modules\.pnpm\next@15.4.4_@babel+core@7.28.3_@opentelemetry+api@1.9.0_@playwright+test@1.54.1_react-dom@19._segbxpq2f7nswfyukaftt246ma\node_modules\next\dist\server\lib\start-server.js:218:13)
```
**Additional Context:**
```json
{
  "errorType": "HTTP_ERROR",
  "isServerSideError": true,
  "source": "character-library-client",
  "method": "POST",
  "url": "https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set",
  "attempt": 1,
  "maxAttempts": 1
}
```

---
Character Library API attempt 1 failed: {
  url: 'https://character.ft.tc/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set',
  method: 'POST',
  endpoint: '/api/v1/characters/68bc1741-maya-chen-1757620529368-108323-e4b5348f-098/generate-360-set',
  error: 'HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":7,"error":"Not Found"}'
}
Generate 360 Set: Character Library API call failed: {
  error: 'Character Library API failed after 1 attempts: HTTP 500: Internal Server Error - {"success":false,"status":"failed","processingTime":7,"error":"Not Found"}',
  characterId: '68c3293162d9ca1841358f09',
  libraryCharacterId: '68bc1741-maya-chen-1757620529368-108323-e4b5348f-098'
}
```
