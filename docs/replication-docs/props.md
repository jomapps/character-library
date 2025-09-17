# Props Library - Implementation Plan

## Overview
The Props Library will manage all physical objects and items used in movie production, from hero props to background set dressing. It provides detailed prop specifications, handling requirements, and visual assets with emphasis on practical usage and safety considerations.

## Core Functionality Adaptation

### 1. Database Schema Changes
**From Character-focused to Prop-focused:**

```typescript
// Primary Prop Fields
name: string                    // Prop name (e.g., "Antique Pocket Watch", "Magic Sword")
propId: string                 // Unique identifier (auto-generated from name)
status: 'available' | 'in_use' | 'damaged' | 'lost' | 'retired'

// Prop Classification
category: 'weapon' | 'furniture' | 'technology' | 'clothing' | 'food' | 'document' | 'art' | 'tool' | 'other'
subcategory: string            // Sword, chair, smartphone, letter, painting, etc.
propType: 'hero' | 'stunt' | 'background' | 'practical' | 'dummy'
era: string                   // Medieval, Victorian, Modern, Futuristic
condition: 'pristine' | 'good' | 'aged' | 'worn' | 'damaged' | 'destroyed'

// Physical Specifications
dimensions: {
  length: number
  width: number
  height: number
  weight: number
  units: 'inches' | 'centimeters'
  weightUnits: 'pounds' | 'kilograms'
}
materials: string[]            // Wood, metal, plastic, fabric, glass, etc.
color: {
  primary: string             // Main color
  secondary?: string[]        // Additional colors
  finish: string             // Matte, glossy, metallic, weathered
}
texture: string[]             // Smooth, rough, carved, embossed, etc.

// Functional Properties
functionality: {
  working: boolean            // Does it actually function?
  movingParts: string[]      // What parts move or operate
  soundEffects: string[]     // Sounds it makes when used
  lightingEffects: string[]  // LEDs, glow, reflection
  specialEffects: string[]   // Smoke, sparks, transformation
}
interactionMethods: string[]   // How actors interact with it
safetyConsiderations: string[] // Sharp edges, weight, fragility

// Production Details
sceneAssociations: string[]    // Which scenes use this prop
characterAssociations: string[] // Which characters handle this prop
storySignificance: string     // Plot importance and meaning
symbolism?: string           // What this prop represents
emotionalContext: string[]    // Joy, fear, mystery, power, etc.

// Practical Considerations
handlingRequirements: {
  specialTraining: boolean    // Requires actor training
  safetyEquipment: string[]  // Gloves, goggles, etc.
  supervision: boolean       // Needs prop master present
  restrictions: string[]     // Age, experience, insurance limits
}
storage: {
  requirements: string[]     // Climate control, security, padding
  location: string          // Where it's currently stored
  accessibility: string     // How easy to retrieve
  insurance: boolean        // Special insurance needed
}
transportation: {
  fragile: boolean          // Needs special handling
  size: 'pocket' | 'handheld' | 'two-person' | 'crane' | 'vehicle'
  packaging: string[]       // Foam, crate, climate control
  restrictions: string[]    // Cannot be shipped, hand-carry only
}

// Condition & Maintenance
wear: {
  expectedLifespan: string   // How long it will last
  currentCondition: string  // Detailed condition notes
  repairHistory: string[]   // Previous repairs and modifications
  replacementParts: string[] // Available spare parts
}
cleaning: {
  methods: string[]         // How to clean safely
  frequency: string         // How often cleaning needed
  restrictions: string[]    // What not to use
}

// Multiples & Variations
quantity: {
  total: number             // How many exist
  available: number         // How many ready for use
  inRepair: number         // How many being fixed
  backup: number           // Spare/duplicate props
}
variations: {
  sizes: string[]          // Different sizes available
  colors: string[]         // Different color versions
  conditions: string[]     // Pristine, aged, damaged versions
  modifications: string[]  // Special versions for specific scenes
}

// Period & Historical Accuracy
historicalPeriod: string     // Specific time period
culturalContext: string     // Geographic/cultural origin
accuracy: {
  historical: boolean       // Historically accurate
  artistic: boolean        // Stylized for artistic effect
  anachronistic: boolean   // Intentionally wrong period
  fantasy: boolean         // Fictional/imaginary item
}
researchNotes: string       // Historical background and references

// Story Integration
plotFunction: string        // How it advances the story
characterDevelopment: string // How it reveals character
thematicSignificance: string // Symbolic meaning
genreCompatibility: string[] // Horror, comedy, action, drama, etc.
```

