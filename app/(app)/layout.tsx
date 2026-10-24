import Dock from "@/components/Dock";

// The app shell around every signed-in page: page content plus the dock.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pt-8 pb-32">{children}</main>
      <Dock />
    </>
  );
}
