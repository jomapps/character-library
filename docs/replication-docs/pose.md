# Pose Library - Implementation Plan

## Overview
The Pose Library will manage pose references and body positioning guides for movie production. Unlike other libraries, this focuses on generic pose templates using stick figures rather than character-specific poses, serving as guides for the image generation system.

## Core Functionality Adaptation

### 1. Database Schema Changes
**From Character-focused to Pose-focused (Simplified):**

```typescript
// Primary Pose Fields
name: string                    // Pose name (e.g., "Standing Confident", "Sitting Relaxed")
poseId: string                 // Unique identifier (auto-generated from name)
status: 'draft' | 'approved' | 'active' | 'archived'

// Pose Classification (SIMPLIFIED)
category: 'standing' | 'sitting' | 'lying' | 'walking' | 'running' | 'action' | 'gesture'
subcategory: string            // Confident, relaxed, aggressive, defensive, etc.
poseType: 'static' | 'dynamic' | 'transitional'
complexity: 'simple' | 'moderate' | 'complex'
bodyParts: string[]           // Which body parts are primary focus

// Body Position Specifications
bodyPosition: {
  torso: {
    angle: number             // Degrees from vertical
    twist: number            // Rotation around spine
    lean: 'forward' | 'backward' | 'left' | 'right' | 'neutral'
    posture: 'straight' | 'slouched' | 'arched' | 'twisted'
  }
  head: {
    tilt: number             // Degrees of tilt
    turn: number             // Degrees of turn
    position: 'up' | 'down' | 'forward' | 'back' | 'neutral'
    expression: 'neutral' | 'focused' | 'relaxed' | 'alert'
  }
  arms: {
    left: {
      shoulder: string       // Raised, lowered, forward, back
      elbow: string         // Bent, straight, angle
      hand: string          // Position and gesture
      gesture: string       // Pointing, grasping, open, etc.
    }
    right: {
      shoulder: string
      elbow: string
      hand: string
      gesture: string
    }
    symmetry: boolean        // Are arms symmetrical
    interaction: string      // What arms are doing
  }
  legs: {
    left: {
      hip: string           // Position and angle
      knee: string          // Bent, straight, angle
      foot: string          // Position and direction
      weight: string        // Weight bearing or not
    }
    right: {
      hip: string
      knee: string
      foot: string
      weight: string
    }
    stance: string          // Wide, narrow, crossed, etc.
    balance: string         // Balanced, shifting, dynamic
  }
}

// Emotional & Contextual Attributes
attributes: {
  emotion: string[]           // Confident, nervous, aggressive, calm
  energy: 'low' | 'medium' | 'high' | 'intense'
  formality: 'casual' | 'formal' | 'professional' | 'intimate'
  openness: 'open' | 'closed' | 'defensive' | 'welcoming'
  dominance: 'dominant' | 'submissive' | 'neutral' | 'assertive'
  attention: 'focused' | 'distracted' | 'alert' | 'relaxed'
}

// Usage Context (SIMPLIFIED - No Character Backstory)
usage: {
  sceneTypes: string[]        // Dialogue, action, romantic, confrontation
  characterTypes: string[]    // Hero, villain, supporting, background
  emotions: string[]          // What emotions this pose conveys
  situations: string[]        // When this pose would be used
  genres: string[]           // Which genres this pose fits
  interactions: string[]      // Solo, with others, with objects
}

// Technical Specifications
technical: {
  viewAngles: string[]        // Front, side, back, three-quarter
  difficulty: 'easy' | 'moderate' | 'difficult' | 'expert'
  stability: 'stable' | 'balanced' | 'dynamic' | 'unstable'
  duration: 'momentary' | 'brief' | 'sustained' | 'continuous'
  transitions: {
    from: string[]            // Poses this can transition from
    to: string[]              // Poses this can transition to
    ease: 'easy' | 'moderate' | 'difficult'
  }
}

// Anatomical Considerations
anatomy: {
  physicalDemands: string[]   // Flexibility, strength, balance required
  restrictions: string[]      // Age, mobility, injury considerations
  comfort: 'comfortable' | 'neutral' | 'uncomfortable' | 'strenuous'
  sustainability: number      // How long pose can be held (minutes)
  modifications: string[]     // Easier variations available
}

// Visual Reference Data (STICK FIGURES)
visualReference: {
  stickFigure: {
    proportions: 'standard' | 'heroic' | 'realistic' | 'stylized'
    style: 'simple' | 'detailed' | 'anatomical'
    annotations: string[]     // Key points highlighted
    measurements: {
      angles: Record<string, number>  // Joint angles
      distances: Record<string, number> // Limb positions
      ratios: Record<string, number>   // Proportional relationships
    }
  }
  guidelines: {
    centerOfGravity: string   // Where balance point is
    weightDistribution: string // How weight is distributed
    keyLines: string[]        // Important alignment lines
    symmetry: string         // Symmetrical or asymmetrical
  }
}

// Application Guidelines
application: {
  imageGeneration: {
    promptIntegration: string // How to integrate into prompts
    keyDescriptors: string[] // Key words for this pose
    commonMistakes: string[] // What to avoid
    enhancements: string[]   // How to improve results
  }
  direction: {
    actorInstructions: string[] // How to direct actors
    keyPoints: string[]      // Most important aspects
    adjustments: string[]    // Common adjustments needed
    timing: string          // When in scene to use
  }
}

// Quality Standards (SIMPLIFIED)
quality: {
  clarity: 'clear' | 'moderate' | 'complex'
  naturalness: 'natural' | 'stylized' | 'exaggerated'
  expressiveness: 'subtle' | 'moderate' | 'strong'
  versatility: 'specific' | 'moderate' | 'versatile'
  recognizability: 'unique' | 'common' | 'universal'
}

// Variations & Alternatives
variations: {
  intensity: string[]         // Subtle, moderate, strong versions
  angles: string[]           // Different viewing angles
  modifications: string[]     // Easier/harder variations
  combinations: string[]      // Works well with these poses
  opposites: string[]        // Contrasting poses
}

// Metadata (NO BACKSTORY OR COMPLEX RELATIONSHIPS)
metadata: {
  tags: string[]             // Simple descriptive tags
  keywords: string[]         // Search keywords
  aliases: string[]          // Alternative names
  culturalContext: string[]  // Cultural considerations
  historicalPeriod: string[] // Time periods where appropriate
  universality: 'universal' | 'cultural' | 'specific'
}
```

