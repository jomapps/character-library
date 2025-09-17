# Vehicles Library - Implementation Plan

## Overview
The Vehicles Library will manage all types of vehicles for movie production, from cars and motorcycles to aircraft and boats. It provides consistent vehicle references, technical specifications, and visual assets for scene generation with emphasis on practical and stunt considerations.

## Core Functionality Adaptation

### 1. Database Schema Changes
**From Character-focused to Vehicle-focused:**

```typescript
// Primary Vehicle Fields
name: string                    // Vehicle name (e.g., "1967 Ford Mustang", "Police Cruiser")
vehicleId: string              // Unique identifier (auto-generated from name)
status: 'available' | 'in_use' | 'maintenance' | 'damaged' | 'retired'

// Vehicle Classification
category: 'car' | 'motorcycle' | 'truck' | 'bus' | 'aircraft' | 'boat' | 'bicycle' | 'other'
subcategory: string            // Sedan, SUV, sports car, helicopter, yacht, etc.
era: string                   // 1920s, 1950s, Modern, Futuristic
condition: 'pristine' | 'good' | 'worn' | 'damaged' | 'destroyed'
purpose: 'hero' | 'stunt' | 'background' | 'practical'

// Technical Specifications
make: string                   // Ford, BMW, Boeing, etc.
model: string                 // Mustang, 3 Series, 747, etc.
year: number                  // Manufacturing year
color: {
  primary: string             // Main body color
  secondary?: string          // Accent colors
  interior: string           // Interior color scheme
}
dimensions: {
  length: number
  width: number
  height: number
  wheelbase?: number
  weight?: number
  units: 'feet' | 'meters'
}

// Performance Specifications
engine: {
  type: string               // V8, Electric, Jet, Outboard, etc.
  power: number             // Horsepower or equivalent
  fuel: string              // Gasoline, diesel, electric, jet fuel
  transmission: string      // Manual, automatic, CVT
}
performance: {
  topSpeed?: number         // Maximum speed
  acceleration?: string     // 0-60 time or equivalent
  range?: number           // Fuel range or battery range
  capacity?: number        // Passenger or cargo capacity
}

// Visual Characteristics
exteriorFeatures: string[]    // Chrome bumpers, racing stripes, roof rack
interiorFeatures: string[]    // Leather seats, dashboard style, controls
modifications: string[]       // Custom paint, performance mods, damage
licensePlate?: string        // If specific plate needed
distinguishingMarks: string[] // Dents, scratches, unique features

// Production Details
availability: {
  startDate: Date
  endDate: Date
  restrictions: string[]     // Time of day, weather, location limits
}
insurance: {
  covered: boolean
  value: number
  restrictions: string[]
}
transportation: {
  selfDriving: boolean      // Can be driven to location
  requiresTrailer: boolean  // Needs special transport
  specialHandling: string[] // Crane, flatbed, etc.
}

// Stunt & Safety Considerations
stuntCapability: {
  crashable: boolean        // Can be destroyed in stunts
  jumpCapable: boolean      // Can perform jumps
  highSpeedRated: boolean   // Safe for high-speed scenes
  rollCageInstalled: boolean
  safetyModifications: string[]
}
driverRequirements: {
  specialLicense: boolean   // CDL, pilot license, etc.
  experienceLevel: string   // Novice, experienced, professional
  certifications: string[] // Stunt driving, motorcycle, aircraft
}

// Story Integration
storyContext: string          // Role in narrative
characterAssociation: string[] // Which characters use this vehicle
emotionalTone: string[]       // Luxury, menacing, nostalgic, futuristic
genreCompatibility: string[]  // Action, drama, comedy, horror, sci-fi
symbolism?: string           // What this vehicle represents

// Maintenance & Condition
maintenanceHistory: {
  lastService: Date
  nextService: Date
  issues: string[]          // Current problems or concerns
  modifications: string[]   // Recent changes or repairs
}
fuelRequirements: {
  type: string             // Regular, premium, diesel, electric
  consumption: number      // MPG or equivalent
  tankCapacity: number
}
```

### 2. Image Generation Prompts
**Vehicle-focused prompting:**

```typescript
// Base prompt structure for vehicles
const vehiclePromptTemplate = `
{VEHICLE_MAKE} {VEHICLE_MODEL} {YEAR}, {COLOR} {CATEGORY}, 
{CONDITION} condition, {ERA} style, {EXTERIOR_FEATURES},
{ANGLE} view, {LIGHTING_CONDITIONS}, {BACKGROUND_CONTEXT},
professional automotive photography, high detail, cinematic quality
`

// Specialized prompt types
const promptTypes = {
  hero: "Hero shot of {VEHICLE}, dramatic lighting, showroom quality, pristine condition",
  action: "{VEHICLE} in action scene, motion blur, dynamic angle, {STUNT_CONTEXT}",
  interior: "Interior view of {VEHICLE}, dashboard and seats visible, {INTERIOR_FEATURES}",
  exterior: "Exterior {ANGLE} view of {VEHICLE}, showing {EXTERIOR_FEATURES}",
  damaged: "{VEHICLE} showing {DAMAGE_TYPE}, realistic wear and damage",
  period: "{VEHICLE} in {ERA} setting, period-appropriate background and styling"
}

// Angle specifications
const vehicleAngles = [
  'front three-quarter',
  'rear three-quarter', 
  'profile side',
  'front straight',
  'rear straight',
  'overhead',
  'low angle',
  'high angle',
  'interior driver POV',
  'interior passenger POV'
]
```

