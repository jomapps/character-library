# Crowd Library - Implementation Plan

## Overview
The Crowd Library will manage background actors, extras, and crowd scenes for movie production. It provides comprehensive crowd management, casting, and coordination tools for consistent background action and atmosphere.

## Core Functionality Adaptation

### 1. Database Schema Changes
**From Character-focused to Crowd-focused:**

```typescript
// Primary Crowd Fields
name: string                    // Crowd name (e.g., "Victorian Street Crowd", "Modern Office Workers")
crowdId: string                // Unique identifier (auto-generated from name)
status: 'casting' | 'booked' | 'ready' | 'used' | 'archived'

// Crowd Classification
category: 'pedestrian' | 'audience' | 'workers' | 'party' | 'protest' | 'military' | 'other'
subcategory: string            // Street crowd, concert audience, office workers, etc.
crowdType: 'background' | 'featured' | 'interactive' | 'atmospheric'
size: 'small' | 'medium' | 'large' | 'massive'
era: string                   // Medieval, Victorian, 1920s, Modern, Futuristic

// Demographics
demographics: {
  totalCount: number          // Total number of people
  ageRanges: {
    children: number          // Under 18
    youngAdults: number       // 18-30
    adults: number           // 31-50
    seniors: number          // 50+
  }
  gender: {
    male: number
    female: number
    nonBinary: number
  }
  ethnicity: {
    diverse: boolean
    specific: string[]        // Specific ethnic requirements
    representation: string   // Proportional, specific, etc.
  }
  physicalTypes: {
    athletic: number
    average: number
    heavyset: number
    tall: number
    short: number
    disabled: number
  }
}

// Wardrobe & Appearance
appearance: {
  wardrobeStyle: string[]     // Business, casual, period, uniform
  colorPalette: string[]      // Dominant colors for crowd
  socialClass: string[]       // Upper, middle, working class mix
  uniformity: 'uniform' | 'varied' | 'mixed'
  seasonality: string[]       // Summer, winter clothing
  accessories: string[]       // Hats, bags, props they carry
  grooming: string[]         // Hair, makeup standards
}

// Behavior & Actions
behavior: {
  activity: string[]          // Walking, sitting, working, celebrating
  energy: 'low' | 'medium' | 'high' | 'varied'
  interaction: 'individual' | 'small_groups' | 'collective'
  movement: {
    pattern: string[]         // Random, directed, choreographed
    speed: 'slow' | 'normal' | 'fast' | 'varied'
    direction: string[]       // Specific movement directions
    density: 'sparse' | 'moderate' | 'dense' | 'packed'
  }
  reactions: {
    toCamera: 'ignore' | 'aware' | 'reactive'
    toAction: string[]        // How they react to main action
    emotional: string[]       // Happy, concerned, excited, etc.
  }
}

// Scene Integration
sceneContext: {
  location: string            // Where the crowd appears
  timeOfDay: string          // Morning, afternoon, evening, night
  weather: string[]          // Sunny, rainy, cold, hot
  event: string              // What's happening in the scene
  relationship: string       // How crowd relates to main action
  visibility: 'background' | 'midground' | 'foreground' | 'mixed'
  focus: 'out_of_focus' | 'soft_focus' | 'sharp' | 'selective'
}

// Casting Requirements
casting: {
  experience: 'none' | 'some' | 'experienced' | 'professional'
  skills: string[]           // Dancing, sports, specific abilities
  availability: {
    dates: Date[]            // Available shooting dates
    duration: number         // Hours per day
    flexibility: string      // Schedule flexibility
  }
  special: {
    languages: string[]      // Languages spoken
    accents: string[]        // Accent requirements
    talents: string[]        // Special talents needed
    restrictions: string[]   // Age, physical, etc.
  }
  union: {
    required: boolean        // Union membership required
    rates: string           // Union vs non-union rates
    regulations: string[]   // Union regulations to follow
  }
}

// Direction & Coordination
direction: {
  briefing: {
    duration: number         // Minutes for crowd briefing
    complexity: string       // Simple, moderate, complex
    language: string[]       // Languages for briefing
    materials: string[]      // Handouts, diagrams, etc.
  }
  coordination: {
    assistants: number       // ADs needed for crowd
    zones: number           // Crowd control zones
    communication: string[] // Radios, megaphones, etc.
    safety: string[]        // Safety briefing points
  }
  choreography: {
    needed: boolean
    complexity: string      // Simple, moderate, complex
    rehearsal: number       // Rehearsal time needed
    coordinator: boolean    // Choreographer needed
  }
}

// Safety & Logistics
safety: {
  hazards: string[]          // Potential safety issues
  equipment: string[]        // Safety equipment needed
  medical: boolean          // Medical personnel required
  insurance: string[]       // Insurance requirements
  permits: string[]         // Special permits needed
  evacuation: string        // Evacuation plan
}
logistics: {
  transportation: {
    needed: boolean
    capacity: number        // People to transport
    distance: string        // Transport distance
    parking: number         // Parking spaces needed
  }
  catering: {
    meals: number           // Number of meals
    dietary: string[]       // Dietary restrictions
    timing: string[]        // Meal timing
  }
  facilities: {
    restrooms: number       // Additional restrooms needed
    changing: number        // Changing areas needed
    holding: string         // Holding area requirements
    weather: string[]       // Weather protection
  }
}

// Budget & Compensation
budget: {
  rates: {
    hourly: number          // Hourly rate per person
    daily: number           // Daily rate per person
    overtime: number        // Overtime rate
    special: number         // Special skills premium
  }
  additional: {
    wardrobe: number        // Wardrobe allowance
    transportation: number  // Transport reimbursement
    meals: number          // Meal costs
    parking: number        // Parking reimbursement
  }
  total: {
    perPerson: number       // Total cost per person
    perDay: number         // Total daily cost
    total: number          // Total crowd cost
  }
  currency: string
}

// Story Integration
story: {
  narrativeFunction: string   // Atmosphere, scale, realism
  emotionalTone: string[]    // Joy, tension, normalcy, etc.
  characterInteraction: string[] // How they interact with leads
  plotRelevance: string      // Background, supporting, integral
  symbolism: string[]        // What the crowd represents
  genreConventions: string[] // Genre-specific crowd expectations
}

// Quality Standards
quality: {
  authenticity: string       // Period accuracy, cultural accuracy
  performance: string        // Natural, directed, choreographed
  consistency: string[]      // Wardrobe, behavior, energy
  integration: string        // How well they blend with scene
  professionalism: string[]  // Punctuality, direction-following
}
```

