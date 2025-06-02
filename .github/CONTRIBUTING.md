# Contributing to NexusAI

Thank you for your interest in contributing to NexusAI! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Environment](#development-environment)
4. [Coding Standards](#coding-standards)
5. [Making Changes](#making-changes)
6. [Testing](#testing)
7. [Documentation](#documentation)
8. [Submitting Changes](#submitting-changes)
9. [Review Process](#review-process)

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/nexus-ai.git
   cd nexus-ai
   ```
3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/original/nexus-ai.git
   ```
4. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Environment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Additional scripts:
   - `npm run build` - Build the project
   - `npm run typecheck` - Run TypeScript type checking
   - `npm run lint` - Lint the codebase
   - `npm run format` - Format code with Prettier
   - `npm run analyze` - Analyze the bundle size

## Coding Standards

We follow a set of coding standards to maintain consistency across the codebase:

1. **TypeScript**: All code should be written in TypeScript
2. **ESLint**: Follow the rules in `.eslintrc.js`
3. **Prettier**: Format code according to `.prettierrc.json`
4. **File Names**: Use kebab-case for file names
5. **Component Names**: Use PascalCase for component names
6. **Function Names**: Use camelCase for function names
7. **Documentation**: Add JSDoc comments for complex functions

See the [Naming Convention](../src/lib/naming-convention.md) document for more details.

## Making Changes

1. Make focused changes that address a specific issue or feature
2. Follow the project's architecture and patterns
3. Keep commits small and focused
4. Write clear commit messages:
   ```
   feat: add support for new AI provider
   
   - Implement provider class
   - Add models to models.ts
   - Update factory to create the provider
   ```

## Testing

1. Manually test your changes
2. Consider adding automated tests when applicable
3. Ensure existing functionality still works

## Documentation

1. Update documentation to reflect your changes
2. Add JSDoc comments to functions and components
3. Consider updating the README.md if needed
4. Add inline comments for complex logic

## Submitting Changes

1. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

2. Pull the latest changes from upstream:
   ```bash
   git pull upstream main
   ```

3. Resolve any conflicts

4. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a pull request from your branch to the main repository

## Review Process

1. All pull requests will be reviewed by maintainers
2. Address any feedback from the review
3. Once approved, your changes will be merged

Thank you for contributing to NexusAI!