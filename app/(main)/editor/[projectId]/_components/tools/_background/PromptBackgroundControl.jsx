import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brush, RefreshCcw, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Input } from '@/components/ui/input';

const MotionInput = motion(Input);
const MotionButton = motion(Button);

const PromptBackgroundControl = memo(() => {
    const [isPromptOpen, setIsPromptOpen] = useState(true);
    const [prompt, setPrompt] = useState('');

    const handleGenerateBackground = () => {
        // TODO: Implement AI background generation
        console.log('Generating background with prompt:', prompt);
    };

    return (
        <motion.div layoutId="background-selector" className="flex flex-col flex-1 gap-y-2 relative overflow-y-auto overflow-x-hidden h-full p-3">
            <div className="flex items-start flex-col gap-3 flex-1">
                <motion.p className="text-[0.8rem] text-zinc-400">
                    Can't find the right image?
                    <br />
                    Type your idea and generate it instead.
                </motion.p>

                {/* INPUT STATE / BUTTON STATE */}
                <AnimatePresence mode="wait">
                    {isPromptOpen ? (
                        <motion.div
                            key="prompt"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col flex-1 gap-3 w-full"
                        >
                            <MotionInput
                                layoutId="background-creating-prompt"
                                type="textarea"
                                placeholder="Describe your background..."
                                rows={10}
                                className="flex-1"
                                onChange={e => setPrompt(e.target.value)}
                                value={prompt}
                                transition={{ layout: { duration: 0.2 } }}
                            />

                            <div className="flex items-center justify-start gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsPromptOpen(false)}
                                    className=" group relative overflow-hidden w-10 hover:w-22 transition-[width] duration-300 ease-out"
                                >
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 -translate-x-16 group-hover:translate-x-0 transition-transform duration-300 ease-out whitespace-nowrap">
                                        Retry
                                    </span>

                                    <RefreshCcw className="mx-auto group-hover:ml-auto group-hover:mr-0" />
                                </Button>

                                <MotionButton
                                    variant="outline"
                                    onClick={handleGenerateBackground}
                                    className=" group relative overflow-hidden w-10 hover:w-30 transition-[width] duration-300 ease-outh hover:justify-end"
                                >
                                    <motion.span
                                        animate={{ color: ['#00ffff', '#0080ff', '#8000ff', '#ff0080', '#00ffff'] }}
                                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                                    >
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 -translate-x-25 group-hover:translate-x-0 transition-transform duration-300 ease-out whitespace-nowrap">
                                            Generate
                                        </span>

                                        <Sparkles className="ml-auto w-fit " />
                                    </motion.span>
                                </MotionButton>

                                <Button variant="outline" onClick={() => setIsPromptOpen(false)} className="ml-auto">
                                    Cancel
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="m-auto"
                        >
                            <MotionButton
                                layoutId="background-creating-prompt"
                                variant="outline"
                                onClick={() => setIsPromptOpen(true)}
                                disableActiveScale
                                layout
                                transition={{ layout: { duration: 0.05 } }}
                            >
                                <motion.span
                                    className="flex items-center gap-3"
                                    animate={{ color: ['#00ffff', '#0080ff', '#8000ff', '#ff0080', '#00ffff'] }}
                                    transition={{ duration: 6, repeat: Infinity }}
                                >
                                    <span>Your Imagination</span>
                                    |
                                    <Brush />
                                </motion.span>
                            </MotionButton>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
});

PromptBackgroundControl.displayName = 'PromptBackgroundControl';

export default PromptBackgroundControl;
