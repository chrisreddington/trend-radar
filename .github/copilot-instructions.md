# Code Guidelines

- The code must follow JSDoc format. Only write comments when necessary to explain complex logic.
- Use descriptive variable and function names that clearly convey their purpose.
- Keep functions small and focused on a single task. If a function is getting too large, consider breaking it into smaller helper functions.
- Avoid using magic numbers or strings. Define constants for any values that are used multiple times.

# Considerations when making changes

- When making any code changes to implementation, ensure that you update (or create) the corresponding tests. Aim for 100% test coverage.
- Before marking your work as complete:
  - Run all tests to ensure everything is functioning as expected.
  - Run the linter to check for any style issues.

# Testing Style

- Use descriptive test names that clearly indicate what is being tested.
- Organize tests logically, grouping related tests together.
- Use `beforeEach` and `afterEach` hooks to set up and tear down any necessary state for tests. Avoid any repetitive setup code within individual tests and do this up front, keeping tests DRY.
