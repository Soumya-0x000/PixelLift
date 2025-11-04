import { createContext, useState } from 'react';

const CanvasContext = createContext(undefined);
export default CanvasContext;

export const CanvasProvider = ({ children }) => {
    const [canvasEditor, setCanvasEditor] = useState(null);
    const [processingMessage, setProcessingMessage] = useState('');
    const [activeTool, setActiveTool] = useState('resize');

    const contextData = {
        canvasEditor,
        setCanvasEditor,
        processingMessage,
        setProcessingMessage,
        activeTool,
        onToolChange: setActiveTool,
    };

    return <CanvasContext.Provider value={contextData}>{children}</CanvasContext.Provider>;
};
