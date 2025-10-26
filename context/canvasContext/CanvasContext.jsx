import { createContext } from 'react';

const CanvasContext = createContext(undefined);
export default CanvasContext;

export const CanvasProvider = ({ children }) => {
    const contextData = {};

    return <CanvasContext.Provider value={contextData}>{children}</CanvasContext.Provider>;
};
