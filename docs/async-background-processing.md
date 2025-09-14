# Async Background Processing System

## 🚀 Overview

The Character Library now supports async background processing for long-running image generation tasks. This prevents timeouts and provides real-time progress tracking for external applications.

## ✨ Key Features

- **Non-Blocking Operations**: API returns immediately with job ID
- **Real-Time Progress**: Track current image being generated
- **Robust Error Handling**: Partial success support with detailed failure tracking
- **Job Management**: Start, monitor, cancel, and list background jobs
- **External App Ready**: Perfect for integration with external applications

## 📋 Supported Operations

### 360° Image Generation (Async)
- **Endpoint**: `POST /api/v1/characters/{id}/generate-360-set`
- **Processing Time**: 15-30 minutes for 27 professional shots
- **Returns**: Job ID and polling URL immediately

## 🔄 Workflow

### 1. Start Background Job
```bash
curl -X POST "https://character.ft.tc/api/v1/characters/{id}/generate-360-set" \
  -H "Content-Type: application/json" \
  -d '{
    "style": "character_production",
    "qualityThreshold": 80,
    "imageCount": 27,
    "maxRetries": 3
  }'
```

**Response (Immediate - HTTP 202):**
```json
{
  "success": true,
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "accepted",
  "message": "360° image generation job started. Generating 27 images.",
  "estimatedCompletionTime": "2025-09-14T19:15:00.000Z",
  "pollUrl": "/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000/status"
}
```

### 2. Monitor Progress
```bash
curl "https://character.ft.tc/api/v1/jobs/{jobId}/status"
```

**Progress Response:**
```json
{
  "success": true,
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "progress": {
    "current": 15,
    "total": 27,
    "percentage": 56,
    "currentTask": "Generating front_85mm shot"
  },
  "message": "Job is processing. Generating front_85mm shot",
  "startedAt": "2025-09-14T18:45:00.000Z",
  "estimatedCompletionAt": "2025-09-14T19:12:00.000Z"
}
```

### 3. Retrieve Results
**Completed Response:**
```json
{
  "success": true,
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "progress": {
    "current": 27,
    "total": 27,
    "percentage": 100,
    "currentTask": "Completed"
  },
  "results": {
    "generatedImages": [
      {
        "url": "https://media.rumbletv.com/media/abc123",
        "angle": "front_50mm",
        "quality": 92,
        "dinoAssetId": "dino-abc123",
        "mediaId": "abc123"
      }
    ],
    "failedImages": [],
    "totalAttempts": 27,
    "processingTime": 1680000
  },
  "message": "Job completed successfully. Generated 27 images.",
  "completedAt": "2025-09-14T19:13:00.000Z"
}
```

## 🛠️ Job Management API

### Check Job Status
```bash
GET /api/v1/jobs/{jobId}/status
```

### Cancel Running Job
```bash
DELETE /api/v1/jobs/{jobId}/status
```

### List Jobs
```bash
GET /api/v1/jobs?characterId={id}&status=processing&page=1&limit=10
```

**Query Parameters:**
- `characterId`: Filter by character
- `status`: Filter by job status (pending, processing, completed, failed, cancelled)
- `jobType`: Filter by job type (360-set, core-set, single-image)
- `page`: Page number for pagination
- `limit`: Results per page (max 100)

## 📊 Job Status Types

| Status | Description |
|--------|-------------|
| `pending` | Job queued, waiting to start |
| `processing` | Job actively running |
| `completed` | Job finished successfully |
| `failed` | Job failed with error |
| `cancelled` | Job was cancelled by user |

## ⚡ Integration Guidelines

### Polling Recommendations
- **Frequency**: Poll every 10-30 seconds
- **Timeout**: Set reasonable timeout (30-45 minutes)
- **Error Handling**: Handle network errors gracefully
- **Progress Display**: Show current task and percentage

### Example Integration (JavaScript)
```javascript
async function generate360Set(characterId, options) {
  // Start job
  const startResponse = await fetch(`/api/v1/characters/${characterId}/generate-360-set`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });
  
  const { jobId } = await startResponse.json();
  
  // Poll for completion
  return new Promise((resolve, reject) => {
    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/v1/jobs/${jobId}/status`);
        const status = await statusResponse.json();
        
        // Update UI with progress
        updateProgress(status.progress);
        
        if (status.status === 'completed') {
          clearInterval(pollInterval);
          resolve(status.results);
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          reject(new Error(status.error));
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 15000); // Poll every 15 seconds
  });
}
```

## 🔧 Technical Details

### Database Schema
- **Collection**: `image-generation-jobs`
- **Progress Tracking**: Real-time updates during processing
- **Result Storage**: Complete metadata and URLs
- **Error Logging**: Detailed failure information

### Background Service
- **Singleton Pattern**: Single service instance manages all jobs
- **Memory Management**: Active job tracking with cleanup
- **Progress Callbacks**: Real-time database updates
- **Error Recovery**: Robust error handling and retry logic

### Performance Characteristics
- **Concurrent Jobs**: Supports multiple simultaneous jobs
- **Memory Usage**: Minimal memory footprint
- **Database Load**: Efficient progress updates
- **Scalability**: Ready for horizontal scaling

## 🚨 Error Handling

### Common Error Scenarios
1. **Character Not Found**: Invalid character ID
2. **Missing Master Reference**: Character needs reference image
3. **Service Unavailable**: Background service not running
4. **Generation Failures**: Individual image generation errors

### Partial Success Support
- Jobs can complete with some failed images
- Detailed failure tracking per image
- Retry recommendations provided
- Quality thresholds respected

## 🔄 Migration from Sync API

### Before (Sync)
```bash
POST /api/v1/characters/{id}/generate-core-set
# Blocks for 15-30 minutes, prone to timeouts
```

### After (Async)
```bash
POST /api/v1/characters/{id}/generate-360-set
# Returns immediately with job ID
GET /api/v1/jobs/{jobId}/status
# Poll for progress and results
```

### Benefits
- ✅ No more timeouts
- ✅ Real-time progress visibility
- ✅ Better user experience
- ✅ External app integration ready
- ✅ Robust error handling
- ✅ Partial success support

## 📈 Monitoring & Analytics

### Job Metrics
- Processing time per job
- Success/failure rates
- Average images per job
- Quality score distributions

### System Health
- Active job count
- Queue depth
- Processing capacity
- Error rates

This async processing system provides a robust, scalable solution for long-running image generation tasks while maintaining excellent user experience and system reliability.
