module {
  /// Identifier of a ticket tier (e.g. "early-bird", "regular", "vip").
  public type TierId = Text;

  /// Human-readable order number shown to the buyer (e.g. "ZV82931").
  public type OrderNumber = Text;

  /// Identifier of a single issued ticket.
  public type TicketId = Text;

  /// Identifier of the single hard-coded event.
  public type EventId = Text;

  /// Opaque, unguessable token embedded in the QR code. Never carries personal data.
  public type SecureToken = Text;

  /// Monetary amount in Indonesian Rupiah (whole rupiah, no decimals).
  public type Rupiah = Nat;

  /// Wall-clock instant in nanoseconds since the Unix epoch (IC time).
  public type Timestamp = Int;

  /// Lifecycle state of an order.
  public type OrderStatus = {
    /// Order created, awaiting payment.
    #pending;
    /// Payment confirmed, tickets issued.
    #paid;
    /// Payment window elapsed before confirmation.
    #expired;
    /// Order cancelled by the buyer or organizer.
    #cancelled;
  };

  /// Lifecycle state of a single ticket.
  public type TicketStatus = {
    /// Issued and not yet scanned at the venue.
    #valid;
    /// Scanned successfully once; a repeat scan reports already used.
    #used;
    /// Voided before entry.
    #cancelled;
    /// Returned to the buyer.
    #refunded;
  };

  /// Payment method offered on the payment page.
  public type PaymentMethod = {
    #qris;
    #gopay;
    #dana;
    #ovo;
    #virtualAccount;
    #card;
  };
};