### 2. Image Generation Prompts
**Pose-focused prompting (STICK FIGURES):**

```typescript
// Base prompt structure for poses
const posePromptTemplate = `
Stick figure drawing, {POSE_NAME}, {BODY_POSITION} position,
{EMOTION} emotion, {ENERGY} energy level, {VIEW_ANGLE} view,
simple line drawing, anatomical accuracy, clear proportions,
instructional diagram style, black lines on white background
`

// Specialized prompt types
const promptTypes = {
  reference: "Stick figure reference of {POSE}, showing {KEY_FEATURES}, instructional style",
  diagram: "Anatomical diagram of {POSE}, showing {JOINT_ANGLES} and {BALANCE_POINTS}",
  sequence: "Pose sequence showing transition from {START_POSE} to {END_POSE}",
  variation: "Pose variations of {BASE_POSE}, showing {INTENSITY_LEVELS}",
  comparison: "Side-by-side comparison of {POSE_A} vs {POSE_B}",
  guide: "Pose guide for {POSE}, showing {ACTOR_DIRECTIONS} and {KEY_POINTS}"
}

// Stick figure style descriptors
const stickFigureStyles = {
  simple: "simple stick figure with basic lines and circles",
  detailed: "detailed stick figure showing joint positions and proportions",
  anatomical: "anatomically accurate stick figure with proper proportions",
  instructional: "instructional diagram style with clear annotations"
}
```

### 3. API Endpoints Adaptation
**Pose-specific endpoints (SIMPLIFIED):**

```typescript
// Core pose management
POST /api/v1/poses/create
PUT /api/v1/poses/{id}/update
GET /api/v1/poses/{id}
DELETE /api/v1/poses/{id}

// Pose discovery and search (SIMPLIFIED)
POST /api/v1/poses/search
POST /api/v1/poses/query
GET /api/v1/poses/by-category/{category}
GET /api/v1/poses/by-emotion/{emotion}
GET /api/v1/poses/by-energy/{level}
GET /api/v1/poses/by-complexity/{level}

// Image generation for poses (STICK FIGURES)
POST /api/v1/poses/{id}/generate-reference
POST /api/v1/poses/{id}/generate-diagram
POST /api/v1/poses/{id}/generate-sequence
POST /api/v1/poses/{id}/generate-variations
POST /api/v1/poses/{id}/generate-comparison
POST /api/v1/poses/{id}/generate-guide

// Pose application
GET /api/v1/poses/{id}/prompt-integration
GET /api/v1/poses/{id}/actor-directions
POST /api/v1/poses/suggest-for-scene
GET /api/v1/poses/by-scene-type/{type}

// Quality and validation (SIMPLIFIED)
POST /api/v1/poses/validate-consistency
GET /api/v1/poses/{id}/quality-metrics
POST /api/v1/poses/{id}/usage-feedback
```

