import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactElement;
    enabled?: boolean;
    checkOverflow?: boolean;
    delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    enabled = true,
    checkOverflow = false,
    delay = 200
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const handleMouseEnter = (e: React.MouseEvent) => {
        const element = e.currentTarget as HTMLElement;

        // If checkOverflow is true, only show if the element is actually truncated
        if (checkOverflow && element.scrollWidth <= element.clientWidth) {
            return;
        }

        if (!enabled) return;

        timeoutRef.current = setTimeout(() => {
            const rect = element.getBoundingClientRect();

            // Calculate position (centered above the element)
            // We'll adjust this after render if needed, but this is a good start
            setPosition({
                top: rect.top - 8, // 8px gap
                left: rect.left + (rect.width / 2)
            });

            setIsVisible(true);
        }, delay);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    // Cleanup timeout
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    // Clone child to attach refs and events
    const trigger = React.cloneElement(children, {
        // @ts-ignore
        ref: (node: HTMLElement) => {
            // Keep existing ref if any
            // @ts-ignore
            const { ref } = children;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
            // @ts-ignore
            triggerRef.current = node;
        },
        onMouseEnter: (e: React.MouseEvent) => {
            handleMouseEnter(e);
            children.props.onMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
            handleMouseLeave();
            children.props.onMouseLeave?.(e);
        }
    });

    if (!enabled) return children;

    return (
        <>
            {trigger}
            {isVisible && createPortal(
                <div
                    className="fixed z-[9999] px-3 py-2 text-xs font-medium text-white bg-slate-950 border border-slate-600/50 rounded shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-100 pointer-events-none max-w-xs break-words ring-1 ring-white/5"
                    style={{
                        top: position.top,
                        left: position.left,
                        transform: 'translate(-50%, -100%)' // Center horizontally, move above
                    }}
                >
                    {content}
                    {/* Arrow */}
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-b border-r border-slate-600/50 rotate-45"></div>
                </div>,
                document.body
            )}
        </>
    );
};
