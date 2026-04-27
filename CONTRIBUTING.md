# Contributing Guide

Thanks for contributing to `feature-env`.

For package installation and usage examples, see `README.md`.

## Prerequisites

- Node.js 18+ (recommended)
- npm
- Git

## Local Setup

```bash
npm install
```

## Development Commands

- Build package: `npm run build`
- Build test output: `npm run build:test`
- Run tests: `npm test`
- Full verification (build + tests): `npm run check`

## Build Lifecycle Hooks

Build scripts use npm lifecycle hooks:

- `prebuild` runs `clean`
- `build` compiles TypeScript to `dist/`
- `postbuild` verifies required build outputs exist
- `prebuild:test` runs `clean:test`
- `build:test` compiles test TypeScript to `.test-dist/`
- `postbuild:test` verifies required test build outputs exist

## Project Structure

- `src/` - package source code
- `test/` - TypeScript tests
- `.test-dist/` - compiled test output
- `examples/` - runnable usage examples

## Contribution Workflow

1. Create a branch from `main`.
2. Make focused changes.
3. Run `npm run check`.
4. Commit with a clear message.
5. Open a pull request.

## Commit Message Suggestions

Use concise, descriptive messages. Examples:

- `feat: add strict unknown env key validation`
- `fix: improve enum validator error detail`
- `docs: add strict mode usage example`
- `test: cover optionalEnv strict unknown keys`

## Pull Request Checklist

- [ ] Code is focused and readable
- [ ] New behavior includes tests
- [ ] Existing tests still pass
- [ ] README/docs updated if behavior changed

## Testing Guidance

- Add tests near related behavior in `test/*.test.ts`.
- Prefer small, explicit test cases for:
  - missing keys
  - invalid values
  - group selection behavior
  - strict unknown key handling (if touched)

## Versioning and Releases

This project follows SemVer:

- Patch: bug fixes (`1.2.0 -> 1.2.1`)
- Minor: backward-compatible features (`1.2.0 -> 1.3.0`)
- Major: breaking changes (`1.x.x -> 2.0.0`)

Release flow:

```bash
npm run check
npm version <patch|minor|major>
npm publish --access public
git push && git push --tags
```

## Reporting Issues

When opening an issue, include:

- Expected behavior
- Actual behavior
- Minimal reproduction
- Node/npm versions
- Relevant env keys/schema snippet (if applicable)