### 2. Image Generation Prompts
**Crowd-focused prompting:**

```typescript
// Base prompt structure for crowds
const crowdPromptTemplate = `
{CROWD_TYPE}, {SIZE} crowd, {ERA} period, {LOCATION_TYPE},
{ACTIVITY} activity, {WARDROBE_STYLE} clothing, {ENERGY_LEVEL} energy,
{DEMOGRAPHICS} demographics, {LIGHTING_CONDITIONS}, {CAMERA_ANGLE},
professional cinematography, background action, realistic crowd behavior
`

// Specialized prompt types
const promptTypes = {
  overview: "Wide shot of {CROWD} in {LOCATION}, showing {ACTIVITY} and {MOVEMENT}",
  detail: "Medium shot of {CROWD_SECTION}, showing {WARDROBE} and {BEHAVIOR}",
  interaction: "{CROWD} reacting to {MAIN_ACTION}, {EMOTIONAL_RESPONSE}",
  atmosphere: "Atmospheric shot of {CROWD} creating {MOOD} in {SETTING}",
  reference: "Crowd reference showing {DEMOGRAPHICS} and {WARDROBE_STYLE}",
  movement: "Dynamic shot of {CROWD} in {MOVEMENT_PATTERN}, {ENERGY} energy"
}

// Crowd behavior descriptors
const crowdBehaviors = {
  natural: "natural realistic crowd behavior with organic movement",
  directed: "directed crowd behavior following specific choreography",
  reactive: "reactive crowd behavior responding to main action",
  atmospheric: "atmospheric crowd creating background ambiance"
}
```

### 3. API Endpoints Adaptation
**Crowd-specific endpoints:**

```typescript
// Core crowd management
POST /api/v1/crowd/create
PUT /api/v1/crowd/{id}/update
GET /api/v1/crowd/{id}
DELETE /api/v1/crowd/{id}

// Crowd discovery and search
POST /api/v1/crowd/search
POST /api/v1/crowd/query
GET /api/v1/crowd/by-project/{projectId}
GET /api/v1/crowd/by-category/{category}
GET /api/v1/crowd/by-size/{size}
GET /api/v1/crowd/by-era/{era}

// Image generation for crowds
POST /api/v1/crowd/{id}/generate-overview-shot
POST /api/v1/crowd/{id}/generate-detail-shot
POST /api/v1/crowd/{id}/generate-interaction-shot
POST /api/v1/crowd/{id}/generate-atmosphere-shot
POST /api/v1/crowd/{id}/generate-reference-shot
POST /api/v1/crowd/{id}/generate-movement-shot

// Casting management
GET /api/v1/crowd/{id}/casting-requirements
POST /api/v1/crowd/{id}/casting-call
PUT /api/v1/crowd/{id}/casting-status
GET /api/v1/crowd/{id}/availability-check

// Production planning
POST /api/v1/crowd/{id}/schedule-estimate
GET /api/v1/crowd/{id}/logistics-requirements
POST /api/v1/crowd/{id}/budget-estimate
GET /api/v1/crowd/{id}/safety-requirements
POST /api/v1/crowd/{id}/coordination-plan

// Direction support
GET /api/v1/crowd/{id}/briefing-materials
POST /api/v1/crowd/{id}/direction-notes
GET /api/v1/crowd/{id}/coordination-requirements
```

