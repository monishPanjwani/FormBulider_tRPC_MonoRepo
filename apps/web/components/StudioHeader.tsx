import Link from "next/link";
import type { ReactNode } from "react";
import { Terminal } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function StudioHeader({ section, children }: { section?: string; children?: ReactNode }) {
  return (
    <header className="studio-header">
      <div className="studio-nav">
        <Link href="/" aria-label="Formcraft home" className="wordmark">
          <Terminal aria-hidden="true" />
          <span>
            formcraft<span className="brand-dot">.</span>
          </span>
        </Link>
        {section && <span className="nav-section">~/{section}</span>}
        <nav aria-label="Main navigation">
          {children}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