### 3. API Endpoints Adaptation
**Vehicle-specific endpoints:**

```typescript
// Core vehicle management
POST /api/v1/vehicles/create
PUT /api/v1/vehicles/{id}/update
GET /api/v1/vehicles/{id}
DELETE /api/v1/vehicles/{id}

// Vehicle discovery and search
POST /api/v1/vehicles/search
POST /api/v1/vehicles/query
GET /api/v1/vehicles/by-project/{projectId}
GET /api/v1/vehicles/by-category/{category}
GET /api/v1/vehicles/by-era/{era}

// Image generation for vehicles
POST /api/v1/vehicles/{id}/generate-hero-shot
POST /api/v1/vehicles/{id}/generate-action-shot
POST /api/v1/vehicles/{id}/generate-interior-view
POST /api/v1/vehicles/{id}/generate-exterior-angles
POST /api/v1/vehicles/{id}/generate-damage-variation
POST /api/v1/vehicles/{id}/generate-period-context

// Vehicle validation and consistency
POST /api/v1/vehicles/validate-project-consistency
POST /api/v1/vehicles/batch-validate
GET /api/v1/vehicles/{id}/quality-metrics

// Production management
GET /api/v1/vehicles/{id}/availability
PUT /api/v1/vehicles/{id}/schedule
GET /api/v1/vehicles/{id}/requirements
POST /api/v1/vehicles/{id}/maintenance-log
GET /api/v1/vehicles/{id}/insurance-info

// Stunt and safety
GET /api/v1/vehicles/{id}/stunt-capabilities
POST /api/v1/vehicles/{id}/safety-check
GET /api/v1/vehicles/{id}/driver-requirements
```

### 4. UI Component Updates
**Vehicle-focused interface:**

```typescript
// Main vehicle components
VehicleCard.tsx              // Display vehicle summary with key image
VehicleDetailView.tsx        // Full vehicle specs and image gallery
VehicleCreationForm.tsx      // Form for adding new vehicles
VehicleSearchInterface.tsx   // Advanced search with technical filters
VehicleFleetView.tsx        // Overview of all available vehicles

// Specialized components
VehicleCategorySelector.tsx
EraAndStylePicker.tsx
TechnicalSpecsForm.tsx
StuntCapabilityTracker.tsx
MaintenanceScheduler.tsx
AvailabilityCalendar.tsx
InsuranceTracker.tsx
SafetyRequirements.tsx

// Image generation components
HeroShotGenerator.tsx
ActionShotGenerator.tsx
InteriorViewGenerator.tsx
ExteriorAngleGenerator.tsx
DamageVariationGenerator.tsx
PeriodContextGenerator.tsx

// Production components
VehicleScheduler.tsx
TransportationPlanner.tsx
DriverRequirements.tsx
StuntCoordination.tsx
```

### 5. Story Integration Points
**Vehicle-narrative connections:**

```typescript
// Story context integration
interface VehicleStoryIntegration {
  narrativeRole: string        // Getaway car, family vehicle, villain's ride
  characterOwnership: string[] // Which characters own/drive this vehicle
  sceneTypes: string[]        // Chase, arrival, conversation, crash
  emotionalContext: string[]   // Freedom, danger, luxury, desperation
  plotSignificance: string    // How vehicle advances the story
  symbolism: string          // What the vehicle represents thematically
}

// Scene-vehicle matching
interface SceneVehicleMatch {
  sceneId: string
  vehicleId: string
  role: 'primary' | 'secondary' | 'background'
  requirements: string[]      // Specific needs for this scene
  stuntRequirements?: string[] // If stunts are involved
  matchScore: number         // How well vehicle fits scene
}
```

### 6. Consistency Checking Logic
**Vehicle-specific validation:**

```typescript
// Visual consistency checks
- Color and condition consistency across shots
- Era-appropriate styling and modifications
- Scale and proportion accuracy
- Lighting and reflection consistency
- Damage progression continuity

// Technical consistency checks
- Performance capability matching scene requirements
- Era accuracy for historical periods
- Mechanical feasibility validation
- Safety equipment presence
- License plate and registration consistency

// Production consistency checks
- Availability during shooting schedule
- Transportation logistics validation
- Insurance and legal compliance
- Driver qualification requirements
- Stunt capability vs. scene demands
```

### 7. Reference Management System
**Vehicle asset organization:**

