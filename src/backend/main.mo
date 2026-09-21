import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import TextValue "mo:caffeineai-oql/TextValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import ApiDocMixin "mixins/api-doc";
import EventApiMixin "mixins/event-api";
import OrdersApiMixin "mixins/orders-api";
import TicketsApiMixin "mixins/tickets-api";
import EventLib "lib/event";
import Common "types/common";
import OrdersTypes "types/orders";
import TicketsTypes "types/tickets";

actor {
  // Stable state. Initial values come from the migration chain.
  let accessControlState : AccessControl.AccessControlState;
  let orders : Map.Map<Common.OrderNumber, OrdersTypes.Order>;
  let tickets : Map.Map<Common.TicketId, TicketsTypes.TicketRecord>;
  let tokens : Map.Map<Common.SecureToken, Common.TicketId>;
  let inventory : Map.Map<Common.TierId, Nat>;
  let state : { var nextOrderSeq : Nat; var nextTicketSeq : Nat };

  /// Tickets still purchasable for a tier. An absent entry means the tier has
  /// never been sold from, so its full capacity is available.
  func remainingOf(tierId : Common.TierId) : Nat {
    switch (inventory.get(tierId)) {
      case (?remaining) { remaining };
      case null {
        switch (EventLib.findTier(tierId)) {
          case (?tier) { tier.capacity };
          case null { 0 };
        };
      };
    };
  };

  /// Atomically decrement a tier's remaining stock. Callers must have already
  /// checked that `quantity` does not exceed `remainingOf(tierId)`.
  func reserve(tierId : Common.TierId, quantity : Nat) {
    inventory.add(tierId, remainingOf(tierId) - quantity);
  };

  /// Order lifecycle state as a stable text column.
  func orderStatusText(status : Common.OrderStatus) : Text {
    switch (status) {
      case (#pending) { "pending" };
      case (#paid) { "paid" };
      case (#expired) { "expired" };
      case (#cancelled) { "cancelled" };
    };
  };

  /// Ticket lifecycle state as a stable text column.
  func ticketStatusText(status : Common.TicketStatus) : Text {
    switch (status) {
      case (#valid) { "valid" };
      case (#used) { "used" };
      case (#cancelled) { "cancelled" };
      case (#refunded) { "refunded" };
    };
  };

  include MixinAuthorization(accessControlState, null);
  include ApiDocMixin();
  include EventApiMixin(remainingOf);
  include OrdersApiMixin(orders, tickets, tokens, state, remainingOf, reserve);
  include TicketsApiMixin(tickets, tokens);
  include Expose({
    entities = [
      // Manual mode: `Order` carries a variant (`status`), a nested record
      // (`customer`), array fields (`lines`, `tickets`), and `Int` timestamps,
      // none of which the built-in auto-derivation resolves. Each column is
      // projected explicitly to a primitive value.
      orders.toEntityManual("order", "Order", "orderNumber")
        .sample({
          orderNumber = "ZV00000";
          status = #pending;
          customer = { fullName = ""; email = ""; whatsapp = "" };
          lines = [];
          subtotal = 0;
          serviceFee = 0;
          total = 0;
          createdAt = 0;
          paymentDeadline = 0;
          tickets = [];
        })
        .payload("orderNumber", func o = o.orderNumber)
        .payload("status", func o = orderStatusText(o.status))
        .payload("customerName", func o = o.customer.fullName)
        .payload("customerEmail", func o = o.customer.email)
        .payload("customerWhatsapp", func o = o.customer.whatsapp)
        .payload("lineCount", func o = o.lines.size())
        .payload("ticketCount", func o = o.tickets.size())
        .payload("subtotal", func o = o.subtotal)
        .payload("serviceFee", func o = o.serviceFee)
        .payload("total", func o = o.total)
        .payload("createdAt", func o = o.createdAt)
        .payload("paymentDeadline", func o = o.paymentDeadline)
        .controllerOnly()
        .build(),
      // Manual mode: `TicketRecord` carries a variant (`status`). The secure
      // token is deliberately never projected into the schema.
      tickets.toEntityManual("ticket", "TicketRecord", "ticketId")
        .sample({
          ticketId = "ZVT00000";
          eventId = EventLib.eventId;
          ticketType = "regular";
          orderId = "ZV00000";
          secureToken = "";
          status = #valid;
        })
        .payload("ticketId", func t = t.ticketId)
        .payload("eventId", func t = t.eventId)
        .payload("ticketType", func t = t.ticketType)
        .payload("orderId", func t = t.orderId)
        .payload("status", func t = ticketStatusText(t.status))
        .controllerOnly()
        .build(),
    ];
  });
};
