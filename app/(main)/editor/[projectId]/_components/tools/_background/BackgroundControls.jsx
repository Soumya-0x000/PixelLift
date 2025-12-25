import React, { memo, useMemo } from 'react';
import { useBackgroundChange } from './useBackgroundChnage';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const BackgroundControls = memo(() => {
    const { handleBackgroundRemoval, processingMessage, getMainImage } = useBackgroundChange();

    const mainImage = useMemo(() => getMainImage(), [getMainImage]);

    return (
        <div className="space-y-6 relative h-full">
            {/* AI Background Removal Button - Outside of tabs */}
            <div className="space-y-4 pb-4 border-b border-white/10">
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
        </div>
    );
});
BackgroundControls.displayName = 'BackgroundControls';

export default BackgroundControls;