### 2. Image Generation Prompts
**Prop-focused prompting:**

```typescript
// Base prompt structure for props
const propPromptTemplate = `
{PROP_NAME}, {MATERIALS} {CATEGORY}, {ERA} period, 
{CONDITION} condition, {COLOR} {FINISH}, {TEXTURE} texture,
{LIGHTING_SETUP}, {BACKGROUND_CONTEXT}, {SCALE_REFERENCE},
professional product photography, high detail, studio quality
`

// Specialized prompt types
const promptTypes = {
  hero: "Hero shot of {PROP}, dramatic lighting, pristine condition, isolated background",
  detail: "Close-up detail of {PROP}, showing {TEXTURE} and {MATERIALS}, macro photography",
  context: "{PROP} in {SCENE_CONTEXT}, being used by {CHARACTER}, natural lighting",
  scale: "{PROP} with scale reference, showing true size and proportions",
  condition: "{PROP} showing {WEAR_LEVEL}, realistic aging and use patterns",
  multiple: "Multiple versions of {PROP}, showing {VARIATIONS}, comparison layout"
}

// Lighting setups for different prop types
const propLightingSetups = {
  jewelry: "soft diffused lighting with controlled reflections",
  weapons: "dramatic side lighting emphasizing form and edge",
  documents: "even flat lighting for readability",
  technology: "clean modern lighting with subtle reflections",
  antiques: "warm atmospheric lighting emphasizing age and character",
  food: "appetizing warm lighting with natural shadows"
}
```

### 3. API Endpoints Adaptation
**Prop-specific endpoints:**

```typescript
// Core prop management
POST /api/v1/props/create
PUT /api/v1/props/{id}/update
GET /api/v1/props/{id}
DELETE /api/v1/props/{id}

// Prop discovery and search
POST /api/v1/props/search
POST /api/v1/props/query
GET /api/v1/props/by-project/{projectId}
GET /api/v1/props/by-category/{category}
GET /api/v1/props/by-scene/{sceneId}
GET /api/v1/props/by-character/{characterId}

// Image generation for props
POST /api/v1/props/{id}/generate-hero-shot
POST /api/v1/props/{id}/generate-detail-shot
POST /api/v1/props/{id}/generate-context-shot
POST /api/v1/props/{id}/generate-scale-reference
POST /api/v1/props/{id}/generate-condition-variations
POST /api/v1/props/{id}/generate-multiple-angles

// Prop validation and consistency
POST /api/v1/props/validate-project-consistency
POST /api/v1/props/batch-validate
GET /api/v1/props/{id}/quality-metrics

// Production management
GET /api/v1/props/{id}/availability
PUT /api/v1/props/{id}/checkout
PUT /api/v1/props/{id}/checkin
GET /api/v1/props/{id}/usage-history
POST /api/v1/props/{id}/condition-report
GET /api/v1/props/{id}/handling-requirements

// Inventory management
GET /api/v1/props/inventory/summary
POST /api/v1/props/inventory/audit
GET /api/v1/props/inventory/low-stock
POST /api/v1/props/{id}/maintenance-log
```

### 4. UI Component Updates
**Prop-focused interface:**

