'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { api } from '@/convex/_generated/api';
import { useConvexMutation, useConvexQuery } from '@/hooks/useConvexQuery';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import useStoreUser from '@/hooks/useStoreUser';
import { formatNumberPrefix } from '@/utils/formatNumberPrefix';
import { BadgeInfo, Crown, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import DraggableImage from '../../../../components/draggableImage';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import useAPIContext from '@/context/APIcontext/useApiContext';

const allowedImageFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const projectInfoInputs = {
    title: {
        name: 'title',
        label: 'Project Title',
        type: 'text',
        placeholder: 'Project Title',
        value: '',
    },
    description: {
        name: 'description',
        label: 'Project Description',
        type: 'text',
        placeholder: 'Project Description',
        value: '',
    },
};

const NewProjectModal = ({ isOpen, onClose }) => {
    const { isApprenticeUser, isMasterUser, isDeityUser, planWiseLimit, checkLimit } =
        usePlanAccess();
    const { data: projectData, loading } = useConvexQuery(api.projects.getUserProjects);
    const { user } = useStoreUser();
    const { mutate: createProject } = useConvexMutation(api.projects.create);
    const router = useRouter();

    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [openPlanUpgradeModal, setOpenPlanUpgradeModal] = useState(false);
    const { post } = useAPIContext();
    const [projectInfo, setProjectInfo] = useState(projectInfoInputs);

    const currentProjectCount = projectData?.length || 0;
    const canCreateProject = useMemo(() => {
        return checkLimit(currentProjectCount, 'projects');
    }, [currentProjectCount, checkLimit]);

    const planWiseAlert = useCallback(() => {
        if (isApprenticeUser) {
            const limit = planWiseLimit?.projects ?? 0;
            const remaining = limit - currentProjectCount;

            if (remaining === 0) {
                return {
                    text: `You have reached the limit of ${limit} projects. Upgrade to create more.`,
                    variant: 'destructive', // red
                };
            }

            if (remaining === 1) {
                return {
                    text: `You can create only 1 more project. Creating this will reach your limit. Upgrade to create more.`,
                    variant: 'warning', // yellow
                };
            }

            return {
                text: `You can create ${remaining} more projects.`,
                variant: 'success', // green
            };
        }

        if (isMasterUser || isDeityUser) {
            return {
                text: 'You can create unlimited projects.',
                variant: 'success', // green
            };
        }

        return { text: '', variant: 'default' };
    }, [isApprenticeUser, isMasterUser, isDeityUser, planWiseLimit, currentProjectCount]);
    const planWiseAlertText = () => planWiseAlert().text;
    const planWiseAlertVariant = () => planWiseAlert().variant;

    const handleProjectCreate = async () => {
        if (!canCreateProject) {
            setOpenPlanUpgradeModal(true);
            return;
        }

        if (!selectedFile) {
            setProjectInfo(prev => ({
                ...prev,
                error: 'Project title is required',
            }));
            toast.error('Please select an image.');
            return;
        }

        if (!projectInfo?.title?.value?.trim()) {
            setProjectInfo({
                ...projectInfo,
                error: 'Project title is required',
            });
            toast.error('Project title is required');
            return;
        }

        try {
            setIsUploading(true);

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('fileName', selectedFile?.name);

            const { data: { success = false, ...response } = {}, status = 0 } = await post(
                '/imagekit/upload',
                formData
            );

            if (!success || status !== 200) {
                throw new Error(response?.error || 'Image upload failed');
            }

            const formattedInfo = Object.entries(projectInfo)?.reduce((acc, [key, val]) => {
                acc[key] = val?.value;
                return acc;
            }, {});

            const projectDetails = {
                ...formattedInfo,
                originalImageUrl: response?.url || '',
                currentImageUrl: response?.url || '',
                thumbnailUrl: response?.thumbnailUrl || '',
                width: response?.width || 800,
                height: response?.height || 600,
                imgKitFileId: response?.fileId || '',
                size: response?.size || 0,
                canvasState: null,
            };

            if (success && status === 200) {
                const projectId = await createProject(projectDetails);

                router.push(`/editor/${projectId}`);
                toast.success('Project created successfully');
            }
        } catch (error) {
            toast.info(error?.message || 'Error creating project');
        } finally {
            setIsUploading(false);
        }
    };

    const upgradePlan = () => {
        router.push('/?scrollto=pricing');
        setOpenPlanUpgradeModal(false);
    };

    const handleDialogCLose = () => {
        if (isUploading) return;
        setIsUploading(false);
        setProjectInfo(projectInfoInputs);
        setSelectedFile(null);
        setPreviewUrl(null);
        onClose();
    };

    const handleProjectInfoChange = e => {
        const { name, value } = e.target;
        setProjectInfo(prev => ({ ...prev, [name]: { ...prev[name], value } }));
    };

    return (
        <>
            {/* project create modal */}
            <Dialog open={isOpen} onOpenChange={handleDialogCLose} className=" backdrop-blur-xs">
                <DialogContent className={` w-fit sm:max-w-[70vw] h-fit max-h-[90vh]`}>
                    <DialogHeader>
                        <DialogTitle>Create your first project</DialogTitle>

                        <div className="flex gap-2 flex-wrap mt-2">
                            <Badge
                                className={` bg-slate-700/30 text-slate-300 border-slate-700/50`}
                            >
                                <Avatar className={`w-6 h-6 mr-2 ring-1 ring-slate-700/50`}>
                                    <AvatarImage src={user?.imageUrl} className={` object-cover`} />
                                    <AvatarFallback>{user?.username}</AvatarFallback>
                                </Avatar>
                                {isApprenticeUser
                                    ? 'Apprentice'
                                    : isMasterUser
                                      ? 'Master'
                                      : isDeityUser
                                        ? 'Deity'
                                        : 'Apprentice'}
                            </Badge>

                            <Badge
                                className={` bg-slate-700/30 text-slate-300 border-slate-700/50`}
                            >
                                {isApprenticeUser
                                    ? `${currentProjectCount} / ${planWiseLimit?.projects} projects used`
                                    : isMasterUser || isDeityUser
                                      ? `${formatNumberPrefix(currentProjectCount + 1)} project`
                                      : `${currentProjectCount} / ${planWiseLimit?.projects} projects used`}
                            </Badge>

                            <Alert className={` basis-full`} variant={planWiseAlertVariant()}>
                                <BadgeInfo />
                                <AlertDescription>{planWiseAlertText()}</AlertDescription>
                            </Alert>
                        </div>

                        <DialogDescription></DialogDescription>
                    </DialogHeader>

                    <AnimatePresence mode="wait">
                        <motion.div
                            layout
                            className="w-full h-[calc(90vh*0.5)] mx-auto border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-700 rounded-lg flex flex-col md:flex-row overflow-hidden"
                        >
                            <FileUpload
                                allowedFormats={allowedImageFormats}
                                maxFiles={1}
                                maxFileSize={15 * 1024 * 1024} // 5MB
                                setSelectedFile={setSelectedFile}
                                setPreviewUrl={setPreviewUrl}
                                className={`h-full `}
                            />
                            {selectedFile && previewUrl && (
                                <div className="hidden w-[40rem] md:flex items-center justify-center border border-neutral-200 dark:border-neutral-700 overflow-hidden relative">
                                    <DraggableImage imageUrl={previewUrl} />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className=" w-full flex flex-col md:flex-row justify-center items-center gap-4">
                        {Object.entries(projectInfo)?.map(([key, input], index) => (
                            <Input
                                key={`${index}_${key}`}
                                type={input.type}
                                value={input.value}
                                onChange={handleProjectInfoChange}
                                placeholder={input.placeholder}
                                name={input.name}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        handleProjectCreate();
                                    }
                                }}
                            />
                        ))}
                    </div>

                    <DialogFooter>
                        <Button
                            disabled={
                                isUploading || !projectInfo?.title?.value?.trim() || !selectedFile
                            }
                            className={`${!canCreateProject && 'cursor-not-allowed pointer-events-none opacity-50'}`}
                            variant={'secondary'}
                            onClick={handleProjectCreate}
                        >
                            {canCreateProject ? (
                                isUploading ? (
                                    <>
                                        <Loader2 className="mr-2 animate-spin" /> Creating...
                                    </>
                                ) : (
                                    'Create Project'
                                )
                            ) : (
                                'Upgrade Plan'
                            )}
                        </Button>

                        <Button
                            onClick={handleDialogCLose}
                            variant="destructive"
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Upgrade Plan Modal */}
            <Dialog
                open={openPlanUpgradeModal}
                onOpenChange={() => setOpenPlanUpgradeModal(false)}
                className={' backdrop-blur-md'}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <span
                                className={`flex gap-3 items-center text-base tracking-wider bg-yellow-400/30 text-yellow-200 ring-1 ring-yellow-600 rounded-md px-2 py-1 w-fit`}
                            >
                                <Crown className=" w-4.5 h-4.5" strokeWidth={2.3} /> Upgrade Plan
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    <DialogDescription asChild>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="flex flex-col gap-3 text-center text-[.9rem] leading-relaxed my-3"
                        >
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="text-slate-600 dark:text-slate-300"
                            >
                                You'll be redirected to our{' '}
                                <span className="font-semibold text-sky-500">pricing page</span> to
                                unlock more possibilities.
                            </motion.span>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                                className="flex flex-col gap-4 text-left text-slate-700 dark:text-slate-200"
                            >
                                <div className="flex flex-col bg-emerald-500/5 dark:bg-emerald-500/10 p-3 rounded-md border-l-4 border-emerald-500">
                                    <span className="font-semibold text-emerald-500">
                                        Master Plan
                                    </span>
                                    <span className="ml-7 text-sm">
                                        Unlimited projects plus{' '}
                                        <span className="text-emerald-600 dark:text-emerald-400">
                                            standard exports, background removal, AI editing &
                                            upscaling
                                        </span>
                                    </span>
                                </div>

                                <div className="flex flex-col bg-purple-500/5 dark:bg-purple-500/10 p-3 rounded-md border-l-4 border-purple-500">
                                    <span className="font-semibold text-purple-500">
                                        Deity Plan
                                    </span>
                                    <span className="ml-7 text-sm">
                                        Everything in Master, plus{' '}
                                        <span className="text-purple-600 dark:text-purple-400">
                                            advanced adjustments, color tools, AI extender &
                                            retouching
                                        </span>
                                    </span>
                                </div>
                            </motion.div>

                            <motion.span
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                                className="text-xs text-slate-500 dark:text-slate-400 mt-1"
                            >
                                ✨ Choose the plan that fits your creative workflow
                            </motion.span>
                        </motion.div>
                    </DialogDescription>

                    <DialogFooter>
                        <Button variant="secondary" onClick={upgradePlan}>
                            Go to Pricing
                        </Button>
                        <Button
                            onClick={() => setOpenPlanUpgradeModal(false)}
                            variant="destructive"
                        >
                            Maybe Later
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default NewProjectModal;
