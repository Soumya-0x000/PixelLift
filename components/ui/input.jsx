'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { useMotionTemplate, useMotionValue, motion } from 'motion/react';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    const radius = 100; // change this to increase the radius of the hover effect
    const [visible, setVisible] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    // Always call hooks unconditionally to avoid Rules of Hooks violations
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const background = useMotionTemplate`radial-gradient(${
        visible ? radius + 'px' : '0px'
    } circle at ${mouseX}px ${mouseY}px, #3b82f6, transparent 80%)`;

    React.useEffect(() => {
        setMounted(true);
    }, []);

    function handleMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top } = currentTarget.getBoundingClientRect();

        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const inputElement = (
        <input
            type={type}
            className={cn(
                `shadow-input dark:placeholder-text-neutral-600 flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600`,
                className
            )}
            ref={ref}
            {...props}
        />
    );

    // Render plain div during SSR to avoid hydration mismatch
    if (!mounted) {
        return <div className="group/input rounded-lg p-[2px] transition duration-300">{inputElement}</div>;
    }

    // Render motion.div after mounting on client
    return (
        <motion.div
            style={{ background }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            className="group/input rounded-lg p-[2px] transition duration-300"
        >
            {inputElement}
        </motion.div>
    );
});
Input.displayName = 'Input';

export { Input };
