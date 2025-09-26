import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "cursor-pointer active:scale-95 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
                destructive:
                    'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
                outline:
                    'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
                secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
                link: 'text-primary underline-offset-4 hover:underline',
                gradient:
                    'text-blue-100 bg-gradient-to-r from-rose-500 to-indigo-700 shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-primary/50',
                glass: 'bg-white/20 text-white shadow-xs backdrop-blur-sm hover:bg-white/30 ring-1 ring-slate-200/30 dark:bg-white/10 dark:ring-slate-800/50 dark:hover:bg-white/20',
                magic: 'relative overflow-hidden rounded-lg font-semibold inline-flex items-center justify-center duration-75 shadow-sm z-0 text-white bg-blue-500 border-0 transition-all ease-in-out z-10',
                badge: 'relative font-mono text-[0.625rem]/[1.125rem] font-medium tracking-widest text-sky-800 uppercase dark:text-sky-300 group transition-all duration-200 cursor-pointer',
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                icon: 'size-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

function Button({ className, variant, size, asChild = false, children, ...props }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            data-slot="button"
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        >
            {children}
            {variant === 'magic' && (
                <span className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className=" w-40 h-40 opacity-50 blur-[20px] animate-[effect_3s_linear_infinite] bg-gradient-to-r from-indigo-600 via-purple-500 to-cyan-400 transition-all duration-400" />
                </span>
            )}
            {variant === 'badge' && (
                <>
                    <span className="absolute inset-0 border border-dashed border-sky-300/60 bg-sky-400/10 group-hover:bg-sky-400/15 dark:border-sky-300/30"></span>
                    <svg
                        width="4"
                        height="4"
                        viewBox="0 0 5 5"
                        className="absolute top-[-8] left-[-8] fill-sky-300 dark:fill-sky-300/50"
                    >
                        <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path>
                    </svg>
                    <svg
                        width="4"
                        height="4"
                        viewBox="0 0 5 5"
                        className="absolute top-[-8] right-[-8] fill-sky-300 dark:fill-sky-300/50"
                    >
                        <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path>
                    </svg>
                    <svg
                        width="4"
                        height="4"
                        viewBox="0 0 5 5"
                        className="absolute bottom-[-8] left-[-8] fill-sky-300 dark:fill-sky-300/50"
                    >
                        <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path>
                    </svg>
                    <svg
                        width="4"
                        height="4"
                        viewBox="0 0 5 5"
                        className="absolute right-[-8] bottom-[-8] fill-sky-300 dark:fill-sky-300/50"
                    >
                        <path d="M2 0h1v2h2v1h-2v2h-1v-2h-2v-1h2z"></path>
                    </svg>
                </>
            )}
        </Comp>
    );
}

export { Button, buttonVariants };
