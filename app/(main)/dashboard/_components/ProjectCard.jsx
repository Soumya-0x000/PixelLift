import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Calendar } from 'lucide-react';
import Image from 'next/image';

const ProjectCard = ({ project, onEditProject }) => {
    const { title, thumbnailUrl, updatedAt } = project;

    const formatDate = ts => {
        const date = new Date(ts);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <Card className="group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-fit py-0 w-full">
            <div className="relative w-full h-36 overflow-hidden">
                <Image
                    src={thumbnailUrl}
                    alt={title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <button
                    onClick={onEditProject}
                    className="absolute top-3 right-3 bg-white/40 hover:bg-white/60 text-gray-800 rounded-full p-2 shadow-sm transition cursor-pointer"
                    title="Edit project"
                >
                    <Edit2 size={16} />
                </button>
            </div>

            <CardHeader className="p- pb-1">
                <CardTitle className="text-lg font-semibold text-slate-700 line-clamp-1">
                    {title}
                </CardTitle>
            </CardHeader>

            <CardContent className="px-4 pb-2 text-sm text-slate-500 flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span>Updated on {formatDate(updatedAt)}</span>
            </CardContent>

            <CardFooter className="px-4 pb-4">
                <button
                    onClick={onEditProject}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                >
                    Open in Editor
                </button>
            </CardFooter>
        </Card>
    );
};

export default ProjectCard;
