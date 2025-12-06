import React from 'react';
import { useImageCrop } from './useImageCrop';

const CropContent = () => {
    const { ASPECT_RATIOS } = useImageCrop();
    
    return <div>CropContent</div>;
};

export default CropContent;
