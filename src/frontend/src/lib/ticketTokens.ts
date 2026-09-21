/**
 * Secure-token plumbing for the e-ticket flow.
 *
 * The public `Ticket` record returned by `confirmDemoPayment` and `getOrder`
 * carries a `secureToken` field — the bearer credential that is the ONLY value
 * encoded into the QR code. The generated bindings in `@/backend` are refreshed
 * by `pnpm bindgen`; until that runs, the field is read here through a narrow
 * runtime check so the UI never has to guess or fall back to the ticket id.
 *
 * Nothing in this module ever touches personal information: tokens are opaque
 * backend-issued strings.
 */

/** A ticket record that may carry the backend-issued secure token. */
interface TokenBearingTicket {
  ticketId: string;
  secureToken?: unknown;
}

/**
 * Reads the `secureToken` off a ticket record if the backend supplied one.
 * Returns an empty string when the field is absent or not a usable string.
 */
export function readSecureToken(ticket: TokenBearingTicket): string {
  const value = ticket.secureToken;
  return typeof value === "string" && value.length > 0 ? value : "";
}

/** Maps each ticket id to its secure token, dropping tickets without one. */
export function collectTicketTokens(
  tickets: ReadonlyArray<TokenBearingTicket>,
): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const ticket of tickets) {
    const token = readSecureToken(ticket);
    if (token) tokens[ticket.ticketId] = token;
  }
  return tokens;
}

/** Serialises a ticketId → token map into a compact `tokens` search param. */
export function encodeTokens(tokens: Record<string, string>): string {
  return Object.entries(tokens)
    .filter(([, token]) => token.length > 0)
    .map(([ticketId, token]) => `${ticketId}:${token}`)
    .join(",");
}

/** Parses a `tokens` search param back into a ticketId → token map. */
export function decodeTokens(raw: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  if (!raw) return tokens;
  for (const pair of raw.split(",")) {
    const separator = pair.indexOf(":");
    if (separator <= 0) continue;
    const ticketId = pair.slice(0, separator);
    const token = pair.slice(separator + 1);
    if (ticketId && token) tokens[ticketId] = token;
  }
  return tokens;
}

/** Session-scoped store for the issued tokens, keyed by order number. */
const TOKEN_STORAGE_KEY = "zavy.ticketTokens";

type TokenStore = Record<string, Record<string, string>>;

function readStore(): TokenStore {
  try {
    const raw = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TokenStore) : {};
  } catch {
    return {};
  }
}

/** Persists the issued tokens for an order so a refresh keeps the QR working. */
export function persistTicketTokens(
  orderNumber: string,
  tokens: Record<string, string>,
): void {
  if (!orderNumber || Object.keys(tokens).length === 0) return;
  try {
    const store = readStore();
    store[orderNumber] = { ...store[orderNumber], ...tokens };
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* storage unavailable — the URL search param still carries the tokens */
  }
}

/** Reads the persisted tokens for an order, if any. */
export function readPersistedTicketTokens(
  orderNumber: string,
): Record<string, string> {
  if (!orderNumber) return {};
  return readStore()[orderNumber] ?? {};
}
