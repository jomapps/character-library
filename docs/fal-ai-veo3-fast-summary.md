# Fal.ai Veo 3 Fast Model Summary

## Overview
- **Model ID**: `fal-ai/veo3/fast`
- **Endpoint**: `https://fal.run/fal-ai/veo3/fast`
- **Category**: text-to-video
- **Type**: Video generation model (NOT for images)

## Key Points
- This is a **VIDEO generation model**, not an image generation model
- Generates videos from text prompts
- Faster and more cost-effective version of Google's Veo 3
- Default duration: 8 seconds
- Default aspect ratio: 16:9
- Default resolution: 720p

## Input Parameters
- `prompt` (required): Text description of the video
- `aspect_ratio`: "16:9", "9:16", "1:1" (default: "16:9")
- `duration`: "8s" (only option currently)
- `resolution`: "720p", "1080p" (default: "720p")
- `negative_prompt`: Optional negative prompt
- `enhance_prompt`: Boolean (default: true)
- `seed`: Optional integer for reproducibility
- `auto_fix`: Boolean (default: true)
- `generate_audio`: Boolean (default: true)

## Output
- Returns a video file with URL
- Format: MP4 video file

## Important Note
**This model is for VIDEO generation, not image generation. It should NOT be used for the character library's image generation needs.**
