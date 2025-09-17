// 'use client';

// import React, { useState } from 'react';
// import { motion, useScroll, useTransform, useMotionValueEvent } from 'motion/react';

// const ScrollToTop = () => {
//     const { scrollY, scrollYProgress } = useScroll();
//     const [isVisible, setIsVisible] = useState(false);
// console.log(scrollY)
//     // Drive visibility from Motion's scroll value (in px)
//     useMotionValueEvent(scrollY, 'change', latest => {
//         const scrollThreshold = 100;
//         setIsVisible(latest > scrollThreshold);
//     });

//     const scrollToTop = () => {
//         window.scrollTo({ top: 0, behavior: 'smooth' });
//     };

//     const circumference = 2 * Math.PI * 22;
//     const strokeDashoffset = useTransform(scrollYProgress, [0, 1], [circumference, 0]);

//     const pathVariants = {
//         hidden: {
//             opacity: 0,
//             pathLength: 0,
//         },
//         visible: {
//             opacity: 1,
//             pathLength: 1,
//             transition: {
//                 pathLength: { delay: 0.5, type: 'spring', duration: 1.5, bounce: 0 },
//                 opacity: { delay: 0.5, duration: 0.01 },
//             },
//         },
//     };

//     return (
//         <motion.div
//             className="fixed right-10 bottom-10 rounded-full"
//             onClick={scrollToTop}
//             whileHover={{ scale: 1.05 }}
//             initial={{ y: 100, opacity: 0 }}
//             animate={{ y: isVisible ? 0 : 100, opacity: isVisible ? 1 : 0 }}
//             style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
//             transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.3 }}
//         >
//             <div className="relative">
//                 {/* Animated border circle */}
//                 <svg className="absolute inset-0 w-12 h-12 -rotate-90" viewBox="0 0 48 48">
//                     {/* Background circle */}
//                     <circle
//                         cx="24"
//                         cy="24"
//                         r="22"
//                         fill="none"
//                         stroke="rgba(255,255,255,0.1)"
//                         strokeWidth="2"
//                     />
//                     {/* Progress circle */}
//                     <motion.circle
//                         cx="24"
//                         cy="24"
//                         r="22"
//                         fill="none"
//                         stroke="url(#gradient)"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeDasharray={circumference}
//                         style={{ strokeDashoffset }}
//                     />
//                     {/* Gradient definition */}
//                     <defs>
//                         <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                             <stop offset="0%" stopColor="#06b6d4" />
//                             <stop offset="50%" stopColor="#3b82f6" />
//                             <stop offset="100%" stopColor="#8b5cf6" />
//                         </linearGradient>
//                     </defs>
//                 </svg>

//                 <motion.button
//                     className="cursor-pointer bg-black/90 rounded-full p-3"
//                     aria-label="Scroll to top"
//                     type="button"
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                     transition={{ type: 'spring', stiffness: 300, damping: 20 }}
//                 >
//                     <motion.svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         width="24"
//                         height="24"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         className="lucide lucide-arrow-big-up-icon lucide-arrow-big-up text-cyan-400 "
//                         initial="hidden"
//                         animate="visible"
//                     >
//                         <motion.path
//                             variants={pathVariants}
//                             strokeWidth={2}
//                             size={5}
//                             d="M9 13a1 1 0 0 0-1-1H5.061a1 1 0 0 1-.75-1.811l6.836-6.835a1.207 1.207 0 0 1 1.707 0l6.835 6.835a1 1 0 0 1-.75 1.811H16a1 1 0 0 0-1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z"
//                         />
//                     </motion.svg>
//                 </motion.button>
//             </div>
//         </motion.div>
//     );
// };

// export default ScrollToTop;










"use client"

import {
    animate,
    motion,
    MotionValue,
    useMotionValue,
    useMotionValueEvent,
    useScroll,
} from "motion/react"
import { useRef } from "react"

export default function ScrollToTop({ containerRef }) {
    const ref = useRef(null);
    const { scrollXProgress } = useScroll({ container: ref });
    const maskImage = useScrollOverflowMask(scrollXProgress);

    return (
        <div id="example">
            <svg id="progress" width="80" height="80" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="30" pathLength="1" className="bg" />
                <motion.circle
                    cx="50"
                    cy="50"
                    r="30"
                    className="indicator"
                    style={{ pathLength: scrollXProgress }}
                />
            </svg>
            <motion.ul ref={ref} >
                <li style={{ background: '#ff0088' }}></li>
                <li style={{ background: '#dd00ee' }}></li>
                <li style={{ background: '#9911ff' }}></li>
                <li style={{ background: '#0d63f8' }}></li>
                <li style={{ background: '#0cdcf7' }}></li>
                <li style={{ background: '#8df0cc' }}></li>
            </motion.ul>
            <StyleSheet />
        </div>
    );
}

const left = `0%`
const right = `100%`
const leftInset = `20%`
const rightInset = `80%`
const transparent = `#0000`
const opaque = `#000`
function useScrollOverflowMask(scrollXProgress) {
    const maskImage = useMotionValue(
        `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`
    )

    useMotionValueEvent(scrollXProgress, "change", (value) => {
        if (value === 0) {
            animate(
                maskImage,
                `linear-gradient(90deg, ${opaque}, ${opaque} ${left}, ${opaque} ${rightInset}, ${transparent})`
            )
        } else if (value === 1) {
            animate(
                maskImage,
                `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${right}, ${opaque})`
            )
        } else if (
            scrollXProgress.getPrevious() === 0 ||
            scrollXProgress.getPrevious() === 1
        ) {
            animate(
                maskImage,
                `linear-gradient(90deg, ${transparent}, ${opaque} ${leftInset}, ${opaque} ${rightInset}, ${transparent})`
            )
        }
    })

    return maskImage
}

/**
 * ==============   Styles   ================
 */

function StyleSheet() {
    return (
        <style>{`
            #example {
              width: 100vw;
              max-width: 400px;
              position: relative;
            }

            #example #progress {
                position: absolute;
                top: -65px;
                left: -15px;
                transform: rotate(-90deg);
            }

            #example .bg {
                stroke: #0b1011;
            }

            #example #progress circle {
                stroke-dashoffset: 0;
                stroke-width: 10%;
                fill: none;
            }

            #progress .indicator {
                stroke: var(--accent);
            }

            #example ul {
                display: flex;
                list-style: none;
                height: 220px;
                overflow-x: scroll;
                padding: 20px 0;
                flex: 0 0 600px;
                margin: 0 auto;
                gap: 20px;
            }

            #example ::-webkit-scrollbar {
                height: 5px;
                width: 5px;
                background: #fff3;
                -webkit-border-radius: 1ex;
            }

            #example ::-webkit-scrollbar-thumb {
                background: var(--accent);
                -webkit-border-radius: 1ex;
            }

            #example ::-webkit-scrollbar-corner {
                background: #fff3;
            }

            #example li {
                flex: 0 0 200px;
                background: var(--accent);
            }

    `}</style>
    )
}
