import Common "common";

module {
  /// One line of an order: a tier and how many of it were bought.
  public type OrderLine = {
    tierId : Common.TierId;
    tierName : Text;
    unitPrice : Common.Rupiah;
    quantity : Nat;
    /// unitPrice * quantity.
    lineTotal : Common.Rupiah;
  };

  /// Buyer-supplied checkout data. Exactly three fields, nothing more.
  public type CustomerInfo = {
    fullName : Text;
    email : Text;
    whatsapp : Text;
  };

  /// A ticket as issued to the buyer. `secureToken` is the bearer credential
  /// encoded in the QR code; it is returned only to the caller who created or
  /// fetched that order and is never projected into the OQL schema.
  public type Ticket = {
    ticketId : Common.TicketId;
    eventId : Common.EventId;
    ticketType : Common.TierId;
    orderId : Common.OrderNumber;
    secureToken : Common.SecureToken;
    status : Common.TicketStatus;
  };

  /// Full order view returned to the buyer.
  public type Order = {
    orderNumber : Common.OrderNumber;
    status : Common.OrderStatus;
    customer : CustomerInfo;
    lines : [OrderLine];
    subtotal : Common.Rupiah;
    serviceFee : Common.Rupiah;
    total : Common.Rupiah;
    createdAt : Common.Timestamp;
    /// Instant by which payment must be confirmed.
    paymentDeadline : Common.Timestamp;
    /// Tickets issued once the order is paid; empty while pending.
    tickets : [Ticket];
  };

  /// Result of creating an order.
  public type CreateOrderResult = {
    orderNumber : Common.OrderNumber;
    subtotal : Common.Rupiah;
    serviceFee : Common.Rupiah;
    total : Common.Rupiah;
    paymentDeadline : Common.Timestamp;
  };

  /// Caller-fixable failures when creating an order.
  public type CreateOrderError = {
    #invalidInput : Text;
    #unknownTier : Common.TierId;
    #insufficientStock : { tierId : Common.TierId; requested : Nat; remaining : Nat };
  };

  /// Caller-fixable failures when confirming a demo payment.
  public type ConfirmPaymentError = {
    #unknownOrder : Common.OrderNumber;
    #alreadyPaid : Common.OrderNumber;
    #orderExpired : Common.OrderNumber;
  };

  /// Result of a demo payment confirmation.
  public type ConfirmPaymentResult = {
    orderNumber : Common.OrderNumber;
    status : Common.OrderStatus;
    tickets : [Ticket];
  };
};
