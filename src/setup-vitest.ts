import React from "react";
import { expect, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

// Provide the minimal Next.js image configuration so <Image /> can render in tests.
const nextImageOptions = JSON.stringify({
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  path: "/",
  loader: "default",
});

const globalProcess =
  typeof process === "undefined"
    ? (((globalThis as Record<string, unknown>).process = {
        env: {},
      }) as NodeJS.Process)
    : process;

let environment = globalProcess.env as
  | Record<string, string | undefined>
  | undefined;

if (!environment) {
  environment = {} as Record<string, string | undefined>;
  globalProcess.env = environment as NodeJS.ProcessEnv;
}

const mutableEnvironment = environment;

if (!mutableEnvironment.NODE_ENV) {
  mutableEnvironment.NODE_ENV = "test";
}

if (!mutableEnvironment.__NEXT_IMAGE_OPTS) {
  mutableEnvironment.__NEXT_IMAGE_OPTS = nextImageOptions;
}

// Vitest does not execute the Next.js image optimizer logic, so mock <Image />
// to behave like a regular <img> while still allowing props assertions.
const MockedNextImage = React.forwardRef<
  HTMLImageElement,
  React.ComponentProps<"img">
>(({ alt, ...rest }, reference) =>
  React.createElement("img", { alt, ref: reference, ...rest }),
);

MockedNextImage.displayName = "NextImageMock";

vi.mock("next/image", () => ({
  __esModule: true,
  default: MockedNextImage,
}));
