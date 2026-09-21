import Common "common";

module {
  /// Internal ticket record. `secureToken` is the only value encoded in the QR
  /// code and is never returned by a public read endpoint.
  public type TicketRecord = {
    ticketId : Common.TicketId;
    eventId : Common.EventId;
    ticketType : Common.TierId;
    orderId : Common.OrderNumber;
    secureToken : Common.SecureToken;
    status : Common.TicketStatus;
  };

  /// Outcome of scanning a ticket token at the venue door.
  public type ScanResult = {
    /// VALID TICKET — first successful scan; the ticket is now marked used.
    #validTicket : { ticketId : Common.TicketId; ticketType : Common.TierId };
    /// ALREADY USED — the token resolved to a ticket that was scanned before.
    #alreadyUsed : { ticketId : Common.TicketId; ticketType : Common.TierId };
    /// INVALID TICKET — the token matches no ticket, or the ticket is
    /// cancelled or refunded.
    #invalidTicket;
  };
};
