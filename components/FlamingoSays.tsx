import type { ReactNode } from "react";
import Flamingo from "./Flamingo";

// The flamingo with a speech bubble, used for empty states and prompts.
export default function FlamingoSays({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-end gap-3">
      <Flamingo pose="talking" className="w-20 shrink-0" />
      <div className="mb-10 rounded-card rounded-bl-none border border-line bg-surface px-4 py-3 shadow-sm">
        {children}
      </div>
    </div>
  );
}
