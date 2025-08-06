'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Home() {
    return (
        <div className="">
            <Button
                variant={'gradient'}
                className={'transition-all duration-300'}
                onClick={() =>
                    toast('Event has been created', {
                        description: new Date().toLocaleString(),
                        action: {
                            label: 'Undo',
                            onClick: () => console.log('Undo'),
                        },
                    })
                }
            >
                Hello
            </Button>
        </div>
    );
}
