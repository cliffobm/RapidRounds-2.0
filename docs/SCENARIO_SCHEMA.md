# Scenario Schema Documentation

This document describes the data structure and payload formats for scenarios and scenario items in RapidRounds.

## 📋 Database Schema

### scenarios Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| system | TEXT | Body system (e.g., "Cardiovascular", "Respiratory") |
| title | TEXT | Scenario title |
| vignette | TEXT | Patient scenario description |
| difficulty | TEXT | "beginner", "intermediate", or "advanced" |
| category | TEXT | Scenario category for filtering |
| estimated_duration | INTEGER | Estimated completion time in minutes |
| learning_objectives | TEXT[] | Array of learning objectives |
| tags | TEXT[] | Array of tags for categorization |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### scenario_items Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| scenario_id | UUID | Foreign key to scenarios table |
| type | TEXT | Question type: "mcq", "multi", "order", "input" |
| payload | JSONB | Question data (see payload formats below) |
| sort_order | INTEGER | Display order within scenario |
| created_at | TIMESTAMP | Creation timestamp |

## 🔧 Scenario Item Payload Formats

### Multiple Choice Questions (mcq)

```json
{
  "question": "What is the normal heart rate range for adults?",
  "options": [
    {
      "id": "a",
      "text": "40-60 bpm"
    },
    {
      "id": "b", 
      "text": "60-100 bpm"
    },
    {
      "id": "c",
      "text": "80-120 bpm"
    },
    {
      "id": "d",
      "text": "100-140 bpm"
    }
  ],
  "correct_answers": ["b"],
  "points": 10,
  "explanation": "Normal adult resting heart rate is 60-100 bpm",
  "category": "assessment",
  "difficulty": "beginner"
}
```

### Multi-Select Questions (multi)

```json
{
  "question": "Which of the following are signs of cardiac distress? (Select all that apply)",
  "options": [
    {
      "id": "a",
      "text": "Chest pain"
    },
    {
      "id": "b",
      "text": "Shortness of breath"
    },
    {
      "id": "c", 
      "text": "Normal appetite"
    },
    {
      "id": "d",
      "text": "Diaphoresis"
    }
  ],
  "correct_answers": ["a", "b", "d"],
  "points": 15,
  "explanation": "Multiple signs indicate cardiac distress requiring immediate attention",
  "category": "assessment",
  "difficulty": "intermediate"
}
```

### Drag-to-Order Questions (order)

```json
{
  "question": "Arrange these nursing interventions in order of priority (first to last):",
  "options": [
    {
      "id": "a",
      "text": "Call for emergency assistance"
    },
    {
      "id": "b",
      "text": "Assess airway, breathing, circulation"
    },
    {
      "id": "c",
      "text": "Obtain vital signs"
    },
    {
      "id": "d",
      "text": "Administer prescribed medications"
    }
  ],
  "correct_answers": ["a", "b", "c", "d"],
  "points": 20,
  "explanation": "Priority follows emergency protocols: call for help, assess ABCs, monitor vitals, then medications",
  "category": "intervention",
  "difficulty": "advanced"
}
```

### Text Input Questions (input)

```json
{
  "question": "Describe the priority nursing assessment for a patient presenting with chest pain:",
  "placeholder": "Enter your assessment approach...",
  "correct_answers": [
    "Assess pain characteristics using PQRST method, obtain vital signs, perform focused cardiac assessment, and prepare for 12-lead ECG"
  ],
  "points": 25,
  "explanation": "Comprehensive chest pain assessment requires systematic approach",
  "category": "assessment", 
  "difficulty": "advanced",
  "rubric": {
    "keywords": ["PQRST", "vital signs", "cardiac assessment", "ECG"],
    "partial_credit": true,
    "min_length": 50
  }
}
```

## 🎓 Rationale System

### rationales Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| scenario_item_id | UUID | Foreign key to scenario_items |
| hint | TEXT | Brief hint for free users |
| full | TEXT | Complete explanation for premium users |
| created_at | TIMESTAMP | Creation timestamp |

### Rationale Content Structure

```json
{
  "hint": "Consider the patient's vital signs and presenting symptoms",
  "full": "The patient presents with classic signs of acute coronary syndrome. The elevated troponin I (2.5 ng/mL) is significantly above normal (<0.04 ng/mL) and indicates myocardial injury. Combined with the crushing chest pain at rest, diaphoresis, and associated symptoms, this strongly suggests ST-elevation myocardial infarction requiring immediate intervention. References: AHA 2020 Guidelines for Management of STEMI, Nursing Critical Care Guidelines 2023."
}
```

## 📊 Patient Data Structure

### Patient Information
```json
{
  "name": "John Martinez",
  "age": 58,
  "gender": "male",
  "allergies": ["Penicillin"],
  "medications": ["Lisinopril 10mg daily", "Metformin 500mg BID"],
  "medicalHistory": ["Hypertension", "Type 2 Diabetes", "Hyperlipidemia"]
}
```

