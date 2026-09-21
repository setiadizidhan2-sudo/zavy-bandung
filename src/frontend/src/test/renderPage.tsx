import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactNode } from "react";

import type { MockActor } from "./mockActor";

/**
 * Renders a component inside the providers the app supplies at runtime
 * (`QueryClientProvider` + a real TanStack router), with `useActor` replaced by
 * a local typed mock.
 *
 * The router is a real one, so `<Link>` navigation and `useRouterState` behave
 * as they do in the app. `initialPath` seeds the memory history so a page that
 * reads search params (success, ticket) sees them.
 */
export interface RenderPageOptions {
  /** The component under test, mounted at `path`. */
  component: () => ReactNode;
  /** Route path, e.g. `/checkout`. */
  path: string;
  /** Initial URL, including any search params. Defaults to `path`. */
  initialPath?: string;
  /** Extra routes so `<Link to>` targets resolve. */
  extraRoutes?: Array<{ path: string; component: () => ReactNode }>;
}

export async function renderPage({
  component,
  path,
  initialPath,
  extraRoutes = [],
}: RenderPageOptions): Promise<RenderResult> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const routes = [
    createRoute({ getParentRoute: () => rootRoute, path, component }),
    ...extraRoutes.map((route) =>
      createRoute({
        getParentRoute: () => rootRoute,
        path: route.path,
        component: route.component,
      }),
    ),
  ];

  const router = createRouter({
    routeTree: rootRoute.addChildren(routes),
    history: createMemoryHistory({ initialEntries: [initialPath ?? path] }),
  });

  // The router resolves its first match asynchronously; without this the
  // provider renders an empty tree and every query fails on a blank body.
  await router.load();

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

/**
 * Builds the module shape a test's `vi.mock("@caffeineai/core-infrastructure")`
 * factory should return, with `useActor` bound to `actor`.
 */
export function coreInfrastructureMock(actor: MockActor) {
  return {
    useActor: () => ({ actor, isFetching: false }),
    InternetIdentityProvider: ({ children }: { children: ReactNode }) =>
      children,
    useInternetIdentity: () => ({
      identity: undefined,
      isAuthenticated: false,
      login: () => {},
      clear: () => {},
      loginStatus: "idle",
      isInitializing: false,
      isLoginIdle: true,
      isLoggingIn: false,
      isLoginSuccess: false,
      isLoginError: false,
    }),
  };
}
