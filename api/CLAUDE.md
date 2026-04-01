# Advertize API Project Guide

## Documentation Synchronization

- **Sync Script**: `sh/sync-docs.sh` (at project root)
- **Requirement**: After updating `CLAUDE.md`, `GEMINI.md`, or `AGENTS.md`, you **MUST** run the synchronization script from the directory where the files reside to ensure all agent-specific guide files are up to date. The script detects the most recently modified file and copies its content to the others.
- **Execution**: Run `../sh/sync-docs.sh` from the `api` directory.

## Technology Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL (TypeORM)
- **Security**: Helmet, CORS, CSRF (csrf-csrf), cookie-parser
- **Monitoring**: New Relic
- **Rate Limiting**: @nestjs/throttler
- **Configuration**: node-config (config package)
- **Documentation**: Swagger (@nestjs/swagger)

## Environment & Tooling

- **NPM Settings**: We use `legacy-peer-deps=true` when running `npm install` due to strict peer dependency requirements in NestJS and related packages.
- **CI/CD**: GitHub Actions (`api-e2e.yml`) runs dependency installation, `typecheck`, `build`, and end-to-end (`e2e`) tests.

## Commands

### Development

- `npm run start:dev`: Starts the application in development mode with watch mode.
- `npm run build`: Compiles the application.
- `npm run typecheck`: Runs TypeScript compiler without emitting files to check for type errors.
- `npm run lint`: Runs ESLint for code quality checks.

### Testing

- `npm run test`: Runs unit tests.
- `npm run test:e2e`: Runs end-to-end tests (requires database connection).
- **Jest Config**: The configuration for Jest is maintained in `jest.config.json` and `test/jest-e2e.json`.

## Coding Standards & Patterns

- **Architecture**: Follow standard NestJS modular architecture (Module, Controller, Service).
- **Naming**: Use camelCase for variables/functions, PascalCase for classes/interfaces.
- **DTOs**: Use `class-validator` for request validation in DTOs. Ensure DTOs have `@ApiProperty()` decorators for Swagger documentation.
- **Entities**: Use TypeORM decorators for database mapping.
- **Error Handling**: Use NestJS built-in `HttpException` classes.
- **Configuration**: Use the `config` package for non-sensitive values and `.env` for secrets.

## API Documentation

- **Swagger UI**: Accessible at `/api`. Note that Swagger is explicitly configured to only be available when `NODE_ENV === 'development'`. Ensure controllers have `@ApiTags()` and `@ApiOperation()` decorators for comprehensive API specifications.

## Project Structure

- `src/adspaces`: Core module for advertising spaces management.
- `src/grid`: Module for Excel data export using `exceljs`.
- `src/healthcheck`: Simple health check endpoint.
- `src/common`: Shared interceptors, filters, and utilities (e.g., New Relic).
- `config/`: Application configuration files.

## Database

Currently uses `synchronize: true` in development (TypeORM). Database is hosted on Supabase.
Connection details are managed via `DATABASE_URL` in `.env`.
