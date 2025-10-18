import React, { useCallback, useState } from 'react';
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
    const { del } = useAPIContext();

    const lastUpdated = useCallback(
        () => formatDistanceToNow(selectedProject?.delete?.updatedAt, { addSuffix: true }),
        [selectedProject?.delete?.updatedAt]
    );

    const handleEditProject = item => {
        router.push(`/editor/${item?._id}`);
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
            // Step 1: Delete from DB (Convex)
            const response = await deleteProject({ projectId: selectedProject.delete._id });
            const { success = false } = response;
            if (!success) throw new Error('Failed to delete project');

            // Step 2: Delete from ImageKit
            const res = await del('/imagekit/delete', {
                fileId: selectedProject.delete.imgKitFileId,
            });
            const { success: imgDeleteSuccess = false } = res;
            if (!imgDeleteSuccess) throw new Error('Failed to delete image');

            toast.success('Project deleted successfully');
            router.refresh();
        } catch (error) {
            console.error('Delete project error:', error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 overflow-auto w-full">
            {projects?.map(project => (
                <ProjectCard
                    key={project?._id}
                    project={project}
                    onEditProject={handleEditProject}
                    onDeleteProject={handleDeleteProject}
                />
            ))}

            {/* Delete modal */}
            <Dialog
                open={openProjectModal.delete}
                onOpenChange={val => setOpenProjectModal({ ...openProjectModal, delete: val })}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <div className="flex gap-2 items-center w-full justify-start">
                                <Avatar className={`w-8 h-8 mr-2 ring-1 ring-slate-700/50 flex`}>
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
                                <span>Delete Project "{selectedProject.delete?.title}"</span>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="text-sm py-4">
                        Are you sure you want to delete this project? This action cannot be undone.
                    </div>

                    <DialogFooter>
                        <Button
                            disabled={
                                isDeleting ||
                                !selectedProject?.delete?.title.trim() ||
                                !selectedProject?.delete
                            }
                            className={`${!selectedProject?.delete && 'cursor-not-allowed pointer-events-none opacity-50'}`}
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
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProjectGrid;
