# VFX Library - Implementation Plan

## Overview
The VFX Library will manage visual effects elements, templates, and assets for movie production. It provides comprehensive VFX references, technical specifications, and integration guidelines for consistent visual effects across scenes.

## Core Functionality Adaptation

### 1. Database Schema Changes
**From Character-focused to VFX-focused:**

```typescript
// Primary VFX Fields
name: string                    // Effect name (e.g., "Explosion Template", "Magic Portal")
vfxId: string                  // Unique identifier (auto-generated from name)
status: 'concept' | 'development' | 'approved' | 'rendered' | 'archived'

// VFX Classification
category: 'compositing' | 'animation' | 'simulation' | 'matte_painting' | 'color_grading' | 'cleanup'
subcategory: string            // Fire, water, smoke, creatures, environments, etc.
effectType: 'practical' | 'digital' | 'hybrid' | 'enhancement'
complexity: 'simple' | 'moderate' | 'complex' | 'hero'
style: string                 // Realistic, stylized, cartoon, abstract

// Technical Specifications
software: {
  primary: string             // After Effects, Nuke, Houdini, Maya, etc.
  secondary?: string[]        // Additional software used
  plugins: string[]          // Third-party plugins required
  version: string            // Software version requirements
  licenses: string[]         // License types needed
}
resolution: {
  width: number              // Pixel width
  height: number             // Pixel height
  aspectRatio: string        // 16:9, 2.35:1, etc.
  frameRate: number          // FPS
  colorSpace: string         // Rec709, LogC, ACES, etc.
  bitDepth: number          // 8, 10, 16, 32 bit
}
duration: {
  typical: number            // Typical duration in seconds
  minimum: number           // Minimum viable duration
  maximum: number           // Maximum recommended duration
  loopable: boolean         // Can be seamlessly looped
}

// Asset Requirements
assets: {
  sourceFootage: {
    required: boolean
    specifications: string[]  // Green screen, specific angles, etc.
    formats: string[]        // ProRes, RAW, etc.
    quality: string          // 4K, 2K, HD requirements
  }
  referenceImages: {
    required: boolean
    types: string[]          // Concept art, photo references, etc.
    quantity: number         // How many references needed
  }
  audioElements: {
    required: boolean
    types: string[]          // Sound effects, ambient, music
    sync: boolean           // Needs to sync with visual
  }
  additionalAssets: string[] // Textures, models, particles, etc.
}

// Rendering Specifications
rendering: {
  renderEngine: string       // Arnold, V-Ray, Cycles, etc.
  renderTime: {
    perFrame: number         // Minutes per frame
    total: number           // Total render time estimate
    complexity: string      // Simple, moderate, complex
  }
  hardware: {
    cpu: string[]           // CPU requirements
    gpu: string[]           // GPU requirements
    ram: number            // RAM in GB
    storage: number        // Storage in GB
    network: boolean       // Network rendering capable
  }
  outputFormats: string[]   // EXR, TIFF, MOV, etc.
  passes: string[]         // Beauty, diffuse, specular, etc.
}

// Integration Requirements
integration: {
  plateRequirements: string[] // What's needed from live action
  trackingPoints: string[]   // Tracking markers, reference objects
  lightingReference: string[] // HDRI, chrome balls, color charts
  cameraData: {
    required: boolean
    format: string          // FBX, Alembic, etc.
    tracking: boolean       // Camera tracking needed
    lens: string           // Lens distortion data
  }
  matchmove: {
    required: boolean
    complexity: string      // 2D, 3D, object tracking
    software: string       // Preferred tracking software
  }
}

// Quality Standards
quality: {
  photoRealism: 'stylized' | 'semi_realistic' | 'photorealistic' | 'hyperrealistic'
  detailLevel: 'low' | 'medium' | 'high' | 'extreme'
  motionQuality: 'basic' | 'good' | 'excellent' | 'perfect'
  lightingIntegration: 'basic' | 'good' | 'seamless'
  colorMatching: 'approximate' | 'good' | 'perfect'
}

// Scene Applications
sceneTypes: string[]          // Action, dialogue, establishing, etc.
locationTypes: string[]       // Interior, exterior, studio, etc.
storyMoments: string[]        // Climax, reveal, transition, etc.
characterInteraction: string[] // How characters interact with effect

// Production Pipeline
pipeline: {
  preproduction: {
    conceptArt: boolean
    previs: boolean
    techvis: boolean
    testing: boolean
  }
  production: {
    onSetSupervision: boolean
    dataWrangling: boolean
    dailies: boolean
    notes: string[]
  }
  postproduction: {
    phases: string[]          // Rough, refined, final
    reviews: number          // Number of review rounds
    deliverables: string[]   // What gets delivered
    timeline: number         // Days to complete
  }
}

// Budget & Resources
budget: {
  development: number        // Pre-production cost
  production: number        // Production cost
  postproduction: number    // Post-production cost
  total: number             // Total effect cost
  currency: string
  breakdown: {
    labor: number
    software: number
    hardware: number
    outsourcing: number
  }
}
team: {
  vfxSupervisor: boolean
  artists: number           // Number of artists needed
  specialties: string[]     // Compositor, animator, etc.
  experience: string        // Junior, mid, senior level
  duration: number          // Weeks of work
}

// Story Integration
storyContext: string          // How effect serves narrative
symbolism: string            // What the effect represents
emotionalImpact: string[]    // Fear, wonder, excitement, etc.
genreConventions: string[]   // Genre-specific VFX expectations
visualMetaphors: string[]    // Symbolic visual elements
```

