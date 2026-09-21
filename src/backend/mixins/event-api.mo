import Common "../types/common";
import EventLib "../lib/event";
import EventTypes "../types/event";

mixin (remainingOf : Common.TierId -> Nat) {
  /// The single hard-coded event.
  public query func getEvent() : async EventTypes.EventInfo {
    EventLib.getEvent();
  };

  /// All ticket tiers with live remaining stock, read from the actor's
  /// inventory map. `soldOut` is true only when remaining is actually zero.
  public query func listTiers() : async [EventTypes.TicketTier] {
    EventLib.tierViews(remainingOf);
  };
};
