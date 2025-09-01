import * as React from "react";
import {createPortal} from "react-dom";
import {cn} from "../../global/library/utils";

export interface TooltipProps {
    children: React.ReactNode;
    content: React.ReactNode;
    delayDuration?: number;
    side?: "top" | "bottom" | "left" | "right";
    className?: string;
}

export default function Tooltip({
                                    children,
                                    content,
                                    delayDuration = 0,
                                    side = "top",
                                    className,
                                }: TooltipProps) {
    const [visible, setVisible] = React.useState(false);
    const [timer, setTimer] = React.useState<ReturnType<typeof setTimeout> | null>(null);
    const [coords, setCoords] = React.useState<{ top: number; left: number }>({top: 0, left: 0});
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    const show = () => {
        if (delayDuration > 0) {
            const t = setTimeout(() => {
                setVisible(true);
            }, delayDuration);
            setTimer(t);
        } else {
            setVisible(true);
        }
    };

    const hide = () => {
        if (timer) clearTimeout(timer);
        setVisible(false);
    };

    const updatePosition = () => {
        const trigger = triggerRef.current;
        const tooltip = tooltipRef.current;
        if (!trigger || !tooltip) return;

        const rect = trigger.getBoundingClientRect();
        const tipRect = tooltip.getBoundingClientRect();
        const spacing = 8; // gap between trigger and tooltip

        let top = 0,
            left = 0;

        switch (side) {
            case "top":
                top = rect.top - tipRect.height - spacing;
                left = rect.left + rect.width / 2 - tipRect.width / 2;
                break;
            case "bottom":
                top = rect.bottom + spacing;
                left = rect.left + rect.width / 2 - tipRect.width / 2;
                break;
            case "left":
                top = rect.top + rect.height / 2 - tipRect.height / 2;
                left = rect.left - tipRect.width - spacing;
                break;
            case "right":
                top = rect.top + rect.height / 2 - tipRect.height / 2;
                left = rect.right + spacing;
                break;
        }
        setCoords({top, left});
    };

    React.useEffect(() => {
        if (visible) {
            updatePosition();
            window.addEventListener("scroll", updatePosition, true);
            window.addEventListener("resize", updatePosition);
        }
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [visible, side]);

    return (
        <>
            {/* Trigger */}
            <div
                ref={triggerRef}
                className="inline-flex w-max h-max"
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
            >
                {children}
            </div>

            {/* Tooltip (portal) */}
            {visible &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        role="tooltip"
                        style={{
                            position: "fixed",
                            top: coords.top,
                            left: coords.left,
                        }}
                        className={cn(
                            "z-[9999] rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95",
                            className
                        )}
                    >
                        {content}
                    </div>,
                    document.body
                )}
        </>
    );
}
