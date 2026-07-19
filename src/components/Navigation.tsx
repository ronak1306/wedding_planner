import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/guests", label: "Guests" },
  { href: "/budget", label: "Budget" },
];

export default function Navigation() {
  return (
    <nav className="border-b border-rose-100 bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
        <span className="text-sm font-semibold uppercase tracking-widest text-rose-400">
          Wedding Planner
        </span>
        <ul className="flex gap-4">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-rose-600"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
