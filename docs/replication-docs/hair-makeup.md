# Hair / Makeup Library - Implementation Plan

## Overview
The Hair/Makeup Library will manage all hair styling, makeup looks, and beauty effects for movie production. It maintains strong character relationships while adding specialized beauty design, application techniques, and continuity tracking.

## Core Functionality Adaptation

### 1. Database Schema Changes
**Character-relationship preserved with beauty-specific enhancements:**

```typescript
// Primary Hair/Makeup Fields
name: string                    // Look name (e.g., "Victorian Updo", "Zombie Makeup")
lookId: string                 // Unique identifier (auto-generated from name)
status: 'concept' | 'approved' | 'in_use' | 'archived'

// Character Relationships (PRESERVED)
characterAssignments: {
  characterId: string          // Which character has this look
  characterName: string        // Character name for reference
  exclusivity: 'signature' | 'shared' | 'background'
  approvalStatus: 'approved' | 'pending' | 'revision_needed'
  testStatus: 'tested' | 'needs_test' | 'failed_test'
}[]

// Look Classification
category: 'hair' | 'makeup' | 'prosthetics' | 'special_effects' | 'combination'
subcategory: string            // Updo, natural makeup, wounds, aging, etc.
lookType: 'hero' | 'stunt' | 'photo_double' | 'background'
complexity: 'simple' | 'moderate' | 'complex' | 'extreme'
era: string                   // Medieval, Victorian, 1920s, Modern, Futuristic

// Hair Specifications (when applicable)
hair: {
  style: string               // Updo, down, braided, curled, straight
  length: 'short' | 'medium' | 'long' | 'extra_long'
  color: {
    base: string              // Natural or base color
    highlights?: string[]     // Highlight colors
    lowlights?: string[]      // Lowlight colors
    temporary?: string[]      // Temporary color additions
    technique: string         // Foil, balayage, ombre, solid
  }
  texture: 'straight' | 'wavy' | 'curly' | 'coily'
  volume: 'flat' | 'natural' | 'voluminous' | 'extreme'
  products: string[]          // Gels, sprays, pomades used
  tools: string[]            // Curling irons, straighteners, etc.
  extensions: {
    used: boolean
    type?: string            // Clip-in, sewn, bonded
    color?: string
    length?: string
  }
  wigs: {
    used: boolean
    type?: string            // Lace front, full cap, partial
    color?: string
    style?: string
    maintenance?: string[]
  }
}

// Makeup Specifications (when applicable)
makeup: {
  foundation: {
    shade: string
    coverage: 'light' | 'medium' | 'full'
    finish: 'matte' | 'satin' | 'dewy'
    brand?: string
    specialEffects?: string[] // Aging, wounds, etc.
  }
  eyes: {
    eyeshadow: string[]      // Colors used
    eyeliner: string         // Style and color
    mascara: string          // Type and color
    eyebrows: string         // Shape and color
    lashes: string           // Natural, false, extensions
    specialEffects?: string[] // Bruising, cuts, etc.
  }
  lips: {
    color: string
    finish: 'matte' | 'satin' | 'gloss'
    technique: string        // Full coverage, stained, ombre
    specialEffects?: string[] // Cuts, dryness, etc.
  }
  contouring: {
    used: boolean
    technique?: string       // Subtle, dramatic, character
    products?: string[]
  }
  specialEffects: {
    wounds: string[]         // Types of injuries
    aging: string[]          // Wrinkles, spots, etc.
    fantasy: string[]        // Non-human features
    prosthetics: string[]    // Applied pieces
  }
}

// Application Details
application: {
  timeRequired: number        // Minutes to complete
  skillLevel: 'basic' | 'intermediate' | 'advanced' | 'expert'
  artistRequired: string[]    // Specific artist qualifications
  products: {
    name: string
    brand: string
    shade?: string
    quantity: string
    cost?: number
  }[]
  tools: string[]            // Brushes, sponges, airbrush, etc.
  techniques: string[]       // Stippling, blending, layering
  order: string[]           // Step-by-step application order
}

// Durability & Maintenance
durability: {
  wearTime: number          // Hours it lasts
  touchupFrequency: string  // How often touchups needed
  weatherResistance: string // Rain, heat, humidity resistance
  activityLevel: string     // Sitting, walking, action scenes
  removalTime: number       // Minutes to remove
  removalMethod: string[]   // Products and techniques for removal
}

// Scene & Continuity Tracking
sceneUsage: {
  sceneId: string
  sceneNumber: string
  shootingDate: Date
  condition: string          // Fresh, touched up, worn, damaged
  continuityNotes: string[]  // Important continuity details
  changes: string[]          // Smudging, damage, wear added
  resetRequired: boolean     // Needs complete redo after scene
}[]
continuityTracking: {
  baselinePhotos: string[]   // Reference photos for continuity
  changeLog: {
    date: Date
    scene: string
    changes: string[]
    touchupTime: number
  }[]
  currentState: string       // Current condition and wear
}

// Health & Safety
safety: {
  allergens: string[]        // Known allergens in products
  skinSensitivity: string[]  // Potential irritants
  eyeSafety: boolean        // Safe for eye area
  lipSafety: boolean        // Safe for lip area
  childSafe: boolean        // Safe for child actors
  pregnancySafe: boolean    // Safe for pregnant actors
  certifications: string[]  // Safety standards met
  patchTestRequired: boolean // Needs skin test before use
}

// Lighting Considerations
lighting: {
  naturalLight: string      // How it looks in daylight
  tungsten: string         // Under tungsten lights
  fluorescent: string      // Under fluorescent lights
  led: string              // Under LED lights
  flash: string            // With camera flash
  colorTemperature: string // Optimal lighting conditions
  reflectivity: string     // Matte, satin, reflective
}

// Story Integration
storyContext: string          // Character development significance
emotionalJourney: string[]    // How look supports character arc
symbolism: string            // What the look represents
transformation: string[]     // Changes throughout story
socialContext: string        // Class, profession, culture indication
psychologicalImpact: string  // Effect on character's confidence
```

