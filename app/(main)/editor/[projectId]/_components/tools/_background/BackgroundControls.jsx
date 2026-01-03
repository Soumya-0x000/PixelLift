import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useBackgroundChange } from './useBackgroundChange';
import { Button } from '@/components/ui/button';
import { Loader2, Palette, Search, Trash2 } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';
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
import axios from 'axios';
import { toast } from 'sonner';
import LazyLoadImage from '@/components/LazyLoadImage';

const bgTabs = [
    { id: 'color', name: 'Color', icon: <Palette className="w-5 aspect-square" /> },
    { id: 'background', name: 'Background', icon: <ImageIcon className="w-5 aspect-square" /> },
];

const INITIAL_PAGE_INFO = {
    total: 0,
    total_pages: 0,
    per_page: 15,
    page: 1,
};

const BackgroundControls = memo(() => {
    const { UNSPLASH_ACCESS_KEY, UNSPLASH_URL, canvasEditor, handleBackgroundRemoval, processingMessage, mainImage } = useBackgroundChange();
    const [selectedTab, setSelectedTab] = useState(bgTabs[0]);
    const [canvasBgColor, setCanvasBgColor] = useState('#ffffff');
    const [imgSearchQuery, setImgSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [unsplashImages, setUnsplashImages] = useState([]);
    const [pageInfo, setPageInfo] = useState(INITIAL_PAGE_INFO);
    const [selectedImgId, setSelectedImgId] = useState(null);

    const loaderRef = useRef(null);

    const handleApplyBgColor = () => {
        if (!canvasEditor) return;
        canvasEditor.backgroundColor = canvasBgColor;
        canvasEditor.requestRenderAll();
    };

    const handleImgSearchQueryChange = e => {
        e.preventDefault();
        setImgSearchQuery(e.target.value);
    };

    const handleSearchKeyPress = e => {
        if (e.key === 'Enter') {
            handleSearchUnsplashImages();
        }
    };

    const handleSearchUnsplashImages = useCallback(
        async (pageNo = 1, shouldAppend = false) => {
            if (!imgSearchQuery || !UNSPLASH_ACCESS_KEY || !UNSPLASH_URL) return;

            try {
                setIsSearching(true);

                const URL = `${UNSPLASH_URL}/search/photos?query=${encodeURIComponent(imgSearchQuery)}&per_page=${pageInfo.per_page}&page=${pageNo}`;
                const response = await axios.get(URL, {
                    headers: {
                        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                    },
                });

                if (response.status === 200) {
                    const data = response.data;
                    setPageInfo(prev => ({
                        ...prev,
                        total: data?.total,
                        total_pages: data?.total_pages,
                        page: pageNo,
                    }));
                    setUnsplashImages(prev => (shouldAppend ? [...prev, ...data?.results] : data?.results));
                } else {
                    toast.error('Error fetching images');
                }
            } catch (error) {
                console.error('Error fetching images:', error);
                toast.error('Error fetching images');
            } finally {
                setIsSearching(false);
            }
        },
        [imgSearchQuery, pageInfo.per_page, pageInfo.page, isSearching]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const first = entries[0];
                console.log(first);
                if (first.isIntersecting) {
                    handleSearchUnsplashImages(pageInfo.page + 1, true);
                }
            },
            { threshold: 0.1 }
        );

        const imgLoader = loaderRef.current;
        console.log(imgLoader);
        if (imgLoader) observer.observe(imgLoader);

        return () => {
            if (imgLoader) observer.unobserve(imgLoader);
        };
    }, [loaderRef]);

    useEffect(() => {
        if (!imgSearchQuery.trim()) {
            setUnsplashImages([]);
            setPageInfo(INITIAL_PAGE_INFO);
        }
    }, [imgSearchQuery]);

    return (
        <div className="flex flex-col gap-y-2 relative h-full">
            {/* AI Background Removal Button - Outside of tabs */}
            <div className="flex flex-col pb-2 border-b border-white/10">
                <div className="mb-2 space-y-1">
                    <h3 className="text-sm font-medium text-white">AI Background Removal</h3>
                    <p className="text-xs text-white/70">Remove the background from your image using AI</p>
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

            <div className="flex flex-col flex-1 ring-1 ring-zinc-800 rounded-md overflow-auto">
                {selectedTab?.id === 'color' ? (
                    <motion.div layoutId="background-selector" className="p-2">
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
                                <Button variant="outline" size="sm" onClick={handleApplyBgColor}>
                                    Apply
                                </Button>
                                <span className="w-12 aspect-square rounded-[0.35rem]" style={{ backgroundColor: canvasBgColor }} />
                            </div>
                        </ColorPicker>
                    </motion.div>
                ) : selectedTab?.id === 'background' ? (
                    <motion.div layoutId="background-selector" className="p-2 flex flex-col flex-1 gap-y-2 relative">
                        <div className="flex gap-2 sticky top-0 left-0 z-10">
                            <Input
                                value={imgSearchQuery}
                                onChange={handleImgSearchQueryChange}
                                onKeyPress={handleSearchKeyPress}
                                placeholder="Search for images..."
                                className={'flex-1 bg-zinc-900 dark:bg-zinc-900'}
                            />

                            <Button
                                onClick={() => handleSearchUnsplashImages(1)}
                                disabled={isSearching}
                                variant="outline"
                                className={'flex items-center justify-center bg-zinc-900 dark:bg-zinc-900'}
                            >
                                <Search />
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 flex-1 overflow-auto ring-1 ring-zinc-800 rounded-lg">
                            <div className="columns-2 md:columns-3 gap-2 p-2 overflow-y-auto">
                                {unsplashImages?.map((image, idx) => (
                                    <motion.div
                                        key={`${image.id}-${idx}`}
                                        className="mb-2 break-inside-avoid rounded-sm overflow-hidden bg-zinc-800"
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <LazyLoadImage
                                            src={image.urls.small}
                                            alt={image.alt_description || 'Unsplash image'}
                                            loading="lazy"
                                            className="w-full h-auto object-cover block"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                            <div ref={loaderRef} className={`h-auto w-full flex ${isSearching ? 'flex-1' : 'hidden'} items-center justify-center col-span-full row-span-full`}>
                                {isSearching && <Loader2 className="animate-spin text-white/50" />}
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </div>
        </div>
    );
});
BackgroundControls.displayName = 'BackgroundControls';

export default BackgroundControls;
