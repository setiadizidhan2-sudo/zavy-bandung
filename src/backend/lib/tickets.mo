import Map "mo:core/Map";
import Common "../types/common";
import Tickets "../types/tickets";

module {
  /// Resolve a scanned secure token to a ticket and mark it used on the first
  /// successful validation.
  public func validateToken(
    token : Common.SecureToken,
    tickets : Map.Map<Common.TicketId, Tickets.TicketRecord>,
    tokens : Map.Map<Common.SecureToken, Common.TicketId>,
  ) : Tickets.ScanResult {
    let ticketId = switch (tokens.get(token)) {
      case (?ticketId) { ticketId };
      case null { return #invalidTicket };
    };

    let record = switch (tickets.get(ticketId)) {
      case (?record) { record };
      case null { return #invalidTicket };
    };

    switch (record.status) {
      case (#valid) {
        tickets.add(ticketId, { record with status = #used });
        #validTicket({ ticketId = record.ticketId; ticketType = record.ticketType });
      };
      case (#used) {
        #alreadyUsed({ ticketId = record.ticketId; ticketType = record.ticketType });
      };
      case (#cancelled) { #invalidTicket };
      case (#refunded) { #invalidTicket };
    };
  };
};