### Vital Signs
```json
{
  "heartRate": 110,
  "bloodPressure": {
    "systolic": 160,
    "diastolic": 95
  },
  "temperature": 98.6,
  "respiratoryRate": 22,
  "oxygenSaturation": 94,
  "painLevel": 8
}
```

### Lab Results
```json
{
  "Troponin I": {
    "value": 2.5,
    "unit": "ng/mL", 
    "normal": false,
    "critical": true
  },
  "CK-MB": {
    "value": 15,
    "unit": "ng/mL",
    "normal": false,
    "critical": false
  }
}
```

## 🎮 Gamification Schema

### achievements Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Achievement title |
| description | TEXT | Achievement description |
| icon | TEXT | Icon identifier (lucide-react icon name) |
| category | TEXT | "performance", "consistency", "learning", "social", "milestone" |
| rarity | TEXT | "common", "uncommon", "rare", "epic", "legendary" |
| xp_reward | INTEGER | XP points awarded |
| requirements | JSONB | Unlock requirements |
| is_active | BOOLEAN | Whether achievement is active |

### Achievement Requirements Format

```json
{
  "scenarios_completed": 10,
  "streak_days": 7,
  "perfect_scores": 1,
  "category_mastery": "cardiac",
  "lessons_completed": 5,
  "students_helped": 3
}
```

## 📚 Lesson Schema

### lessons Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Lesson title |
| description | TEXT | Lesson description |
| duration_min | INTEGER | Duration in minutes |
| content_url | TEXT | URL to lesson content |
| content_type | TEXT | "video", "reading", "interactive", "assessment" |
| difficulty | TEXT | "beginner", "intermediate", "advanced" |
| prerequisites | UUID[] | Array of prerequisite lesson IDs |
| learning_objectives | TEXT[] | Array of learning objectives |
| tags | TEXT[] | Array of tags |
| is_published | BOOLEAN | Whether lesson is published |

### lesson_checkpoints Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| lesson_id | UUID | Foreign key to lessons |
| question | TEXT | Checkpoint question |
| options | JSONB | Question options (for MCQ) |
| answer_key | TEXT | Correct answer |
| explanation | TEXT | Answer explanation |
| points | INTEGER | Points awarded |
| sort_order | INTEGER | Display order |

## 🔐 Access Control

### Subscription Tiers

#### Free Tier
- 5 scenarios per month
- 5 free rationale explanations (total)
- Basic progress tracking
- Community leaderboards

#### Trial Tier (7 days)
- Unlimited scenario access
- Unlimited rationale explanations
- All premium features
- Advanced analytics

#### Premium Tier
- Unlimited everything
- Priority support
- Offline content download
- Institution leaderboards
- Custom study plans

### Usage Tracking

```json
{
  "user_id": "uuid",
  "usage_type": "free|premium",
  "count": 3,
  "updated_at": "2024-12-14T10:00:00Z"
}
```

## 🔄 Data Flow

### Scenario Completion Flow

1. **User starts scenario** → Create progress entry
2. **User answers questions** → Update progress with answers
3. **User completes scenario** → Calculate score, award XP
4. **Check for achievements** → Unlock badges if criteria met
5. **Update leaderboards** → Recalculate rankings
6. **Sync to server** → Persist progress data

### Rationale Access Flow

1. **User requests rationale** → Check subscription tier
2. **Verify usage limits** → Query rationale_usage table
3. **Return appropriate content** → Hint vs full explanation
4. **Track usage** → Increment counter for free users
5. **Show upgrade prompts** → If limits exceeded

## 📱 Mobile Considerations

### Swipe Gestures
- **Left Swipe**: Navigate to next item
- **Right Swipe**: Bookmark/flag current item
- **Tap**: Select options or activate buttons
- **Long Press**: Show additional options (future)

### Touch Targets
- Minimum 44px × 44px for all interactive elements
- Comfortable spacing between adjacent targets
- Visual feedback for touch interactions
- Haptic feedback for important actions (future)

### Performance
- Lazy loading for off-screen content
- Efficient list virtualization for large datasets
- Optimized images with proper sizing
- Minimal JavaScript bundles for mobile

## 🧪 Testing Guidelines

### Component Testing
- Test all interactive states (default, hover, focus, disabled)
- Verify accessibility attributes and keyboard navigation
- Test with different data scenarios (empty, error, loading)
- Validate responsive behavior across viewports

### Scenario Testing
- Complete scenario flow from start to finish
- Test all question types and interactions
- Verify bookmark and progress persistence
- Test access control and monetization gates

### Performance Testing
- Load time under 3 seconds on 3G
- Smooth 60fps animations
- Efficient memory usage
- Proper cleanup and garbage collection



