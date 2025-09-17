# Locations / Sets Library - Implementation Plan

## Overview
The Locations/Sets Library will manage filming locations, sets, and environments for the movie generation system. It will provide consistent location references, environmental context, and visual assets for scene generation.

## Core Functionality Adaptation

### 1. Database Schema Changes
**From Character-focused to Location-focused:**

```typescript
// Primary Location Fields
name: string                    // Location name (e.g., "Victorian Mansion", "Downtown Alley")
locationId: string             // Unique identifier (auto-generated from name)
status: 'scouted' | 'approved' | 'built' | 'available' | 'in_use' | 'archived'

// Location Development Fields
locationHistory: string        // Historical context, previous uses, significance
architecturalStyle: string     // Gothic, Modern, Art Deco, Industrial, etc.
era: string                   // Time period (1920s, Contemporary, Futuristic)
mood: string                  // Atmosphere (mysterious, cozy, ominous, bright)
description: string           // Detailed physical description

// Geographic & Environmental
geographicLocation: string    // City, region, or fictional location
coordinates?: { lat: number, lng: number }
weatherConditions: string[]   // Sunny, rainy, foggy, snowy options
lightingConditions: string[] // Natural, artificial, mixed, golden hour
seasonality: string[]        // Spring, Summer, Fall, Winter compatibility

// Technical Specifications
dimensions: {
  length?: number
  width?: number
  height?: number
  area?: number
  units: 'feet' | 'meters'
}
capacity: {
  crew?: number
  equipment?: number
  vehicles?: number
}
accessibility: {
  wheelchairAccessible: boolean
  parkingAvailable: boolean
  publicTransport: boolean
}

// Production Details
shootingPermissions: {
  required: boolean
  obtained: boolean
  expiryDate?: Date
  restrictions?: string[]
}
availabilitySchedule: {
  availableDays: string[]
  timeRestrictions?: string
  seasonalAvailability?: string[]
}
costInformation: {
  dailyRate?: number
  currency: string
  additionalFees?: string[]
}

// Visual & Aesthetic Properties
colorPalette: string[]        // Dominant colors in the location
textureElements: string[]     // Brick, wood, metal, glass, stone
lightingSources: string[]     // Windows, lamps, natural, neon
acousticProperties: string    // Echoing, muffled, reverberant, clear

// Story Integration
storyContext: string          // How this location fits into narratives
emotionalTone: string[]       // Happy, sad, tense, romantic, mysterious
genreCompatibility: string[]  // Horror, romance, action, comedy, drama
symbolism?: string           // What this location represents thematically

// Practical Considerations
safetyRequirements: string[]  // Special safety measures needed
equipmentNeeds: string[]      // Lighting, sound, camera equipment requirements
weatherProtection: boolean    // Indoor/covered vs outdoor exposure
powerAvailability: {
  electrical: boolean
  generators: boolean
  capacity?: string
}
```

### 2. Image Generation Prompts
**Environment-focused prompting:**

```typescript
// Base prompt structure for locations
const locationPromptTemplate = `
{LOCATION_NAME}, {ARCHITECTURAL_STYLE} architecture, {ERA} period, 
{MOOD} atmosphere, {LIGHTING_CONDITIONS}, {WEATHER_CONDITIONS},
{COLOR_PALETTE} color scheme, {TEXTURE_ELEMENTS} textures,
professional architectural photography, high detail, cinematic quality
`

// Specialized prompt types
const promptTypes = {
  establishing: "Wide establishing shot of {LOCATION}, showing full context and scale",
  detail: "Close-up architectural details of {LOCATION}, focusing on {TEXTURE_ELEMENTS}",
  interior: "Interior view of {LOCATION}, showing {LIGHTING_CONDITIONS} and atmosphere",
  exterior: "Exterior facade of {LOCATION}, {WEATHER_CONDITIONS}, {TIME_OF_DAY}",
  aerial: "Aerial view of {LOCATION}, showing surrounding context and geography"
}
```

### 3. API Endpoints Adaptation
**Location-specific endpoints:**