```typescript
// Main prop components
PropCard.tsx                 // Display prop summary with key image
PropDetailView.tsx          // Full prop specs and image gallery
PropCreationForm.tsx        // Form for adding new props
PropSearchInterface.tsx     // Advanced search with material/category filters
PropInventoryView.tsx       // Overview of all props and availability

// Specialized components
PropCategorySelector.tsx
MaterialSelector.tsx
ConditionTracker.tsx
HandlingRequirements.tsx
SafetyGuidelines.tsx
StorageTracker.tsx
MaintenanceScheduler.tsx
InventoryManager.tsx

// Image generation components
HeroShotGenerator.tsx
DetailShotGenerator.tsx
ContextShotGenerator.tsx
ScaleReferenceGenerator.tsx
ConditionVariationGenerator.tsx
MultipleAngleGenerator.tsx

// Production components
PropCheckoutSystem.tsx
UsageTracker.tsx
ConditionReporter.tsx
SafetyChecker.tsx
```

### 5. Story Integration Points
**Prop-narrative connections:**

```typescript
// Story context integration
interface PropStoryIntegration {
  narrativeFunction: string    // MacGuffin, weapon, clue, symbol
  characterConnection: string[] // Which characters interact with it
  sceneImportance: string[]   // Critical, supporting, background
  plotAdvancement: string     // How it moves story forward
  symbolism: string          // Thematic meaning and representation
  emotionalResonance: string[] // Fear, comfort, mystery, power
}

// Scene-prop relationships
interface ScenePropRelationship {
  sceneId: string
  propId: string
  usage: 'handled' | 'visible' | 'mentioned' | 'implied'
  importance: 'critical' | 'important' | 'supporting' | 'background'
  condition: string          // What condition needed for this scene
  specialRequirements: string[] // Specific needs for this scene
}
```

### 6. Consistency Checking Logic
**Prop-specific validation:**

```typescript
// Visual consistency checks
- Color and finish consistency across shots
- Scale and proportion accuracy
- Condition progression continuity
- Material appearance consistency
- Lighting and shadow consistency

// Narrative consistency checks
- Prop availability during story timeline
- Character access and ownership logic
- Condition changes match story events
- Period accuracy for historical settings
- Cultural appropriateness validation

// Production consistency checks
- Availability during shooting schedule
- Safety requirements compliance
- Handling qualification verification
- Storage and transportation logistics
- Insurance and legal compliance
```

### 7. Reference Management System
**Prop asset organization:**

```typescript
// Image gallery structure
interface PropImageGallery {
  heroShots: MediaItem[]          // Glamour shots, isolated background
  detailShots: MediaItem[]        // Close-ups showing materials/texture
  contextShots: MediaItem[]       // Props in scene context
  scaleReferences: MediaItem[]    // Size comparison shots
  conditionVariations: MediaItem[] // Different wear levels
  multipleAngles: MediaItem[]     // 360-degree reference views
  usageShots: MediaItem[]         // Being handled/used by actors
  storageShots: MediaItem[]       // How it's stored and packaged
}

// Reference categorization
interface PropReference {
  referenceType: 'hero' | 'detail' | 'context' | 'scale' | 'condition' | 'usage'
  angle: string                  // Specific camera angle
  condition: string             // Current condition state
  context: string               // Studio, set, storage, in-use
  lightingSetup: string         // Studio, natural, dramatic
  scaleReference: boolean       // Includes size reference
  isMasterReference: boolean    // Primary reference for this prop
  handlingSafe: boolean        // Safe for actor handling
  qualityScore: number         // Technical and artistic quality
  accuracyScore: number        // Historical/period accuracy
}
```

### 8. Domain-Specific Fields
**Unique prop attributes:**

