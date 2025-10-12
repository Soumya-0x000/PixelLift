import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { NextResponse } from 'next/server';
import { httpAction } from '@/convex/_generated/server';

export async function POST(request) {
    try {
        const event = await verifyWebhook(request);

        if (!event) {
            return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
        }

        const { data: { id = '', items = [] } = {}, type: eventType = '' } = event || {};
        const { plan: { slug: currentUserPlan = '' } = {} } = items?.[0] || {};

        console.log(`Received webhook with ID ${id} and event type of ${eventType}`);

        if (eventType === 'subscription.updated') {
        }
        return NextResponse.json({ message: 'Received' });
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return NextResponse.json({ error: 'Error verifying webhook' }, { status: 400 });
    }
}
