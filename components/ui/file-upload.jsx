import { cn } from '@/lib/utils';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { IconUpload } from '@tabler/icons-react';
import { useDropzone } from 'react-dropzone';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from './input';

const mainVariant = {
    initial: {
        x: 0,
        y: 0,
    },
    animate: {
        x: 20,
        y: -20,
        opacity: 0.9,
    },
};

const secondaryVariant = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
    },
};

export const FileUpload = ({
    className,
    onChange = () => {},
    allowedFormats = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'],
    maxFiles = 1,
    maxFileSize = 5 * 1024 * 1024, // 5MB default
    setSelectedFile = () => {},
    setPreviewUrl = () => {},
}) => {
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = newFiles => {
        // Filter files based on maxFileSize
        const validFiles = newFiles.filter(file => file.size <= maxFileSize);

        // Notify user about rejected files
        const rejectedFiles = newFiles.filter(file => file.size > maxFileSize);
        if (rejectedFiles.length > 0) {
            toast.error(
                `Some files exceed the maximum size of ${(maxFileSize / (1024 * 1024)).toFixed(2)} MB and were not added.`
            );
        }

        // Update state with valid files
        setFiles(prevFiles => [...prevFiles, ...validFiles].slice(0, maxFiles));
        onChange && onChange(validFiles);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const { getRootProps, isDragActive } = useDropzone({
        multiple: false,
        noClick: true,
        onDrop: handleFileChange,
        onDropRejected: error => {
            console.log(error);
        },
    });

    useEffect(() => {
        if (files.length > maxFiles) {
            setFiles(prevFiles => prevFiles.slice(0, maxFiles));
        }

        if (files.length > 0) {
            setSelectedFile?.(files[0]);
            setPreviewUrl?.(URL.createObjectURL(files[0]));
        } else if (files.length <= 0) {
            setSelectedFile?.(null);
            setPreviewUrl?.(null);
        }
    }, [files, maxFiles]);

    const handleFileClick = (e, file) => {
        e.stopPropagation();

        setSelectedFile?.(file);
        setPreviewUrl?.(URL.createObjectURL(file));
    }

    return (
        <div className={cn('w-full', className)} {...getRootProps()}>
            <motion.div
                onClick={handleClick}
                whileHover="animate"
                className={` pt-5 group/file block rounded-lg ${files.length >= maxFiles ? ' cursor-auto' : 'cursor-pointer'} w-full h-full relative overflow-hidden`}
            >
                <Input
                    ref={fileInputRef}
                    id="file-upload-handle"
                    type="file"
                    accept={allowedFormats?.join(',') || '*/*'}
                    onChange={e => handleFileChange(Array.from(e.target.files || []))}
                    className="hidden"
                    disabled={files.length >= maxFiles}
                    multiple={maxFiles > 1}
                    max={maxFiles}
                />
                <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
                    <GridPattern />
                </div>
                <div className="flex flex-col items-center justify-start h-full">
                    <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
                        Upload file
                    </p>
                    <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
                        Drag or drop your files here or click to upload
                    </p>

                    <span className=" text-sm text-neutral-400 dark:text-neutral-400 mt-1">
                        Supports PNG, JPG, JPEG, WEBP (up to {maxFileSize / (1024 * 1024)} MB)
                    </span>

                    <div
                        className={`relative w-full h-[65%] max-w-xl mx-auto ${files?.length > 0 ? 'mt-5' : 'mt-10'} `}
                    >
                        <div
                            className={`space-y-3 max-h-full overflow-y-auto overflow-x-hidden px-6 ${files.length > 0 ? 'pt-3' : ''}`}
                        >
                            {files.length > 0 &&
                                files.map((file, idx) => (
                                    <motion.div
                                        key={'file' + idx}
                                        layoutId={idx === 0 ? 'file-upload' : 'file-upload-' + idx}
                                        className={cn(
                                            'relative z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start py-2 px-3 w-full h-fit mx-auto rounded-md',
                                            'shadow-sm cursor-pointer'
                                        )}
                                        onClick={e => handleFileClick(e, file)}
                                    >
                                        <div className="flex justify-between w-full items-center gap-4">
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                layout
                                                className="text-[0.77rem] text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                                            >
                                                {file.name}
                                            </motion.p>
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                layout
                                                className="rounded-lg px-2 py-1 w-fit shrink-0 text-[0.65rem] text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                                            >
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </motion.p>
                                        </div>

                                        <div className="flex md:flex-row flex-col items-start md:items-center w-full mt-1 justify-between text-neutral-600 dark:text-neutral-400">
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                layout
                                                className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-[0.72rem]"
                                            >
                                                {file.type}
                                            </motion.p>

                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                layout
                                                className="text-xs"
                                            >
                                                modified{' '}
                                                {new Date(file.lastModified).toLocaleDateString()}
                                            </motion.p>
                                        </div>

                                        <div className=" w-full h-full overflow-hidden absolute top-0 left-0 rounded-md pointer-events-none">
                                            <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full opacity-80 blur-3xl animate-blob animation-delay-2000" />
                                            <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-gradient-to-tr from-pink-400 to-yellow-500 rounded-full opacity-30 blur-3xl animate-blob animation-delay-4000" />
                                        </div>

                                        <div
                                            className="absolute -top-2 -right-2 cursor-pointer bg-[#7f0b10] text-white rounded-full p-1 transition duration-300 w-5 h-5 flex items-center justify-center"
                                            onClick={e => {
                                                e.stopPropagation();
                                                setFiles(prevFiles =>
                                                    prevFiles.filter((_, i) => i !== idx)
                                                );
                                            }}
                                        >
                                            <X />
                                        </div>
                                    </motion.div>
                                ))}
                        </div>
                        {!files.length && (
                            <motion.div
                                layoutId="file-upload"
                                variants={mainVariant}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 20,
                                }}
                                className={cn(
                                    'relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md',
                                    'shadow-[0px_10px_50px_rgba(0,0,0,0.1)]'
                                )}
                            >
                                {isDragActive ? (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-neutral-600 flex flex-col items-center"
                                    >
                                        Drop it
                                        <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                                    </motion.p>
                                ) : (
                                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                                )}
                            </motion.div>
                        )}

                        {!files.length && (
                            <motion.div
                                variants={secondaryVariant}
                                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
                            ></motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export function GridPattern() {
    const columns = 41;
    const rows = 11;
    return (
        <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
            {Array.from({ length: rows }).map((_, row) =>
                Array.from({ length: columns }).map((_, col) => {
                    const index = row * columns + col;
                    return (
                        <div
                            key={`${col}-${row}`}
                            className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                                index % 2 === 0
                                    ? 'bg-gray-50 dark:bg-neutral-950'
                                    : 'bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]'
                            }`}
                        />
                    );
                })
            )}
        </div>
    );
}
