import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Maximize2, Search, SearchIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '@/components/ui/input';
import LazyLoadImage from '@/components/LazyLoadImage';
import { useUnsplashImages } from './useUnsplashImages';
import ImageMaximizeModal from './ImageMaximizeModal';

const ImageBackgroundControl = memo(() => {
    const {
        imgSearchQuery,
        handleImgSearchQueryChange,
        isSearching,
        unsplashImages,
        maximizedImg,
        setMaximizedImg,
        loaderRef,
        scrollContainerRef,
        handleSearchUnsplashImages,
        handleImageClick,
    } = useUnsplashImages();

    const handleSearchKeyPress = e => {
        if (e.key === 'Enter') {
            handleSearchUnsplashImages();
        }
    };

    return (
        <>
            <motion.div
                ref={scrollContainerRef}
                layoutId="background-selector"
                className="flex flex-col flex-1 gap-y-0 relative overflow-y-auto overflow-x-hidden h-full"
            >
                {/* 1. Sticky Header */}
                <div className="flex gap-2 z-10 sticky top-0 left-0 p-2 bg-[#0b0b0b]">
                    <Input
                        value={imgSearchQuery}
                        onChange={handleImgSearchQueryChange}
                        onKeyPress={handleSearchKeyPress}
                        placeholder="Search for images..."
                        className={'flex-1 h-8 rounded-sm'}
                        autoFocus
                    />

                    <Button
                        onClick={() => handleSearchUnsplashImages(1)}
                        disabled={isSearching}
                        variant="outline"
                        className={'flex items-center justify-center h-full'}
                    >
                        <Search />
                    </Button>
                </div>

                {/* 2. Content Container */}
                <div className="flex-1 p-2 ring">
                    {unsplashImages?.length > 0 ? (
                        <div className="columns-2 gap-2" onClick={handleImageClick}>
                            {unsplashImages?.map((image, idx) => (
                                <motion.div
                                    key={`${image.id}-${idx}`}
                                    layoutId={`card-${image.id}`}
                                    data-img-id={image.id}
                                    data-url={image.urls.full}
                                    data-user={image.user.name}
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
                            <p>No images found for "{imgSearchQuery}"</p>
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
                                <span className="text-[10px] text-white/30 uppercase tracking-widest">Loading...</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Animated Modal */}
            <ImageMaximizeModal maximizedImg={maximizedImg} onClose={() => setMaximizedImg({ url: null, layoutId: null, clickedBy: null })} />
        </>
    );
});

ImageBackgroundControl.displayName = 'ImageBackgroundControl';

export default ImageBackgroundControl;
