import type { ReactNode } from "react";
import Flamingo from "./Flamingo";

// A chat message: the flamingo on the left, the user on the right.
export default function ChatBubble({ from, children }: { from: "user" | "flamingo"; children: ReactNode }) {
  if (from === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-card rounded-br-none bg-flamingo px-4 py-2.5 text-white">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <Flamingo pose="talking" className="w-10 shrink-0" />
      <div className="flex min-w-0 max-w-[85%] flex-col gap-3 rounded-card rounded-tl-none border border-line bg-surface px-4 py-2.5 shadow-sm">
        {children}
      </div>
    </div>
  );
}
