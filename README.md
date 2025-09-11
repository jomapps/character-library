# Character Library

A state-of-the-art Digital Asset Management (DAM) system specifically designed for managing fictional characters and their visual assets. Built with Next.js, Payload CMS, and integrated with advanced AI services for character image generation and consistency validation.

## 🎯 Features

### Core Character Management
- **Comprehensive Character Profiles** - Store detailed personas, biographies, relationships, and attributes
- **Rich Text Content** - Biography, personality, motivations, backstory with full rich text editing
- **Physical Descriptions** - Age, height, eye color, hair color, and detailed physical descriptions
- **Skills & Abilities** - Track character skills with proficiency levels
- **Status Tracking** - Draft → Development → Production → Archived workflow

### AI-Powered Image Generation
- **Master Reference Images** - Generate consistent character reference images
- **360° Core Reference Sets** - Complete character turnaround references
- **Scene-Specific Images** - Context-aware image generation for specific scenes
- **Character Interactions** - Generate images showing character relationships
- **Batch Processing** - Efficient bulk image generation for projects

### Visual Consistency & Quality Assurance
- **DINOv3 Integration** - Advanced computer vision for visual consistency validation
- **Quality Metrics** - Comprehensive quality scoring and analysis
- **Consistency Validation** - Cross-scene and cross-image consistency checking
- **Automated QA Pipeline** - Quality assurance workflows with recommendations

### Character Relationships
- **Relationship Mapping** - Define and track character relationships
- **Relationship Strength & Conflict** - Quantify relationship dynamics (1-10 scales)
- **Bidirectional Relationships** - Automatic reverse relationship creation
- **Relationship Graphs** - Visual relationship network analysis
- **Relationship-Aware Images** - Generate images that reflect character dynamics

### Novel Movie Integration
- **Project-Specific Management** - Characters linked to specific Novel Movie projects
- **Bidirectional Synchronization** - Sync changes between Novel Movie and Character Library
- **Conflict Resolution** - Automatic and manual conflict resolution strategies
- **Bulk Operations** - Efficient handling of multiple characters and operations
- **Scene Context Tracking** - Track character appearances across different scenes

### Natural Language Querying
- **PathRAG Integration** - Query character knowledge using natural language
- **Knowledge Base Sync** - Automatic synchronization with graph database
- **Contextual Search** - Find characters based on traits, relationships, and story elements

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB database
- Environment variables configured (see `.env.example`)

### Local Development

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd character-library
   cp .env.example .env
   npm install
   ```

2. **Configure Environment**
   Edit `.env` with your database and service configurations:
   ```env
   MONGODB_URI=mongodb://localhost:27017/character-library
   PAYLOAD_SECRET=your-secret-key
   DINOV3_API_URL=your-dinov3-service-url
   PATHRAG_API_URL=your-pathrag-service-url
   FAL_KEY=your-fal-ai-key
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Admin Panel: `http://localhost:3000/admin`
   - API Documentation: `http://localhost:3000/api-docs`

#### Docker (Optional)

If you prefer to use Docker for local development instead of a local MongoDB instance, the provided docker-compose.yml file can be used.

To do so, follow these steps:

- Modify the `MONGODB_URI` in your `.env` file to `mongodb://127.0.0.1/<dbname>`
- Modify the `docker-compose.yml` file's `MONGODB_URI` to match the above `<dbname>`
- Run `docker-compose up` to start the database, optionally pass `-d` to run in the background.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

## 📚 API Documentation

### Novel Movie Integration Endpoints

#### Character Management
```http
# Create Novel Movie character
POST /api/v1/characters/novel-movie
{
  "novelMovieProjectId": "project-123",
  "characterData": { /* character data */ },
  "syncSettings": { "conflictResolution": "novel-movie-wins" }
}

# Sync character changes
PUT /api/v1/characters/{id}/novel-movie-sync
{
  "characterData": { /* updated data */ },
  "lastModified": "2025-09-07T05:34:51.566Z",
  "changeSet": ["biography", "personality"]
}

# Bulk operations
POST /api/v1/characters/bulk/novel-movie
{
  "projectId": "project-123",
  "operation": "create",
  "characters": [{ /* character data */ }]
}
```

#### Scene-Specific Image Generation
```http
# Generate scene image
POST /api/v1/characters/{id}/generate-scene-image
{
  "sceneContext": "Character in dark alley",
  "sceneType": "action",
  "mood": "tense"
}

# Generate character interaction
POST /api/v1/characters/generate-interaction
{
  "primaryCharacterId": "char-1",
  "secondaryCharacterIds": ["char-2"],
  "interactionType": "confrontation",
  "sceneDescription": "Heated argument"
}

# Batch scene generation
POST /api/v1/characters/batch-generate-scenes
{
  "projectId": "project-123",
  "scenes": [{ /* scene data */ }]
}
```