```typescript
// Core location management
POST /api/v1/locations/create
PUT /api/v1/locations/{id}/update
GET /api/v1/locations/{id}
DELETE /api/v1/locations/{id}

// Location discovery and search
POST /api/v1/locations/search
POST /api/v1/locations/query
GET /api/v1/locations/by-project/{projectId}

// Image generation for locations
POST /api/v1/locations/{id}/generate-establishing-shot
POST /api/v1/locations/{id}/generate-detail-shot
POST /api/v1/locations/{id}/generate-interior-view
POST /api/v1/locations/{id}/generate-aerial-view
POST /api/v1/locations/{id}/generate-scene-image

// Location validation and consistency
POST /api/v1/locations/validate-project-consistency
POST /api/v1/locations/batch-validate
GET /api/v1/locations/{id}/quality-metrics

// Location relationships and context
POST /api/v1/locations/{id}/nearby-locations
GET /api/v1/locations/geographic-clusters
POST /api/v1/locations/{id}/story-connections

// Production management
POST /api/v1/locations/{id}/schedule-availability
PUT /api/v1/locations/{id}/permissions
GET /api/v1/locations/{id}/production-requirements
```

### 4. UI Component Updates
**Location-focused interface:**

```typescript
// Main location components
LocationCard.tsx              // Display location summary with key image
LocationDetailView.tsx        // Full location information and image gallery
LocationCreationForm.tsx      // Form for adding new locations
LocationSearchInterface.tsx   // Advanced search with filters
LocationMapView.tsx          // Geographic visualization of locations

// Specialized components
ArchitecturalStyleSelector.tsx
WeatherConditionPicker.tsx
LightingConditionSelector.tsx
AvailabilityScheduler.tsx
PermissionTracker.tsx
ProductionRequirements.tsx
LocationComparison.tsx       // Side-by-side location comparison

// Image generation components
EstablishingShotGenerator.tsx
DetailShotGenerator.tsx
InteriorViewGenerator.tsx
AerialViewGenerator.tsx
SceneContextGenerator.tsx
```

### 5. Story Integration Points
**Location-narrative connections:**

```typescript
// Story context integration
interface LocationStoryIntegration {
  sceneTypes: string[]         // Types of scenes this location supports
  narrativeFunction: string    // Plot advancement, character development, etc.
  emotionalJourney: string[]   // How location supports character arcs
  symbolism: string           // Thematic meaning of the location
  genreAlignment: string[]    // Which genres this location serves best
}

// Scene-location matching
interface SceneLocationMatch {
  sceneId: string
  locationId: string
  matchScore: number          // How well location fits scene requirements
  adaptationNotes: string     // What changes might be needed
  alternativeOptions: string[] // Other suitable locations
}
```

### 6. Consistency Checking Logic
**Location-specific validation:**

```typescript
// Visual consistency checks
- Architectural style consistency across shots
- Lighting condition matching between scenes
- Weather continuity validation
- Color palette consistency
- Scale and proportion accuracy

// Narrative consistency checks
- Location availability during story timeline
- Geographic logic (travel time between locations)
- Seasonal appropriateness
- Cultural/historical accuracy
- Genre compatibility validation

// Production consistency checks
- Equipment requirements compatibility
- Crew capacity validation
- Permission and legal compliance
- Budget constraint adherence
- Schedule conflict detection
```

### 7. Reference Management System
**Location asset organization:**

```typescript
// Image gallery structure
interface LocationImageGallery {
  establishingShots: MediaItem[]    // Wide shots showing full location
  detailShots: MediaItem[]         // Architectural details and textures
  interiorViews: MediaItem[]       // Inside views and room layouts
  exteriorViews: MediaItem[]       // Outside facades and approaches
  aerialViews: MediaItem[]         // Overhead and drone shots
  seasonalVariations: MediaItem[]   // Same location in different seasons
  timeOfDayVariations: MediaItem[] // Different lighting conditions
  weatherVariations: MediaItem[]   // Different weather conditions
}

// Reference categorization
interface LocationReference {
  referenceType: 'establishing' | 'detail' | 'interior' | 'exterior' | 'aerial'
  viewAngle: string              // Front, side, back, corner, overhead
  timeOfDay: string             // Dawn, morning, noon, afternoon, dusk, night
  weather: string               // Clear, cloudy, rainy, snowy, foggy
  season: string                // Spring, summer, fall, winter
  lightingSetup: string         // Natural, artificial, mixed, dramatic
  isMasterReference: boolean    // Primary reference for this location
  qualityScore: number          // Technical and artistic quality rating
  consistencyScore: number      // How well it matches other location shots
}
```

