import { Coffee, Gamepad2, MapPin, ShoppingBag, Trees, Utensils, Wine, type LucideIcon } from "lucide-react";

// A simple icon and pastel colour for a place type, used when there is no photo.
const KINDS: { match: RegExp; Icon: LucideIcon; tint: string }[] = [
  { match: /caf|coffee|bakery|tea|dessert/i, Icon: Coffee, tint: "bg-sand" },
  { match: /bar|pub|wine|cocktail/i, Icon: Wine, tint: "bg-flamingo/15" },
  { match: /park|garden|beach|nature|trail/i, Icon: Trees, tint: "bg-emerald-100" },
  { match: /arcade|bowling|game|cinema|karaoke|museum|attraction/i, Icon: Gamepad2, tint: "bg-lagoon/15" },
  { match: /mall|shop|market|store/i, Icon: ShoppingBag, tint: "bg-violet-100" },
  { match: /restaurant|food|hawker|eat|pizz|kitchen|grill|noodle|sushi|hot ?pot|bbq|diner|bistro/i, Icon: Utensils, tint: "bg-coral/20" },
];

export function placeIcon(type: string | null) {
  return KINDS.find((k) => k.match.test(type ?? "")) ?? { Icon: MapPin, tint: "bg-cream" };
}