```typescript
// Sensory characteristics
tactileProperties: string[]     // Smooth, rough, soft, hard, sticky
weight: {
  actual: number               // Real weight
  perceived: string           // How heavy it feels to handle
  distribution: string        // Balanced, top-heavy, awkward
}
temperature: string           // Warm, cool, neutral, variable
soundProperties: string[]     // Creaks, rattles, silent, musical

// Interactive elements
movingParts: {
  doors: boolean              // Opens/closes
  drawers: boolean           // Pull out sections
  buttons: boolean           // Pressable elements
  switches: boolean          // Toggle mechanisms
  rotating: boolean          // Spinning or turning parts
}
hiddenFeatures: string[]     // Secret compartments, messages, mechanisms
wearPatterns: string[]       // Where it shows use and age

// Cultural and symbolic aspects
culturalSignificance: string  // Religious, ceremonial, traditional meaning
socialStatus: string         // Luxury, common, poverty, professional
genderAssociation: string    // Masculine, feminine, neutral, either
ageAssociation: string       // Child, adult, elderly, timeless
personalityReflection: string // What it says about the owner

// Production logistics
setupTime: string            // How long to prepare for use
breakdown: string           // How long to pack away
specialistRequired: boolean  // Needs expert to operate/maintain
backupRequired: boolean     // Must have duplicates available
```

### 9. Integration with External Services
**Maintain existing services plus prop-specific:**

```typescript
// Existing services
// Fal.ai for prop image generation
// OpenRouter for prop description enhancement
// Cloudflare R2 for prop image storage
// DINOv3 for prop visual consistency
// PathRAG for prop knowledge management

// Prop-specific service enhancements
interface PropServices {
  materialDatabase: string     // Material properties and characteristics
  safetyDatabase: string      // Safety guidelines and regulations
  insuranceAPI: string        // Valuation and coverage information
  inventorySystem: string     // Stock tracking and management
  maintenanceTracker: string  // Repair and upkeep scheduling
  historicalReference: string // Period accuracy verification
}
```

### 10. Quality Metrics
**Prop-specific quality assessment:**

```typescript
interface PropQualityMetrics {
  visualConsistency: number      // Consistency across different shots
  materialAccuracy: number      // Realistic material representation
  historicalAccuracy: number    // Period and cultural correctness
  productionReadiness: number   // Ready for filming
  safetyCompliance: number      // Meets safety requirements
  imageQuality: number          // Technical image quality
  uniquenessScore: number       // How distinctive and memorable
  versatilityScore: number      // Range of scenes it can support
  conditionAccuracy: number     // Realistic wear and aging
  narrativeValue: number        // Story and character significance
}
```

## Implementation Priority

### Phase 1: Core Infrastructure
1. Database schema migration from characters to props
2. Basic CRUD operations for props
3. Category and material classification system
4. Image upload and gallery management

### Phase 2: Image Generation
1. Prop-specific prompt templates
2. Multiple shot type generation (hero, detail, context, scale)
3. Condition variation generation
4. Integration with existing Fal.ai pipeline

### Phase 3: Production Features
1. Checkout/checkin system for prop usage
2. Condition tracking and reporting
3. Safety requirement management
4. Inventory and availability tracking

### Phase 4: Advanced Features
1. Story integration and scene associations
2. Advanced search and filtering
3. Maintenance scheduling and alerts
4. Production analytics and reporting

## Technical Considerations

### Database Migration Strategy
- Create comprehensive prop schema with detailed specifications
- Preserve existing media and user collections
- Import any existing prop data from character references
- Update API routes for prop-specific operations

### Image Generation Enhancements
- Develop product photography prompt templates
- Create lighting setups appropriate for different prop types
- Implement condition and wear variation systems
- Add scale reference and context generation

### UI/UX Adaptations
- Design prop-centric dashboard with inventory focus
- Create forms for detailed physical specifications
- Implement checkout/checkin workflow
- Add safety and handling requirement interfaces

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
DATABASE_URI=mongodb://127.0.0.1/props-library
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

This comprehensive plan provides the foundation for creating a robust Props Library that serves the unique needs of prop management for movie production while maintaining the technical excellence of the character library system.
