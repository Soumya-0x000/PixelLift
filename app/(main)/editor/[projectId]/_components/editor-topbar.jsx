'use client';

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    ArrowLeft,
    Crop,
    Expand,
    Eye,
    Maximize2,
    Palette,
    Sliders,
    Text,
    Icon,
    Lock,
    RotateCcw,
    RotateCw,
    SendToBack,
    WandSparkles,
    Undo2,
    Redo2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import { Button } from '@/components/ui/button';
import UpgradePlanModal from '@/components/UpgradePlanModal';
import { Input } from '@/components/ui/input';
import { useConvexMutation } from '@/hooks/useConvexQuery';
import { api } from '@/convex/_generated/api';

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
        id: 'text',
        label: 'Text',
        icon: Text,
    },
    {
        id: 'adjust',
        label: 'Adjust',
        icon: Sliders,
        masterOnly: true,
    },
    {
        id: 'background',
        label: 'AI Background',
        icon: Palette,
        masterOnly: true,
    },
    {
        id: 'aiEdit',
        label: 'AI Editing',
        icon: WandSparkles,
        masterOnly: true,
    },
    // {
    //     id: 'upscaler',
    //     label: 'AI Upscaler',
    //     icon: Expand,
    //     masterOnly: true,
    // },
    {
        id: 'aiExtender',
        label: 'AI Extender',
        icon: Maximize2,
        masterOnly: true,
    },
    // {
    //     id: 'colorAdjustments',
    //     label: 'Color Adjustments',
    //     icon: Palette,
    // },
    // {
    //     id: 'retouch',
    //     label: 'Retouch',
    //     icon: SendToBack,
    // },
];

const upMessage = {
    master: 'This feature is locked behind the Master plan. Upgrade and break past the basic limits to access advanced functionality.',
    deity: 'This feature is reserved for the Deity plan. Upgrade to the highest tier to experience everything the platform truly offers—nothing less will do.',
};

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
    const [projectTitle, setProjectTitle] = useState(project.title || 'Untitled Project');
    const [upgradeMsg, setUpgradeMsg] = useState({ title: '', description: '' });
    const { hasAccess, isApprenticeUser } = usePlanAccess();

    const { canvasEditor, activeTool, onToolChange } = useCanvasContext();
    const { mutate: updateProject } = useConvexMutation(api.projects.updateProject);

    const formatUpgradeMsg = toolId => {
        const plan = TOOLS.find(tool => tool.id === toolId);
        if (plan?.hasOwnProperty('masterOnly')) {
            setUpgradeMsg({
                title: `Master Plan`,
                description: upMessage.master,
            });
        } else if (plan?.hasOwnProperty('deityOnly')) {
            setUpgradeMsg({
                title: `Deity Plan`,
                description: upMessage.deity,
            });
        }
    };

    const handleBackToDashboard = () => {
        router.push('/dashboard');
    };

    const handleToolChange = toolId => {
        if (!hasAccess(toolId)) {
            setRestrictedTool(toolId);
            formatUpgradeMsg(toolId);
            setShowUpgradeModal(true);
            return;
        }
        onToolChange(toolId);
    };

    const onTitleChange = async e => {
        const { value } = e.target;
        setProjectTitle(value);

        if (value) {
            const updateTitle = await updateProject({
                projectId: project._id,
                title: value,
            });

            let timeoutId;
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                updateTitle();
            }, 600);
        }
    };

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

                    <div>
                        <Input
                            className="font-semibold w-xs border-none outline-none bg-transparent text-white text-center text-medium placeholder:text-gray-400 focus-within:font-normal focus-within:tracking-wider transition-all"
                            value={projectTitle}
                            onChange={onTitleChange}
                        />
                    </div>

                    <div>Right</div>
                </div>

                {/* Tools Row */}
                <div className="flex items-center justify-between">
                    {/* Tools */}
                    <div className="flex items-center gap-2">
                        {TOOLS.map(tool => {
                            const Icon = tool.icon;
                            const isActive = activeTool === tool.id;
                            const hasToolAccess = hasAccess(tool.id);

                            return (
                                <Button
                                    key={tool.id}
                                    variant={isActive ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => handleToolChange(tool.id)}
                                    className={`gap-2 relative ${
                                        isActive
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'text-white hover:text-gray-300 hover:bg-gray-100'
                                    } ${!hasToolAccess ? 'opacity-60' : ''}`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tool.label}
                                    {!hasToolAccess && <Lock className="h-3 w-3 text-amber-400" />}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center gap-4">
                        {/* Undo/Redo */}
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                // className={`text-white ${!canUndo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'}`}
                                // onClick={handleUndo}
                                // disabled={!canUndo || isUndoRedoOperation}
                                // title={`Undo (${undoStack.length - 1} actions available)`}
                            >
                                <Undo2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                // className={`text-white ${!canRedo ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-700'}`}
                                // onClick={handleRedo}
                                // disabled={!canRedo || isUndoRedoOperation}
                                // title={`Redo (${redoStack.length} actions available)`}
                            >
                                <Redo2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upgrade Plan Modal */}
            <UpgradePlanModal
                openModal={showUpgradeModal}
                closeModal={() => setShowUpgradeModal(false)}
                upgradeMsg={upgradeMsg}
            />
        </>
    );
};

EditorTopbar.propTypes = {};

export default EditorTopbar;
