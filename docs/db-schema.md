# Database Schema Documentation

## Overview
This document describes the database schema for the RapidRounds nursing education platform. The schema is designed to support a comprehensive learning management system with scenarios, questions, progress tracking, and gamification features.

## Entity Relationship Diagram (ERD)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    profiles     │    │  institutions   │    │   categories    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ email           │    │ name            │    │ slug            │
│ full_name       │    │ domain          │    │ name            │
│ avatar_url      │    │ settings        │    │ description     │
│ role            │    │ created_at      │    │ icon            │
│ institution_id  │    │ updated_at      │    │ color           │
│ created_at      │    └─────────────────┘    │ sort_order      │
│ updated_at      │                           │ is_active       │
└─────────────────┘                           │ created_at      │
         │                                     │ updated_at      │
         │                                     └─────────────────┘
         │                                              │
         │                                              │
         ▼                                              │
┌─────────────────┐    ┌─────────────────┐              │
│  profile_options│    │    scenarios    │              │
├─────────────────┤    ├─────────────────┤              │
│ id (PK)         │    │ id (PK)         │              │
│ user_id (FK)    │    │ title           │              │
│ option_key      │    │ description     │              │
│ option_value    │    │ content         │              │
│ created_at      │    │ difficulty      │              │
│ updated_at      │    │ category        │              │
└─────────────────┘    │ category_id (FK)│              │
                       │ is_custom       │              │
                       │ author_id (FK)  │              │
                       │ institution_id  │              │
                       │ is_published    │              │
                       │ estimated_duration│            │
                       │ learning_objectives│            │
                       │ tags            │              │
                       │ created_at      │              │
                       │ updated_at      │              │
                       └─────────────────┘              │
                                │                       │
                                │                       │
                                ▼                       │
┌─────────────────┐    ┌─────────────────┐              │
│    questions    │    │scenario_categories│            │
├─────────────────┤    ├─────────────────┤              │
│ id (PK)         │    │ id (PK)         │              │
│ scenario_id (FK)│    │ scenario_id (FK)│              │
│ question_text   │    │ category_id (FK)│              │
│ question_type   │    │ is_primary      │              │
│ options         │    │ created_at      │              │
│ correct_answer  │    └─────────────────┘              │
│ explanation     │                                     │
│ rationale       │                                     │
│ points          │                                     │
│ difficulty      │                                     │
│ category        │                                     │
│ time_limit      │                                     │
│ sort_order      │                                     │
│ is_active       │                                     │
│ created_at      │                                     │
│ updated_at      │                                     │
└─────────────────┘                                     │
         │                                               │
         │                                               │
         ▼                                               │
┌─────────────────┐    ┌─────────────────┐              │
│ student_answers │    │ student_progress│              │
├─────────────────┤    ├─────────────────┤              │
│ id (PK)         │    │ id (PK)         │              │
│ student_id (FK) │    │ student_id (FK) │              │
│ question_id (FK)│    │ scenario_id (FK)│              │
│ scenario_id (FK)│    │ status          │              │
│ answer          │    │ score           │              │
│ is_correct      │    │ time_spent      │              │
│ points_earned   │    │ attempts        │              │
│ time_spent      │    │ answers         │              │
│ attempt_number  │    │ started_at      │              │
│ answered_at     │    │ completed_at    │              │
│ created_at      │    │ created_at      │              │
└─────────────────┘    │ updated_at      │              │
         │              └─────────────────┘              │
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       │
┌─────────────────┐    ┌─────────────────┐              │
│  student_badges │    │     badges      │              │
├─────────────────┤    ├─────────────────┤              │
│ id (PK)         │    │ id (PK)         │              │
│ student_id (FK) │    │ name            │              │
│ badge_id (FK)   │    │ description     │              │
│ earned_at       │    │ icon            │              │
└─────────────────┘    │ criteria        │              │
                       │ points          │              │
                       │ category        │              │
                       │ created_at      │              │
                       └─────────────────┘              │
                                                       │
                                                       │
                                                       ▼
                                               ┌─────────────────┐
                                               │  leaderboard_v  │
                                               ├─────────────────┤
                                               │ student_id      │
                                               │ student_name    │
                                               │ institution_id  │
                                               │ total_points    │
                                               │ scenarios_completed│
                                               │ average_score   │
                                               │ badges_earned   │
                                               │ last_activity   │
                                               │ rank            │
                                               └─────────────────┘
