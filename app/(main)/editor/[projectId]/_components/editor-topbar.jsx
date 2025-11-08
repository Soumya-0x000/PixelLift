'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeft, Crop, Expand, Eye, Maximize2, Palette, Sliders, Text } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { Button } from '@/components/ui/button';

const TOOLS = [
    {
        id: 'resize',
        label: 'Resize',
        icon: Expand,
        isActive: true,
    },
    {
        id: 'crop',
        label: 'Crop',
        icon: Crop,
    },
    {
        id: 'adjust',
        label: 'Adjust',
        icon: Sliders,
    },
    {
        id: 'text',
        label: 'Text',
        icon: Text,
    },
    {
        id: 'background',
        label: 'AI Background',
        icon: Palette,
        proOnly: true,
    },
    {
        id: 'ai_extender',
        label: 'AI Image Extender',
        icon: Maximize2,
        proOnly: true,
    },
    {
        id: 'ai_edit',
        label: 'AI Editing',
        icon: Eye,
        proOnly: true,
    },
];

const EXPORT_FORMATS = [
    {
        format: 'PNG',
        quality: 1.0,
        label: 'PNG (High Quality)',
        extension: 'png',
    },
    {
        format: 'JPEG',
        quality: 0.9,
        label: 'JPEG (90% Quality)',
        extension: 'jpg',
    },
    {
        format: 'JPEG',
        quality: 0.8,
        label: 'JPEG (80% Quality)',
        extension: 'jpg',
    },
    {
        format: 'WEBP',
        quality: 0.9,
        label: 'WebP (90% Quality)',
        extension: 'webp',
    },
];

const EditorTopbar = ({ project }) => {
    const router = useRouter();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [restrictedTool, setRestrictedTool] = useState(null);
    const { hasAccess, isApprenticeUser } = usePlanAccess();

    const { canvasEditor, activeTool, onToolChange } = useCanvasContext();

    const handleBackToDashboard = () => {
        router.push('/dashboard');
    };

    const handleToolChange = toolId => {};

    return (
        <>
            <div className="border-b px-6 py-3">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBackToDashboard}
                            className="text-white hover:text-gray-300"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            All Projects
                        </Button>
                    </div>

                    <h1 className="font-extrabold capitalize">{project.title}</h1>

                    <div>Right</div>
                </div>
            </div>
        </>
    );
};

EditorTopbar.propTypes = {};

export default EditorTopbar;
