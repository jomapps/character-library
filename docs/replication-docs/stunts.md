# Stunts Library - Implementation Plan

## Overview
The Stunts Library will manage stunt sequences, safety protocols, and action choreography for movie production. It provides comprehensive stunt references, safety specifications, and coordination guidelines for consistent and safe action sequences.

## Core Functionality Adaptation

### 1. Database Schema Changes
**From Character-focused to Stunt-focused:**

```typescript
// Primary Stunt Fields
name: string                    // Stunt name (e.g., "Car Chase Sequence", "Rooftop Jump")
stuntId: string                // Unique identifier (auto-generated from name)
status: 'concept' | 'planned' | 'rehearsed' | 'approved' | 'executed' | 'archived'

// Stunt Classification
category: 'fight' | 'vehicle' | 'fall' | 'fire' | 'water' | 'aerial' | 'explosion' | 'other'
subcategory: string            // Hand combat, car chase, high fall, etc.
stuntType: 'practical' | 'wire_work' | 'vehicle' | 'pyrotechnic' | 'combination'
complexity: 'simple' | 'moderate' | 'complex' | 'extreme'
riskLevel: 'low' | 'medium' | 'high' | 'extreme'

// Safety Specifications
safety: {
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'extreme'
    factors: string[]        // Height, speed, fire, etc.
    mitigations: string[]    // Safety measures in place
    residualRisk: string     // Risk after mitigations
  }
  equipment: {
    protective: string[]     // Helmets, pads, harnesses
    rigging: string[]       // Wires, rigs, platforms
    medical: string[]       // First aid, ambulance, medic
    fire: string[]          // Extinguishers, blankets, suits
    specialized: string[]   // Airbags, crash mats, etc.
  }
  personnel: {
    stuntCoordinator: boolean
    stuntPerformers: number
    riggers: number
    medics: number
    fireMarshall: boolean
    specialistRequired: string[] // Specific expertise needed
  }
  protocols: {
    rehearsals: number       // Number of rehearsals required
    safetyMeetings: number   // Safety briefings needed
    emergencyPlan: string    // Emergency response plan
    communicationPlan: string // How team communicates
    abortSignals: string[]   // How to stop the stunt
  }
}

// Technical Requirements
technical: {
  equipment: {
    name: string
    type: string            // Rigging, vehicle, pyro, etc.
    specifications: string  // Technical specs
    quantity: number
    supplier: string
    certification: string[] // Safety certifications
  }[]
  setup: {
    time: number            // Setup time in hours
    crew: number           // Crew members needed
    space: string          // Space requirements
    conditions: string[]   // Weather, lighting, etc.
  }
  execution: {
    duration: number        // Stunt duration in seconds
    takes: number          // Expected number of takes
    resetTime: number      // Time between takes
    conditions: string[]   // Optimal conditions
  }
}

// Performance Specifications
performance: {
  performers: {
    primary: {
      skills: string[]      // Required skills
      experience: string    // Experience level needed
      physicalRequirements: string[] // Fitness, abilities
      certifications: string[] // Required certifications
    }
    doubles: {
      needed: boolean
      quantity: number
      matching: string[]    // What needs to match actor
      skills: string[]
    }
    specialists: {
      type: string[]        // Driver, pilot, fighter, etc.
      qualifications: string[]
      experience: string
    }
  }
  choreography: {
    style: string           // Realistic, stylized, etc.
    influences: string[]    // Martial arts, dance, etc.
    keyMoments: string[]    // Critical story beats
    rhythm: string         // Fast, slow, building, etc.
  }
}

// Vehicle Requirements (if applicable)
vehicles: {
  primary: {
    type: string           // Car, motorcycle, boat, etc.
    specifications: string // Make, model, modifications
    condition: string      // Pristine, damaged, destroyed
    modifications: string[] // Roll cage, safety equipment
    backup: boolean        // Backup vehicle needed
  }[]
  support: {
    camera: string[]       // Camera cars, boats, etc.
    safety: string[]       // Ambulance, fire truck, etc.
    transport: string[]    // Trailers, recovery vehicles
  }
}

// Location Requirements
location: {
  type: string             // Studio, practical, exterior
  specifications: string[] // Size, surface, obstacles
  safety: {
    clearance: string      // Safety perimeters
    access: string[]       // Emergency vehicle access
    hazards: string[]      // Existing hazards
    modifications: string[] // Safety modifications needed
  }
  permits: {
    required: string[]     // Permits needed
    restrictions: string[] // Time, noise, etc.
    insurance: string[]    // Special insurance needed
  }
}

// Camera & Coverage
coverage: {
  cameras: {
    quantity: number       // Number of cameras
    positions: string[]    // Camera positions
    protection: string[]   // Camera protection needed
    operators: string[]    // Operator safety requirements
  }
  angles: string[]         // Desired camera angles
  specialEquipment: string[] // Crash cams, wire cams, etc.
  backup: boolean          // Backup coverage plan
}

// Story Integration
storyContext: string          // How stunt serves narrative
characterDevelopment: string  // Character growth through action
emotionalBeats: string[]     // Emotional moments in stunt
symbolism: string           // What the action represents
genreConventions: string[]  // Genre-specific expectations

// Legal & Insurance
legal: {
  permits: string[]        // Required permits
  insurance: {
    coverage: string[]     // Types of coverage needed
    value: number         // Coverage amount
    deductible: number    // Insurance deductible
    exclusions: string[]  // What's not covered
  }
  waivers: string[]       // Required waivers
  regulations: string[]   // Applicable regulations
  liability: string       // Liability considerations
}

// Budget & Schedule
budget: {
  preproduction: number    // Planning and rehearsal costs
  equipment: number       // Equipment rental costs
  personnel: number       // Stunt team costs
  location: number        // Location and permit costs
  insurance: number       // Insurance costs
  contingency: number     // Contingency percentage
  total: number          // Total stunt cost
  currency: string
}
schedule: {
  preproduction: number   // Days for planning
  rehearsal: number      // Days for rehearsal
  shooting: number       // Days for execution
  total: number         // Total days
  dependencies: string[] // What must happen first
}
```