```

## Table Descriptions

### Core Tables

#### profiles
Stores user profile information including authentication details and role-based access.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users(id) |
| email | TEXT | User's email address |
| full_name | TEXT | User's full name |
| avatar_url | TEXT | URL to user's avatar image |
| role | TEXT | User role (student, educator, admin) |
| institution_id | UUID | Foreign key to institutions table |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last update timestamp |

#### institutions
Stores educational institution information and settings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Institution name |
| domain | TEXT | Institution email domain |
| settings | JSONB | Institution-specific settings |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last update timestamp |

#### categories
Normalized table for scenario categories with metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| slug | TEXT | URL-friendly category identifier |
| name | TEXT | Display name for category |
| description | TEXT | Category description |
| icon | TEXT | Icon identifier for UI |
| color | TEXT | Color code for UI theming |
| sort_order | INTEGER | Display order |
| is_active | BOOLEAN | Whether category is active |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last update timestamp |

### Content Tables

#### scenarios
Stores learning scenarios with content and metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Scenario title |
| description | TEXT | Scenario description |
| content | JSONB | Scenario content (patient info, vitals, etc.) |
| difficulty | TEXT | Difficulty level (beginner, intermediate, advanced) |
| category | TEXT | Legacy category field (deprecated) |
| category_id | UUID | Foreign key to categories table |
| is_custom | BOOLEAN | Whether scenario is custom created |
| author_id | UUID | Foreign key to profiles table |
| institution_id | UUID | Foreign key to institutions table |
| is_published | BOOLEAN | Whether scenario is published |
| estimated_duration | INTEGER | Estimated duration in minutes |
| learning_objectives | TEXT[] | Array of learning objectives |
| tags | TEXT[] | Array of tags for categorization |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last update timestamp |

#### questions
Normalized table for scenario questions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| scenario_id | UUID | Foreign key to scenarios table |
| question_text | TEXT | Question text |
| question_type | TEXT | Type of question (multiple_choice, text, etc.) |
| options | JSONB | Question options (for multiple choice) |
| correct_answer | JSONB | Correct answer(s) |
| explanation | TEXT | Answer explanation |
| rationale | TEXT | Clinical rationale |
| points | INTEGER | Points awarded for correct answer |
| difficulty | TEXT | Question difficulty level |
| category | TEXT | Question category (Assessment, Intervention, etc.) |
| time_limit | INTEGER | Time limit in seconds |
| sort_order | INTEGER | Display order |
| is_active | BOOLEAN | Whether question is active |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last update timestamp |

### Progress Tracking Tables

#### student_progress
Tracks student progress through scenarios.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| student_id | UUID | Foreign key to profiles table |
| scenario_id | UUID | Foreign key to scenarios table |
| status | TEXT | Progress status (not_started, in_progress, completed) |
| score | INTEGER | Final score percentage |
| time_spent | INTEGER | Time spent in minutes |
| attempts | INTEGER | Number of attempts |
| answers | JSONB | Student answers (legacy) |
| started_at | TIMESTAMP | When scenario was started |
| completed_at | TIMESTAMP | When scenario was completed |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last update timestamp |

#### student_answers
Normalized table for student answers to questions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| student_id | UUID | Foreign key to profiles table |
| question_id | UUID | Foreign key to questions table |
| scenario_id | UUID | Foreign key to scenarios table |
| answer | JSONB | Student's answer |
| is_correct | BOOLEAN | Whether answer is correct |
| points_earned | INTEGER | Points earned for this answer |
| time_spent | INTEGER | Time spent in seconds |
| attempt_number | INTEGER | Attempt number |
| answered_at | TIMESTAMP | When answer was submitted |
| created_at | TIMESTAMP | Record creation timestamp |

### Gamification Tables

#### badges
Stores badge definitions and criteria.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Badge name |
| description | TEXT | Badge description |
| icon | TEXT | Badge icon identifier |
| criteria | JSONB | Badge earning criteria |
| points | INTEGER | Points awarded for badge |
| category | TEXT | Badge category |
| created_at | TIMESTAMP | Record creation timestamp |

#### student_badges
Junction table for student-badge relationships.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| student_id | UUID | Foreign key to profiles table |
| badge_id | UUID | Foreign key to badges table |
| earned_at | TIMESTAMP | When badge was earned |

### User Preferences

#### profile_options
Stores user preferences and settings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to profiles table |
| option_key | TEXT | Preference key |
| option_value | JSONB | Preference value |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last update timestamp |

### Junction Tables

#### scenario_categories
Many-to-many relationship between scenarios and categories.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| scenario_id | UUID | Foreign key to scenarios table |
| category_id | UUID | Foreign key to categories table |
| is_primary | BOOLEAN | Whether this is the primary category |
| created_at | TIMESTAMP | Record creation timestamp |

### Views

#### leaderboard_v
Materialized view for leaderboard data.

| Column | Type | Description |
|--------|------|-------------|
| student_id | UUID | Student identifier |
| student_name | TEXT | Student's full name |
| institution_id | UUID | Institution identifier |
| total_points | INTEGER | Total points earned |
| scenarios_completed | INTEGER | Number of scenarios completed |
| average_score | NUMERIC | Average score across scenarios |
| badges_earned | INTEGER | Number of badges earned |
| last_activity | TIMESTAMP | Last activity timestamp |
| rank | INTEGER | Student's rank |

## Row Level Security (RLS) Policies

### Public Read Access
- **categories**: All active categories are publicly readable
- **scenarios**: Published scenarios are publicly readable
- **questions**: Questions for published scenarios are publicly readable
- **scenario_categories**: All scenario-category relationships are publicly readable
- **badges**: All badges are publicly readable

### Owner-Only Access
- **profiles**: Users can only read/update their own profile
- **profile_options**: Users can only manage their own preferences
- **student_progress**: Students can only manage their own progress
- **student_answers**: Students can only manage their own answers
- **student_badges**: Students can only view their own badges

### Educator/Admin Access
- **profiles**: Educators and admins can read all profiles
- **scenarios**: Educators and admins can manage all scenarios
- **student_progress**: Educators and admins can view all progress
- **student_answers**: Educators and admins can view all answers

## Indexes

### Performance Indexes
- `idx_profiles_email`: Email lookup
- `idx_profiles_role`: Role-based queries
- `idx_scenarios_category`: Category filtering
- `idx_scenarios_published`: Published scenario queries
- `idx_questions_scenario`: Question lookup by scenario
- `idx_student_progress_student`: Student progress queries
- `idx_student_answers_student`: Student answer queries

### Composite Indexes
- `idx_student_progress_student_scenario`: Unique constraint on student-scenario pairs
- `idx_student_answers_student_question_attempt`: Unique constraint on student-question-attempt

## Functions

### calculate_question_points(question_id, answer)
Calculates points earned for a given answer to a question.

### update_student_progress(student_id, scenario_id)
Updates student progress based on completed questions and calculates final score.

## Triggers

### Updated At Triggers
All tables with `updated_at` columns have triggers that automatically update the timestamp when records are modified.

## Data Types

### JSONB Usage
- **scenarios.content**: Complex scenario data including patient info, vitals, and flow
- **questions.options**: Multiple choice options
- **questions.correct_answer**: Flexible answer format
- **student_answers.answer**: Student response data
- **profile_options.option_value**: Flexible preference storage
- **badges.criteria**: Badge earning criteria

### Array Types
- **scenarios.learning_objectives**: TEXT[] for learning objectives
- **scenarios.tags**: TEXT[] for categorization tags
- **lessons.prerequisites**: UUID[] for prerequisite scenarios

## Constraints

### Check Constraints
- **profiles.role**: Must be 'student', 'educator', or 'admin'
- **scenarios.difficulty**: Must be 'beginner', 'intermediate', or 'advanced'
- **questions.question_type**: Must be valid question type
- **questions.difficulty**: Must be valid difficulty level
- **badges.category**: Must be valid badge category

### Unique Constraints
- **profiles.id**: Primary key
- **categories.slug**: Unique category identifier
- **student_progress**: Unique on (student_id, scenario_id)
- **student_answers**: Unique on (student_id, question_id, attempt_number)
- **profile_options**: Unique on (user_id, option_key)
- **scenario_categories**: Unique on (scenario_id, category_id)
