# System Architecture Specification

## Overview
The Studlyf backend is structured as a modular monolith adhering to domain-driven design principles.

## Core Layers
1. **Controller Layer (`controllers/`):** Handles HTTP request/response parsing.
2. **Service Layer (`services/`):** Implements business logic orchestrations.
3. **Repository Layer (`repositories/`):** Handles data persistence operations via MongoDB driver.
4. **DTO Layer (`dto/`):** Defines request/response data shapes.
5. **Validation Layer (`validation/`):** Enforces runtime input contracts via Zod schemas.

## Data Flow
`Client Request -> Security/Auth Middleware -> Router -> Controller -> Service -> Repository -> MongoDB`
