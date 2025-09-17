# REPLICATION README

##  Overview

This is a character library app. it works to serve the movie generation system. it helps at various points to deliver consistent characters, voices and images for the movie generation system. 
voice system is still under development, but the voice id is present for characters.

## Purpose

i want to clone the code  following libraries locations / sets, vehicles, props, wardrobe, hair / makeup, lighting lookbook, vfx, stunts, insets, crowd and pose.
those libraries will be very similar to character library, but with different data and different image generation needs.

## List of Libraries to be created

1. Locations / Sets
2. Vehicles
3. Props
4. Wardrobe
5. Hair / Makeup
6. Lighting Lookbook
7. VFX
8. Stunts
9. Insets
10. Crowd
11. Pose

## Analysis Phase (Do This First)
Before creating any new repos, analyze this character-library to identify:
Core Patterns to Replicate:

Story integration workflow
Image generation pipeline
DINOV3 consistency checking
Reference image management
Backstory/metadata structure
UI/UX patterns that work well

Domain-Specific Elements to Replace:

Character-specific data schemas
Character-focused UI components
Character relationship logic
Character-specific prompts for image generation

## Domain Adaptation Plan
Create a systematic checklist for your vibe coder:
ADAPTATION CHECKLIST for [LIBRARY_NAME]:
□ Database Schema Changes
□ UI Component Updates  
□ Image Generation Prompts
□ Consistency Check Logic
□ Story Integration Points
□ Reference Management
□ Domain-Specific Fields
□ Navigation/Menu Updates
□ Documentation Updates

where LIBRARY_NAME is the name of the library being created.

## Sample Domain-Specific Adaptation Maps
Here's a sample of what each library could need to change from the character template (incomplete):

Locations Library:

Replace "character backstory" → "location history/context"
Replace "character traits" → "architectural style, era, mood"
Update image prompts for environments vs. people
Add geographic/architectural metadata
Weather/lighting condition fields

Vehicles Library:

Replace "character personality" → "vehicle condition, era, purpose"
Add mechanical specifications
Stunt/practical driving considerations
Multiple angle requirements (interior/exterior)

Props Library:

Replace "character relationships" → "scene/character associations"
Add scale, material, period accuracy fields
Practical vs. hero prop distinctions
Safety/handling requirements

Wardrobe Library:

Keep character relationships (wardrobe belongs to characters)
Add sizing, period accuracy, scene continuity
Costume changes tracking
Stunt double considerations

Pose Library:

Replace "character-specific" → "general pose library"
Simplify prompts to generic postures
No backstory/metadata needed
Consistency checks for pose accuracy
Poses will be images of stick figures, not characters
they will guide the image generation system to create the right pose.

## Key functionality
1. User should be able to prompt a new library item with prompt and optionally reference (images). Backend api and frontend ui should support this.
2. There should be an endpoint added to backend api and to frontend ui where the user can use a prompt area, with reference image(s) and request a new image to be generated based on what he gives. For the library item. all generations will be saved as additional media for the library item.

## Pathrag and Dino
we will use all the same external apps like fal.ai, openrouter, fal.ai and cloudflare

## Baml
baml is core to any prompting
in this document I have provided the ideas of what I want to do.