#### Character Relationships
```http
# Create relationship
POST /api/v1/characters/{id}/relationships
{
  "relatedCharacterId": "other-char",
  "relationshipType": "mentor",
  "strength": 9,
  "conflictLevel": 1
}

# Get relationship graph
GET /api/v1/characters/relationships/graph?projectId=project-123

# Generate relationship image
POST /api/v1/characters/generate-relationship-image
{
  "characterIds": ["char-1", "char-2"],
  "relationshipContext": "Mentor teaching student"
}
```

#### Quality Assurance
```http
# Get quality metrics
GET /api/v1/characters/{id}/quality-metrics

# Validate project consistency
POST /api/v1/characters/validate-project-consistency
{
  "projectId": "project-123",
  "includeVisualValidation": true
}

# Batch validation
POST /api/v1/characters/batch-validate
{
  "characterIds": ["char-1", "char-2"],
  "validationType": "complete"
}
```

### Standard Character Endpoints
```http
# CRUD Operations
GET    /api/v1/characters           # List characters
POST   /api/v1/characters           # Create character
GET    /api/v1/characters/{id}      # Get character
PUT    /api/v1/characters/{id}      # Update character
DELETE /api/v1/characters/{id}      # Delete character

# Image Generation
POST   /api/v1/characters/{id}/generate-image
POST   /api/v1/characters/{id}/generate-core-set
POST   /api/v1/characters/{id}/validate-consistency

# Knowledge Base
POST   /api/v1/characters/{id}/sync-to-pathrag
POST   /api/v1/characters/query-knowledge
```

## 🏗️ Architecture

### Core Collections
- **Characters** - Main character data with enhanced Novel Movie integration fields
- **Media** - File storage with AI-generated image metadata
- **Users** - Authentication and access control

### Enhanced Character Schema
```typescript
interface Character {
  // Basic Information
  name: string
  characterId: string
  status: 'draft' | 'in_development' | 'ready' | 'in_production' | 'archived'

  // Character Development
  biography: string
  personality: string
  motivations: string
  backstory: string

  // Physical Description
  age: number
  height: string
  eyeColor: string
  hairColor: string
  physicalDescription: string

  // Novel Movie Integration
  novelMovieIntegration: {
    projectId: string
    syncStatus: 'synced' | 'pending' | 'conflict' | 'error'
    lastSyncAt: Date
    changeLog: ChangeLogEntry[]
  }

  // Enhanced Relationships
  enhancedRelationships: Array<{
    characterId: string
    relationshipType: string
    strength: number // 1-10
    conflictLevel: number // 1-10
    visualCues: string[]
  }>

  // Scene Contexts
  sceneContexts: Array<{
    sceneId: string
    sceneType: 'dialogue' | 'action' | 'emotional' | 'establishing'
    generatedImages: string[]
    qualityScores: number[]
  }>

  // Quality Metrics
  enhancedQualityMetrics: {
    narrativeConsistency: number
    crossSceneConsistency: number
    relationshipVisualConsistency: number
    validationHistory: ValidationEntry[]
  }
}
```

### External Service Integration
- **DINOv3 Service** - Visual consistency validation using computer vision
- **PathRAG Service** - Natural language querying and knowledge base management
- **FAL.ai** - AI image generation with FLUX models
- **Novel Movie System** - Production workflow integration

## 🔧 Configuration

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/character-library
PAYLOAD_SECRET=your-secret-key

# AI Services
DINOV3_API_URL=http://localhost:8000
PATHRAG_API_URL=http://localhost:8001
FAL_KEY=your-fal-ai-key

# File Storage
S3_BUCKET=your-s3-bucket
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_REGION=us-east-1

# Novel Movie Integration
NOVEL_MOVIE_API_URL=http://novel-movie-api
NOVEL_MOVIE_API_KEY=your-api-key
```

### Docker Setup (Optional)
```bash
# Start with Docker Compose
docker-compose up -d

# Or use individual containers
docker run -d --name mongodb mongo:latest
docker run -d --name character-library -p 3000:3000 character-library:latest
```

## 🚀 Production Deployment

### Build and Deploy
```bash
# Build for production
npm run build

# Start production server
npm run serve

# Or use PM2 for process management
pm2 start ecosystem.config.js
```

### Deployment Options
- **Payload Cloud** - One-click deployment from GitHub
- **Vercel/Netlify** - Serverless deployment with MongoDB Atlas
- **Docker** - Containerized deployment on any platform
- **Traditional VPS** - Manual deployment on virtual private servers

## 📖 Documentation

- [High-Level Overview](docs/high-level-overview.md)
- [External Services Integration](docs/external-services/how-to-use-character-library.md)
- [Novel Movie Integration Requirements](docs/novel-required-improvements.md)
- [API Endpoints Reference](src/lib/api-endpoints.ts)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Open an issue on GitHub
- Contact the development team

---

**Character Library** - Powering the future of character-driven content creation with AI-enhanced asset management.
