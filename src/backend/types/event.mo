import Common "common";

module {
  /// The single hard-coded concert event.
  public type EventInfo = {
    id : Common.EventId;
    name : Text;
    tagline : Text;
    /// ISO-8601 local date, e.g. "2026-10-21".
    date : Text;
    /// Local start time, e.g. "19:00".
    time : Text;
    /// IANA timezone label, e.g. "WIB".
    timezone : Text;
    venue : Text;
    city : Text;
    /// Unix epoch nanoseconds of the doors-open instant, for the countdown.
    startsAt : Common.Timestamp;
  };

  /// A purchasable ticket tier with live remaining stock.
  public type TicketTier = {
    id : Common.TierId;
    name : Text;
    description : Text;
    price : Common.Rupiah;
    /// Total tickets ever available for this tier.
    capacity : Nat;
    /// Tickets still purchasable right now.
    remaining : Nat;
    /// True when `remaining` is zero.
    soldOut : Bool;
  };
};
