import Link from "next/link"
import { Binary, Code, MessageCircle } from "lucide-react"

const footerLinks = {
  Product: [
    { label: "Practice", href: "/battles/bitwise/practice" },
    { label: "Battle", href: "/battles/bitwise/battle" },
    { label: "Learn", href: "/battles/bitwise/learn" },
    { label: "Leaderboard", href: "/battles/bitwise/leaderboard" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Tutorials", href: "#" },
    { label: "API", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/battles/bitwise" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500 text-white">
                <Binary className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                BITWISE MASTER
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              The premium platform for mastering bit manipulation and bitwise
              algorithms through structured learning and competitive coding.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600"
              >
                <Code className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 md:flex-row">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Bitwise Master. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link href="#" className="transition-colors hover:text-slate-600">
              Terms
            </Link>
            <Link href="#" className="transition-colors hover:text-slate-600">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-slate-600">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
