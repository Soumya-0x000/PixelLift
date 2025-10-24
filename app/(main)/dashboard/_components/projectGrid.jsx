import React, { useCallback, useMemo, useState } from 'react';
import ProjectCard from './ProjectCard';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/convex/_generated/api';
import { useConvexMutation } from '@/hooks/useConvexQuery';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import useAPIContext from '@/app/context/APIcontext/useApiContext';

const ProjectGrid = ({ projects }) => {
    const router = useRouter();
    const [selectedProject, setSelectedProject] = useState({
        edit: null,
        delete: null,
    });
    const [openProjectModal, setOpenProjectModal] = useState({
        edit: false,
        delete: false,
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const { mutate: deleteProject, loading } = useConvexMutation(api.projects.deleteProject);
    const { mutate: updateProject } = useConvexMutation(api.projects.updateProject);
    const { del } = useAPIContext();

    const lastUpdated = useCallback(
        () => formatDistanceToNow(selectedProject?.delete?.updatedAt, { addSuffix: true }),
        [selectedProject?.delete?.updatedAt]
    );

    // Create a Map for O(1) lookup
    const projectMap = useMemo(() => {
        const mp = new Map();
        projects.forEach(p => mp.set(p._id, p));
        return mp;
    }, [projects]);

    const handleEditProject = item => {
        if (!item?._id) {
            toast.error('Invalid project ID');
            return;
        }
        router.push(`/editor/${item?._id}`);
    };

    const handleDelegatedClick = e => {
        const projectCard = e.target.closest('[data-id]');
        if (!projectCard) {
            toast.error('Project not found');
            return;
        }

        const projectId = projectCard.dataset.id;
        const project = projectMap.get(projectId);
        if (!project) {
            toast.error('Project not found');
            return;
        }

        handleEditProject(project);
    };

    const handleDeleteProject = item => {
        setSelectedProject({ ...selectedProject, delete: item });
        setOpenProjectModal({ ...openProjectModal, delete: true });
    };

    const handleDialogCLose = () => {
        setOpenProjectModal({ edit: false, delete: false });
        setSelectedProject({ edit: null, delete: null });
        setIsDeleting(false);
    };

    const handleDeleteProjectSubmission = async () => {
        if (!selectedProject?.delete) return;

        try {
            setIsDeleting(true);

            // step 0, mark the project as 'pending' deletion
            const markPendingRes = await updateProject({
                projectId: selectedProject.delete._id,
                deleteStatus: 'pending',
            });
            const { success: markPendingSuccess = false } = markPendingRes;
            if (!markPendingSuccess) throw new Error('Failed to mark project as pending deletion');

            // Step 1: Delete from imagekit
            const res = await del('/imagekit/delete', selectedProject.delete.imgKitFileId);
            const { data: { success: imgDeleteSuccess = false, status } = {} } = res;
            if (!imgDeleteSuccess || status !== 204) throw new Error('Failed to delete image');

            // Step 2: Delete from DB (Convex)
            const response = await deleteProject({ projectId: selectedProject.delete._id });
            const { success: projectDelSuccess = false } = response;
            if (!projectDelSuccess) throw new Error('Failed to delete project');

            toast.success('Project deleted successfully');
            router.refresh();
        } catch (error) {
            console.error('Delete project error:', error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsDeleting(false);
            setOpenProjectModal(prev => ({ ...prev, delete: false }));
            setSelectedProject({ edit: null, delete: null });
        }
    };

    return (
        <>
            <div
                className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 xl:gap-6 overflow-auto justify-items-center w-full"
                onClick={handleDelegatedClick}
            >
                {projects?.map(project => (
                    <ProjectCard
                        key={project?._id}
                        project={project}
                        // onEditProject={handleEditProject}
                        onDeleteProject={handleDeleteProject}
                    />
                ))}
            </div>

            {/* Delete modal */}
            <Dialog
                open={openProjectModal.delete}
                onOpenChange={val => setOpenProjectModal({ ...openProjectModal, delete: val })}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <div className="flex gap-2 items-center w-full justify-start">
                                <Avatar
                                    className={`w-6 xs:w-8 h-6 xs:h-8 ring-1 ring-slate-700/50 flex`}
                                >
                                    <AvatarImage
                                        src={
                                            selectedProject?.delete?.thumbnailUrl ||
                                            '/api/placeholder/40/40'
                                        }
                                        className={` object-cover`}
                                    />
                                    <AvatarFallback>
                                        {selectedProject?.delete?.title}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-[1rem] sm:text-base line-clamp-1 text-start w-[75%]">
                                    Delete Project "{selectedProject.delete?.title}"
                                </span>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="text-xs sm:text-sm py-4">
                        Are you sure you want to delete this project? This action cannot be undone.
                    </div>

                    <DialogFooter>
                        <div className="flex justify-end gap-3">
                            <Button
                                disabled={
                                    isDeleting ||
                                    !selectedProject?.delete?.title.trim() ||
                                    !selectedProject?.delete
                                }
                                className={`${!selectedProject?.delete && 'cursor-not-allowed pointer-events-none opacity-50 w-fit'}`}
                                variant={'secondary'}
                                onClick={handleDeleteProjectSubmission}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 animate-spin" /> Deleting...
                                    </>
                                ) : (
                                    'Delete Project'
                                )}
                            </Button>

                            <Button
                                onClick={handleDialogCLose}
                                variant="destructive"
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ProjectGrid;
