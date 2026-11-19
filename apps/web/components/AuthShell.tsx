import type { ReactNode } from "react";
import Link from "next/link";
import { StudioHeader } from "./StudioHeader";

export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="studio-grid min-h-screen">
      <StudioHeader section="account">
        <Link href="/live">Live forms</Link>
      </StudioHeader>
      <main className="mx-auto max-w-lg px-4 py-12 md:py-20">
        <div className="form-surface p-6 sm:p-10">
          <h1 className="mb-8 text-3xl font-semibold tracking-tight">
            {title}
            <span className="brand-dot">.</span>
          </h1>
          {children}
        </div>
      </main>
    </div>
  );
}
