# Character Initial Image Generation API

This document describes the API endpoints for generating initial character images that can be used as master reference images.

## Overview

The Character Library provides two endpoints for generating initial character images:

1. **Standalone Generation** (`POST /api/v1/characters/generate-initial-image`) - Generate an image without requiring an existing character
2. **Character-Specific Generation** (`POST /api/v1/characters/[id]/generate-initial-image`) - Generate an initial image for an existing character

Both endpoints create high-quality reference images optimized for character consistency validation and future image generation.

## Features

- **AI-Powered Generation**: Uses Fal.ai for high-quality image generation
- **Prompt Enhancement**: Automatically optimizes prompts for reference image quality
- **Cloudflare R2 Storage**: Images are uploaded to Cloudflare R2 for fast, global access
- **DINOv3 Processing**: Automatic feature extraction and quality analysis
- **Public URLs**: Returns publicly accessible image URLs
- **Character Integration**: Automatically sets generated images as master reference images

## Endpoints

### 1. Standalone Initial Image Generation

Generate an initial character image without requiring an existing character.

**Endpoint**: `POST /api/v1/characters/generate-initial-image`

**Request Body**:
```json
{
  "prompt": "A brave knight in silver armor with black hair and blue eyes",
  "style": "character_turnaround",
  "width": 768,
  "height": 1024,
  "alt": "Custom alt text for the image"
}
```

**Parameters**:
- `prompt` (required): Text description of the character to generate
- `style` (optional): Generation style - `character_turnaround`, `character_production`, or `custom` (default: `character_turnaround`)
- `width` (optional): Image width in pixels (default: 768)
- `height` (optional): Image height in pixels (default: 1024)
- `alt` (optional): Alt text for the image (auto-generated if not provided)

**Response**:
```json
{
  "success": true,
  "message": "Initial character image generated successfully",
  "data": {
    "imageId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "dinoAssetId": "images/standalone_initial_1703123456789.jpg",
    "publicUrl": "https://media.rumbletv.com/images/standalone_initial_1703123456789.jpg",
    "qualityScore": 85.5,
    "validationNotes": "Image passed all validation checks.",
    "filename": "standalone_initial_1703123456789.jpg"
  }
}
```

### 2. Character-Specific Initial Image Generation

Generate an initial image for an existing character and set it as the master reference image.

**Endpoint**: `POST /api/v1/characters/[id]/generate-initial-image`

**Request Body**:
```json
{
  "prompt": "A brave knight in silver armor with black hair and blue eyes",
  "style": "character_turnaround",
  "width": 768,
  "height": 1024
}
```

**Parameters**:
- `prompt` (required): Text description of the character to generate
- `style` (optional): Generation style (default: `character_turnaround`)
- `width` (optional): Image width in pixels (default: 768)
- `height` (optional): Image height in pixels (default: 1024)

**Response**:
```json
{
  "success": true,
  "message": "Initial character image generated successfully",
  "data": {
    "characterId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "characterName": "Sir Galahad",
    "imageId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "dinoAssetId": "images/char123_initial_1703123456789.jpg",
    "publicUrl": "https://media.rumbletv.com/images/char123_initial_1703123456789.jpg",
    "qualityScore": 87.2,
    "validationNotes": "Image passed all validation checks."
  }
}
```

## Prompt Enhancement

Both endpoints automatically enhance user prompts to optimize them for reference image generation. The enhancement adds:

- Front-facing orientation
- Direct camera gaze
- Neutral expression
- Clear lighting
- Full body visibility
- Standing pose
- Plain background
- High quality and detail specifications
- Character reference sheet styling

**Example**:
- **Input**: `"A magical elf"`
- **Enhanced**: `"A magical elf, front facing, looking directly at camera, neutral expression, clear lighting, full body visible, standing pose, plain background, high quality, detailed, character reference sheet style"`

If your prompt already contains reference-specific terms, only quality enhancers are added.

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Prompt is required"
}
```

```json
{
  "success": false,
  "error": "Character already has a master reference image. Use the generate-image endpoint for additional images."
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Character not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Image generation failed",
  "details": "Fal.ai API error: 503 - Service temporarily unavailable"
}
```

## Usage Examples

### JavaScript/TypeScript

```typescript
// Standalone image generation
const response = await fetch('/api/characters/generate-initial-image', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'A fierce dragon warrior with emerald scales and golden eyes',
    style: 'character_turnaround',
  }),
});

const result = await response.json();
if (result.success) {
  console.log('Image generated:', result.data.publicUrl);
  console.log('Image ID:', result.data.imageId);
}
```

```typescript
// Character-specific image generation
const characterId = 'your-character-id';
const response = await fetch(`/api/characters/${characterId}/generate-initial-image`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'A wise wizard with a long white beard and blue robes',
  }),
});

const result = await response.json();
if (result.success) {
  console.log('Master reference image set for character:', result.data.characterName);
  console.log('Public URL:', result.data.publicUrl);
}
```

### cURL

```bash
# Standalone generation
curl -X POST http://localhost:3000/api/v1/characters/generate-initial-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cyberpunk hacker with neon blue hair and augmented reality glasses",
    "style": "character_turnaround"
  }'

# Character-specific generation
curl -X POST http://localhost:3000/api/v1/characters/64f8a1b2c3d4e5f6a7b8c9d0/generate-initial-image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A steampunk inventor with brass goggles and mechanical arm"
  }'
```

## Integration with Character Creation

The standalone endpoint is perfect for creating characters with initial images:

```typescript
// 1. Generate initial image
const imageResponse = await fetch('/api/characters/generate-initial-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'A noble paladin with golden armor and a holy symbol',
  }),
});

const imageResult = await imageResponse.json();

// 2. Create character with the generated image as master reference
const characterResponse = await fetch('/api/characters', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Sir Lightbringer',
    characterId: 'sir-lightbringer',
    description: 'A noble paladin dedicated to justice',
    masterReferenceImage: imageResult.data.imageId,
    masterReferenceProcessed: true,
    // ... other character data
  }),
});
```

## Technical Details

- **Image Format**: JPEG
- **Default Dimensions**: 768x1024 (portrait orientation for character sheets)
- **Quality**: High quality with 35 inference steps
- **Processing Time**: Typically 10-30 seconds depending on complexity
- **Storage**: Images are stored in Cloudflare R2 with global CDN distribution
- **Feature Extraction**: Automatic DINOv3 processing for consistency validation
- **Timeout**: 30 seconds for DINOv3 processing completion

## Best Practices

1. **Descriptive Prompts**: Provide detailed descriptions including physical features, clothing, and pose
2. **Reference Style**: Use `character_turnaround` style for master reference images
3. **Consistent Terminology**: Use consistent character descriptions across your application
4. **Error Handling**: Always check the `success` field and handle errors appropriately
5. **Image Management**: Store the returned `imageId` and `dinoAssetId` for future reference
6. **Public URLs**: Use the returned `publicUrl` for displaying images in your application