### 4. UI Component Updates
**Crowd-focused interface:**

```typescript
// Main crowd components
CrowdCard.tsx               // Display crowd with size and type
CrowdDetailView.tsx        // Full crowd specs and requirements
CrowdCreationForm.tsx      // Form for creating new crowds
CrowdSearchInterface.tsx   // Search with size/category filters
CrowdLibraryView.tsx       // Overview of all crowd types

// Casting components
DemographicsSelector.tsx
CastingRequirements.tsx
AvailabilityTracker.tsx
UnionCompliance.tsx
RateCalculator.tsx

// Direction components
BehaviorPlanner.tsx
MovementChoreographer.tsx
CoordinationPlanner.tsx
BriefingMaterials.tsx
SafetyPlanner.tsx

// Image generation components
OverviewShotGenerator.tsx
DetailShotGenerator.tsx
InteractionShotGenerator.tsx
AtmosphereShotGenerator.tsx
ReferenceShotGenerator.tsx
MovementShotGenerator.tsx

// Production components
LogisticsPlanner.tsx
BudgetCalculator.tsx
ScheduleCoordinator.tsx
SafetyManager.tsx
```

### 5. Story Integration Points
**Crowd-narrative connections:**

```typescript
// Story context integration
interface CrowdStoryIntegration {
  narrativeFunction: string    // Atmosphere, scale, authenticity
  emotionalContribution: string[] // Mood, energy, tension
  characterSupport: string    // How they support main characters
  plotRelevance: string      // Background, supporting, integral
  symbolism: string[]        // What the crowd represents
  genreExpectations: string[] // Genre-specific crowd conventions
}

// Scene-crowd relationships
interface SceneCrowdMatch {
  sceneId: string
  crowdId: string
  visibility: 'background' | 'midground' | 'foreground'
  activity: string           // What the crowd is doing
  interaction: string        // How they interact with main action
  importance: 'atmospheric' | 'supporting' | 'integral'
  duration: number          // Screen time in seconds
}
```

### 6. Consistency Checking Logic
**Crowd-specific validation:**

```typescript
// Visual consistency checks
- Wardrobe style consistency across scenes
- Demographic representation consistency
- Behavior and energy level consistency
- Period and cultural accuracy
- Scale and proportion appropriateness

// Casting consistency checks
- Availability across shooting schedule
- Union compliance requirements
- Budget constraint adherence
- Skill and experience requirements
- Safety and insurance compliance

// Story consistency checks
- Crowd behavior logic for scene context
- Emotional tone appropriateness
- Character interaction believability
- Genre convention adherence
- Narrative function fulfillment
```

### 7. Reference Management System
**Crowd asset organization:**

```typescript
// Image gallery structure
interface CrowdImageGallery {
  overviewShots: MediaItem[]      // Wide shots showing full crowd
  detailShots: MediaItem[]        // Medium shots of crowd sections
  interactionShots: MediaItem[]   // Crowd interacting with main action
  atmosphereShots: MediaItem[]    // Atmospheric crowd shots
  referenceShots: MediaItem[]     // Casting and wardrobe references
  movementShots: MediaItem[]      // Dynamic movement shots
  behaviorExamples: MediaItem[]   // Behavior and activity examples
  wardrobeReferences: MediaItem[] // Wardrobe and styling references
}

// Reference categorization
interface CrowdReference {
  referenceType: 'overview' | 'detail' | 'interaction' | 'atmosphere' | 'reference' | 'movement'
  size: string                   // Small, medium, large, massive
  activity: string              // What the crowd is doing
  demographics: string          // Age, gender, ethnicity mix
  wardrobe: string             // Clothing style and period
  behavior: string             // Energy and interaction level
  isMasterReference: boolean    // Primary reference for this crowd
  castingApproved: boolean     // Approved for casting use
  qualityScore: number         // Technical and artistic quality
  authenticityScore: number    // Period and cultural accuracy
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
DATABASE_URI=mongodb://127.0.0.1/crowd-library
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

This comprehensive plan provides the foundation for creating a robust Crowd Library that serves the unique needs of background actor management, casting, and coordination for movie production.
