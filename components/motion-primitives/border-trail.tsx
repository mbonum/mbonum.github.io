"use client";
import { cn } from "@/lib/utils";
import {
	motion,
	type MotionValue,
	type Transition,
	useMotionTemplate,
	useMotionValue,
} from "motion/react";

export type BorderTrailProps = {
	className?: string;
	size?: number;
	transition?: Transition;
	onAnimationComplete?: () => void;
	style?: React.CSSProperties;
	/** When set, disables the default loop and follows this position along the border. */
	offsetDistance?: MotionValue<string> | string;
};

function useControlledOffset(
	offsetDistance?: MotionValue<string> | string,
): { offsetDistance?: MotionValue<string> | string } | null {
	const placeholder = useMotionValue("0%");
	const motionSource =
		typeof offsetDistance === "string" || !offsetDistance
			? placeholder
			: offsetDistance;
	const templated = useMotionTemplate`${motionSource}`;

	if (offsetDistance === undefined) return null;
	if (typeof offsetDistance === "string") {
		return { offsetDistance };
	}
	return { offsetDistance: templated };
}

export function BorderTrail({
	className,
	size = 60,
	transition,
	onAnimationComplete,
	style,
	offsetDistance,
}: BorderTrailProps) {
	const defaultTransition: Transition = {
		repeat: Number.POSITIVE_INFINITY,
		duration: 5,
		ease: "linear",
	};

	const isControlled = offsetDistance !== undefined;
	const controlledOffset = useControlledOffset(offsetDistance);
	const offsetPath = `rect(0 auto auto 0 round ${size}px)`;

	return (
		<div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
			<motion.div
				className={cn("absolute aspect-square bg-zinc-500", className)}
				style={{
					width: size,
					offsetPath,
					...controlledOffset,
					...style,
				}}
				animate={
					isControlled ? undefined : { offsetDistance: ["0%", "100%"] }
				}
				transition={isControlled ? { duration: 0 } : transition || defaultTransition}
				onAnimationComplete={onAnimationComplete}
			/>
		</div>
	);
}