### 4. UI Component Updates
**Pose-focused interface (SIMPLIFIED):**

```typescript
// Main pose components
PoseCard.tsx                // Display pose with stick figure preview
PoseDetailView.tsx         // Full pose specs and applications
PoseCreationForm.tsx       // Form for creating new poses
PoseSearchInterface.tsx    // Search with category/emotion filters
PoseLibraryView.tsx        // Overview of all pose references

// Simplified components (NO CHARACTER RELATIONSHIPS)
CategorySelector.tsx
EmotionSelector.tsx
EnergyLevelSelector.tsx
BodyPositionEditor.tsx
AnatomicalDiagram.tsx
UsageGuidelines.tsx

// Image generation components (STICK FIGURES)
ReferenceGenerator.tsx
DiagramGenerator.tsx
SequenceGenerator.tsx
VariationGenerator.tsx
ComparisonGenerator.tsx
GuideGenerator.tsx

// Application components
PromptIntegrator.tsx
ActorDirections.tsx
SceneSuggestions.tsx
QualityChecker.tsx
```

### 5. Story Integration Points
**Pose-narrative connections (SIMPLIFIED):**

```typescript
// Simplified story context integration
interface PoseStoryIntegration {
  sceneTypes: string[]        // Which scene types this pose fits
  emotionalContext: string[] // Emotions this pose conveys
  characterTypes: string[]   // Which character types use this pose
  narrativeFunction: string  // How pose serves story
  genreCompatibility: string[] // Which genres this pose fits
  situationalUse: string[]   // When this pose is appropriate
}

// Scene-pose relationships (SIMPLIFIED)
interface ScenePoseMatch {
  sceneId: string
  poseId: string
  usage: 'primary' | 'secondary' | 'background'
  context: string           // Why this pose fits the scene
  alternatives: string[]    // Other poses that could work
  matchScore: number       // How well pose fits scene needs
}
```

### 6. Consistency Checking Logic
**Pose-specific validation (SIMPLIFIED):**

```typescript
// Visual consistency checks (STICK FIGURES)
- Anatomical accuracy and proportions
- Joint angle feasibility
- Balance and stability logic
- Pose clarity and readability
- Style consistency across library

// Application consistency checks
- Emotional appropriateness for context
- Physical feasibility for actors
- Scene type compatibility
- Genre convention adherence
- Cultural sensitivity validation

// Technical consistency checks
- Prompt integration effectiveness
- Image generation compatibility
- Transition logic between poses
- Difficulty level accuracy
- Usage guideline clarity
```

### 7. Reference Management System
**Pose asset organization (STICK FIGURES):**

```typescript
// Image gallery structure (SIMPLIFIED)
interface PoseImageGallery {
  references: MediaItem[]         // Basic stick figure references
  diagrams: MediaItem[]          // Anatomical diagrams
  sequences: MediaItem[]         // Pose transition sequences
  variations: MediaItem[]        // Different intensity variations
  comparisons: MediaItem[]       // Side-by-side comparisons
  guides: MediaItem[]           // Actor direction guides
  applications: MediaItem[]      // Usage examples
  annotations: MediaItem[]       // Annotated versions
}

// Reference categorization (SIMPLIFIED)
interface PoseReference {
  referenceType: 'reference' | 'diagram' | 'sequence' | 'variation' | 'comparison' | 'guide'
  category: string              // Standing, sitting, action, etc.
  emotion: string              // Primary emotion conveyed
  complexity: string           // Simple, moderate, complex
  viewAngle: string           // Front, side, back, three-quarter
  isMasterReference: boolean   // Primary reference for this pose
  anatomicallyAccurate: boolean // Anatomically correct
  qualityScore: number         // Technical and instructional quality
  usabilityScore: number       // How useful for image generation
}
```

## Implementation Priority (SIMPLIFIED)

### Phase 1: Core Infrastructure
1. Database schema for poses (simplified, no character relationships)
2. Basic CRUD operations for poses
3. Stick figure image generation system
4. Simple search and filtering

### Phase 2: Image Generation (STICK FIGURES)
1. Stick figure prompt templates
2. Anatomical diagram generation
3. Pose variation generation
4. Integration with existing Fal.ai pipeline

### Phase 3: Application Features
1. Prompt integration guidelines
2. Actor direction tools
3. Scene suggestion system
4. Quality validation tools

### Phase 4: Integration & Polish
1. Image generation system integration
2. Usage analytics and feedback
3. Pose recommendation engine
4. Library optimization

## Technical Considerations

### Database Migration Strategy
- Create simplified pose schema without character relationships
- Focus on anatomical and emotional data
- Preserve existing media and user collections
- Update API routes for pose-specific operations

