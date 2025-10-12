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

const subscriptionItems = [
    'subscriptionItem.updated',
    'subscriptionItem.active',
    'subscriptionItem.canceled',
    'subscriptionItem.upcoming',
    'subscriptionItem.ended',
    'subscriptionItem.abandoned',
    'subscriptionItem.incomplete',
    'subscriptionItem.pastDue',
    'subscriptionItem.freeTrialEnding',
];

const paymentAttempts = ['paymentAttempt.created', 'paymentAttempt.updated'];

export async function POST(request) {
    try {
        // Verify webhook authenticity
        const event = await verifyWebhook(request);
        console.log(event);
        if (!event) {
            return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
        }

        const { data, type: eventType } = event;
        const { items = [], payer = {}, status: subscriptionStatus } = data || {};
        const userId = payer?.user_id ?? '';
        const issuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;
        const tokenIdentifier = `${issuerDomain}|${userId}`;

        if (!userId) {
            return NextResponse.json(
                { message: 'No user found in webhook payload' },
                { status: 200 }
            );
        }

        // Helper to find the best plan candidate
        const findPlanItem = (statuses = []) => {
            if (!Array.isArray(items) || items.length === 0) return null;
            const candidates = items.filter(item => statuses.includes(item.status));
            if (candidates.length === 0) return null;
            // Prefer the most recent/upcoming item (by period_start, fallback to updated_at)
            return candidates.sort(
                (a, b) =>
                    (b.period_start ?? b.updated_at ?? 0) - (a.period_start ?? a.updated_at ?? 0)
            )[0];
        };

        let planToSet = 'apprentice_user'; // default fallback plan

        // Handle subscription-level events
        if (subscriptions.includes(eventType)) {
            if (subscriptionStatus === 'active') {
                const activeItem = findPlanItem(['active', 'upcoming']);
                planToSet = activeItem?.plan?.slug ?? 'apprentice_user';
            } else if (subscriptionStatus === 'past_due') {
                // Optionally restrict access
                planToSet = 'apprentice_user';
            }
        }

        // Handle subscription item–level events
        else if (subscriptionItems.includes(eventType)) {
            if (['subscriptionItem.ended', 'subscriptionItem.abandoned'].includes(eventType)) {
                planToSet = 'apprentice_user';
            } else if (eventType === 'subscriptionItem.pastDue') {
                planToSet = 'apprentice_user';
            } else {
                const activeItem = findPlanItem(['active', 'upcoming']);
                planToSet = activeItem?.plan?.slug ?? 'apprentice_user';
            }
        }

        // Handle payment attempt events (for logs only)
        else if (paymentAttempts.includes(eventType)) {
            console.log(`💳 Payment attempt event (${eventType}) for user ${userId}`);
            return NextResponse.json({ message: 'Payment attempt logged' }, { status: 200 });
        }

        // Update user's plan in Convex DB
        await fetchMutation(api.user.updateUserPlan, {
            tokenIdentifier,
            plan: planToSet,
        });

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
