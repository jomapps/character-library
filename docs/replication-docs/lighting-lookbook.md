# Lighting Lookbook Library - Implementation Plan

## Overview
The Lighting Lookbook Library will manage lighting setups, moods, and visual styles for movie production. It provides comprehensive lighting references, technical specifications, and mood boards for consistent cinematic lighting across scenes.

## Core Functionality Adaptation

### 1. Database Schema Changes
**From Character-focused to Lighting-focused:**

```typescript
// Primary Lighting Fields
name: string                    // Setup name (e.g., "Film Noir Shadow", "Golden Hour Romance")
lightingId: string             // Unique identifier (auto-generated from name)
status: 'concept' | 'tested' | 'approved' | 'in_use' | 'archived'

// Lighting Classification
category: 'natural' | 'artificial' | 'mixed' | 'practical' | 'special_effects'
subcategory: string            // Key light, fill light, rim light, ambient, etc.
style: string                 // Film noir, romantic, horror, documentary, etc.
mood: string                  // Dramatic, soft, harsh, mysterious, cheerful
era: string                   // Classic Hollywood, Modern, Contemporary, Futuristic
genre: string[]               // Horror, romance, action, drama, comedy

// Technical Specifications
lightingSources: {
  type: string                // LED, tungsten, HMI, fluorescent, natural
  brand?: string              // ARRI, Kino Flo, Aputure, etc.
  model?: string              // Specific light model
  wattage: number            // Power consumption
  colorTemperature: number   // Kelvin rating
  cri: number               // Color Rendering Index
  quantity: number          // How many of this light
  position: string          // Key, fill, rim, background, practical
  angle: string             // High, low, side, front, back
  distance: string          // Close, medium, far
  diffusion?: string        // Softbox, umbrella, bounce, none
  flags?: string[]          // Light modifiers used
}[]

// Setup Configuration
setup: {
  keyLight: {
    source: string            // Primary light source
    intensity: number         // Percentage or lux
    angle: number            // Degrees from subject
    height: number           // Height from ground
    distance: number         // Distance from subject
    diffusion: string        // Type of diffusion used
    color: string           // Gel or filter color
  }
  fillLight?: {
    source: string
    intensity: number
    ratio: string           // Key to fill ratio (2:1, 4:1, etc.)
    angle: number
    diffusion: string
  }
  rimLight?: {
    source: string
    intensity: number
    angle: number
    color?: string
  }
  backgroundLight?: {
    source: string
    intensity: number
    pattern: string         // Even, gradient, spotted
    color?: string
  }
  practicalLights: {
    type: string            // Lamps, candles, screens, etc.
    intensity: string       // Bright, dim, flickering
    color: string
    motivation: string      // Story reason for the light
  }[]
}

// Visual Characteristics
appearance: {
  contrast: 'low' | 'medium' | 'high' | 'extreme'
  shadows: {
    hardness: 'soft' | 'medium' | 'hard'
    direction: string       // Where shadows fall
    density: 'light' | 'medium' | 'deep'
    color?: string         // Tinted shadows
  }
  highlights: {
    intensity: 'subtle' | 'moderate' | 'bright' | 'blown'
    color?: string         // Tinted highlights
    falloff: 'gradual' | 'sharp'
  }
  colorPalette: {
    dominant: string        // Primary color tone
    secondary?: string[]    // Supporting colors
    temperature: 'cool' | 'neutral' | 'warm'
    saturation: 'desaturated' | 'natural' | 'saturated'
  }
}

// Mood & Atmosphere
atmosphere: {
  emotional: string[]         // Romantic, tense, peaceful, ominous
  energy: 'low' | 'medium' | 'high' | 'intense'
  intimacy: 'distant' | 'neutral' | 'intimate' | 'claustrophobic'
  time: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night'
  weather: string[]          // Sunny, cloudy, stormy, foggy
  season: string[]           // Spring, summer, fall, winter
}

// Scene Applications
sceneTypes: string[]          // Dialogue, action, romantic, horror, etc.
locationTypes: string[]       // Interior, exterior, studio, practical
characterTypes: string[]      // Hero, villain, ensemble, background
storyMoments: string[]        // Introduction, conflict, resolution, etc.

// Technical Requirements
equipment: {
  lights: {
    name: string
    quantity: number
    power: number
    accessories: string[]   // Stands, flags, gels, etc.
  }[]
  power: {
    totalWattage: number
    circuits: number
    generators?: boolean
    distribution: string[]  // Extension cords, distro boxes
  }
  crew: {
    gaffer: boolean
    electricians: number
    grips: number
    specialSkills: string[] // Rigging, effects, etc.
  }
  setupTime: number         // Minutes to set up
  strikeTime: number        // Minutes to tear down
}

// Camera Considerations
camera: {
  exposureSettings: {
    iso: number[]           // Recommended ISO range
    aperture: string[]      // Recommended f-stops
    shutterSpeed: string[]  // Recommended shutter speeds
  }
  whiteBalance: number      // Kelvin setting
  colorSpace: string        // Rec709, LogC, etc.
  dynamicRange: string      // How much DR needed
  specialConsiderations: string[] // High speed, low light, etc.
}

// Safety & Regulations
safety: {
  heatGeneration: 'low' | 'medium' | 'high' | 'extreme'
  ventilationNeeded: boolean
  fireHazard: 'low' | 'medium' | 'high'
  electricalLoad: number    // Amps required
  specialPrecautions: string[]
  permits: string[]         // Special permits needed
}

// Cost & Budget
budget: {
  equipmentCost: number     // Daily rental cost
  crewCost: number         // Labor cost
  powerCost: number        // Electrical cost
  totalCost: number        // All-in daily cost
  currency: string
  budgetCategory: string   // Which department budget
}

// Story Integration
storyContext: string          // How lighting serves narrative
symbolism: string            // What the lighting represents
characterDevelopment: string  // How it reveals character
genreConventions: string[]   // Genre-specific lighting rules
visualMetaphors: string[]    // Symbolic lighting elements
```