### Image Generation Focus (STICK FIGURES)
- Develop stick figure generation templates
- Create anatomical accuracy validation
- Implement pose variation systems
- Add instructional diagram capabilities

### UI/UX Adaptations (SIMPLIFIED)
- Design pose-centric dashboard without character complexity
- Create anatomical position editors
- Implement stick figure preview systems
- Add pose application and direction tools

## Tech Stack

### Core Framework & Runtime
- **Next.js 15.4.4** - React framework with App Router
- **React 19.1.1** - Frontend UI library
- **TypeScript 5.7.3** - Type-safe JavaScript
- **Node.js ^18.20.2 || >=20.9.0** - Runtime environment
- **pnpm ^9 || ^10** - Package manager

### Backend & CMS
- **PayloadCMS 3.54.0** - Headless CMS and admin panel
  - `@payloadcms/next` - Next.js integration
  - `@payloadcms/ui` - Admin UI components
  - `@payloadcms/richtext-lexical` - Rich text editor
  - `@payloadcms/payload-cloud` - Cloud deployment plugin

### Database & Storage
- **MongoDB** - Primary database via `@payloadcms/db-mongodb`
- **Mongoose** - MongoDB object modeling
- **Cloudflare R2** - Object storage via `@payloadcms/storage-s3`
  - Media file storage and CDN
  - Custom domain integration (`https://media.rumbletv.com`)

### Image Processing & AI
- **Fal.ai** - AI image generation service
  - Text-to-image: `fal-ai/nano-banana`
  - Image-to-image: `fal-ai/nano-banana/edit`
- **Sharp 0.34.2** - High-performance image processing
- **DINOv3 Service** - Visual consistency validation
- **OpenRouter API** - LLM integration for descriptions

### External Services Integration
- **PathRAG Service** - Knowledge base management
- **BAML** - Prompt engineering and AI orchestration
- **Cloudflare R2** - File storage and CDN
- **OpenRouter** - AI model routing and management

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **@tailwindcss/forms** - Form styling plugin
- **Lucide React ^0.542.0** - Icon library
- **PostCSS ^8.5.6** - CSS processing

### Forms & Validation
- **React Hook Form ^7.62.0** - Form state management
- **@hookform/resolvers ^5.2.1** - Form validation resolvers
- **Zod ^4.1.5** - Schema validation

### Development & Testing
- **ESLint ^9.16.0** - Code linting
- **Prettier ^3.4.2** - Code formatting
- **Vitest 3.2.3** - Unit testing framework
- **Playwright 1.54.1** - End-to-end testing
- **@testing-library/react 16.3.0** - React testing utilities

### Build & Deployment
- **Cross-env ^7.0.3** - Cross-platform environment variables
- **Autoprefixer ^10.4.21** - CSS vendor prefixing
- **GraphQL ^16.8.1** - API query language
- **PM2** - Process management (via ecosystem.config.js)

### Development Tools
- **Dotenv 16.4.7** - Environment variable management
- **Node-fetch ^3.3.2** - HTTP client
- **Form-data ^4.0.4** - Multipart form data handling
- **React Syntax Highlighter ^15.6.6** - Code syntax highlighting

### Configuration Files
- `next.config.mjs` - Next.js configuration with Payload integration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration with path mapping
- `payload.config.ts` - PayloadCMS configuration
- `ecosystem.config.js` - PM2 deployment configuration

### Environment Variables
```bash
# Database
DATABASE_URI=mongodb://127.0.0.1/pose-library
PAYLOAD_SECRET=your-payload-secret

# AI Services
FAL_KEY=your-fal-api-key
FAL_TEXT_TO_IMAGE_MODEL=fal-ai/nano-banana
FAL_IMAGE_TO_IMAGE_MODEL=fal-ai/nano-banana/edit
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=anthropic/claude-sonnet-4

# External Services
DINO_SERVICE_URL=https://dino.ft.tc
DINO_API_KEY=your-dino-api-key
PATHRAG_SERVICE_URL=https://pathrag.ft.tc
PATHRAG_API_KEY=your-pathrag-api-key

# Storage
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-key
CLOUDFLARE_R2_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_ENDPOINT=your-r2-endpoint
CLOUDFLARE_R2_PUBLIC_URL=https://media.yourdomain.com

# Admin
PAYLOADCMS_ADMIN_EMAIL=admin@yourdomain.com
PAYLOADCMS_ADMIN_PASSWORD=your-admin-password
```

This comprehensive plan provides the foundation for creating a robust Pose Library that serves as a reference system for image generation, focusing on stick figure representations rather than character-specific poses, making it a universal tool for guiding pose generation across all character types.
