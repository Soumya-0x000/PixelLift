import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/convex/_generated/api';
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import useStoreUser from '@/hooks/useStoreUser';
import { formatNumberPrefix } from '@/utils/formatNumberPrefix';
import { useAuth, useUser } from '@clerk/nextjs';
import React, { useMemo } from 'react';

const NewProjectModal = ({ isOpen, onClose }) => {
    const { isApprenticeUser, isMasterUser, isDeityUser, checkLimit } = usePlanAccess();
    const { data: projectData, loading } = useConvexQuery(api.projects.getUserProjects);
    const { user } = useStoreUser();

    const currentProjectCount = projectData?.length || 0;
    const canCreateProject = useMemo(() => {
        return checkLimit(currentProjectCount, 'projects');
    }, [currentProjectCount, checkLimit]);
    console.log(canCreateProject);

    const handleClose = () => {
        onClose();
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create your first project</DialogTitle>

                        <div className="flex gap-2">
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
                                {isApprenticeUser ? (
                                    <>{currentProjectCount} / 3 projects used</>
                                ) : isMasterUser || isDeityUser ? (
                                    <>{formatNumberPrefix(currentProjectCount + 1)}project</>
                                ) : (
                                    <>{currentProjectCount} / 3 projects used</>
                                )}
                            </Badge>
                        </div>

                        <DialogDescription></DialogDescription>
                    </DialogHeader>

                    <DialogFooter>Footer</DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default NewProjectModal;
