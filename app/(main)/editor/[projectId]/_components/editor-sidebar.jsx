import React from 'react';
import PropTypes from 'prop-types';
import { Crop, Expand, Eye, Loader2, Maximize2, Palette, Sliders, Text } from 'lucide-react';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import CropContent from './tools/CropContent';
import ResizeControls from './tools/_resize/ResizeControls';
import AdjustControls from './tools/_adjust/AdjustControls';
import BackgroundControls from './tools/BackgroundControls';
import AIExtenderControls from './tools/AIExtenderControls';
import TextControls from './tools/TextControls';
import AIEdit from './tools/AIEdit';

const TOOL_CONFIGS = {
    resize: {
        title: 'Resize',
        icon: Expand,
        description: 'Change project dimensions',
    },
    crop: {
        title: 'Crop',
        icon: Crop,
        description: 'Crop and trim your image',
    },
    adjust: {
        title: 'Adjust',
        icon: Sliders,
        description: 'Brightness, contrast, and more (Save Manually)',
    },
    background: {
        title: 'Background',
        icon: Palette,
        description: 'Remove or change background',
    },
    aiExtender: {
        title: 'AI Image Extender',
        icon: Maximize2,
        description: 'Extend image boundaries with AI',
    },
    text: {
        title: 'Add Text',
        icon: Text,
        description: 'Customize in Various Fonts',
    },
    aiEdit: {
        title: 'AI Editing',
        icon: Eye,
        description: 'Enhance image quality with AI',
    },
};

const EditorSidebar = () => {
    const { activeTool, processing } = useCanvasContext();

    const toolConfig = TOOL_CONFIGS[activeTool] || {};

    if (!toolConfig) {
        return null;
    }

    const Icon = toolConfig.icon;

    return (
        <div className="min-w-96 border-r flex flex-col ">
            {/* Sidebar Header */}
            <div className="px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                    <span className="flex gap-3">
                        <Icon className="h-5 w-5 text-white" />
                        <h2 className="text-lg font-semibold text-white">{toolConfig.title}</h2>
                    </span>
                    {processing && (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 text-white/70 animate-spin" />
                            <span className="text-white/70 text-sm">Applying...</span>
                        </span>
                    )}
                </div>
                <p className="text-sm text-white mt-1">{toolConfig.description}</p>
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 p-3 overflow-y-auto">
                {renderToolContent(activeTool)}
            </div>
        </div>
    );
};

EditorSidebar.propTypes = {};

export default EditorSidebar;

function renderToolContent(activeTool) {
    switch (activeTool) {
        case 'crop':
            return <CropContent />;
        case 'resize':
            return <ResizeControls />;
        case 'adjust':
            return <AdjustControls />;
        case 'background':
            return <BackgroundControls />;
        case 'ai_extender':
            return <AIExtenderControls />;
        case 'text':
            return <TextControls />;
        case 'ai_edit':
            return <AIEdit />;
        default:
            return <div className="text-white">Select a tool to get started</div>;
    }
}
