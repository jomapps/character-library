# Wardrobe Library - Implementation Plan

## Overview
The Wardrobe Library will manage all clothing, costumes, and accessories for movie production. Unlike other libraries, it maintains strong character relationships while adding specialized costume design, sizing, continuity, and stunt considerations.

## Core Functionality Adaptation

### 1. Database Schema Changes
**Character-relationship preserved with wardrobe-specific enhancements:**

```typescript
// Primary Wardrobe Fields
name: string                    // Garment name (e.g., "Victorian Evening Gown", "Police Uniform")
wardrobeId: string             // Unique identifier (auto-generated from name)
status: 'available' | 'in_use' | 'cleaning' | 'repair' | 'retired'

// Character Relationships (PRESERVED)
characterAssignments: {
  characterId: string          // Which character wears this
  characterName: string        // Character name for reference
  exclusivity: 'exclusive' | 'shared' | 'background'
  fittingStatus: 'fitted' | 'needs_fitting' | 'alterations_needed'
  approvalStatus: 'approved' | 'pending' | 'rejected'
}[]

// Garment Classification
category: 'outerwear' | 'tops' | 'bottoms' | 'dresses' | 'uniforms' | 'accessories' | 'shoes' | 'undergarments'
subcategory: string            // Jacket, shirt, pants, hat, jewelry, etc.
garmentType: 'hero' | 'stunt' | 'background' | 'photo_double'
era: string                   // Medieval, Victorian, 1920s, Modern, Futuristic
style: string                 // Formal, casual, work, evening, ceremonial

// Sizing & Fit Information
sizing: {
  standard: {
    size: string              // XS, S, M, L, XL, or numeric sizes
    measurements: {
      chest?: number          // Chest/bust measurement
      waist?: number          // Waist measurement
      hips?: number           // Hip measurement
      inseam?: number         // Inseam for pants
      sleeve?: number         // Sleeve length
      neck?: number           // Neck size for shirts
      head?: number           // Hat size
      foot?: number           // Shoe size
    }
    units: 'inches' | 'centimeters'
  }
  alterations: {
    needed: boolean
    description: string[]     // What alterations are required
    completed: boolean
    alteredBy: string        // Tailor/seamstress name
    alterationDate?: Date
  }
  fit: {
    quality: 'perfect' | 'good' | 'acceptable' | 'poor'
    notes: string           // Specific fit issues or notes
    lastFitting: Date
    nextFitting?: Date
  }
}

// Material & Construction
materials: {
  primary: string[]           // Cotton, wool, silk, leather, synthetic
  secondary?: string[]        // Lining, trim, hardware materials
  care: string[]             // Dry clean only, hand wash, machine wash
  durability: 'delicate' | 'normal' | 'heavy_duty' | 'stunt_ready'
  breathability: 'high' | 'medium' | 'low'
  stretch: boolean
  waterResistant: boolean
}
construction: {
  quality: 'couture' | 'high_end' | 'standard' | 'budget'
  handmade: boolean
  reinforcements: string[]    // Areas with extra stitching/support
  closures: string[]         // Buttons, zippers, velcro, snaps
  pockets: number
  removableParts: string[]   // Detachable collars, sleeves, etc.
}

// Visual Characteristics
appearance: {
  colors: {
    primary: string
    secondary?: string[]
    pattern?: string          // Solid, striped, plaid, floral, etc.
    patternDescription?: string
  }
  texture: string[]          // Smooth, rough, shiny, matte, textured
  condition: 'pristine' | 'good' | 'worn' | 'distressed' | 'damaged'
  aging: {
    intentional: boolean     // Deliberately aged for character
    level: string           // Light, moderate, heavy aging
    techniques: string[]    // Tea staining, sandpaper, etc.
  }
}

// Scene & Continuity Tracking
sceneUsage: {
  sceneId: string
  sceneNumber: string
  shootingDate: Date
  condition: string          // Condition needed for this scene
  continuityNotes: string[]  // Important continuity details
  changes: string[]          // Damage, dirt, blood, etc. added
  resetRequired: boolean     // Needs cleaning/repair after scene
}[]
continuityTracking: {
  baselinePhotos: string[]   // Reference photos for continuity
  changeLog: {
    date: Date
    scene: string
    changes: string[]
    reversible: boolean
  }[]
  currentState: string       // Current condition and modifications
}

// Stunt & Safety Considerations
stuntCompatibility: {
  stuntReady: boolean        // Safe for stunt work
  modifications: string[]    // Padding, reinforcement, breakaway parts
  restrictions: string[]     // What stunts it can't be used for
  safetyFeatures: string[]  // Fire retardant, padding, etc.
  doubleRequired: boolean    // Needs stunt double version
}
safetyCompliance: {
  fireRetardant: boolean
  allergenFree: boolean
  childSafe: boolean        // If worn by child actors
  certifications: string[]  // Safety standards met
}

// Production Logistics
availability: {
  shootingSchedule: {
    startDate: Date
    endDate: Date
    scenes: string[]
  }[]
  maintenanceSchedule: {
    cleaning: Date[]
    repairs: Date[]
    fittings: Date[]
  }
  restrictions: string[]     // Weather, location, time restrictions
}
storage: {
  location: string          // Wardrobe trailer, studio, etc.
  requirements: string[]    // Hanging, flat, climate control
  accessibility: string     // How quickly it can be retrieved
  protection: string[]      // Garment bags, boxes, hangers
}

// Cost & Budget Tracking
financial: {
  purchasePrice?: number
  rentalCost?: number
  alterationCosts: number[]
  cleaningCosts: number[]
  insuranceValue: number
  currency: string
  budgetCategory: string    // Which department budget
}

// Period & Historical Accuracy
historicalContext: {
  period: string            // Specific historical period
  region: string           // Geographic/cultural context
  socialClass: string      // Upper, middle, working class
  occasion: string         // Daily wear, formal, work, ceremonial
  accuracy: {
    historical: boolean     // Historically accurate
    artistic: boolean      // Stylized for artistic effect
    research: string[]     // Reference sources used
  }
}
```

