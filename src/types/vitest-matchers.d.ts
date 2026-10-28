import "vitest";

// Vitest 5's browser jest-dom typings narrowed toHaveTextContent to string | number,
// but @testing-library/jest-dom (registered in setup-vitest.ts) also accepts a RegExp.
declare module "vitest" {
  // Type parameters must match Vitest's own declaration to merge.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  interface Assertion<T = any> {
    toHaveTextContent(
      text: string | number | RegExp,
      options?: { normalizeWhitespace: boolean },
    ): void;
  }
}
