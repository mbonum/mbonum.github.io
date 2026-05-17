"use client";
import { BorderTrail } from "@/components/motion-primitives/border-trail";
import { cn } from "@/lib/utils";
import { useMotionValue, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { type ReactNode, useCallback, useRef, useState } from "react";

function getPerimeterOffsetPercent(
	px: number,
	py: number,
	w: number,
	h: number,
): string {
	const perimeter = 2 * (w + h);
	const topDist = py;
	const bottomDist = h - py;
	const leftDist = px;
	const rightDist = w - px;
	const min = Math.min(topDist, bottomDist, leftDist, rightDist);

	let distance: number;
	if (min === topDist) {
		distance = px;
	} else if (min === rightDist) {
		distance = w + py;
	} else if (min === bottomDist) {
		distance = w + h + (w - px);
	} else {
		distance = 2 * w + h + (h - py);
	}

	return `${(distance / perimeter) * 100}%`;
}

type GlowCardProps = {
	children: ReactNode;
	className?: string;
	href?: string;
	external?: boolean;
};

export function GlowCard({
	children,
	className,
	href,
	external,
}: GlowCardProps) {
	const containerRef = useRef<HTMLAnchorElement | HTMLDivElement>(null);
	const offsetPercent = useMotionValue(0);
	const offsetPercentSmooth = useSpring(offsetPercent, {
		stiffness: 90,
		damping: 48,
		mass: 0.8,
	});
	const offsetDistance = useTransform(
		offsetPercentSmooth,
		(value) => `${value}%`,
	);
	const [isHovered, setIsHovered] = useState(false);

	const handleMouseMove = useCallback(
		(event: React.MouseEvent<HTMLElement>) => {
			const el = containerRef.current;
			if (!el) return;
			const { left, top, width, height } = el.getBoundingClientRect();
			const percent = Number.parseFloat(
				getPerimeterOffsetPercent(
					event.clientX - left,
					event.clientY - top,
					width,
					height,
				),
			);
			offsetPercent.set(percent);
		},
		[offsetPercent],
	);

	const handlers = {
		onMouseMove: handleMouseMove,
		onMouseEnter: () => setIsHovered(true),
		onMouseLeave: () => setIsHovered(false),
	};

	const cardClassName = cn(
		"group relative block overflow-hidden rounded-2xl bg-zinc-300/30 p-[1px] dark:bg-zinc-600/30",
		className,
	);

	const inner = (
		<>
			<BorderTrail
				className={cn(
					"bg-linear-to-l from-zinc-700 via-zinc-600 to-zinc-700 transition-opacity duration-300 dark:from-zinc-300 dark:via-zinc-400 dark:to-zinc-300",
					isHovered ? "opacity-55" : "opacity-0",
				)}
				offsetDistance={offsetDistance}
				size={72}
				style={{
					boxShadow:
						"0px 0px 28px 10px rgb(255 255 255 / 18%), 0 0 40px 20px rgb(0 0 0 / 10%)",
				}}
			/>
			<div className="relative h-full w-full rounded-[15px] bg-white p-4 dark:bg-zinc-950">
				{children}
			</div>
		</>
	);

	if (href) {
		if (external) {
			return (
				<a
					ref={containerRef as React.RefObject<HTMLAnchorElement>}
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className={cardClassName}
					{...handlers}
				>
					{inner}
				</a>
			);
		}

		return (
			<Link
				ref={containerRef as React.RefObject<HTMLAnchorElement>}
				href={href}
				className={cardClassName}
				{...handlers}
			>
				{inner}
			</Link>
		);
	}

	return (
		<div ref={containerRef as React.RefObject<HTMLDivElement>} className={cardClassName} {...handlers}>
			{inner}
		</div>
	);
}