### 2. Image Generation Prompts
**Wardrobe-focused prompting:**

```typescript
// Base prompt structure for wardrobe
const wardrobePromptTemplate = `
{GARMENT_NAME}, {MATERIALS} {CATEGORY}, {ERA} period, 
{STYLE} style, {COLOR} {PATTERN}, {CONDITION} condition,
{LIGHTING_SETUP}, {BACKGROUND_CONTEXT}, {DISPLAY_METHOD},
professional fashion photography, high detail, studio quality
`

// Specialized prompt types
const promptTypes = {
  hero: "Hero shot of {GARMENT}, dramatic fashion lighting, pristine condition, model wearing",
  flat: "Flat lay of {GARMENT}, even lighting, showing construction details and pattern",
  detail: "Close-up detail of {GARMENT}, showing {MATERIALS} texture and {CONSTRUCTION} quality",
  fitting: "{GARMENT} being worn by {CHARACTER}, showing fit and styling",
  continuity: "{GARMENT} in {CONDITION} for scene continuity reference",
  stunt: "Stunt version of {GARMENT}, showing safety modifications and reinforcements"
}

// Display methods for different garment types
const displayMethods = {
  dresses: "on dress form or model",
  suits: "on mannequin showing full silhouette", 
  accessories: "arranged on neutral background",
  shoes: "paired and angled to show profile",
  hats: "on hat stand or model",
  jewelry: "on jewelry display or model"
}
```

### 3. API Endpoints Adaptation
**Wardrobe-specific endpoints:**

```typescript
// Core wardrobe management
POST /api/v1/wardrobe/create
PUT /api/v1/wardrobe/{id}/update
GET /api/v1/wardrobe/{id}
DELETE /api/v1/wardrobe/{id}

// Character-wardrobe relationships (PRESERVED)
GET /api/v1/wardrobe/by-character/{characterId}
POST /api/v1/wardrobe/{id}/assign-character
PUT /api/v1/wardrobe/{id}/character-assignment
DELETE /api/v1/wardrobe/{id}/unassign-character

// Wardrobe discovery and search
POST /api/v1/wardrobe/search
POST /api/v1/wardrobe/query
GET /api/v1/wardrobe/by-project/{projectId}
GET /api/v1/wardrobe/by-category/{category}
GET /api/v1/wardrobe/by-era/{era}
GET /api/v1/wardrobe/by-scene/{sceneId}

// Image generation for wardrobe
POST /api/v1/wardrobe/{id}/generate-hero-shot
POST /api/v1/wardrobe/{id}/generate-flat-lay
POST /api/v1/wardrobe/{id}/generate-detail-shot
POST /api/v1/wardrobe/{id}/generate-fitting-reference
POST /api/v1/wardrobe/{id}/generate-continuity-shot
POST /api/v1/wardrobe/{id}/generate-stunt-version

// Fitting and alterations
POST /api/v1/wardrobe/{id}/schedule-fitting
PUT /api/v1/wardrobe/{id}/fitting-notes
POST /api/v1/wardrobe/{id}/alteration-request
GET /api/v1/wardrobe/{id}/alteration-status

// Continuity tracking
POST /api/v1/wardrobe/{id}/continuity-photo
PUT /api/v1/wardrobe/{id}/scene-condition
GET /api/v1/wardrobe/{id}/continuity-history
POST /api/v1/wardrobe/{id}/reset-condition

// Production management
GET /api/v1/wardrobe/{id}/availability
PUT /api/v1/wardrobe/{id}/schedule
POST /api/v1/wardrobe/{id}/maintenance-log
GET /api/v1/wardrobe/cleaning-schedule
```

