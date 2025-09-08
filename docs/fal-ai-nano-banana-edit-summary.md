# Fal.ai Nano Banana Edit Model Summary

## Overview
- **Model ID**: `fal-ai/nano-banana/edit`
- **Endpoint**: `https://fal.run/fal-ai/nano-banana/edit`
- **Category**: image-to-image
- **Type**: Image editing model (requires input images)

## Key Points
- This is an **IMAGE EDITING model**, requires existing images as input
- Uses Google's Gemini for image editing
- Can edit multiple images at once
- Requires `image_urls` parameter with existing images

## Input Parameters (Required)
- `prompt` (required): Text description of the editing task
- `image_urls` (required): Array of URLs of input images to edit

## Input Parameters (Optional)
- `num_images`: Number of images to generate (1-4, default: 1)
- `output_format`: "jpeg" or "png" (default: "jpeg")
- `sync_mode`: Boolean, return data URIs instead of URLs (default: false)

## Output
- `images`: Array of edited image files with URLs
- `description`: Text description from Gemini

## Usage with fal-client
```python
import fal_client

result = fal_client.subscribe(
    "fal-ai/nano-banana/edit",
    arguments={
        "prompt": "make a photo of the man driving the car down the california coastline",
        "image_urls": ["https://example.com/image1.png", "https://example.com/image2.png"]
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)
```

## Important Note
**This model requires existing images as input. For text-to-image generation (creating images from scratch), we need the base nano-banana model at `fal-ai/nano-banana`.**
