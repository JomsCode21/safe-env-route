# Release Notes

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added
- `strictUnknownKeys` option for `requireEnv` and `optionalEnv` (opt-in).
- Unknown key issue type: `unknown_key`.
- Typo suggestions for unknown keys (example: `API_URl` -> `API_URL`).
- Runnable demo: `examples/strict-unknown-keys.cjs`.
- Contributor guide: `CONTRIBUTING.md`.

### Changed
- Documentation now includes strict unknown-key usage and quick demo steps.
- Tests now cover strict mode enabled/disabled and typo suggestion behavior.
- Package rename: `safe-env-route` -> `feature-env`.

### Deprecated
- 

### Removed
- 

### Fixed
- Improved environment validation feedback for mis-typed env keys.

### Security
- 

---

## [1.1.0] - 2026-04-24

### Added
- Route/feature-aware environment validation API.
- Grouped schema support with `defineEnv`.
- Runtime validation helpers:
  - `requireEnv`
  - `optionalEnv`
- Built-in validators:
  - `str`
  - `url`
  - `bool`
  - `int`
  - `enumOf`
- Legacy compatibility exports under `feature-env/legacy`.
- CLI aliases:
  - `feature-env`
  - `env-checking`

### Changed
- N/A

### Fixed
- N/A

### Security
- N/A

---

## [1.0.0] - 2026-04-24

### Added
- Initial release of the project
- Core environment variable presence checks via legacy API.

### Changed
- N/A

### Fixed
- N/A

### Security
- N/A

---

## Release Guidelines

### Versioning
This project follows **Semantic Versioning (SemVer)**:
- **MAJOR**: incompatible API changes
- **MINOR**: backwards-compatible features
- **PATCH**: backwards-compatible bug fixes

---

## Notes

- Include links to issues or PRs when possible:
  - Example: Fixed login crash ([#42](https://example.com/issues/42))
- Highlight breaking changes clearly under a "Breaking Changes" section if needed.
- Keep entries concise and user-focused.

---

## Contributors

Thanks to everyone who contributed to this release:

- Name or GitHub handle
