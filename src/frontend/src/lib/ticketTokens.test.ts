import {
  collectTicketTokens,
  decodeTokens,
  encodeTokens,
  persistTicketTokens,
  readPersistedTicketTokens,
  readSecureToken,
} from "@/lib/ticketTokens";
import { describe, expect, it } from "vitest";

/**
 * Secure-token plumbing.
 *
 * The QR payload policy is a security property: the QR encodes ONLY the
 * backend-issued secure token, never a name, email, phone number, or order
 * number. These tests pin the plumbing that carries that token from the
 * backend response to the e-ticket.
 */
describe("ticketTokens", () => {
  it("reads a secure token off a ticket and rejects non-string values", () => {
    expect(readSecureToken({ ticketId: "ZVT1", secureToken: "abc123" })).toBe(
      "abc123",
    );
    expect(readSecureToken({ ticketId: "ZVT1", secureToken: "" })).toBe("");
    expect(readSecureToken({ ticketId: "ZVT1" })).toBe("");
    expect(readSecureToken({ ticketId: "ZVT1", secureToken: 42 })).toBe("");
  });

  it("collects only tickets that carry a token", () => {
    const tokens = collectTicketTokens([
      { ticketId: "ZVT1", secureToken: "token-one" },
      { ticketId: "ZVT2" },
      { ticketId: "ZVT3", secureToken: "token-three" },
    ]);
    expect(tokens).toEqual({ ZVT1: "token-one", ZVT3: "token-three" });
  });

  it("round-trips a token map through the search param", () => {
    const tokens = { ZVT1: "token-one", ZVT2: "token-two" };
    expect(decodeTokens(encodeTokens(tokens))).toEqual(tokens);
  });

  it("ignores malformed search-param pairs", () => {
    expect(decodeTokens("")).toEqual({});
    expect(decodeTokens("no-separator")).toEqual({});
    expect(decodeTokens(":missing-id")).toEqual({});
    expect(decodeTokens("ZVT1:")).toEqual({});
  });

  it("persists and reads tokens per order", () => {
    persistTicketTokens("ZV00001", { ZVT1: "token-one" });
    expect(readPersistedTicketTokens("ZV00001")).toEqual({ ZVT1: "token-one" });
    expect(readPersistedTicketTokens("ZV99999")).toEqual({});
  });
});
