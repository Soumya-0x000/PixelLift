'use client';

import './loadingFallback.css';

export default function LoadingFallback() {
    return (
        <div className="loading-fallback-container flex flex-col items-center justify-center h-screen bg-white dark:bg-black">
            <div className="loading-fallback-loader">
                <svg className="loading-fallback-svg-defs" width="0" height="0">
                    <defs suppressHydrationWarning>
                        <linearGradient id="loading-fallback-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#973BED" suppressHydrationWarning />
                            <stop offset="100%" stopColor="#007CFF" suppressHydrationWarning />
                        </linearGradient>
                        <linearGradient id="loading-fallback-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFC800" suppressHydrationWarning />
                            <stop offset="100%" stopColor="#FF00FF" suppressHydrationWarning />
                        </linearGradient>
                        <linearGradient id="loading-fallback-gradient-3" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00E0ED" suppressHydrationWarning />
                            <stop offset="100%" stopColor="#00DA72" suppressHydrationWarning />
                        </linearGradient>
                        <linearGradient id="loading-fallback-gradient-4" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF6B6B" suppressHydrationWarning />
                            <stop offset="100%" stopColor="#FFE66D" suppressHydrationWarning />
                        </linearGradient>
                    </defs>
                </svg>

                {/* P */}
                <svg viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        pathLength="360"
                        d="M5 5 L5 45 M5 5 L20 5 Q25 5 25 12.5 Q25 20 20 20 L5 20"
                        className="loading-fallback-dash loading-fallback-gradient-1"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>

                {/* I */}
                <svg viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        pathLength="360"
                        d="M8 5 L22 5 M15 5 L15 45 M8 45 L22 45"
                        className="loading-fallback-dash loading-fallback-gradient-2"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>

                {/* X */}
                <svg viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        pathLength="360"
                        d="M5 5 L25 45 M25 5 L5 45"
                        className="loading-fallback-dash loading-fallback-gradient-3"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>

                {/* E */}
                <svg viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        pathLength="360"
                        d="M25 5 L5 5 L5 45 L25 45 M5 25 L20 25"
                        className="loading-fallback-dash loading-fallback-gradient-4"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>

                {/* L */}
                <svg viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        pathLength="360"
                        d="M5 5 L5 45 L25 45"
                        className="loading-fallback-dash loading-fallback-gradient-1"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>

                {/* L */}
                <svg viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        pathLength="360"
                        d="M5 5 L5 45 L25 45"
                        className="loading-fallback-dash loading-fallback-gradient-2"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>

                {/* I */}
                <svg viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        pathLength="360"
                        d="M8 5 L22 5 M15 5 L15 45 M8 45 L22 45"
                        className="loading-fallback-dash loading-fallback-gradient-3"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>

                {/* F */}
                <svg viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        pathLength="360"
                        d="M25 5 L5 5 L5 45 M5 25 L20 25"
                        className="loading-fallback-dash loading-fallback-gradient-4"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>

                {/* T */}
                <svg viewBox="0 0 30 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        pathLength="360"
                        d="M5 5 L25 5 M15 5 L15 45"
                        className="loading-fallback-dash loading-fallback-gradient-1"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                </svg>

                <div className="loading-fallback-spacer"></div>
            </div>
        </div>
    );
}
