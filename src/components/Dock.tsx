"use client";

import React, { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type MotionProps,
} from "motion/react";

/**
 * macOS-style dock, adapted from MagicUI (https://magicui.design/docs/components/dock).
 * Trimmed to the project's conventions: no `class-variance-authority`, no `cn()` —
 * plain template-literal class strings. `motion` is the only dependency.
 *
 * Cursor proximity magnifies each `DockIcon` (`useSpring` over the distance from
 * the pointer). It is a pointer-only effect — on touch the dock is static.
 * Pass `disableMagnification` (e.g. from `usePrefersReducedMotion()`) to pin it.
 */

const DEFAULT_SIZE = 52;
const DEFAULT_MAGNIFICATION = 74;
const DEFAULT_DISTANCE = 140;

const DOCK_CLASS =
  "mx-auto flex w-max items-end justify-center gap-1.5 rounded-2xl border " +
  "border-gray-200 bg-cream-alt/80 p-2 shadow-lg backdrop-blur-md " +
  "supports-[backdrop-filter]:bg-cream-alt/70";

const ALIGN: Record<NonNullable<DockProps["direction"]>, string> = {
  top: "items-start",
  middle: "items-center",
  bottom: "items-end",
};

export interface DockProps {
  className?: string;
  children: React.ReactNode;
  iconSize?: number;
  iconMagnification?: number;
  iconDistance?: number;
  disableMagnification?: boolean;
  direction?: "top" | "middle" | "bottom";
}

export const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className = "",
      children,
      iconSize = DEFAULT_SIZE,
      iconMagnification = DEFAULT_MAGNIFICATION,
      iconDistance = DEFAULT_DISTANCE,
      disableMagnification = false,
      direction = "bottom",
    },
    ref,
  ) => {
    const mouseX = useMotionValue(Infinity);

    const renderChildren = () =>
      React.Children.map(children, (child) => {
        if (React.isValidElement<DockIconProps>(child) && child.type === DockIcon) {
          return React.cloneElement(child, {
            ...child.props,
            mouseX,
            size: iconSize,
            magnification: iconMagnification,
            distance: iconDistance,
            disableMagnification,
          });
        }
        return child;
      });

    return (
      <motion.div
        ref={ref}
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        data-mind-dock
        className={`${DOCK_CLASS} ${ALIGN[direction]} ${className}`}
      >
        {renderChildren()}
      </motion.div>
    );
  },
);

Dock.displayName = "Dock";

export interface DockIconProps
  extends Omit<MotionProps & React.HTMLAttributes<HTMLDivElement>, "children"> {
  size?: number;
  magnification?: number;
  distance?: number;
  disableMagnification?: boolean;
  mouseX?: MotionValue<number>;
  className?: string;
  children?: React.ReactNode;
}

export function DockIcon({
  size = DEFAULT_SIZE,
  magnification = DEFAULT_MAGNIFICATION,
  distance = DEFAULT_DISTANCE,
  disableMagnification = false,
  mouseX,
  className = "",
  children,
  ...props
}: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const padding = Math.max(6, size * 0.16);
  const fallbackMouseX = useMotionValue(Infinity);

  const distanceFromCursor = useTransform(mouseX ?? fallbackMouseX, (value) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return value - bounds.x - bounds.width / 2;
  });

  const target = disableMagnification ? size : magnification;
  const sizeTransform = useTransform(
    distanceFromCursor,
    [-distance, 0, distance],
    [size, target, size],
  );
  const scaledSize = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.div
      ref={ref}
      style={{ width: scaledSize, height: scaledSize, padding }}
      className={`flex aspect-square cursor-pointer items-center justify-center rounded-2xl ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

DockIcon.displayName = "DockIcon";
