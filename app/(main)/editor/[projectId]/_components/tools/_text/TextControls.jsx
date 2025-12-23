import useCanvasContext from '@/context/canvasContext/useCanvasContext';
import React from 'react';

const TextControls = () => {
    const { canvasEditor } = useCanvasContext();
    
    if (!canvasEditor) {
        return (
            <div className="p-4">
                <p className="text-white/70 text-sm">Canvas not ready</p>
            </div>
        );
    }
    return <div>TextControls</div>;
};

export default TextControls;
