import { NextResponse } from 'next/server';
import { verifyWebhook } from '@clerk/nextjs/webhooks';
import { fetchMutation } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

const subscriptions = [
    'subscription.created',
    'subscription.updated',
    'subscription.active',
    'subscription.pastDue',
];

export async function POST(request) {
    try {
        const event = await verifyWebhook(request);

        if (!event) {
            return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
        }

        const { data, type: eventType } = event;
        const issuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;

        // === USER SYNC EVENTS ===
        if (eventType === 'user.updated') {
            const userId = data.id;
            const tokenIdentifier = `${issuerDomain}|${userId}`;

            const name = `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim();
            const email = data.email_addresses?.[0]?.email_address ?? '';
            const imageUrl = data.image_url ?? '';

            await fetchMutation(api.user.updateUser, { tokenIdentifier, name, email, imageUrl });

            console.log(`✅ Synced user (${eventType}):`, email);
            return NextResponse.json({ message: `User ${eventType} synced successfully` });
        }

        if (eventType === 'user.deleted') {
            const userId = data.id;
            const tokenIdentifier = `${issuerDomain}|${userId}`;
            await fetchMutation(api.user.deleteUser, { tokenIdentifier });
            console.log(`🗑️ Deleted user from Convex: ${userId}`);
            return NextResponse.json({ message: 'User deleted from Convex' });
        }

        // === SUBSCRIPTION SYNC EVENTS ===
        const { items = [], payer = {}, status: subscriptionStatus } = data || {};
        const userId = payer?.user_id ?? '';
        const tokenIdentifier = `${issuerDomain}|${userId}`;

        if (!userId) {
            return NextResponse.json(
                { message: 'No user found in webhook payload' },
                { status: 200 }
            );
        }

        const findPlanItem = (statuses = []) => {
            if (!Array.isArray(items) || items.length === 0) return null;
            const candidates = items.filter(item => statuses.includes(item.status));
            if (candidates.length === 0) return null;
            return candidates.sort(
                (a, b) =>
                    (b.period_start ?? b.updated_at ?? 0) - (a.period_start ?? a.updated_at ?? 0)
            )[0];
        };

        let planToSet = 'apprentice_user';

        if (subscriptions.includes(eventType)) {
            if (subscriptionStatus === 'active') {
                const activeItem = findPlanItem(['active']);
                planToSet = activeItem?.plan?.slug;
            } else if (subscriptionStatus === 'past_due') {
                planToSet = 'apprentice_user';
            }
        }

        await fetchMutation(api.user.updateUser, { tokenIdentifier, plan: planToSet });

        return NextResponse.json({
            message: 'Webhook processed successfully',
            eventType,
            plan: planToSet,
        });
    } catch (err) {
        console.error('❌ Clerk webhook error:', err);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
    }
}
