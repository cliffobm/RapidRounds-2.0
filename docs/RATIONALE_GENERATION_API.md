# Rationale Generation API Documentation

## Overview

The rationale generation feature uses OpenAI's GPT-4o-mini model to provide comprehensive, educational explanations for medical scenarios and questions.

## API Endpoint

**POST** `/api/access/rationale`

## Request Format

```json
{
  "scenarioItemId": "required-scenario-id",
  "prompt": "Medical question or scenario description",
  "generate": true
}
```

### Parameters

- **`scenarioItemId`** (required): Unique identifier for the scenario
- **`prompt`** (required when `generate: true`): The medical question or scenario to generate rationale for
- **`generate`** (optional): Set to `true` to generate rationale, omit or `false` to only check access

## Response Format

### Success Response (with rationale generation)

```json
{
  "access": {
    "hasAccess": true,
    "reason": "premium",
    "message": "Access granted"
  },
  "counters": {
    "rationalesUsed": 3,
    "scenariosCompleted": 5
  },
  "rationale": {
    "rationale": "Generated educational explanation...",
    "model": "gpt-4o-mini",
    "usage": {
      "prompt_tokens": 150,
      "completion_tokens": 300,
      "total_tokens": 450
    }
  }
}
```

### Access Check Only Response

```json
{
  "access": {
    "hasAccess": true,
    "reason": "premium",
    "message": "Access granted"
  },
  "counters": {
    "rationalesUsed": 3,
    "scenariosCompleted": 5
  }
}
```

### Error Responses

```json
{
  "error": "Missing required parameters"
}
```

```json
{
  "error": "AI features not available - missing API key"
}
```

```json
{
  "error": "Failed to generate rationale"
}
```

## Usage Examples

### 1. Check Access Only

```javascript
const response = await fetch('/api/access/rationale', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    scenarioItemId: 'scenario-123'
  })
});

const data = await response.json();
console.log('Access:', data.access);
```

### 2. Generate Rationale

```javascript
const response = await fetch('/api/access/rationale', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    scenarioItemId: 'scenario-123',
    prompt: 'A 45-year-old patient presents with chest pain. ECG shows ST elevation in leads II, III, and aVF. What is the diagnosis?',
    generate: true
  })
});

const data = await response.json();

if (data.rationale) {
  console.log('Generated rationale:', data.rationale.rationale);
} else {
  console.log('Access denied:', data.access.message);
}
```

## Access Control

The API respects the following access levels:

- **Premium Users**: Unlimited rationale generation
- **Trial Users**: Limited rationale generation (based on trial limits)
- **Free Users**: Limited rationale generation (5 free rationales)

## Error Handling

### Common Error Scenarios

1. **Missing API Key**: Returns 503 when OpenAI API key is not configured
2. **Access Denied**: Returns access information when user doesn't have permission
3. **Invalid Request**: Returns 400 for missing required parameters
4. **Generation Failure**: Returns 500 when OpenAI API call fails

### Best Practices

1. **Always check access first** before attempting to generate rationale
2. **Handle rate limiting** gracefully in your UI
3. **Cache rationale responses** to avoid unnecessary API calls
4. **Provide fallback content** when AI generation fails

## Environment Setup

### Required Environment Variables

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Testing

Use the provided test script to verify functionality:

```bash
npx tsx scripts/test-rationale-generation.ts
```

## Rate Limits and Costs

- **Model**: GPT-4o-mini (cost-effective)
- **Max Tokens**: 1000 per request
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Rate Limits**: Subject to OpenAI's API limits

## Security Considerations

1. **API Key Protection**: OpenAI API key is server-side only
2. **User Authentication**: All requests require valid user authentication
3. **Access Control**: Respects user subscription levels
4. **Input Validation**: All prompts are validated before sending to OpenAI

## Monitoring and Debugging

- **Logs**: Check server logs for OpenAI API errors
- **Usage Tracking**: Monitor token usage through OpenAI dashboard
- **Access Logs**: Track user access patterns through Supabase
- **Error Rates**: Monitor API error rates in Vercel dashboard
