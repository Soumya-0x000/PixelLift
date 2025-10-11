import { verifyWebhook } from '@clerk/nextjs/webhooks';

export async function POST(request) {
    try {
        const evt = await verifyWebhook(request);

        const { data: { id } = {}, type: eventType = '' } = evt.data;

        console.log(`Received webhook with ID ${id} and event type of ${eventType}`);
        console.log('Webhook payload:', evt.data);
        return Response.json({ message: 'Received' });
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return Response.json({ error: 'Error verifying webhook' }, { status: 400 });
    }
}
