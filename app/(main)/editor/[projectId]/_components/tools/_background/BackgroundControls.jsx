import { lazy, memo, Suspense, useState } from 'react';
import { useBackgroundChange } from './useBackgroundChange';
import { Button } from '@/components/ui/button';
import { Palette, Trash2, TypeOutline } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

const ColorBackgroundControl = lazy(() => import('./ColorBackgroundControl'));
const ImageBackgroundControl = lazy(() => import('./ImageBackgroundControl'));
const PromptBackgroundControl = lazy(() => import('./PromptBackgroundControl'));

const BG_TABS = [
    { id: 'color', name: 'Color', icon: <Palette size={15} className="w-5 aspect-square" /> },
    { id: 'background', name: 'Background', icon: <ImageIcon size={15} className="w-5 aspect-square" /> },
    { id: 'prompt', name: 'Prompt', icon: <TypeOutline size={15} className="w-5 aspect-square" /> },
];

const BackgroundControls = memo(() => {
    const { canvasEditor, handleBackgroundRemoval, processingMessage, mainImage } = useBackgroundChange();

    const [selectedTab, setSelectedTab] = useState(BG_TABS[0]);

    const handleRemoveCanvasBackground = () => {
        if (!canvasEditor) return;

        canvasEditor.backgroundColor = null;
        canvasEditor.backgroundImage = null;
        canvasEditor.requestRenderAll();
    };

    const handleTabChange = id => {
        setSelectedTab(prev => ({ ...prev, id }));
    };

    const TabSkeleton = () => (
        <div className="flex-1 p-4 space-y-3 animate-pulse">
            <div className="h-4 bg-zinc-800 rounded w-1/3" />
            <div className="h-20 bg-zinc-800 rounded" />
            <div className="h-20 bg-zinc-800 rounded" />
        </div>
    );

    const BackgroundUpdateRenderer = () => {
        if (!canvasEditor) return null;

        let Content = null;

        switch (selectedTab?.id) {
            case 'color':
                Content = <ColorBackgroundControl />;
                break;
            case 'background':
                Content = <ImageBackgroundControl />;
                break;
            case 'prompt':
                Content = <PromptBackgroundControl />;
                break;
            default:
                Content = null;
        }

        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedTab?.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="flex flex-col flex-1 min-h-0"
                >
                    <Suspense fallback={<TabSkeleton />}>{Content}</Suspense>
                </motion.div>
            </AnimatePresence>
        );
    };

    return (
        <div className="flex flex-col gap-y-2 relative h-full">
            {/* AI Background Removal Button - Outside of tabs */}
            <div className="flex flex-col pb-2 border-b border-white/10">
                <div className="mb-2 space-y-1">
                    <h3 className="text-sm font-medium text-white">AI Background Removal</h3>
                    <p className="text-xs text-white/70">Remove the background from your image using AI</p>
                </div>

                <Button onClick={handleBackgroundRemoval} disabled={processingMessage || !mainImage} className="w-full" variant="outline">
                    <Trash2 className=" mr-2" />
                    <span className="text-[0.85rem]">Remove Image Background</span>
                </Button>

                {!mainImage && <p className="text-xs text-amber-400">Please add an image to the canvas first to remove its background</p>}
            </div>

            <div className=" w-full ring-1 ring-white/10 rounded-md overflow-hidden flex items-center">
                {BG_TABS.map(({ id, name, icon }) => (
                    <button
                        key={id}
                        onClick={() => handleTabChange(id)}
                        className={cn(
                            'relative px-3 py-1 border-none outline-none text-slate-200 hover:text-slate-300 transition-colors ring-1 ring-transparent cursor-pointer flex-1 flex items-center justify-center',
                            selectedTab?.id === id && 'text-slate-300 ring-0'
                        )}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {selectedTab?.id === id && (
                            <motion.div
                                layoutId="pilltab1"
                                transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                                className="absolute inset-0 bg-linear-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80 z-0"
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {icon}
                            <span className="text-[0.8rem]">{name}</span>
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex flex-col flex-1 ring-1 ring-zinc-800 rounded-md overflow-hidden min-h-0">
                <BackgroundUpdateRenderer />
            </div>

            <Button onClick={handleRemoveCanvasBackground} disabled={processingMessage || !mainImage} className="w-full" variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Canvas Background
            </Button>
        </div>
    );
});
BackgroundControls.displayName = 'BackgroundControls';

export default BackgroundControls;
