import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/**
 * Shared test setup.
 *
 * The generated components expose `data-ocid` hooks rather than ARIA test ids,
 * so `data-ocid` is registered as the test-id attribute once here. Semantic
 * queries are still preferred wherever the markup offers them.
 */
configure({ testIdAttribute: "data-ocid" });

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

// jsdom does not implement matchMedia, which the app's responsive hooks read.
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// jsdom does not implement scrollTo, which the router's scroll restoration uses.
if (!window.scrollTo) {
  Object.defineProperty(window, "scrollTo", {
    writable: true,
    value: () => {},
  });
}
