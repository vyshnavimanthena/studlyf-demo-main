# API Contracts Specification

## Standard API Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {
    "timestamp": "2026-08-01T17:30:00.000Z",
    "requestId": "uuid-v4"
  }
}
```

## Error Response Format

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error",
  "errors": [],
  "meta": {
    "timestamp": "2026-08-01T17:30:00.000Z",
    "requestId": "uuid-v4"
  }
}
```
