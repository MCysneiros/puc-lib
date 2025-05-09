"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "~/lib/utils";

const navigationItems = [
  { href: "/", label: "Livros", icon: "📚" },
  { href: "/alunos", label: "Alunos", icon: "🧑‍🎓" },
  { href: "/emprestimos", label: "Empréstimos", icon: "📝" },
  { href: "/estatistica", label: "Estatística", icon: "📊" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex flex-1 items-center">
            <div className="flex flex-shrink-0 items-center">
              <span className="text-2xl font-bold text-primary">Biblioteca</span>
            </div>
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-full items-center rounded-md px-3 py-2 text-sm font-medium",
                    pathname === item.href
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-muted-foreground hover:text-primary",
                    "transition-colors duration-200"
                  )}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