### 2. Image Generation Prompts
**VFX-focused prompting:**

```typescript
// Base prompt structure for VFX
const vfxPromptTemplate = `
{VFX_NAME}, {EFFECT_TYPE} visual effect, {STYLE} style,
{COMPLEXITY} complexity, {QUALITY_LEVEL} quality,
{INTEGRATION_CONTEXT}, {COLOR_PALETTE}, {LIGHTING_CONDITIONS},
professional VFX reference, high detail, cinematic quality
`

// Specialized prompt types
const promptTypes = {
  concept: "Concept art for {VFX_EFFECT}, {STYLE} style, showing {KEY_ELEMENTS}",
  reference: "VFX reference showing {EFFECT} integrated into {SCENE_CONTEXT}",
  breakdown: "VFX breakdown showing {EFFECT} layers and components",
  comparison: "Before and after comparison showing {EFFECT} integration",
  technical: "Technical VFX reference showing {TECHNICAL_ASPECTS}",
  progression: "VFX progression from rough to final showing {EFFECT}"
}

// VFX quality descriptors
const vfxQualities = {
  photorealistic: "photorealistic VFX with perfect lighting integration",
  stylized: "stylized artistic VFX with creative interpretation",
  seamless: "seamlessly integrated VFX matching practical elements",
  spectacular: "spectacular hero VFX with maximum visual impact"
}
```

### 3. API Endpoints Adaptation
**VFX-specific endpoints:**

```typescript
// Core VFX management
POST /api/v1/vfx/create
PUT /api/v1/vfx/{id}/update
GET /api/v1/vfx/{id}
DELETE /api/v1/vfx/{id}

// VFX discovery and search
POST /api/v1/vfx/search
POST /api/v1/vfx/query
GET /api/v1/vfx/by-project/{projectId}
GET /api/v1/vfx/by-category/{category}
GET /api/v1/vfx/by-complexity/{level}
GET /api/v1/vfx/by-software/{software}

// Image generation for VFX
POST /api/v1/vfx/{id}/generate-concept-art
POST /api/v1/vfx/{id}/generate-reference-shot
POST /api/v1/vfx/{id}/generate-breakdown
POST /api/v1/vfx/{id}/generate-comparison
POST /api/v1/vfx/{id}/generate-technical-reference
POST /api/v1/vfx/{id}/generate-progression

// Technical specifications
GET /api/v1/vfx/{id}/software-requirements
GET /api/v1/vfx/{id}/hardware-requirements
GET /api/v1/vfx/{id}/asset-requirements
POST /api/v1/vfx/{id}/render-estimate
GET /api/v1/vfx/{id}/pipeline-requirements

// Production planning
POST /api/v1/vfx/{id}/schedule-estimate
GET /api/v1/vfx/{id}/team-requirements
POST /api/v1/vfx/{id}/budget-estimate
GET /api/v1/vfx/{id}/deliverables-list

// Integration support
POST /api/v1/vfx/{id}/plate-requirements
GET /api/v1/vfx/{id}/tracking-requirements
POST /api/v1/vfx/{id}/lighting-requirements
GET /api/v1/vfx/{id}/camera-requirements
```

