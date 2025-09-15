import {
	Cancel01Icon,
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
	const [mobileMenuView, setMobileMenuView] = useState<"menu" | "content">(
		"menu"
	);

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

	// Reset to menu view when mobile menu opens
	useEffect(() => {
		if (isMobileMenuOpen) {
			setMobileMenuView("menu");
		}
	}, [isMobileMenuOpen]);

	return (
		<div className="flex h-screen flex-col overflow-hidden bg-gray-50 md:flex-row">
			{/* Mobile Header */}
			<div className="relative z-50 flex items-center justify-between border-gray-200 border-b bg-white p-2 md:hidden">
				<button
					className="relative z-50 rounded-lg p-2 transition-colors hover:bg-gray-100 active:bg-gray-200"
					data-testid="hamburger-button"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						setIsMobileMenuOpen(!isMobileMenuOpen);
					}}
					onTouchStart={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
					style={{ touchAction: "manipulation" }}
					type="button"
				>
					<HugeiconsIcon
						className="pointer-events-none h-6 w-6"
						icon={Menu01Icon}
					/>
				</button>
				<h1 className="font-semibold text-lg">hn.fd</h1>
				<div className="w-10" /> {/* Spacer for centering */}
			</div>

			{/* Mobile Menu Floating Overlay */}
			{isMobileMenuOpen && (
				<div className="fixed inset-0 z-40 md:hidden">
					{/* Backdrop */}
					<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

					{/* Floating Menu Container */}
					<div className="slide-in-from-left absolute inset-0 flex h-full animate-in duration-300">
						<div className="flex h-full w-full bg-gray-50">
							{/* Navigation Panel */}
							<div
								className={cn(
									"flex h-full transition-transform duration-300 ease-in-out",
									mobileMenuView === "menu" ? "w-full" : "-translate-x-full w-0"
								)}
							>
								<div className="flex h-full w-full flex-col bg-white">
									{/* Menu Header */}
									<div className="flex items-center justify-between border-gray-200 border-b p-2">
										<h2 className="font-semibold text-lg">Navigation</h2>
										<div className="flex gap-2">
											<button
												className="rounded-lg p-2 transition-colors hover:bg-gray-100"
												onClick={() => {
													setMobileMenuView("content");
												}}
												title="Show Content"
												type="button"
											>
												<span className="text-sm">Posts</span>
											</button>
											<button
												className="rounded-lg p-2 transition-colors hover:bg-gray-100"
												onClick={() => {
													setIsMobileMenuOpen(false);
												}}
												title="Close Menu"
												type="button"
											>
												<HugeiconsIcon
													className="h-5 w-5"
													icon={Cancel01Icon}
												/>
											</button>
										</div>
									</div>

									{/* Navigation Links */}
									<nav className="flex-1 space-y-1 p-2">
										<TooltipProvider>
											{navLinks.map((link) => (
												<Link
													className={cn(
														"flex items-center gap-3 rounded-lg p-3 text-gray-700 transition-colors hover:bg-gray-100",
														activePath === link.href &&
															"bg-orange-200 text-orange-700 hover:bg-orange-200"
													)}
													key={link.href}
													onClick={() => {
														setIsMobileMenuOpen(false);
													}}
													to={link.href}
												>
													<HugeiconsIcon className="h-5 w-5" icon={link.icon} />
													<span className="font-medium">{link.label}</span>
												</Link>
											))}
										</TooltipProvider>
									</nav>
								</div>
							</div>

							{/* Content Panel */}
							<div
								className={cn(
									"flex h-full transition-transform duration-300 ease-in-out",
									mobileMenuView === "content"
										? "w-full"
										: "w-0 translate-x-full"
								)}
							>
								<div className="flex h-full w-full flex-col">
									{/* Content Header */}
									<div className="flex items-center justify-between border-gray-200 border-b bg-white p-2">
										<button
											className="rounded-lg p-2 transition-colors hover:bg-gray-100"
											onClick={() => {
												setMobileMenuView("menu");
											}}
											title="Show Menu"
											type="button"
										>
											<span className="text-sm">Menu</span>
										</button>
										<h2 className="font-semibold text-lg">Posts</h2>
										<button
											className="rounded-lg p-2 transition-colors hover:bg-gray-100"
											onClick={() => {
												setIsMobileMenuOpen(false);
											}}
											title="Close Menu"
											type="button"
										>
											<HugeiconsIcon className="h-5 w-5" icon={Cancel01Icon} />
										</button>
									</div>

									{/* Content Area */}
									<div className="flex-1 overflow-hidden">
										<Outlet />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Desktop sidebar navigation */}
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

			{/* Main content area */}
			<div className="hidden flex-1 overflow-hidden md:block">
				<Outlet />
			</div>

			{/* Mobile content area - only when menu is closed */}
			{!isMobileMenuOpen && (
				<div className="flex-1 overflow-hidden md:hidden">
					<Outlet />
				</div>
			)}
		</div>
	);
}
