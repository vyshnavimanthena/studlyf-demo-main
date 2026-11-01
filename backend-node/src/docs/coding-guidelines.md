# Coding Guidelines & Standards

1. **Strict Typing:** Never use `any`. Define interfaces or types in `interfaces/` or `shared/types/`.
2. **Controller Scope:** Controllers must remain lean. No database calls in controllers.
3. **Validation:** All incoming request bodies, queries, and params must be validated with Zod schemas.
4. **Error Handling:** Use custom `AppError` subclasses from `@shared/errors`.
5. **Barrel Exports:** Every module must export its public interface via `index.ts`.
