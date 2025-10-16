import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Calendar, LucideEdit2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const ProjectCard = ({ project, onEditProject }) => {
    const { title, description, thumbnailUrl, updatedAt } = project;
    console.log(project);

    const formatDate = ts => {
        const date = new Date(ts);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer w-full max-w-sm h-fit">
            {/* Image Container - Compact */}
            <div className="relative w-full h-40 overflow-hidden">
                <Image
                    src={thumbnailUrl || '/api/placeholder/400/320'}
                    width={400}
                    height={320}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                {/* Edit Button - Floating */}
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onEditProject();
                    }}
                    className="absolute top-3 right-3 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                    aria-label="Edit"
                >
                    <LucideEdit2 size={14} strokeWidth={2.5} />
                </button>
            </div>

            {/* Content - Ultra Compact */}
            <div className="p-4 pt-3 h-31">
                {/* Title */}
                <span className="text-base font-semibold tracking-wide text-white line-clamp-1">
                    {title}
                </span>

                {/* Description - Optional, compact */}
                <p className="text-xs text-slate-400 line-clamp-2 leading-4.5 h-9 hyphens-auto">{description}</p>

                {/* Bottom Row - Date & Action */}
                <div className="flex items-center justify-between gap-2 pt-3">
                    {/* Date */}
                    <div className="flex items-center gap-1.5 text-[0.8rem] text-slate-500">
                        <Calendar size={14} className="flex-shrink-0" />
                        <span>{formatDate(updatedAt)}</span>
                    </div>

                    {/* Action Button - Inline */}
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            onEditProject();
                        }}
                        className="flex items-center gap-1.5 bg-indigo-500 hover:bg-slate-100 text-indigo-100 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all duration-200 active:scale-95 group/btn"
                    >
                        <span>Open</span>
                        <ArrowRight
                            size={12}
                            strokeWidth={2.5}
                            className="group-hover/btn:translate-x-1 transition-transform"
                        />
                    </button>
                </div>
            </div>

            {/* Accent Border */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-white/5 group-hover:ring-white/10 transition-all pointer-events-none" />
        </div>
    );
};

export default ProjectCard;
