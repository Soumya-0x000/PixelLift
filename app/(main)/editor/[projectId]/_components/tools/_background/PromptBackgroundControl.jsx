import { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brush, RefreshCcw, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Input } from '@/components/ui/input';
import { useBackgroundChange } from './useBackgroundChange';
import { FabricImage } from 'fabric';
import axios from 'axios';

const MotionInput = motion(Input);
const MotionButton = motion(Button);

const PromptBackgroundControl = memo(() => {
    const { HF_MODEL_ID, HF_API_URL, currentProject } = useBackgroundChange();

    const [isPromptOpen, setIsPromptOpen] = useState(false);
    const [prompt, setPrompt] = useState('');

    // Utility for waiting
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    // Standard Fetch with Recursive Retry logic
    async function fetchWithRetry(url, options, retries = 5, delay = 2000) {
        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_HF_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({ inputs: prompt }),
            });

            // 503 = Model is still loading; 429 = Rate limited
            if ((response.status === 503 || response.status === 429) && retries > 0) {
                console.warn(`Server busy (${response.status}). Retrying in ${delay}ms...`);
                await sleep(delay);
                // Double the wait time for next attempt
                return fetchWithRetry(url, options, retries - 1, delay * 2);
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: 'Unknown Error' }));
                throw new Error(error.error || `HTTP ${response.status}`);
            }

            return response;
        } catch (error) {
            if (retries > 0) {
                await sleep(delay);
                return fetchWithRetry(url, options, retries - 1, delay * 2);
            }
            throw error;
        }
    }

    const handleGenerateBackground = async () => {
        if (!prompt) return;

        const API_URL = `${HF_API_URL}/${HF_MODEL_ID}`;

        try {
            setProcessing(true);
            setProcessingMessage('Preparing your background...');

            const response = await fetchWithRetry(API_URL);

            const blob = await response.blob();
            const aiImageUrl = URL.createObjectURL(blob);

            // Rest of your existing Fabric.js logic to set background...
            const fabricImage = await FabricImage.fromURL(aiImageUrl, { crossOrigin: 'anonymous' });

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

            canvasEditor.backgroundImage = fabricImage;
            canvasEditor.requestRenderAll();
            toast.success('Background applied!');
        } catch (error) {
            console.error('Background Error:', error);
            toast.error(`Background failed: ${error.message}`);
        } finally {
            setProcessing(false);
            setProcessingMessage(null);
        }
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