### 2. Image Generation Prompts
**Hair/Makeup-focused prompting:**

```typescript
// Base prompt structure for hair/makeup
const beautyPromptTemplate = `
{LOOK_NAME}, {CHARACTER_NAME}, {ERA} period, 
{HAIR_STYLE} hair, {MAKEUP_STYLE} makeup, {LIGHTING_CONDITIONS},
{ANGLE} view, {SKIN_TONE}, {EXPRESSION},
professional beauty photography, high detail, studio quality
`

// Specialized prompt types
const promptTypes = {
  hero: "Hero beauty shot of {CHARACTER} with {LOOK}, dramatic lighting, perfect application",
  reference: "Reference shot of {LOOK} on {CHARACTER}, even lighting, showing all details",
  continuity: "{LOOK} on {CHARACTER} in {CONDITION} for scene continuity",
  process: "Step-by-step application of {LOOK}, showing {TECHNIQUE}",
  comparison: "Before and after comparison of {LOOK} application",
  lighting: "{LOOK} under {LIGHTING_TYPE}, showing color accuracy"
}

// Lighting setups for different looks
const beautyLightingSetups = {
  natural: "soft natural lighting emphasizing skin texture",
  glamour: "dramatic beauty lighting with controlled shadows",
  editorial: "high-fashion editorial lighting with strong contrast",
  continuity: "consistent flat lighting for continuity matching",
  special_effects: "dramatic lighting emphasizing prosthetics and effects"
}
```

### 3. API Endpoints Adaptation
**Hair/Makeup-specific endpoints:**

```typescript
// Core hair/makeup management
POST /api/v1/hair-makeup/create
PUT /api/v1/hair-makeup/{id}/update
GET /api/v1/hair-makeup/{id}
DELETE /api/v1/hair-makeup/{id}

// Character-look relationships (PRESERVED)
GET /api/v1/hair-makeup/by-character/{characterId}
POST /api/v1/hair-makeup/{id}/assign-character
PUT /api/v1/hair-makeup/{id}/character-assignment
DELETE /api/v1/hair-makeup/{id}/unassign-character

// Look discovery and search
POST /api/v1/hair-makeup/search
POST /api/v1/hair-makeup/query
GET /api/v1/hair-makeup/by-project/{projectId}
GET /api/v1/hair-makeup/by-category/{category}
GET /api/v1/hair-makeup/by-era/{era}
GET /api/v1/hair-makeup/by-complexity/{level}

// Image generation for hair/makeup
POST /api/v1/hair-makeup/{id}/generate-hero-shot
POST /api/v1/hair-makeup/{id}/generate-reference-shot
POST /api/v1/hair-makeup/{id}/generate-continuity-shot
POST /api/v1/hair-makeup/{id}/generate-process-shots
POST /api/v1/hair-makeup/{id}/generate-lighting-test
POST /api/v1/hair-makeup/{id}/generate-comparison

// Application and testing
POST /api/v1/hair-makeup/{id}/schedule-test
PUT /api/v1/hair-makeup/{id}/test-results
POST /api/v1/hair-makeup/{id}/application-notes
GET /api/v1/hair-makeup/{id}/product-list
POST /api/v1/hair-makeup/{id}/timing-log

// Continuity tracking
POST /api/v1/hair-makeup/{id}/continuity-photo
PUT /api/v1/hair-makeup/{id}/scene-condition
GET /api/v1/hair-makeup/{id}/continuity-history
POST /api/v1/hair-makeup/{id}/touchup-log

// Safety and health
GET /api/v1/hair-makeup/{id}/safety-info
POST /api/v1/hair-makeup/{id}/allergy-check
PUT /api/v1/hair-makeup/{id}/patch-test-results
```

