// Set environment variables before any imports
(process.env as any).NODE_ENV = "test";
(process.env as any).NEXT_PUBLIC_API_URL = "https://api.test.com";

import "@testing-library/jest-dom";
import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with React Testing Library's matchers
expect.extend(matchers);

// Mock 'server-only' for client/component tests
vi.mock('server-only', () => ({
  __esModule: true,
  default: () => {},
}));

// Mock fetch globally if not present
if (!globalThis.fetch) {
  globalThis.fetch = (...args: any[]) =>
    Promise.reject(new Error('global fetch not mocked in vitest.setup.ts'));
}

// Clean up and reset mocks after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
});
