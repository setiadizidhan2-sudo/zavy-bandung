import Common "../types/common";
import Types "../types/event";

module {
  /// Identifier of the single hard-coded event.
  public let eventId : Common.EventId = "zavy-live-in-bandung";

  /// Doors-open instant: 21 October 2026, 19:00 WIB (UTC+7) = 12:00 UTC.
  /// Expressed in nanoseconds since the Unix epoch, as IC time.
  public let startsAt : Common.Timestamp = 1_792_670_400_000_000_000;

  /// The single hard-coded event this app sells tickets for.
  public func getEvent() : Types.EventInfo {
    {
      id = eventId;
      name = "ZAVY — LIVE IN BANDUNG";
      tagline = "One night. One stage. Live in Bandung.";
      date = "2026-10-21";
      time = "19:00";
      timezone = "WIB";
      venue = "Rooftop Coffee Uber";
      city = "Bandung";
      startsAt;
    };
  };

  /// The three ticket tiers, in display order, with their fixed capacity and
  /// price. Remaining stock is supplied by the caller from live inventory.
  public func tierDefinitions() : [Types.TicketTier] {
    [
      {
        id = "early-bird";
        name = "EARLY BIRD";
        description = "Limited release. The first 100 tickets at the lowest price.";
        price = 75_000;
        capacity = 100;
        remaining = 0;
        soldOut = false;
      },
      {
        id = "regular";
        name = "REGULAR";
        description = "General admission to the full ZAVY live set.";
        price = 100_000;
        capacity = 300;
        remaining = 0;
        soldOut = false;
      },
      {
        id = "vip";
        name = "VIP";
        description = "Premium viewing area and priority entry. Only 50 available.";
        price = 200_000;
        capacity = 50;
        remaining = 0;
        soldOut = false;
      },
    ];
  };

  /// Look up one tier definition by id.
  public func findTier(tierId : Common.TierId) : ?Types.TicketTier {
    tierDefinitions().find(func tier = tier.id == tierId);
  };

  /// The three tiers with live remaining stock, in display order. `remainingOf`
  /// resolves the current stock for a tier from the actor's inventory map.
  public func tierViews(remainingOf : Common.TierId -> Nat) : [Types.TicketTier] {
    tierDefinitions().map(func tier = tierWithRemaining(tier, remainingOf(tier.id)));
  };

  /// One tier definition with its live remaining stock and sold-out flag.
  public func tierWithRemaining(tier : Types.TicketTier, remaining : Nat) : Types.TicketTier {
    { tier with remaining; soldOut = remaining == 0 };
  };
};