### 2. Image Generation Prompts
**Lighting-focused prompting:**

```typescript
// Base prompt structure for lighting
const lightingPromptTemplate = `
{LIGHTING_SETUP}, {MOOD} atmosphere, {COLOR_TEMPERATURE} lighting,
{CONTRAST} contrast, {SHADOW_QUALITY} shadows, {TIME_OF_DAY},
{GENRE} style, {LOCATION_TYPE}, professional cinematography,
high detail, cinematic quality
`

// Specialized prompt types
const promptTypes = {
  setup: "Lighting setup diagram showing {LIGHT_POSITIONS} and {EQUIPMENT}",
  mood: "Cinematic scene with {LIGHTING_SETUP}, {MOOD} atmosphere, {GENRE} style",
  comparison: "Lighting comparison showing {SETUP_A} vs {SETUP_B} on same subject",
  technical: "Technical lighting reference showing {SHADOWS} and {HIGHLIGHTS}",
  practical: "Practical lighting setup in {LOCATION} with {PRACTICAL_SOURCES}",
  portrait: "Portrait lighting using {SETUP}, showing skin tones and shadows"
}

// Lighting quality descriptors
const lightingQualities = {
  soft: "soft diffused lighting with gradual shadow falloff",
  hard: "hard directional lighting with sharp defined shadows",
  dramatic: "high contrast dramatic lighting with deep shadows",
  natural: "natural realistic lighting mimicking available light",
  stylized: "stylized artistic lighting with creative color and contrast"
}
```

### 3. API Endpoints Adaptation
**Lighting-specific endpoints:**

```typescript
// Core lighting management
POST /api/v1/lighting/create
PUT /api/v1/lighting/{id}/update
GET /api/v1/lighting/{id}
DELETE /api/v1/lighting/{id}

// Lighting discovery and search
POST /api/v1/lighting/search
POST /api/v1/lighting/query
GET /api/v1/lighting/by-project/{projectId}
GET /api/v1/lighting/by-mood/{mood}
GET /api/v1/lighting/by-genre/{genre}
GET /api/v1/lighting/by-scene-type/{sceneType}

// Image generation for lighting
POST /api/v1/lighting/{id}/generate-setup-diagram
POST /api/v1/lighting/{id}/generate-mood-reference
POST /api/v1/lighting/{id}/generate-comparison
POST /api/v1/lighting/{id}/generate-technical-reference
POST /api/v1/lighting/{id}/generate-practical-example
POST /api/v1/lighting/{id}/generate-portrait-test

// Technical specifications
GET /api/v1/lighting/{id}/equipment-list
GET /api/v1/lighting/{id}/power-requirements
GET /api/v1/lighting/{id}/crew-requirements
POST /api/v1/lighting/{id}/cost-estimate
GET /api/v1/lighting/{id}/safety-requirements

// Scene integration
POST /api/v1/lighting/match-scene-requirements
GET /api/v1/lighting/by-location/{locationId}
POST /api/v1/lighting/{id}/scene-applications
GET /api/v1/lighting/mood-suggestions/{mood}

// Production planning
POST /api/v1/lighting/{id}/schedule-test
GET /api/v1/lighting/{id}/setup-checklist
POST /api/v1/lighting/{id}/execution-notes
```

