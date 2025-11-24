import React from 'react';
import { useImageResize } from './useImageResize';
import useCanvasContext from '@/context/canvasContext/useCanvasContext';

const ResizeControls = () => {
    const { ASPECT_RATIOS,currentProject } = useImageResize();

    return (
        <div>
            <div>ResizeControls</div>
            <div>
                {ASPECT_RATIOS.map(ratio => (
                    <button key={ratio.name}>{ratio.label}</button>
                ))}
            </div>
        </div>
    );
};

export default ResizeControls;