### 8. Domain-Specific Fields
**Unique location attributes:**

```typescript
// Environmental factors
ambientSounds: string[]          // Traffic, nature, industrial, silence
airQuality: string              // Clean, polluted, dusty, humid
temperature: {
  typical: number
  range: { min: number, max: number }
  seasonal: boolean
}

// Architectural details
buildingMaterials: string[]      // Brick, concrete, wood, steel, glass
roofType: string                // Flat, pitched, dome, complex
windowTypes: string[]           // Large, small, arched, modern, broken
doorTypes: string[]             // Grand, simple, hidden, multiple
flooringSurfaces: string[]      // Hardwood, carpet, tile, concrete

// Surrounding context
neighborhood: string            // Urban, suburban, rural, industrial
trafficLevel: string           // Heavy, moderate, light, none
proximityToLandmarks: string[] // Near famous buildings, parks, etc.
publicTransportAccess: string[] // Bus, train, subway, none

// Special features
uniqueFeatures: string[]        // Spiral staircase, fireplace, balcony
hiddenAreas: string[]          // Secret rooms, basements, attics
viewsFromLocation: string[]     // Ocean, mountains, city skyline
historicalSignificance: string  // What happened here historically
```

### 9. Integration with External Services
**Maintain existing service connections:**

```typescript
// Fal.ai integration for location image generation
// OpenRouter for location description enhancement
// Cloudflare R2 for location image storage
// DINOv3 for location visual consistency checking
// PathRAG for location knowledge management

// Location-specific service enhancements
interface LocationServices {
  weatherAPI: string           // Real weather data for location accuracy
  mapServices: string         // Geographic and satellite imagery
  architecturalDatabase: string // Style and period reference data
  permissionServices: string   // Legal and permit information
  costDatabase: string        // Location rental and fee information
}
```

### 10. Quality Metrics
**Location-specific quality assessment:**

```typescript
interface LocationQualityMetrics {
  visualConsistency: number      // Consistency across different shots
  architecturalAccuracy: number  // Historical and style accuracy
  atmosphericConsistency: number // Mood and lighting consistency
  productionReadiness: number    // How ready for actual filming
  narrativeAlignment: number     // How well it serves story needs
  technicalQuality: number      // Image resolution and clarity
  uniquenessScore: number       // How distinctive and memorable
  versatilityScore: number      // How many different scenes it can support
}
```

## Implementation Priority

### Phase 1: Core Infrastructure
1. Database schema migration from characters to locations
2. Basic CRUD operations for locations
3. Image upload and gallery management
4. Simple search and filtering

### Phase 2: Image Generation
1. Location-specific prompt templates
2. Multiple shot type generation (establishing, detail, interior, exterior)
3. Weather and lighting variation generation
4. Integration with existing Fal.ai pipeline

### Phase 3: Advanced Features
1. Geographic mapping and visualization
2. Production scheduling and availability
3. Permission and legal tracking
4. Cost estimation and budgeting

### Phase 4: Integration & Polish
1. Story integration and scene matching
2. Advanced consistency checking
3. Batch operations and bulk management
4. Reporting and analytics

## Technical Considerations

### Database Migration Strategy
- Preserve existing media and user collections
- Create new locations collection with comprehensive schema
- Migrate any existing location data from character references
- Update API routes and endpoints systematically

### Image Generation Enhancements
- Develop location-specific prompt engineering
- Create shot type templates for different location needs
- Implement weather and lighting variation systems
- Add architectural style consistency checking

### UI/UX Adaptations
- Design location-centric dashboard and navigation
- Create location-specific forms and input methods
- Implement map-based location browsing
- Add production-focused tools and interfaces

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
DATABASE_URI=mongodb://127.0.0.1/locations-library
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

This comprehensive plan provides the foundation for creating a robust Locations/Sets Library that maintains the technical excellence of the character library while serving the unique needs of location and set management for movie production.
