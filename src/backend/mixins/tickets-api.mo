import Map "mo:core/Map";
import Common "../types/common";
import TicketsLib "../lib/tickets";
import Tickets "../types/tickets";

mixin (
  tickets : Map.Map<Common.TicketId, Tickets.TicketRecord>,
  tokens : Map.Map<Common.SecureToken, Common.TicketId>,
) {
  /// Venue scan validation: resolves a scanned secure token to VALID TICKET,
  /// ALREADY USED, or INVALID TICKET, marking the ticket used on first success.
  public shared func validateTicket(token : Common.SecureToken) : async Tickets.ScanResult {
    TicketsLib.validateToken(token, tickets, tokens);
  };
};
