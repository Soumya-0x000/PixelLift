import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useBackgroundChange } from './useBackgroundChange';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Maximize2, Palette, Search, SearchIcon, Trash2, X } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { FabricImage } from 'fabric';

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
    const {
        UNSPLASH_ACCESS_KEY,
        UNSPLASH_URL,
        canvasEditor,
        handleBackgroundRemoval,
        processingMessage,
        mainImage,
        currentProject,
        setProcessing,
        setProcessingMessage,
    } = useBackgroundChange();

    const [selectedTab, setSelectedTab] = useState(bgTabs[0]);
    const [canvasBgColor, setCanvasBgColor] = useState('#ffffff');
    const [imgSearchQuery, setImgSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [unsplashImages, setUnsplashImages] = useState(null);
    const [pageInfo, setPageInfo] = useState(INITIAL_PAGE_INFO);
    const [maximizedImg, setMaximizedImg] = useState({
        url: null,
        layoutId: null,
    });
    const [selectedImgId, setSelectedImgId] = useState(null);

    const loaderRef = useRef(null);
    const scrollContainerRef = useRef(null);

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
        [imgSearchQuery, pageInfo.per_page, UNSPLASH_ACCESS_KEY, UNSPLASH_URL]
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                const first = entries[0];
                if (first.isIntersecting && !isSearching && pageInfo.page < pageInfo.total_pages) {
                    handleSearchUnsplashImages(pageInfo.page + 1, true);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px 50px 0px' }
        );

        const imgLoader = loaderRef.current;
        if (imgLoader) observer.observe(imgLoader);

        return () => {
            if (imgLoader) observer.unobserve(imgLoader);
        };
    }, [handleSearchUnsplashImages, pageInfo.page, pageInfo.total_pages, isSearching]);

    useEffect(() => {
        if (!imgSearchQuery.trim()) {
            setUnsplashImages(null);
            setPageInfo(INITIAL_PAGE_INFO);
        }
    }, [imgSearchQuery]);

    const handleImageClick = async e => {
        if (!canvasEditor) return;

        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;

        const imageCard = e.target.closest('[data-img-id]');
        if (!imageCard) return;

        const { imgId, url } = imageCard.dataset;
        const action = actionBtn.dataset.action;

        setSelectedImgId(imgId);

        if (action === 'maximize') {
            setMaximizedImg(prev => ({ ...prev, url, layoutId: `card-${imgId}` }));
            return;
        }

        try {
            setProcessing(true);
            setProcessingMessage('Downloading image...');
            const response = await axios.get(`${UNSPLASH_URL}/photos/${imgId}/download`, {
                headers: {
                    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                },
            });

            const data = response.data;

            if (action === 'select') {
                setProcessingMessage('Applying image...');

                const fabricImage = await FabricImage.fromURL(data.url, {
                    crossOrigin: 'anonymous',
                });

                // USE PROJECT DIMENSIONS instead of canvas dimensions for proper scaling
                const { width: canvasWidth, height: canvasHeight } = currentProject;

                // Calculate scales
                const scaleX = canvasWidth / fabricImage.width;
                const scaleY = canvasHeight / fabricImage.height;

                // Use Math.max to FILL the entire canvas (ensures no empty space)
                const scale = Math.max(scaleX, scaleY);

                fabricImage.set({
                    scaleX: scale,
                    scaleY: scale,
                    originX: 'center',
                    originY: 'center',
                    left: canvasWidth / 2,
                    top: canvasHeight / 2,
                });

                // Set background and render
                canvasEditor.backgroundImage = fabricImage;
                canvasEditor.requestRenderAll();
                setSelectedImgId(null);
            }

            if (action === 'download') {
                // Fetch the image as a blob to bypass CORS restrictions
                const blob = await fetch(data.url).then(res => res.blob());
                const blobUrl = URL.createObjectURL(blob);

                const filename = `${imgSearchQuery}-${imgId}.jpg`;
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                // Clean up the blob URL
                URL.revokeObjectURL(blobUrl);
                setSelectedImgId(null);
            }
        } catch (error) {
            console.error('Error fetching image:', error);
            toast.error('Error fetching image');
        } finally {
            setProcessing(false);
            setProcessingMessage(null);
        }
    };

    const handleRemoveCanvasBackground = () => {
        if (!canvasEditor) return;

        canvasEditor.backgroundColor = null;
        canvasEditor.backgroundImage = null;
        canvasEditor.requestRenderAll();
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

            <div className="flex flex-col flex-1 ring-1 ring-zinc-800 rounded-md overflow-hidden">
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
                    <motion.div
                        ref={scrollContainerRef}
                        layoutId="background-selector"
                        className="flex flex-col flex-1 gap-y-2 relative overflow-y-auto overflow-x-hidden h-full"
                    >
                        {/* 1. Sticky Header */}
                        <div className="flex gap-2 z-10 sticky top-0 left-0 p-2 bg-[#0b0b0b]">
                            <Input
                                value={imgSearchQuery}
                                onChange={handleImgSearchQueryChange}
                                onKeyPress={handleSearchKeyPress}
                                placeholder="Search for images..."
                                className={'flex-1'}
                                autoFocus
                            />

                            <Button
                                onClick={() => handleSearchUnsplashImages(1)}
                                disabled={isSearching}
                                variant="outline"
                                className={'flex items-center justify-center'}
                            >
                                <Search />
                            </Button>
                        </div>

                        {/* 2. Content Container */}
                        <div className="flex-1 p-2">
                            {unsplashImages?.length > 0 ? (
                                <div className="columns-2 gap-2" onClick={handleImageClick}>
                                    {unsplashImages?.map((image, idx) => (
                                        <motion.div
                                            key={`${image.id}-${idx}`}
                                            layoutId={`card-${image.id}`}
                                            data-img-id={image.id}
                                            data-url={image.urls.full}
                                            className="mb-2 break-inside-avoid rounded-sm overflow-hidden bg-[#0b0b0b] relative"
                                        >
                                            <LazyLoadImage
                                                src={image.urls.small}
                                                alt={image.alt_description || 'Unsplash image'}
                                                loading="lazy"
                                                className="w-full h-auto object-cover block"
                                            />
                                            <div className="absolute bottom-0 left-0 w-full p-1 line-clamp-2 text-xs bg-black/50 flex items-center justify-start text-white">
                                                <p>{image.user.name}</p>
                                            </div>

                                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-2 opacity-0 backdrop-blur-[1px] hover:opacity-100 transition-opacity">
                                                <Button data-action="select" variant="outline" className="text-white mb-1">
                                                    Select
                                                </Button>

                                                <div className="flex gap-2">
                                                    <Button data-action="maximize" variant="outline" className="text-white h-8 w-8">
                                                        <Maximize2 size={16} />
                                                    </Button>
                                                    <Button data-action="download" variant="outline" className="text-white h-8 w-8">
                                                        <Download size={16} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : imgSearchQuery && unsplashImages !== null ? (
                                <div className="text-center text-white/50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center flex-col w-full">
                                    <p>No images found for ""{imgSearchQuery}""</p>
                                    <p>Try a different search term</p>
                                </div>
                            ) : (
                                !isSearching && (
                                    <div className="text-center text-white/50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center flex-col w-full">
                                        <SearchIcon className="w-12 h-12" />
                                        <p className="mt-3">Search for background Images</p>
                                        <p className="text-xs mt-1 font-thin">Powered by Unsplash</p>
                                    </div>
                                )
                            )}

                            {/* 3. The Sentinel - Place it outside the 'columns' div */}
                            <div ref={loaderRef} className="h-24 w-full flex items-center justify-center">
                                {isSearching && (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="animate-spin text-white/50" />
                                        <span className="text-[10px] text-white/30 uppercase tracking-widest">Loading</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </div>

            <Button onClick={handleRemoveCanvasBackground} disabled={processingMessage || !mainImage} className="w-full" variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Canvas Background
            </Button>

            {/* Animated Modal with layoutId */}
            <AnimatePresence>
                {maximizedImg?.layoutId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* 1. Dark Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            layoutId={maximizedImg.layoutId}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                            onClick={() => setMaximizedImg(null)}
                        />

                        {/* 2. The Morphing Card */}
                        <motion.div
                            layoutId={maximizedImg.layoutId} // Matches the ID in the grid
                            className="relative max-w-[60vw] max-h-[60vh] bg-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl z-10"
                        >
                            <motion.div layoutId={maximizedImg.layoutId}>
                                <LazyLoadImage src={maximizedImg.url} alt="Maximized" className="w-full h-full object-contain" />
                            </motion.div>

                            {/* 3. Modal Content (Fades in after expansion) */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 text-white">
                                <h3 className="text-lg font-bold">Image Details</h3>
                                <p className="text-neutral-400">Captured by the Unsplash community.</p>
                            </motion.div>

                            <button onClick={() => setMaximizedImg(null)} className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white">
                                <X size={20} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
});
BackgroundControls.displayName = 'BackgroundControls';

export default BackgroundControls;
