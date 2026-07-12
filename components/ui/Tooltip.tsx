// components/ui/Tooltip.tsx
"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  type ReactNode,
  type HTMLAttributes,
} from "react";
import { createPortal } from "react-dom";

type TooltipSide = "top" | "bottom" | "left" | "right";
type TooltipAlign = "center" | "start" | "end";

type TooltipProps = {
  content: ReactNode;
  children?: ReactNode;
  side?: TooltipSide;
  align?: TooltipAlign;
  delay?: number;
} & Omit<HTMLAttributes<HTMLDivElement>, "content">;

export function Tooltip({
  content,
  children,
  side = "top",
  align = "center",
  delay = 150,
  ...rest
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const triggerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const tooltipId = useId();
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const show = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => setOpen(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setOpen(false);
  };

  // Position logic: prefer mouse position, fall back to trigger element
  useEffect(() => {
    if (!open) return;

    const tooltip = tooltipRef.current;
    const trigger = triggerRef.current;
    if (!tooltip) return;

    const tooltipRect = tooltip.getBoundingClientRect();
    const padding = 8;
    let top = 0;
    let left = 0;

    const mouse = mousePosRef.current;

    if (mouse) {
      // Position near cursor
      const offsetX = 12;
      const offsetY = 16;
      top = mouse.y + offsetY;
      left = mouse.x + offsetX;
    } else if (trigger) {
      // Fallback to trigger-based positioning
      const triggerRect = trigger.getBoundingClientRect();

      switch (side) {
        case "top":
          top = triggerRect.top - tooltipRect.height - 8;
          break;
        case "bottom":
          top = triggerRect.bottom + 8;
          break;
        case "left":
          top =
            triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case "right":
          top =
            triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.right + 8;
          break;
      }

      if (side === "top" || side === "bottom") {
        if (align === "center") {
          left =
            triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        } else if (align === "start") {
          left = triggerRect.left;
        } else {
          left = triggerRect.right - tooltipRect.width;
        }
      } else {
        if (align === "start") {
          top = triggerRect.top;
        } else if (align === "end") {
          top = triggerRect.bottom - tooltipRect.height;
        }
      }
    }

    // Clamp to viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    left = Math.max(padding, Math.min(left, vw - tooltipRect.width - padding));
    top = Math.max(padding, Math.min(top, vh - tooltipRect.height - padding));

    setCoords({ top, left });
  }, [open, side, align]);

  if (typeof document === "undefined") {
    return (
      <div ref={triggerRef} {...rest}>
        {children}
      </div>
    );
  }

  const tooltipNode = open ? (
    <div
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
      style={{
        top: coords.top,
        left: coords.left,
      }}
      className="fixed z-[60] max-w-xs animate-tooltip-in rounded-control border border-inverse bg-surface-graphite px-3 py-2 text-[12px] text-surface-graphite-foreground opacity-0 shadow-overlay backdrop-blur-sm scale-[0.97]"
    >
      {content}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={triggerRef}
        {...rest}
        onMouseEnter={(e) => {
          mousePosRef.current = { x: e.clientX, y: e.clientY };
          rest.onMouseEnter?.(e);
          show();
        }}
        onMouseMove={(e) => {
          mousePosRef.current = { x: e.clientX, y: e.clientY };
          rest.onMouseMove?.(e);
        }}
        onMouseLeave={(e) => {
          rest.onMouseLeave?.(e);
          hide();
        }}
        onFocus={(e) => {
          rest.onFocus?.(e);
          show();
        }}
        onBlur={(e) => {
          rest.onBlur?.(e);
          hide();
        }}
        aria-describedby={open ? tooltipId : undefined}
      >
        {children}
      </div>
      {createPortal(tooltipNode, document.body)}
    </>
  );
}
