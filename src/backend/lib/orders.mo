import Blob "mo:core/Blob";
import Char "mo:core/Char";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Random "mo:core/Random";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Common "../types/common";
import EventLib "event";
import Orders "../types/orders";
import TicketsTypes "../types/tickets";

module {
  /// Service fee added to every order, in whole rupiah.
  public let serviceFee : Common.Rupiah = 10_000;

  /// Payment window: 30 minutes from order creation.
  public let paymentWindowNs : Int = 1_800_000_000_000;

  /// Largest number of tickets a single order may contain.
  public let maxQuantityPerOrder : Nat = 10;

  /// Alphabet for generated order numbers and ticket ids. Excludes characters
  /// that are easy to confuse when read aloud or typed by hand.
  let codeAlphabet : [Char] = [
    '2', '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'J', 'K', 'M', 'N', 'P', 'Q', 'R', 'S',
    'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  ];

  /// Alphabet for secure tokens: full lowercase hex, 32 characters = 128 bits.
  let tokenAlphabet : [Char] = [
    '0', '1', '2', '3', '4', '5', '6', '7',
    '8', '9', 'a', 'b', 'c', 'd', 'e', 'f',
  ];

  /// Draw `count` characters from `alphabet` using canister entropy.
  func randomCode(alphabet : [Char], count : Nat) : async Text {
    let bytes = Blob.toArray(await Random.blob());
    if (bytes.size() == 0) {
      Runtime.trap("Entropy source returned no bytes");
    };
    let size = alphabet.size();
    var code = "";
    var i = 0;
    while (i < count) {
      let byte = bytes[i % bytes.size()].toNat();
      code #= alphabet[byte % size].toText();
      i += 1;
    };
    code;
  };

  /// A unique order number in the ZV##### style.
  func newOrderNumber(seq : Nat) : async Common.OrderNumber {
    let suffix = await randomCode(codeAlphabet, 5);
    "ZV" # suffix # seq.toText();
  };

  /// A unique ticket id in the ZVT##### style.
  func newTicketId(seq : Nat) : async Common.TicketId {
    let suffix = await randomCode(codeAlphabet, 5);
    "ZVT" # suffix # seq.toText();
  };

  /// A 128-bit unguessable token. This is the only value encoded in the QR code.
  func newSecureToken() : async Common.SecureToken {
    await randomCode(tokenAlphabet, 32);
  };

  /// Trim surrounding whitespace and collapse internal runs of whitespace to a
  /// single space, so "  Zidhan   Maulana " is stored as "Zidhan Maulana".
  func normalizeName(raw : Text) : Text {
    let trimmed = raw.trim(#predicate(Char.isWhitespace));
    let parts = trimmed.split(#predicate(Char.isWhitespace)).filter(func part = not part.isEmpty());
    parts.join(" ");
  };

  /// Trim surrounding whitespace from a single-line field.
  func normalizeField(raw : Text) : Text {
    raw.trim(#predicate(Char.isWhitespace));
  };

  /// A deliberately permissive email shape check: exactly one "@", a non-empty
  /// local part, and a dotted domain with non-empty labels.
  func isPlausibleEmail(value : Text) : Bool {
    let at = value.split(#char '@').toArray();
    if (at.size() != 2) { return false };
    let local = at[0];
    let domain = at[1];
    if (local.isEmpty() or domain.isEmpty()) { return false };
    if (local.contains(#predicate(Char.isWhitespace))) { return false };
    if (domain.contains(#predicate(Char.isWhitespace))) { return false };
    let labels = domain.split(#char '.').toArray();
    if (labels.size() < 2) { return false };
    labels.all(func part = not part.isEmpty());
  };

  /// A WhatsApp number must carry at least 8 digits and contain nothing but
  /// digits, spaces, and the usual separators.
  func isPlausibleWhatsapp(value : Text) : Bool {
    let digits = value.toArray().filter(func c = c.isDigit()).size();
    if (digits < 8) { return false };
    value.toArray().all(func c =
      c.isDigit() or c == ' ' or c == '+' or c == '-' or c == '(' or c == ')'
    );
  };

  /// Create an order for `quantity` tickets of `tierId`, reserving stock and
  /// issuing an order number plus a payment deadline.
  public func createOrder(
    fullName : Text,
    email : Text,
    whatsapp : Text,
    tierId : Common.TierId,
    quantity : Nat,
    orders : Map.Map<Common.OrderNumber, Orders.Order>,
    state : { var nextOrderSeq : Nat; var nextTicketSeq : Nat },
    remainingOf : Common.TierId -> Nat,
    reserve : (Common.TierId, Nat) -> (),
  ) : async { #ok : Orders.CreateOrderResult; #err : Orders.CreateOrderError } {
    let name = normalizeName(fullName);
    let mail = normalizeField(email);
    let phone = normalizeField(whatsapp);

    if (name.isEmpty()) {
      return #err(#invalidInput("Full name is required."));
    };
    if (not isPlausibleEmail(mail)) {
      return #err(#invalidInput("Enter a valid email address."));
    };
    if (not isPlausibleWhatsapp(phone)) {
      return #err(#invalidInput("Enter a valid WhatsApp number."));
    };
    if (quantity == 0 or quantity > maxQuantityPerOrder) {
      return #err(#invalidInput("Quantity must be between 1 and " # maxQuantityPerOrder.toText() # "."));
    };

    let tier = switch (EventLib.findTier(tierId)) {
      case (?tier) { tier };
      case null { return #err(#unknownTier(tierId)) };
    };

    let remaining = remainingOf(tierId);
    if (quantity > remaining) {
      return #err(#insufficientStock({ tierId; requested = quantity; remaining }));
    };

    reserve(tierId, quantity);

    let seq = state.nextOrderSeq;
    state.nextOrderSeq := seq + 1;
    let orderNumber = await newOrderNumber(seq);

    let subtotal = tier.price * quantity;
    let total = subtotal + serviceFee;
    let createdAt = Time.now();
    let paymentDeadline = createdAt + paymentWindowNs;

    let line : Orders.OrderLine = {
      tierId = tier.id;
      tierName = tier.name;
      unitPrice = tier.price;
      quantity;
      lineTotal = subtotal;
    };

    let order : Orders.Order = {
      orderNumber;
      status = #pending;
      customer = { fullName = name; email = mail; whatsapp = phone };
      lines = [line];
      subtotal;
      serviceFee;
      total;
      createdAt;
      paymentDeadline;
      tickets = [];
    };

    orders.add(orderNumber, order);

    #ok({
      orderNumber;
      subtotal;
      serviceFee;
      total;
      paymentDeadline;
    });
  };

  /// Fetch an order by its order number.
  public func getOrder(
    orderNumber : Common.OrderNumber,
    orders : Map.Map<Common.OrderNumber, Orders.Order>,
  ) : ?Orders.Order {
    orders.get(orderNumber);
  };

  /// Demo payment confirmation: marks the order paid and issues its tickets.
  /// This is the single integration point where a Midtrans transaction-status
  /// confirmation would be substituted.
  public func confirmDemoPayment(
    orderNumber : Common.OrderNumber,
    orders : Map.Map<Common.OrderNumber, Orders.Order>,
    tickets : Map.Map<Common.TicketId, TicketsTypes.TicketRecord>,
    tokens : Map.Map<Common.SecureToken, Common.TicketId>,
    state : { var nextOrderSeq : Nat; var nextTicketSeq : Nat },
  ) : async { #ok : Orders.ConfirmPaymentResult; #err : Orders.ConfirmPaymentError } {
    let order = switch (orders.get(orderNumber)) {
      case (?order) { order };
      case null { return #err(#unknownOrder(orderNumber)) };
    };

    switch (order.status) {
      case (#paid) { return #err(#alreadyPaid(orderNumber)) };
      case (#cancelled) { return #err(#orderExpired(orderNumber)) };
      case (#expired) { return #err(#orderExpired(orderNumber)) };
      case (#pending) {};
    };

    if (Time.now() > order.paymentDeadline) {
      orders.add(orderNumber, { order with status = #expired });
      return #err(#orderExpired(orderNumber));
    };

    var issued : [Orders.Ticket] = [];
    for (line in order.lines.values()) {
      var i = 0;
      while (i < line.quantity) {
        let seq = state.nextTicketSeq;
        state.nextTicketSeq := seq + 1;

        let ticketId = await newTicketId(seq);
        let secureToken = await newSecureToken();

        let record : TicketsTypes.TicketRecord = {
          ticketId;
          eventId = EventLib.eventId;
          ticketType = line.tierId;
          orderId = orderNumber;
          secureToken;
          status = #valid;
        };

        tickets.add(ticketId, record);
        tokens.add(secureToken, ticketId);

        issued := issued.concat([{
          ticketId;
          eventId = record.eventId;
          ticketType = record.ticketType;
          orderId = record.orderId;
          secureToken = record.secureToken;
          status = record.status;
        }]);

        i += 1;
      };
    };

    let paid : Orders.Order = { order with status = #paid; tickets = issued };
    orders.add(orderNumber, paid);

    #ok({ orderNumber; status = #paid; tickets = issued });
  };
};