### 2. Image Generation Prompts
**Stunt-focused prompting:**

```typescript
// Base prompt structure for stunts
const stuntPromptTemplate = `
{STUNT_NAME}, {STUNT_TYPE} stunt sequence, {COMPLEXITY} complexity,
{SAFETY_LEVEL} safety setup, {LOCATION_TYPE}, {CAMERA_ANGLE},
{ACTION_STYLE}, professional stunt cinematography, high detail, dynamic action
`

// Specialized prompt types
const promptTypes = {
  concept: "Stunt concept art showing {STUNT_SEQUENCE}, {ACTION_STYLE} style",
  safety: "Safety setup diagram for {STUNT}, showing {SAFETY_EQUIPMENT} and {PROTOCOLS}",
  choreography: "Action choreography reference showing {FIGHT_SEQUENCE} movements",
  coverage: "Camera coverage plan for {STUNT} showing {CAMERA_POSITIONS}",
  equipment: "Stunt equipment setup showing {RIGGING} and {SAFETY_GEAR}",
  execution: "Dynamic action shot of {STUNT} in progress, {CAMERA_ANGLE} view"
}

// Action style descriptors
const actionStyles = {
  realistic: "realistic grounded action with practical physics",
  stylized: "stylized cinematic action with dramatic flair",
  brutal: "intense brutal action with visceral impact",
  graceful: "fluid graceful action with dance-like choreography"
}
```

### 3. API Endpoints Adaptation
**Stunt-specific endpoints:**

```typescript
// Core stunt management
POST /api/v1/stunts/create
PUT /api/v1/stunts/{id}/update
GET /api/v1/stunts/{id}
DELETE /api/v1/stunts/{id}

// Stunt discovery and search
POST /api/v1/stunts/search
POST /api/v1/stunts/query
GET /api/v1/stunts/by-project/{projectId}
GET /api/v1/stunts/by-category/{category}
GET /api/v1/stunts/by-risk-level/{level}
GET /api/v1/stunts/by-complexity/{level}

// Image generation for stunts
POST /api/v1/stunts/{id}/generate-concept-art
POST /api/v1/stunts/{id}/generate-safety-diagram
POST /api/v1/stunts/{id}/generate-choreography-reference
POST /api/v1/stunts/{id}/generate-coverage-plan
POST /api/v1/stunts/{id}/generate-equipment-setup
POST /api/v1/stunts/{id}/generate-execution-shot

// Safety management
GET /api/v1/stunts/{id}/risk-assessment
POST /api/v1/stunts/{id}/safety-checklist
GET /api/v1/stunts/{id}/equipment-requirements
POST /api/v1/stunts/{id}/safety-briefing
GET /api/v1/stunts/{id}/emergency-plan

// Production planning
POST /api/v1/stunts/{id}/schedule-estimate
GET /api/v1/stunts/{id}/team-requirements
POST /api/v1/stunts/{id}/budget-estimate
GET /api/v1/stunts/{id}/permit-requirements
POST /api/v1/stunts/{id}/insurance-requirements

// Execution tracking
POST /api/v1/stunts/{id}/rehearsal-log
PUT /api/v1/stunts/{id}/execution-notes
POST /api/v1/stunts/{id}/incident-report
GET /api/v1/stunts/{id}/performance-review
```

