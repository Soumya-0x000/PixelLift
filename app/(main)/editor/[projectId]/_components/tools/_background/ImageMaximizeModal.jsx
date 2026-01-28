import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import LazyLoadImage from '@/components/LazyLoadImage';

const ImageMaximizeModal = ({ maximizedImg, onClose }) => {
    if (!maximizedImg?.layoutId) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Dark Overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    onClick={onClose}
                />

                {/* The Morphing Card */}
                <motion.div
                    layoutId={maximizedImg.layoutId}
                    className="relative max-w-[80vw] max-h-[80vh] bg-[#1a1a1a] rounded-xl overflow-hidden shadow-2xl z-10"
                >
                    <LazyLoadImage src={maximizedImg.url} alt="Maximized" className="w-full h-full object-cover" />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-0 left-0 right-0 p-6 text-white bg-linear-to-t from-black/80 to-transparent"
                    >
                        <h3 className="text-lg font-bold">Image Details</h3>
                        <p className="text-neutral-400">Captured by {maximizedImg.clickedBy ? `${maximizedImg.clickedBy}` : 'Unsplash community'}</p>
                    </motion.div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ImageMaximizeModal;
