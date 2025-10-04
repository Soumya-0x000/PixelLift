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
import { api } from '@/convex/_generated/api';
import { useConvexQuery } from '@/hooks/useConvexQuery';
import { usePlanAccess } from '@/hooks/usePlanAccess';
import useStoreUser from '@/hooks/useStoreUser';
import { formatNumberPrefix } from '@/utils/formatNumberPrefix';
import { useAuth, useUser } from '@clerk/nextjs';
import { BadgeInfo } from 'lucide-react';
import React, { useCallback, useMemo } from 'react';

const NewProjectModal = ({ isOpen, onClose }) => {
    const { isApprenticeUser, isMasterUser, isDeityUser, planWiseLimit, checkLimit } =
        usePlanAccess();
    const { data: projectData, loading } = useConvexQuery(api.projects.getUserProjects);
    const { user } = useStoreUser();

    const currentProjectCount = projectData?.length || 0;
    const canCreateProject = useMemo(() => {
        return checkLimit(currentProjectCount, 'projects');
    }, [currentProjectCount, checkLimit]);
    console.log(canCreateProject, planWiseLimit);

    const handleClose = () => {
        onClose();
    };

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

    return (
        <>
            <Dialog open={isOpen} onOpenChange={handleClose} className=" backdrop-blur-xs">
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create your first project</DialogTitle>

                        <div className="flex gap-2 flex-wrap">
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

                    <DialogFooter>
                        <Button
                            disabled={!canCreateProject}
                            className={`${!canCreateProject && 'cursor-not-allowed pointer-events-none opacity-50'}`}
                            variant={'secondary'}
                        >
                            {canCreateProject ? 'Create Project' : 'Upgrade Plan'}
                        </Button>

                        <Button onClick={handleClose} variant="destructive">
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default NewProjectModal;
