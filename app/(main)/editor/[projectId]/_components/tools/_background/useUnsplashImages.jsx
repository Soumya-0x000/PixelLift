import { useCallback, useEffect, useRef, useState } from 'react';
import { useBackgroundChange } from './useBackgroundChange';
import axios from 'axios';
import { toast } from 'sonner';
import { FabricImage } from 'fabric';

const INITIAL_PAGE_INFO = {
    total: 0,
    total_pages: 0,
    per_page: 15,
    page: 1,
};

export const useUnsplashImages = () => {
    const { canvasEditor, currentProject, setProcessing, setProcessingMessage, UNSPLASH_ACCESS_KEY, UNSPLASH_URL } = useBackgroundChange();

    const [imgSearchQuery, setImgSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [unsplashImages, setUnsplashImages] = useState(null);
    const [pageInfo, setPageInfo] = useState(INITIAL_PAGE_INFO);
    const [maximizedImg, setMaximizedImg] = useState({
        url: null,
        layoutId: null,
        clickedBy: null,
    });
    const [selectedImgId, setSelectedImgId] = useState(null);

    const loaderRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Complex API logic: Search Unsplash images with pagination
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

    // Complex logic: IntersectionObserver for infinite scroll
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

    // Reset logic when search query changes
    useEffect(() => {
        if (!imgSearchQuery.trim()) {
            setUnsplashImages(null);
            setPageInfo(INITIAL_PAGE_INFO);
        }
    }, [imgSearchQuery]);

    // Complex logic: Handle image actions (select, download, maximize)
    const handleImageClick = async e => {
        if (!canvasEditor) return;

        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;

        const imageCard = e.target.closest('[data-img-id]');
        if (!imageCard) return;

        const { imgId, url, user: clickedBy } = imageCard.dataset;
        const action = actionBtn.dataset.action;

        setSelectedImgId(imgId);

        if (action === 'maximize') {
            setMaximizedImg(prev => ({ ...prev, url, layoutId: `card-${imgId}`, clickedBy }));
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

                const fabricImage = await FabricImage.fromURL(data.url, { crossOrigin: 'anonymous' });

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

    return {
        imgSearchQuery,
        setImgSearchQuery,
        isSearching,
        unsplashImages,
        pageInfo,
        maximizedImg,
        setMaximizedImg,
        selectedImgId,
        loaderRef,
        scrollContainerRef,
        handleSearchUnsplashImages,
        handleImageClick,
    };
};
