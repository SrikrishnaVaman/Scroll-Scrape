import Dock from "@/components/Dock";

// The app shell around every signed-in page: page content plus the dock.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      {/* Soft colour washes behind every page */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-32 size-[28rem] rounded-full bg-[#FFD6E1] opacity-50 blur-3xl" />
        <div className="absolute top-1/3 -right-40 size-[30rem] rounded-full bg-[#C6E9F7] opacity-50 blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 size-[26rem] rounded-full bg-[#FFE0C7] opacity-50 blur-3xl" />
      </div>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pt-8 pb-32">{children}</main>
      <Dock />
    </>
  );
}
