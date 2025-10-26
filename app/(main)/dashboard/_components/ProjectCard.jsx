import React, { useState } from 'react';
import { Edit2, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDate } from '@/utils/formatDate';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { parseISO } from 'date-fns/parseISO';
import { format } from 'date-fns/format';

const ProjectCard = React.memo(({ project }) => {
    const { title, description, thumbnailUrl, updatedAt } = project;
    const [isHovered, setIsHovered] = useState(false);
    const containerVariants = {
        hidden: {
            transition: {
                staggerChildren: 0.1,
                staggerDirection: -1, // Reverse order for exit
            },
        },
        visible: {
            transition: {
                staggerChildren: 0.12,
                delayChildren: 0.05,
            },
        },
    };

    const buttonVariants = {
        hidden: {
            opacity: 0,
            y: -10,
            scale: 0.8,
            transition: {
                duration: 0.2,
                ease: 'easeIn',
            },
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.3,
                ease: 'easeOut',
            },
        },
    };

    const formattedDate = updatedAt
        ? format(typeof updatedAt === 'string' ? parseISO(updatedAt) : new Date(updatedAt), 'PPP p')
        : 'N/A';

    return (
        <motion.div
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 w-full max-w-sm h-fit"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            {/* Image Container - Compact */}
            <div className="relative w-full h-40 overflow-hidden">
                <motion.img
                    src={thumbnailUrl || '/api/placeholder/400/320'}
                    alt={title}
                    className="w-full h-full object-cover"
                    animate={{ scale: isHovered ? 1.1 : 1 }}
                    transition={{ duration: 0.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                {/* Action Buttons - Staggered Animation with Motion */}
                <motion.div
                    className="absolute top-3 right-3 flex flex-col gap-2"
                    initial="hidden"
                    animate={isHovered ? 'visible' : 'hidden'}
                    variants={containerVariants}
                >
                    <motion.button
                        data-action="edit"
                        data-id={project._id}
                        // onClick={e => e.stopPropagation()}
                        className="bg-white/10 backdrop-blur-md hover:bg-yellow-400/40 cursor-pointer text-white rounded-full p-2"
                        aria-label="Edit"
                        variants={buttonVariants}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Edit2 size={15} strokeWidth={2.5} />
                    </motion.button>

                    <motion.button
                        data-action="delete"
                        data-id={project._id}
                        // onClick={e => e.stopPropagation()}
                        className="bg-white/10 backdrop-blur-md hover:bg-red-400/40 cursor-pointer text-red-100 rounded-full p-2"
                        aria-label="Delete"
                        variants={buttonVariants}
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Trash2 size={15} strokeWidth={2.5} />
                    </motion.button>
                </motion.div>
            </div>

            {/* Bottom Content */}
            <div className="py-2 px-2 h-fit">
                {/* Title */}
                <span className="text-base font-semibold tracking-wide text-white line-clamp-1">
                    {title}
                </span>

                {/* Description - Optional, compact */}
                <p className="text-xs text-slate-400 line-clamp-1 w-full hyphens-auto h-4.5">
                    {description}
                </p>

                {/* Bottom Row - Date & Action */}
                <div className="flex items-end justify-between gap-2 pt-2.5">
                    {/* Date */}
                    <div className="flex flex-col">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 text-[0.8rem] text-slate-500">
                                    <Calendar size={14} className="flex-shrink-0" />
                                    <span>{formatDate(updatedAt)}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent
                                className={`bg-slate-300 fill-slate-300 text-slate-900`}
                            >
                                {formattedDate}
                            </TooltipContent>
                        </Tooltip>

                        <div className="text-[0.6rem] flex items-center gap-1.5 text-slate-500 mt-1">
                            <span className="px-1 py-0.5 ring-[0.5px] bg-slate-900  ring-slate-600 rounded-sm line-clamp-1">{`${project.width} x ${project.height}px`}</span>
                            <span className="px-1 py-0.5 ring-[0.5px] bg-slate-900  ring-slate-600 rounded-sm line-clamp-1">{`${(project.size / (1024 * 1024)).toFixed(2)} MB`}</span>
                        </div>
                    </div>

                    {/* Action Button - Inline */}
                    <Button
                        data-action="edit"
                        data-id={project._id}
                        // onClick={e => e.stopPropagation()}
                        variant={'outline'}
                        className="flex items-center gap-1.5 text-slate-200 text-xs font-semibold p-0 px-3 rounded-lg transition-all duration-200 active:scale-95 group/btn cursor-pointer overflow-hidden"
                    >
                        <span>Open</span>
                        <span className="relative inline-flex w-5 h-5">
                            {/* Arrow 1 — moves out to the right */}
                            <ChevronRight
                                size={16}
                                strokeWidth={2.5}
                                className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out group-hover/btn:translate-x-0 group-hover/btn:opacity-"
                            />

                            {/* Arrow 2 — enters from the left */}
                            <ChevronRight
                                size={16}
                                strokeWidth={2.5}
                                className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 transition-all duration-300 ease-in-out group-hover/btn:left-[12px] group-hover/btn:-translate-x-1/2 group-hover/btn:opacity-100"
                            />
                        </span>
                    </Button>
                </div>
            </div>

            {/* Accent Border */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-white/5 group-hover:ring-white/10 transition-all pointer-events-none" />
        </motion.div>
    );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;
