# Character Library API Test Plan

## Overview
This document outlines a comprehensive test plan for all Character Library API endpoints using real data. Tests will be executed in logical order to ensure data dependencies are met.

## Test Environment
- **Base URL**: http://localhost:3000
- **Test Data**: Fictional character "Aria Shadowbane"
- **Test Method**: Manual API testing using curl commands
- **Dependencies**: Tests are ordered to create necessary data first

## Test Character Profile
**Name**: Aria Shadowbane
**Concept**: A skilled elven rogue with a mysterious past, seeking redemption for past mistakes.

## Test Execution Order

### Phase 1: Basic Character Management
1. **List Characters (GET /api/v1/characters)**
   - Verify empty or existing character list
   - Test pagination parameters

2. **Create Character (POST /api/v1/characters)**
   - Create Aria Shadowbane with complete persona data
   - Verify character creation and auto-generated characterId

3. **Get Specific Character (GET /api/v1/characters/{id})**
   - Retrieve the created character by ID
   - Verify all data fields are correctly stored

4. **Update Character (PATCH /api/v1/characters/{id})**
   - Update character status and add additional details
   - Verify changes are persisted

### Phase 2: PathRAG Knowledge Base Management
5. **PathRAG Health Check (POST /api/v1/pathrag/manage)**
   - Verify PathRAG service is healthy and accessible

6. **Sync Character to PathRAG (POST /api/v1/pathrag/manage)**
   - Sync the created character to the knowledge base
   - Verify successful synchronization

7. **Get PathRAG Stats (POST /api/v1/pathrag/manage)**
   - Retrieve knowledge base statistics
   - Verify character data is indexed

### Phase 3: Character Query System
8. **Query Character Knowledge (POST /api/v1/characters/query)**
   - Test various natural language queries about Aria
   - Test different response types and parameters

9. **Get Query Stats (GET /api/v1/characters/query?action=stats)**
   - Retrieve PathRAG statistics via query endpoint

### Phase 4: Image Generation & Management
10. **Generate Character Image (POST /api/v1/characters/{id}/generate-image)**
    - Generate a master reference image for Aria
    - Test different prompts and styles

11. **Generate 360° Core Set (POST /api/v1/characters/{id}/generate-core-set)**
    - Generate comprehensive reference angles
    - Requires master reference image from previous step

### Phase 5: Quality Assurance
12. **Validate Character Consistency (POST /api/v1/characters/{id}/validate-consistency)**
    - Run consistency validation across all character images
    - Verify quality scores and recommendations

13. **QA Configuration (GET /api/v1/qa/config)**
    - Retrieve current QA thresholds and settings

14. **Run QA on Assets (POST /api/v1/qa)**
    - Test quality assurance on generated images
    - Verify consistency and quality scoring

### Phase 6: Media Management
15. **List Media (GET /api/media)**
    - Retrieve all uploaded media files
    - Verify character images are properly stored

16. **Get Specific Media (GET /api/media/{id})**
    - Retrieve specific media file details

### Phase 7: Advanced Operations
17. **Delete Character (DELETE /api/v1/characters/{id})**
    - Clean up test data (optional, for cleanup)

## Test Data Templates

### Character Creation Payload
```json
{
  "name": "Aria Shadowbane",
  "status": "draft",
  "biography": {
    "root": {
      "type": "root",
      "children": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Born in the twilight forests of Elderwood, Aria was raised by a secretive guild of shadow dancers. Her early years were marked by rigorous training in stealth, acrobatics, and the ancient art of shadow manipulation."
            }
          ]
        }
      ],
      "direction": null,
      "format": "",
      "indent": 0,
      "version": 1
    }
  },
  "personality": {
    "root": {
      "type": "root",
      "children": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Aria is introspective and cautious, preferring to observe before acting. She has a dry sense of humor and struggles with trust issues due to past betrayals. Despite her guarded nature, she has a strong moral compass and will risk everything to protect the innocent."
            }
          ]
        }
      ],
      "direction": null,
      "format": "",
      "indent": 0,
      "version": 1
    }
  },
  "motivations": {
    "root": {
      "type": "root",
      "children": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Driven by a need to atone for past mistakes that led to the destruction of her guild. She seeks to uncover the truth behind the betrayal that cost her everything and find a way to honor her fallen comrades."
            }
          ]
        }
      ],
      "direction": null,
      "format": "",
      "indent": 0,
      "version": 1
    }
  },
  "backstory": {
    "root": {
      "type": "root",
      "children": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Five years ago, Aria's guild was ambushed during what should have been a routine mission. She was the sole survivor, saved only by her mentor's sacrifice. The attack was orchestrated by someone with intimate knowledge of their operations, suggesting a traitor within their ranks."
            }
          ]
        }
      ],
      "direction": null,
      "format": "",
      "indent": 0,
      "version": 1
    }
  },
  "skills": [
    {
      "skill": "Stealth",
      "level": "expert",
      "description": "Master of moving unseen and unheard through any environment"
    },
    {
      "skill": "Shadow Magic",
      "level": "advanced",
      "description": "Can manipulate shadows for concealment and minor illusions"
    },
    {
      "skill": "Dual Wielding",
      "level": "expert",
      "description": "Exceptional skill with paired daggers and short swords"
    },
    {
      "skill": "Acrobatics",
      "level": "master",
      "description": "Incredible agility and parkour abilities"
    }
  ],
  "age": 127,
  "height": "5'6\"",
  "weight": "125 lbs",
  "eyeColor": "Violet",
  "hairColor": "Silver-white",
  "physicalDescription": {
    "root": {
      "type": "root",
      "children": [
        {
          "type": "paragraph",
          "children": [
            {
              "type": "text",
              "text": "Aria is a lithe elf with an athletic build honed by years of training. Her silver-white hair is often braided with small charms and trinkets. Her violet eyes seem to shimmer with an inner light, and intricate tattoos of shadow patterns wind around her arms and shoulders. She moves with fluid grace, every gesture purposeful and controlled."
            }
          ]
        }
      ],
      "direction": null,
      "format": "",
      "indent": 0,
      "version": 1
    }
  }
}
```

## Expected Results
- All endpoints should return appropriate HTTP status codes
- Character data should be consistently stored and retrieved
- PathRAG integration should successfully index character information
- Image generation should produce valid media files
- Quality assurance should provide meaningful scores and feedback

## Success Criteria
- ✅ All API endpoints respond without errors
- ✅ Character data is properly stored and retrievable
- ✅ PathRAG knowledge base is successfully populated
- ✅ Natural language queries return relevant results
- ✅ Image generation workflow completes successfully
- ✅ Quality assurance validates generated content

## Notes
- Some endpoints may require external services (PathRAG, DINOv3) to be running
- Image generation may take significant time to complete
- Quality assurance requires images to be present before validation
