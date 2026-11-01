# Migration Notes & Guidelines

- **FastAPI Parity:** Maintain exact route pathing and status code responses.
- **Incremental Cutover:** Reverse proxy can route endpoints individually between Python and Node.js.
- **Database Parity:** MongoDB collection names and field mappings must remain identical to the FastAPI implementation.
