import { useContext } from "react";
import CanvasContext from "./CanvasContext";

const useCanvasContext = () => {
    const canvasContext = useContext(CanvasContext);

    if (canvasContext === undefined) {
        throw new Error("useCanvasContext must be used inside a CanvasProvider.");
    }

    return canvasContext;
};
export default useCanvasContext;