### 4. UI Component Updates
**Stunt-focused interface:**

```typescript
// Main stunt components
StuntCard.tsx                // Display stunt with safety rating
StuntDetailView.tsx         // Full stunt specs and safety info
StuntCreationForm.tsx       // Form for creating new stunts
StuntSearchInterface.tsx    // Search with risk/complexity filters
StuntLibraryView.tsx        // Overview of all stunt sequences

// Safety components
RiskAssessment.tsx
SafetyChecklist.tsx
EquipmentTracker.tsx
PersonnelRequirements.tsx
EmergencyPlanner.tsx
IncidentReporter.tsx
SafetyBriefing.tsx

// Planning components
ChoreographyPlanner.tsx
CoveragePlanner.tsx
ScheduleEstimator.tsx
BudgetCalculator.tsx
PermitTracker.tsx
InsuranceManager.tsx

// Image generation components
ConceptArtGenerator.tsx
SafetyDiagramGenerator.tsx
ChoreographyReferenceGenerator.tsx
CoveragePlanGenerator.tsx
EquipmentSetupGenerator.tsx
ExecutionShotGenerator.tsx

// Execution components
RehearsalTracker.tsx
ExecutionMonitor.tsx
PerformanceReviewer.tsx
```

### 5. Story Integration Points
**Stunt-narrative connections:**

```typescript
// Story context integration
interface StuntStoryIntegration {
  narrativeFunction: string    // Character development, plot advancement
  emotionalBeats: string[]    // Fear, triumph, sacrifice, etc.
  characterGrowth: string     // How action reveals character
  symbolism: string          // What the action represents
  genreConventions: string[] // Genre-specific action expectations
  pacing: string            // How it affects story rhythm
}

// Scene-stunt relationships
interface SceneStuntMatch {
  sceneId: string
  stuntId: string
  importance: 'climax' | 'major' | 'supporting' | 'transition'
  requirements: string[]      // Specific story needs
  characterInvolvement: string[] // Which characters participate
  emotionalContext: string   // Emotional state during action
}
```

### 6. Consistency Checking Logic
**Stunt-specific validation:**

```typescript
// Safety consistency checks
- Risk level appropriate for production
- Safety equipment adequate for risk
- Personnel qualifications sufficient
- Emergency protocols comprehensive
- Insurance coverage adequate

// Technical consistency checks
- Equipment availability and compatibility
- Location suitability for stunt
- Weather and environmental factors
- Camera coverage feasibility
- Schedule and budget realism

// Story consistency checks
- Character capability alignment
- Injury continuity logic
- Emotional beat appropriateness
- Genre convention adherence
- Pacing and rhythm integration
```

### 7. Reference Management System
**Stunt asset organization:**

```typescript
// Image gallery structure
interface StuntImageGallery {
  conceptArt: MediaItem[]         // Initial stunt concepts
  safetyDiagrams: MediaItem[]     // Safety setup diagrams
  choreographyReferences: MediaItem[] // Movement and choreography
  coveragePlans: MediaItem[]      // Camera coverage plans
  equipmentSetups: MediaItem[]    // Equipment and rigging setups
  executionShots: MediaItem[]     // Dynamic action shots
  rehearsalFootage: MediaItem[]   // Rehearsal documentation
  safetyDocumentation: MediaItem[] // Safety briefings and checklists
}

// Reference categorization
interface StuntReference {
  referenceType: 'concept' | 'safety' | 'choreography' | 'coverage' | 'equipment' | 'execution'
  riskLevel: string              // Low, medium, high, extreme
  complexity: string            // Simple, moderate, complex, extreme
  safetyApproved: boolean       // Safety coordinator approved
  rehearsalStage: string        // Planning, rehearsal, approved
  isMasterReference: boolean    // Primary reference for this stunt
  safetyCompliant: boolean      // Meets safety standards
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
DATABASE_URI=mongodb://127.0.0.1/stunts-library
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

This comprehensive plan provides the foundation for creating a robust Stunts Library that prioritizes safety while serving the unique needs of action sequence planning, coordination, and execution for movie production.