### 4. UI Component Updates
**Hair/Makeup-focused interface:**

```typescript
// Main hair/makeup components
LookCard.tsx                 // Display look with character assignment
LookDetailView.tsx          // Full look specs and application info
LookCreationForm.tsx        // Form for creating new looks
LookSearchInterface.tsx     // Search with complexity/era filters
CharacterLooksView.tsx      // All looks for specific character

// Character relationship components (PRESERVED)
CharacterAssignment.tsx     // Assign looks to characters
TestScheduler.tsx          // Schedule and track makeup tests
ApprovalWorkflow.tsx       // Look approval process
LookComparison.tsx         // Compare different looks for character

// Specialized components
HairStyleSelector.tsx
MakeupPalette.tsx
ProductTracker.tsx
ApplicationTimer.tsx
ContinuityTracker.tsx
SafetyChecker.tsx
LightingTester.tsx

// Image generation components
HeroShotGenerator.tsx
ReferenceShotGenerator.tsx
ContinuityShotGenerator.tsx
ProcessShotGenerator.tsx
LightingTestGenerator.tsx
ComparisonGenerator.tsx

// Production components
ApplicationScheduler.tsx
ProductInventory.tsx
ArtistScheduler.tsx
TouchupTracker.tsx
```

### 5. Story Integration Points
**Hair/Makeup-character-narrative connections:**

```typescript
// Enhanced story context integration
interface LookStoryIntegration {
  characterDevelopment: string  // How look reflects character growth
  narrativeFunction: string    // Disguise, transformation, status
  emotionalJourney: string[]   // How look supports character arc
  symbolism: string           // What the look represents
  transformation: string[]    // Look changes throughout story
  psychologicalImpact: string // Effect on character's confidence
  audiencePerception: string  // How audience should perceive character
}

// Scene-look relationships
interface SceneLookRelationship {
  sceneId: string
  lookId: string
  characterId: string         // Which character has the look
  importance: 'critical' | 'important' | 'supporting' | 'background'
  condition: string          // Required condition for scene
  continuityRequirements: string[] // Specific continuity needs
  changesDuring: string[]    // Wear/damage that occurs in scene
  touchupNeeded: boolean     // Requires touchup during scene
}
```

### 6. Consistency Checking Logic
**Hair/Makeup-specific validation:**

```typescript
// Visual consistency checks
- Color accuracy across different lighting
- Application quality consistency
- Wear pattern progression continuity
- Character-look pairing validation
- Era and style appropriateness

// Character relationship validation
- Character skin tone compatibility
- Character personality alignment
- Character arc progression through looks
- Multiple character conflicts (same signature look)
- Exclusive assignment enforcement

// Production consistency checks
- Application time vs. shooting schedule
- Product availability and inventory
- Artist skill level requirements
- Safety and allergy compliance
- Lighting condition compatibility
```

### 7. Reference Management System
**Hair/Makeup asset organization:**

```typescript
// Image gallery structure
interface LookImageGallery {
  heroShots: MediaItem[]          // Glamour beauty photography
  referenceShots: MediaItem[]     // Even lighting, all details visible
  continuityShots: MediaItem[]    // Current condition for continuity
  processShots: MediaItem[]       // Step-by-step application
  lightingTests: MediaItem[]      // Under different lighting conditions
  comparisonShots: MediaItem[]    // Before/after, variations
  detailShots: MediaItem[]        // Close-ups of specific techniques
  wearTests: MediaItem[]          // How it looks after hours of wear
}

// Reference categorization
interface LookReference {
  referenceType: 'hero' | 'reference' | 'continuity' | 'process' | 'lighting' | 'comparison'
  characterContext: string       // Which character wearing it
  condition: string             // Fresh, worn, touched up
  lightingCondition: string     // Natural, tungsten, LED, etc.
  applicationStage: string      // Complete, partial, in-progress
  angle: string                // Front, profile, three-quarter
  isMasterReference: boolean    // Primary reference for this look
  continuityApproved: boolean   // Approved for continuity use
  qualityScore: number          // Technical and artistic quality
  accuracyScore: number         // Color and application accuracy
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
DATABASE_URI=mongodb://127.0.0.1/hair-makeup-library
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

This comprehensive plan provides the foundation for creating a robust Hair/Makeup Library that maintains essential character relationships while adding specialized beauty design, application tracking, and continuity management capabilities.