### 4. UI Component Updates
**Lighting-focused interface:**

```typescript
// Main lighting components
LightingCard.tsx             // Display lighting setup with mood image
LightingDetailView.tsx       // Full setup specs and technical info
LightingCreationForm.tsx     // Form for creating new setups
LightingSearchInterface.tsx  // Search with mood/genre filters
LightingMoodBoard.tsx        // Visual mood board of lighting styles

// Specialized components
MoodSelector.tsx
GenreStyleGuide.tsx
EquipmentCalculator.tsx
PowerRequirements.tsx
SafetyChecker.tsx
BudgetEstimator.tsx
SetupTimer.tsx
CrewPlanner.tsx

// Image generation components
SetupDiagramGenerator.tsx
MoodReferenceGenerator.tsx
ComparisonGenerator.tsx
TechnicalReferenceGenerator.tsx
PracticalExampleGenerator.tsx
PortraitTestGenerator.tsx

// Production components
LightingScheduler.tsx
EquipmentTracker.tsx
CrewScheduler.tsx
SafetyChecker.tsx
BudgetTracker.tsx
```

### 5. Story Integration Points
**Lighting-narrative connections:**

```typescript
// Story context integration
interface LightingStoryIntegration {
  narrativeFunction: string    // Reveals character, advances plot, creates mood
  emotionalJourney: string[]   // How lighting supports story arc
  symbolism: string           // What the lighting represents thematically
  characterDevelopment: string // How lighting reveals character
  genreConventions: string[]  // Genre-specific lighting expectations
  visualMetaphors: string[]   // Symbolic lighting elements
}

// Scene-lighting relationships
interface SceneLightingMatch {
  sceneId: string
  lightingId: string
  importance: 'critical' | 'important' | 'supporting' | 'background'
  requirements: string[]      // Specific needs for this scene
  adaptations: string[]       // Modifications needed for scene
  matchScore: number         // How well lighting fits scene
}
```

### 6. Consistency Checking Logic
**Lighting-specific validation:**

```typescript
// Visual consistency checks
- Color temperature consistency across scenes
- Mood and atmosphere continuity
- Shadow direction and quality consistency
- Contrast level appropriateness
- Genre convention adherence

// Technical consistency checks
- Equipment availability and compatibility
- Power requirement feasibility
- Crew skill level requirements
- Safety regulation compliance
- Budget constraint adherence

// Narrative consistency checks
- Mood alignment with story beats
- Character lighting consistency
- Time of day logic
- Location lighting appropriateness
- Genre expectation fulfillment
```

### 7. Reference Management System
**Lighting asset organization:**

```typescript
// Image gallery structure
interface LightingImageGallery {
  setupDiagrams: MediaItem[]      // Technical setup diagrams
  moodReferences: MediaItem[]     // Cinematic mood examples
  comparisons: MediaItem[]        // Before/after, variations
  technicalReferences: MediaItem[] // Shadow/highlight examples
  practicalExamples: MediaItem[]  // Real-world applications
  portraitTests: MediaItem[]      // Portrait lighting tests
  equipmentPhotos: MediaItem[]    // Equipment setup photos
  resultExamples: MediaItem[]     // Final cinematic results
}

// Reference categorization
interface LightingReference {
  referenceType: 'setup' | 'mood' | 'comparison' | 'technical' | 'practical' | 'portrait'
  mood: string                   // Emotional quality
  genre: string                 // Film genre context
  complexity: string            // Simple, moderate, complex
  location: string              // Studio, interior, exterior
  timeOfDay: string            // Dawn, day, dusk, night
  isMasterReference: boolean    // Primary reference for this setup
  technicalAccuracy: boolean    // Technically accurate representation
  qualityScore: number          // Technical and artistic quality
  usabilityScore: number        // How practical for production
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
DATABASE_URI=mongodb://127.0.0.1/lighting-lookbook-library
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

This comprehensive plan provides the foundation for creating a robust Lighting Lookbook Library that serves the unique needs of cinematographic lighting design and technical planning for movie production.
