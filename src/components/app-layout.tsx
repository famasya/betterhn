import {
	FireIcon,
	Menu01Icon,
	QuestionIcon,
	RocketIcon,
	StarIcon,
	TargetIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FirebasePostDetail } from "~/lib/types";
import { cn } from "~/lib/utils";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "./ui/tooltip";

export const navLinks = [
	{ label: "Front Page", href: "/", icon: FireIcon },
	{ label: "Best", href: "/best", icon: StarIcon },
	{ label: "New", href: "/new", icon: TargetIcon },
	{ label: "Ask", href: "/ask", icon: QuestionIcon },
	{ label: "Show", href: "/show", icon: RocketIcon },
];

type Props = {
	posts?: FirebasePostDetail[];
	remainingItems?: number[][];
	activePath: string;
};
export default function AppLayout({ activePath }: Props) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Prevent body scroll when mobile menu is open
	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}

		// Cleanup on unmount
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isMobileMenuOpen]);

	return (
		<div className="flex h-screen flex-col overflow-hidden bg-gray-50 md:flex-row">
			{/* Mobile Header */}
			<div className="flex items-center justify-between border-gray-200 border-b bg-white p-2 md:hidden">
				<button
					className="rounded-lg p-2 transition-colors hover:bg-gray-100"
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					type="button"
				>
					<HugeiconsIcon className="h-6 w-6" icon={Menu01Icon} />
				</button>
				<h1 className="font-semibold text-lg">hn.fd</h1>
				<div className="w-10" /> {/* Spacer for centering */}
			</div>

			{/* sidebar navigation */}
			<div className="hidden border-gray-200 border-r bg-white md:block">
				<nav className="space-y-2 p-2">
					<TooltipProvider>
						{navLinks.map((link) => (
							<Tooltip delayDuration={0} key={link.href}>
								<TooltipTrigger asChild>
									<Link
										className={cn(
											"flex items-center gap-3 rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100",
											activePath === link.href &&
												"bg-orange-200 text-orange-700 hover:bg-orange-200"
										)}
										to={link.href}
									>
										<HugeiconsIcon className="h-5 w-5" icon={link.icon} />
									</Link>
								</TooltipTrigger>
								<TooltipContent side="right">
									<p>{link.label}</p>
								</TooltipContent>
							</Tooltip>
						))}
					</TooltipProvider>
				</nav>
			</div>

			<Outlet />
		</div>
	);
}
