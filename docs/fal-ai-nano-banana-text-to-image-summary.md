# Fal.ai Nano Banana Text-to-Image Model Summary

## Overview
- **Model ID**: `fal-ai/nano-banana`
- **Endpoint**: `https://fal.run/fal-ai/nano-banana`
- **Category**: text-to-image
- **Type**: Text-to-image generation model (creates images from text prompts)

## Key Points
- This is a **TEXT-TO-IMAGE model** - generates images from text prompts
- Uses Google's Gemini for image generation
- Does NOT require input images (unlike the edit variant)
- Perfect for creating new images from scratch

## Input Parameters (Required)
- `prompt` (required): Text description of the image to generate

## Input Parameters (Optional)
- `num_images`: Number of images to generate (1-4, default: 1)
- `output_format`: "jpeg" or "png" (default: "jpeg")
- `sync_mode`: Boolean, return data URIs instead of URLs (default: false)

## Output
- `images`: Array of generated image files with URLs
- `description`: Text description from Gemini

## Usage with fal-client
```python
import fal_client

result = fal_client.subscribe(
    "fal-ai/nano-banana",
    arguments={
        "prompt": "An action shot of a black lab swimming in an inground suburban swimming pool..."
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)
```

## Usage with HTTP API
```bash
curl --request POST \
  --url https://fal.run/fal-ai/nano-banana \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "Your image description here"
   }'
```

## Important Note
**This is the correct model for text-to-image generation in the character library. The current environment variables should use:**
- `FAL_TEXT_TO_IMAGE_MODEL=fal-ai/nano-banana` (for text-to-image)
- `FAL_IMAGE_TO_IMAGE_MODEL=fal-ai/nano-banana/edit` (for image editing)