### 4. UI Component Updates
**Wardrobe-focused interface:**

```typescript
// Main wardrobe components
WardrobeCard.tsx             // Display garment with character assignment
WardrobeDetailView.tsx       // Full garment specs and fitting info
WardrobeCreationForm.tsx     // Form for adding new garments
WardrobeSearchInterface.tsx  // Search with size/character filters
CharacterWardrobeView.tsx    // All garments for specific character

// Character relationship components (PRESERVED)
CharacterAssignment.tsx      // Assign garments to characters
FittingScheduler.tsx        // Schedule and track fittings
AlterationTracker.tsx       // Track alteration needs and progress
ApprovalWorkflow.tsx        // Costume approval process

// Specialized components
SizingCalculator.tsx
MaterialSelector.tsx
PeriodStyleGuide.tsx
ContinuityTracker.tsx
StuntSafetyChecker.tsx
CleaningScheduler.tsx
BudgetTracker.tsx

// Image generation components
HeroShotGenerator.tsx
FlatLayGenerator.tsx
DetailShotGenerator.tsx
FittingReferenceGenerator.tsx
ContinuityShotGenerator.tsx
StuntVersionGenerator.tsx

// Production components
WardrobeCalendar.tsx
SceneBreakdown.tsx
MaintenanceScheduler.tsx
CostTracker.tsx
```

### 5. Story Integration Points
**Wardrobe-character-narrative connections:**

```typescript
// Enhanced story context integration
interface WardrobeStoryIntegration {
  characterDevelopment: string  // How costume reflects character growth
  narrativeFunction: string    // Disguise, status symbol, plot device
  emotionalJourney: string[]   // How costume supports character arc
  symbolism: string           // What the costume represents
  transformation: string[]    // Costume changes throughout story
  socialContext: string       // Class, profession, culture indication
}

// Scene-wardrobe relationships
interface SceneWardrobeRelationship {
  sceneId: string
  wardrobeId: string
  characterId: string         // Which character wears it
  importance: 'critical' | 'important' | 'supporting' | 'background'
  condition: string          // Required condition for scene
  continuityRequirements: string[] // Specific continuity needs
  changesDuring: string[]    // Damage/changes that occur in scene
}
```

### 6. Consistency Checking Logic
**Wardrobe-specific validation:**

```typescript
// Visual consistency checks
- Color and pattern consistency across shots
- Fit and styling consistency
- Condition progression continuity
- Lighting and fabric appearance consistency
- Character-costume pairing validation

// Character relationship validation
- Character size compatibility
- Character personality alignment
- Character arc progression through costume
- Multiple character conflicts (same costume)
- Exclusive assignment enforcement

// Production consistency checks
- Availability during character's scenes
- Cleaning and maintenance scheduling
- Alteration completion before shooting
- Stunt safety compliance
- Budget and cost tracking
```

### 7. Reference Management System
**Wardrobe asset organization:**

```typescript
// Image gallery structure
interface WardrobeImageGallery {
  heroShots: MediaItem[]          // Fashion photography style shots
  flatLays: MediaItem[]           // Laid flat showing construction
  detailShots: MediaItem[]        // Close-ups of materials/construction
  fittingReferences: MediaItem[]  // On character/model showing fit
  continuityShots: MediaItem[]    // Current condition for continuity
  stuntVersions: MediaItem[]      // Safety-modified versions
  alterationProgress: MediaItem[] // Before/during/after alterations
  careInstructions: MediaItem[]   // Cleaning and maintenance guides
}

// Reference categorization
interface WardrobeReference {
  referenceType: 'hero' | 'flat' | 'detail' | 'fitting' | 'continuity' | 'stunt'
  characterContext: string       // Which character wearing it
  condition: string             // Current condition state
  fittingStage: string         // Pre-fitting, fitted, altered
  sceneContext?: string        // Specific scene if applicable
  lightingSetup: string        // Studio, natural, dramatic
  isMasterReference: boolean   // Primary reference for this garment
  continuityApproved: boolean  // Approved for continuity use
  qualityScore: number         // Technical and artistic quality
  fitAccuracy: number          // How well it fits the character
}
```

