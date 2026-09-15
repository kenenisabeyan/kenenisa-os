# Intelligence Core REST API Specification

Base URL: `/api/v1/intelligence`
Authentication: Required (`requireAuth` via cookie session)

---

## Endpoints

### `POST /api/v1/intelligence/chat`
Submit a message to the Intelligence Core.

#### Request Body
```json
{
  "conversationId": "optional-uuid",
  "message": "What should I focus on today?"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "conversationId": "uuid",
    "message": {
      "id": "uuid",
      "role": "ASSISTANT",
      "content": "Based on your operating context..."
    },
    "facts": ["Fact 1"],
    "inferences": ["Inference 1"],
    "recommendations": ["Recommendation 1"],
    "proposal": null
  }
}
```

---

### `POST /api/v1/intelligence/actions/confirm`
Confirm or cancel a proposed AI action.

#### Request Body
```json
{
  "proposalId": "proposal-id",
  "confirm": true
}
```

---

### Conversations API
- `GET /api/v1/intelligence/conversations`
- `GET /api/v1/intelligence/conversations/:id/messages`
- `DELETE /api/v1/intelligence/conversations/:id`

---

### Memory API
- `GET /api/v1/intelligence/memory`
- `POST /api/v1/intelligence/memory`
- `PATCH /api/v1/intelligence/memory/:id`
- `POST /api/v1/intelligence/memory/:id/archive`
