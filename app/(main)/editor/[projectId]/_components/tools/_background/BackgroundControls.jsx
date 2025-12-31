import React, { memo, useEffect, useState } from 'react';
import { useBackgroundChange } from './useBackgroundChange';
import { Button } from '@/components/ui/button';
import { Image, Palette, Search, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    ColorPicker,
    ColorPickerAlpha,
    ColorPickerEyeDropper,
    ColorPickerFormat,
    ColorPickerHue,
    ColorPickerSelection,
} from '@/components/ui/shadcn-io/color-picker';
import { Input } from '@/components/ui/input';

const bgTabs = [
    { id: 'color', name: 'Color', icon: <Palette className="w-5 aspect-square" /> },
    { id: 'background', name: 'Background', icon: <Image className="w-5 aspect-square" /> },
];

const BackgroundControls = memo(() => {
    const { canvasEditor, handleBackgroundRemoval, processingMessage, mainImage } = useBackgroundChange();

    const [selectedTab, setSelectedTab] = useState(bgTabs[0]);
    const [canvasBgColor, setCanvasBgColor] = useState('#ffffff');
    const [imgSearchQuery, setImgSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [images, setImages] = useState(null);
    const [selectedImgId, setSelectedImgId] = useState(null);

    const handleApplyBgColor = () => {
        if (!canvasEditor) return;
        canvasEditor.backgroundColor = canvasBgColor;
        canvasEditor.requestRenderAll();
    };

    const handleImgSearchQueryChange = e => {
        e.preventDefault();
        setImgSearchQuery(e.target.value);
    };

    // Debounce the search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(imgSearchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [imgSearchQuery]);

    // Trigger search when debounced query changes
    useEffect(() => {
        if (debouncedQuery && debouncedQuery.trim()) {
            handleSearchUnsplashImages();
        }
    }, [debouncedQuery]);

    const handleSearchKeyPress = e => {
        if (e.key === 'Enter') {
            handleSearchUnsplashImages();
        }
    };

    const handleSearchUnsplashImages = async () => {
        if (!imgSearchQuery) return;

        try {
            setIsSearching(true);
            const response = await fetch(`${UNSPLASH_URL}/search/photos?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`);
            const data = await response.json();
            setImages(data.results);
        } catch (error) {
            console.error('Error fetching images:', error);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="flex flex-col gap-y-2 relative h-full">
            {/* AI Background Removal Button - Outside of tabs */}
            <div className="flex flex-col pb-2 border-b border-white/10">
                <div>
                    <h3 className="text-sm font-medium text-white mb-2">AI Background Removal</h3>
                    <p className="text-xs text-white/70 mb-4">Automatically remove the background from your image using AI</p>
                </div>

                <Button onClick={handleBackgroundRemoval} disabled={processingMessage || !mainImage} className="w-full" variant="outline">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Image Background
                </Button>

                {!mainImage && <p className="text-xs text-amber-400">Please add an image to the canvas first to remove its background</p>}
            </div>

            <div className=" w-full ring-1 ring-white/10 rounded-md overflow-hidden flex items-center">
                {bgTabs.map(({ id, name, icon }) => (
                    <button
                        key={id}
                        onClick={() => setSelectedTab(prev => ({ ...prev, id }))}
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
                            <span className="text-sm">{name}</span>
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex-1 ring-1 ring-zinc-800 rounded-md overflow-auto">
                {selectedTab?.id === 'color' ? (
                    <motion.div layoutId="background-selector">
                        <ColorPicker
                            className="max-w-sm rounded-md border bg-background p-4 shadow-sm"
                            defaultValue="#ffffff"
                            onChange={setCanvasBgColor}
                        >
                            <ColorPickerSelection />
                            <div className="flex items-center gap-4">
                                <ColorPickerEyeDropper />
                                <div className="grid w-full gap-1">
                                    <ColorPickerHue />
                                    <ColorPickerAlpha />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ColorPickerFormat readOnly={false} />
                                <Button variant="outline" onClick={handleApplyBgColor}>
                                    Apply
                                </Button>
                                <span className="w-16 aspect-square rounded-md" style={{ backgroundColor: canvasBgColor }} />
                            </div>
                        </ColorPicker>
                    </motion.div>
                ) : selectedTab?.id === 'background' ? (
                    <motion.div layoutId="background-selector" className="p-2 flex flex-col gap-y-2">
                        <div className="flex gap-2">
                            <Input
                                value={imgSearchQuery}
                                onChange={handleImgSearchQueryChange}
                                onKeyPress={handleSearchKeyPress}
                                placeholder="Search for images..."
                                className={'flex-1'}
                            />

                            <Button
                                onClick={handleSearchUnsplashImages}
                                disabled={isSearching}
                                variant="outline"
                                className={'flex items-center justify-center'}
                            >
                                <Search />
                            </Button>
                            </div>
                            
                            <div className=''></div>
                    </motion.div>
                ) : null}
            </div>
        </div>
    );
});
BackgroundControls.displayName = 'BackgroundControls';

export default BackgroundControls;