```typescript
// Image gallery structure
interface VehicleImageGallery {
  heroShots: MediaItem[]          // Glamour shots, showroom quality
  actionShots: MediaItem[]        // Dynamic, motion, stunt shots
  interiorViews: MediaItem[]      // Dashboard, seats, controls
  exteriorAngles: MediaItem[]     // All standard automotive angles
  detailShots: MediaItem[]        // Close-ups of features, badges
  damageVariations: MediaItem[]   // Different levels of wear/damage
  periodContexts: MediaItem[]     // Vehicle in era-appropriate settings
  stuntPrep: MediaItem[]         // Safety modifications, rigging
}

// Reference categorization
interface VehicleReference {
  referenceType: 'hero' | 'action' | 'interior' | 'exterior' | 'detail' | 'damage'
  angle: string                  // Specific camera angle
  condition: string             // Pristine, worn, damaged state
  context: string               // Studio, location, action scene
  lightingSetup: string         // Natural, studio, dramatic
  isMasterReference: boolean    // Primary reference for this vehicle
  stuntReady: boolean          // Prepared for stunt work
  qualityScore: number         // Technical and artistic quality
  accuracyScore: number        // Historical/technical accuracy
}
```

### 8. Domain-Specific Fields
**Unique vehicle attributes:**

```typescript
// Operational characteristics
soundProfile: string[]          // Engine note, exhaust sound, road noise
handlingCharacteristics: string[] // Smooth, rough, responsive, sluggish
comfortLevel: string           // Luxury, basic, uncomfortable, sporty
visibility: {
  forward: string              // Excellent, good, limited, poor
  rear: string
  sides: string
  blindSpots: string[]
}

// Special equipment
specialEquipment: string[]      // Winch, lights, radio, weapons mounts
emergencyEquipment: string[]    // First aid, fire extinguisher, tools
entertainmentSystems: string[]  // Radio, TV, gaming, communication
climateControl: string         // AC, heating, none, advanced

// Historical context
historicalSignificance: string  // Famous owner, movie appearances
culturalImpact: string         // Iconic status, social meaning
productionHistory: string      // How many made, rarity
collectibleValue: number       // Current market value

// Practical considerations
parkingRequirements: string[]   // Size restrictions, special needs
fuelAvailability: string       // Common, specialty, hard to find
partAvailability: string       // Easy, moderate, difficult, impossible
specialistRequired: boolean     // Needs expert mechanic/pilot
```

### 9. Integration with External Services
**Maintain existing service connections plus vehicle-specific:**

```typescript
// Existing services
// Fal.ai for vehicle image generation
// OpenRouter for vehicle description enhancement  
// Cloudflare R2 for vehicle image storage
// DINOv3 for vehicle visual consistency
// PathRAG for vehicle knowledge management

// Vehicle-specific service enhancements
interface VehicleServices {
  vinDecoder: string            // Vehicle identification and specs
  insuranceAPI: string          // Coverage and valuation data
  maintenanceTracker: string    // Service history and scheduling
  fuelPriceAPI: string         // Current fuel costs and availability
  transportationAPI: string     // Shipping and logistics
  dmvAPI: string               // Registration and legal requirements
}
```

### 10. Quality Metrics
**Vehicle-specific quality assessment:**

```typescript
interface VehicleQualityMetrics {
  visualConsistency: number      // Consistency across different shots
  technicalAccuracy: number     // Specs and performance accuracy
  historicalAccuracy: number    // Period and era correctness
  productionReadiness: number   // Ready for filming
  stuntSafety: number          // Safety for stunt work
  imageQuality: number         // Technical image quality
  uniquenessScore: number      // How distinctive and memorable
  versatilityScore: number     // Range of scenes it can support
  conditionAccuracy: number    // Realistic wear and damage
  contextualFit: number        // How well it fits story/genre
}
```

## Implementation Priority

### Phase 1: Core Infrastructure
1. Database schema migration from characters to vehicles
2. Basic CRUD operations for vehicles
3. Technical specifications management
4. Image upload and gallery system

### Phase 2: Image Generation
1. Vehicle-specific prompt templates
2. Multiple angle and context generation
3. Condition variation generation (pristine to damaged)
4. Integration with existing Fal.ai pipeline

### Phase 3: Production Features
1. Availability scheduling and booking
2. Maintenance tracking and alerts
3. Insurance and legal compliance
4. Transportation and logistics planning

### Phase 4: Advanced Features
1. Stunt coordination and safety tracking
2. Driver requirement management
3. Advanced search and filtering
4. Fleet management and analytics

## Technical Considerations

### Database Migration Strategy
- Create comprehensive vehicle schema with technical specifications
- Preserve existing media and user collections
- Import any existing vehicle data from character references
- Update API routes for vehicle-specific operations

### Image Generation Enhancements
- Develop automotive photography prompt templates
- Create angle-specific generation for standard automotive views
- Implement condition variation system (pristine to destroyed)
- Add era-appropriate styling and context generation

### UI/UX Adaptations
- Design vehicle-centric dashboard with technical focus
- Create forms for detailed technical specifications
- Implement fleet overview and management tools
- Add production scheduling and logistics interfaces

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
DATABASE_URI=mongodb://127.0.0.1/vehicles-library
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

This comprehensive plan provides the foundation for creating a robust Vehicles Library that serves the unique needs of automotive asset management for movie production while maintaining the technical excellence of the character library system.
