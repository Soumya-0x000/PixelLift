import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import {
    ColorPicker,
    ColorPickerAlpha,
    ColorPickerEyeDropper,
    ColorPickerFormat,
    ColorPickerHue,
    ColorPickerSelection,
} from '@/components/ui/shadcn-io/color-picker';
import { useBackgroundChange } from './useBackgroundChange';

const ColorBackgroundControl = memo(() => {
    const { canvasEditor, processingMessage } = useBackgroundChange();
    const [canvasBgColor, setCanvasBgColor] = useState('#ffffff');

    const handleApplyBgColor = () => {
        if (!canvasEditor) return;
        canvasEditor.backgroundColor = canvasBgColor;
        canvasEditor.requestRenderAll();
    };

    return (
        <motion.div layoutId="background-selector" className="p-2">
            <ColorPicker className="max-w-sm rounded-md border bg-background p-4 shadow-sm" defaultValue="#ffffff" onChange={setCanvasBgColor}>
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
                    <Button variant="outline" size="sm" onClick={handleApplyBgColor} disabled={processingMessage}>
                        Apply
                    </Button>
                    <span className="w-12 aspect-square rounded-[0.35rem]" style={{ backgroundColor: canvasBgColor }} />
                </div>
            </ColorPicker>
        </motion.div>
    );
});

ColorBackgroundControl.displayName = 'ColorBackgroundControl';

export default ColorBackgroundControl;
