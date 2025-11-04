'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Crop, Expand, Eye, Maximize2, Palette, Sliders, Text } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { usePlanAccess } from '@/hooks/usePlanAccess';

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

const EditorTopbar = props => {
    const router = useRouter();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [restrictedTool, setRestrictedTool] = useState(null);
    const { hasAccess, isApprenticeUser,  } = usePlanAccess();

    const { canvasEditor, activeTool, onToolChange } = useCanvasContext();

    return <div>EditorTopbar</div>;
};

EditorTopbar.propTypes = {};

export default EditorTopbar;