### 4. UI Component Updates
**VFX-focused interface:**

```typescript
// Main VFX components
VFXCard.tsx                  // Display VFX with preview image
VFXDetailView.tsx           // Full VFX specs and technical info
VFXCreationForm.tsx         // Form for creating new VFX
VFXSearchInterface.tsx      // Search with software/complexity filters
VFXLibraryView.tsx          // Overview of all VFX assets

// Specialized components
SoftwareSelector.tsx
ComplexityCalculator.tsx
RenderEstimator.tsx
HardwareRequirements.tsx
AssetTracker.tsx
PipelineManager.tsx
QualityStandards.tsx
BudgetCalculator.tsx

// Image generation components
ConceptArtGenerator.tsx
ReferenceShotGenerator.tsx
BreakdownGenerator.tsx
ComparisonGenerator.tsx
TechnicalReferenceGenerator.tsx
ProgressionGenerator.tsx

// Production components
VFXScheduler.tsx
TeamPlanner.tsx
AssetManager.tsx
RenderQueue.tsx
DeliverableTracker.tsx
```

### 5. Story Integration Points
**VFX-narrative connections:**

```typescript
// Story context integration
interface VFXStoryIntegration {
  narrativeFunction: string    // Spectacle, story advancement, world building
  emotionalImpact: string[]   // Wonder, fear, excitement, etc.
  symbolism: string          // What the effect represents thematically
  characterDevelopment: string // How VFX reveals or affects character
  worldBuilding: string[]    // How VFX establishes story world
  genreConventions: string[] // Genre-specific VFX expectations
}

// Scene-VFX relationships
interface SceneVFXMatch {
  sceneId: string
  vfxId: string
  importance: 'hero' | 'supporting' | 'enhancement' | 'cleanup'
  requirements: string[]      // Specific needs for this scene
  integration: string[]       // How it integrates with live action
  matchScore: number         // How well VFX fits scene needs
}
```

### 6. Consistency Checking Logic
**VFX-specific validation:**

```typescript
// Visual consistency checks
- Style and quality consistency across shots
- Lighting integration accuracy
- Color matching with practical elements
- Scale and perspective accuracy
- Motion and physics realism

// Technical consistency checks
- Software compatibility across pipeline
- Resolution and format consistency
- Render quality standards
- Asset format compatibility
- Pipeline workflow adherence

// Production consistency checks
- Budget constraint compliance
- Timeline feasibility
- Team skill requirements
- Hardware availability
- Software licensing
```

### 7. Reference Management System
**VFX asset organization:**

```typescript
// Image gallery structure
interface VFXImageGallery {
  conceptArt: MediaItem[]         // Initial concept designs
  referenceShots: MediaItem[]     // Integrated VFX examples
  breakdowns: MediaItem[]         // Layer and component breakdowns
  comparisons: MediaItem[]        // Before/after, variations
  technicalReferences: MediaItem[] // Technical specifications
  progressions: MediaItem[]       // Development stages
  plateExamples: MediaItem[]      // Required source footage
  deliverables: MediaItem[]       // Final rendered outputs
}

// Reference categorization
interface VFXReference {
  referenceType: 'concept' | 'reference' | 'breakdown' | 'comparison' | 'technical' | 'progression'
  complexity: string             // Simple, moderate, complex, hero
  quality: string               // Draft, refined, final
  software: string              // Primary software used
  integration: string           // How it integrates with live action
  isMasterReference: boolean    // Primary reference for this VFX
  technicalAccuracy: boolean    // Technically accurate representation
  qualityScore: number          // Technical and artistic quality
  feasibilityScore: number     // Production feasibility rating
}
```

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
DATABASE_URI=mongodb://127.0.0.1/vfx-library
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

This comprehensive plan provides the foundation for creating a robust VFX Library that serves the unique needs of visual effects planning, development, and production management for movie creation.
