"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Overview", href: "/" },
  { label: "Study", href: "/study" },
  { label: "Cards", href: "/flashcards" },
  { label: "Quiz", href: "/quiz" },
  { label: "Glossary", href: "/glossary" },
  { label: "Numbers", href: "/numbers" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1.5 overflow-x-auto border-b border-border bg-bg px-4 py-2.5 scrollbar-none">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-lg border px-3.5 py-2 text-[13px] font-semibold transition-all ${
              isActive
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-muted hover:border-border-2 hover:text-text"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
