import Map "mo:core/Map";
import Common "../types/common";
import OrdersLib "../lib/orders";
import Orders "../types/orders";
import TicketsTypes "../types/tickets";

mixin (
  orders : Map.Map<Common.OrderNumber, Orders.Order>,
  tickets : Map.Map<Common.TicketId, TicketsTypes.TicketRecord>,
  tokens : Map.Map<Common.SecureToken, Common.TicketId>,
  state : { var nextOrderSeq : Nat; var nextTicketSeq : Nat },
  remainingOf : Common.TierId -> Nat,
  reserve : (Common.TierId, Nat) -> (),
) {
  /// Create an order from the three checkout fields plus tier and quantity.
  public shared func createOrder(
    fullName : Text,
    email : Text,
    whatsapp : Text,
    tierId : Common.TierId,
    quantity : Nat,
  ) : async { #ok : Orders.CreateOrderResult; #err : Orders.CreateOrderError } {
    await OrdersLib.createOrder(fullName, email, whatsapp, tierId, quantity, orders, state, remainingOf, reserve);
  };

  /// Fetch an order by its order number.
  public query func getOrder(orderNumber : Common.OrderNumber) : async ?Orders.Order {
    OrdersLib.getOrder(orderNumber, orders);
  };

  /// Demo payment confirmation — marks the order paid and issues tickets.
  /// Documented as a demo path; the single Midtrans integration point.
  public shared func confirmDemoPayment(
    orderNumber : Common.OrderNumber,
  ) : async { #ok : Orders.ConfirmPaymentResult; #err : Orders.ConfirmPaymentError } {
    await OrdersLib.confirmDemoPayment(orderNumber, orders, tickets, tokens, state);
  };
};
