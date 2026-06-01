import Link from "next/link";

const platformLinks = [
	{ href: "/main/leaderboard", label: "Leaderboard" },
	{ href: "/main/profile", label: "Profile" },
	{ href: "/auth/signup", label: "Join Challenges" },
];

const helpLinks = [
	{ href: "/auth/forgot-password", label: "Reset Password" },
	{ href: "/auth/otp", label: "OTP Verification" },
	{ href: "/auth/signup", label: "Account Help" },
];

const socialLinks = [
	{ href: "https://github.com", label: "GitHub" },
	{ href: "https://linkedin.com", label: "LinkedIn" },
	{ href: "https://discord.com", label: "Discord" },
	{ href: "https://x.com", label: "X" },
];

export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer id="app-footer" className="relative overflow-hidden border-t border-slate-200 bg-linear-to-b from-white via-cyan-50/70 to-emerald-100/60 text-slate-700">
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0"
			>
				<div className="absolute -left-14 top-6 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" />
				<div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-sky-300/25 blur-3xl" />
				<div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-emerald-300/30 blur-3xl" />
			</div>

			<div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1fr_0.9fr_0.9fr_1fr] lg:gap-10">
				<div className="space-y-4">
					<div className="inline-flex items-center gap-3 rounded-full border border-slate-300/80 bg-white/85 px-4 py-2 text-sm font-semibold tracking-wide text-slate-900 shadow-sm backdrop-blur">
						<span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
						DSA Saga
					</div>
					<div className="max-w-xs rounded-2xl border border-cyan-200/70 bg-white/80 p-4 backdrop-blur">
						<p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Contact</p>
						<p className="mt-2 text-sm font-medium text-slate-900">contact@dsasaga.in</p>

					</div>
				</div>

				<div>
					<h3 className="text-sm font-semibold uppercase tracking-widest text-slate-900">
						Platform
					</h3>
					<ul className="mt-4 space-y-3 text-sm sm:text-base">
						{platformLinks.map((link) => (
							<li key={link.label}>
								<Link
									href={link.href}
									className="inline-flex items-center gap-2 text-slate-600 transition hover:text-slate-900"
								>
									<span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className="text-sm font-semibold uppercase tracking-widest text-slate-900">
						Support
					</h3>
					<ul className="mt-4 space-y-3 text-sm sm:text-base">
						{helpLinks.map((link) => (
							<li key={link.label}>
								<Link
									href={link.href}
									className="inline-flex items-center gap-2 text-slate-600 transition hover:text-slate-900"
								>
									<span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
									{link.label}
								</Link>
							</li>
						))}
					</ul>
				</div>

				<div>
					<h3 className="text-sm font-semibold uppercase tracking-widest text-slate-900">
						Social
					</h3>
					<div className="mt-4 flex flex-wrap gap-2.5">
						{socialLinks.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="rounded-full border border-slate-300/90 bg-white/75 px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-900"
							>
								{link.label}
							</Link>
						))}
					</div>
					<p className="mt-4 text-sm leading-6 text-slate-600">
						Follow for weekly DSA prompts, contest reminders, and community updates.
					</p>
				</div>
			</div>

			<div className="relative border-t border-slate-200/80 bg-white/60">
				<div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-10">
					<p>Copyright {year} DSA Saga. All rights reserved.</p>
					<p className="text-slate-600">Built for learners who ship solutions consistently.</p>
				</div>
			</div>
		</footer>
	);
}
