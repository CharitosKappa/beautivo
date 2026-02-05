import type { ReactNode } from "react";
export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background px-6 py-4">
        <h1 className="text-lg font-semibold">Beautivo Admin</h1>
      </header>
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
