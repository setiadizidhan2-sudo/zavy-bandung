import { Layout } from "@/components/Layout";
import { StickyBuyBar } from "@/components/StickyBuyBar";
import { CheckoutPage } from "@/pages/CheckoutPage";
import EventPage from "@/pages/EventPage";
import HomePage from "@/pages/HomePage";
import { PaymentPage } from "@/pages/PaymentPage";
import { SuccessPage } from "@/pages/SuccessPage";
import { TermsPage } from "@/pages/TermsPage";
import { TicketPage } from "@/pages/TicketPage";
import TicketsPage from "@/pages/TicketsPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
      <StickyBuyBar />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const eventRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/event",
  component: EventPage,
});

const ticketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tickets",
  component: TicketsPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment",
  component: PaymentPage,
});

const successRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/success",
  validateSearch: (
    search: Record<string, unknown>,
  ): { order?: string; tokens?: string } => ({
    order: typeof search.order === "string" ? search.order : undefined,
    tokens: typeof search.tokens === "string" ? search.tokens : undefined,
  }),
  component: SuccessPage,
});

const ticketRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ticket",
  validateSearch: (
    search: Record<string, unknown>,
  ): { order?: string; token?: string } => ({
    order: typeof search.order === "string" ? search.order : undefined,
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: TicketPage,
});

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  eventRoute,
  ticketsRoute,
  checkoutRoute,
  paymentRoute,
  successRoute,
  ticketRoute,
  termsRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
