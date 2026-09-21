import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type OrderNumber = Text;
  type TicketId = Text;
  type SecureToken = Text;
  type TierId = Text;
  type EventId = Text;
  type Rupiah = Nat;
  type Timestamp = Int;

  type OrderStatus = { #pending; #paid; #expired; #cancelled };
  type TicketStatus = { #valid; #used; #cancelled; #refunded };

  type CustomerInfo = { fullName : Text; email : Text; whatsapp : Text };

  type OrderLine = {
    tierId : TierId;
    tierName : Text;
    unitPrice : Rupiah;
    quantity : Nat;
    lineTotal : Rupiah;
  };

  type Ticket = {
    ticketId : TicketId;
    eventId : EventId;
    ticketType : TierId;
    orderId : OrderNumber;
    secureToken : SecureToken;
    status : TicketStatus;
  };

  type Order = {
    orderNumber : OrderNumber;
    status : OrderStatus;
    customer : CustomerInfo;
    lines : [OrderLine];
    subtotal : Rupiah;
    serviceFee : Rupiah;
    total : Rupiah;
    createdAt : Timestamp;
    paymentDeadline : Timestamp;
    tickets : [Ticket];
  };

  type TicketRecord = {
    ticketId : TicketId;
    eventId : EventId;
    ticketType : TierId;
    orderId : OrderNumber;
    secureToken : SecureToken;
    status : TicketStatus;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    orders : Map.Map<OrderNumber, Order>;
    tickets : Map.Map<TicketId, TicketRecord>;
    tokens : Map.Map<SecureToken, TicketId>;
    inventory : Map.Map<TierId, Nat>;
    state : { var nextOrderSeq : Nat; var nextTicketSeq : Nat };
  };

  public func migration(_old : {}) : NewActor {
    {
      accessControlState = AccessControl.initState();
      orders = Map.empty();
      tickets = Map.empty();
      tokens = Map.empty();
      inventory = Map.empty();
      state = { var nextOrderSeq = 0; var nextTicketSeq = 0 };
    };
  };
};