### 8. Domain-Specific Fields
**Unique wardrobe attributes:**

```typescript
// Comfort and wearability
comfort: {
  breathability: 'excellent' | 'good' | 'poor'
  flexibility: 'full_range' | 'limited' | 'restrictive'
  weight: 'light' | 'medium' | 'heavy'
  temperature: 'cool' | 'neutral' | 'warm'
  irritation: string[]        // Potential skin irritation issues
}

// Performance characteristics
performance: {
  durability: number          // Expected number of wears
  washability: string[]       // Care instructions
  wrinkleResistance: 'high' | 'medium' | 'low'
  colorFastness: 'excellent' | 'good' | 'poor'
  shrinkage: 'none' | 'minimal' | 'significant'
}

// Cultural and social context
culturalSignificance: {
  region: string             // Geographic origin
  tradition: string          // Cultural tradition represented
  ceremony: string           // Ceremonial significance
  taboos: string[]          // Cultural restrictions or sensitivities
  modernization: string     // How it's been adapted for modern use
}

// Psychological impact
psychologicalEffect: {
  characterConfidence: string // How it affects character's confidence
  audiencePerception: string // How audience should perceive character
  powerDynamic: string      // Authority, submission, equality
  attractiveness: string    // Intended attractiveness level
  approachability: string   // Friendly, intimidating, neutral
}
```

### 9. Integration with External Services
**Maintain existing services plus wardrobe-specific:**

```typescript
// Existing services maintained
// Fal.ai for wardrobe image generation
// OpenRouter for wardrobe description enhancement
// Cloudflare R2 for wardrobe image storage
// DINOv3 for wardrobe visual consistency
// PathRAG for wardrobe knowledge management

// Wardrobe-specific service enhancements
interface WardrobeServices {
  sizingAPI: string           // Size conversion and fitting algorithms
  fabricDatabase: string     // Material properties and care instructions
  fashionHistory: string     // Historical accuracy verification
  colorMatching: string      // Color coordination and palette tools
  cleaningServices: string   // Professional cleaning and care
  alterationNetwork: string  // Tailoring and alteration services
}
```

### 10. Quality Metrics
**Wardrobe-specific quality assessment:**

```typescript
interface WardrobeQualityMetrics {
  visualConsistency: number      // Consistency across different shots
  fitAccuracy: number           // How well garments fit characters
  historicalAccuracy: number    // Period and cultural correctness
  characterAlignment: number    // How well costume serves character
  productionReadiness: number   // Ready for filming
  continuityCompliance: number  // Meets continuity requirements
  imageQuality: number          // Technical image quality
  versatilityScore: number      // Range of scenes it can support
  maintenanceScore: number      // Ease of care and upkeep
  budgetEfficiency: number      // Cost-effectiveness rating
}
```

## Implementation Priority

### Phase 1: Core Infrastructure
1. Database schema adaptation preserving character relationships
2. Basic CRUD operations for wardrobe items
3. Character assignment and relationship management
4. Image upload and gallery system

### Phase 2: Character Integration
1. Enhanced character-wardrobe relationship tools
2. Fitting scheduling and tracking
3. Alteration workflow management
4. Character-specific wardrobe views

### Phase 3: Production Features
1. Continuity tracking and photo management
2. Scene breakdown and scheduling
3. Cleaning and maintenance workflows
4. Budget and cost tracking

### Phase 4: Advanced Features
1. Stunt safety and modification tracking
2. Historical accuracy verification
3. Advanced search and filtering
4. Production analytics and reporting

## Technical Considerations

### Database Migration Strategy
- Preserve and enhance character relationship functionality
- Create comprehensive wardrobe schema with sizing and fit data
- Maintain existing media and user collections
- Update API routes for wardrobe-specific operations

### Character Relationship Preservation
- Keep existing character assignment patterns
- Enhance with wardrobe-specific relationship data
- Add fitting and alteration tracking
- Maintain character-centric views and workflows

### Image Generation Enhancements
- Develop fashion photography prompt templates
- Create character-specific fitting reference generation
- Implement continuity and condition variation systems
- Add flat lay and detail shot capabilities

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
DATABASE_URI=mongodb://127.0.0.1/wardrobe-library
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

This comprehensive plan provides the foundation for creating a robust Wardrobe Library that maintains the essential character relationships while adding specialized costume design, fitting, and production management capabilities.

### UI/UX Adaptations
- Design wardrobe-centric dashboard maintaining character connections
- Create character-wardrobe assignment interfaces
- Implement fitting and alteration workflow tools
- Add continuity tracking and scene breakdown views
- Design size and measurement management systems

