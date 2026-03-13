"use client";

import Link from "next/link";

interface AppNavbarProps {
  title: string;
  subtitle?: string;
  backHref?: string;
}

export default function AppNavbar({ title, subtitle = "", backHref }: AppNavbarProps) {
  return (
    <header className="app-navbar">
      <div className="container mx-auto px-4 h-full">
        <div className="h-full flex items-center gap-3 md:gap-5">
          {backHref ? (
            <Link href={backHref} className="app-navbar-back" aria-label="Voltar">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
          ) : null}

          <div className="min-w-0">
            <h1 className="app-navbar-title truncate">{title}</h1>
            {subtitle ? <p className="app-navbar-subtitle truncate">{subtitle}</p> : null}
          </div>
        </div>
      </div>
    </header>
  );
}
