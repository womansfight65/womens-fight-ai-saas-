import 'server-only';

import { getStore } from '@/lib/data';
import { integrations } from '@/lib/config/env';
import { getPlan, PLANS } from '@/lib/config/plans';
import type { PlanTier, Subscription, SubscriptionPlan, UUID } from '@/types';

export interface BillingState {
  /** False until Stripe keys are configured — the UI says so plainly. */
  paymentsConnected: boolean;
  subscription: Subscription | null;
  plan: SubscriptionPlan;
  plans: SubscriptionPlan[];
}

/**
 * Billing. The UI and the plan data are complete; the payment processor is not
 * connected in this build, and the product says so rather than pretending a
 * checkout exists.
 */
class BillingService {
  async state(workspaceId: UUID): Promise<BillingState> {
    const store = await getStore();
    const subscription = await store.getSubscription(workspaceId);
    return {
      paymentsConnected: integrations.billing,
      subscription,
      plan: getPlan(subscription?.plan_id ?? 'free'),
      plans: PLANS,
    };
  }

  async startCheckout(_workspaceId: UUID, _planId: PlanTier, _interval: 'monthly' | 'yearly') {
    if (!integrations.billing) {
      return {
        ok: false as const,
        error: 'Payments are not connected in this build. Add STRIPE_SECRET_KEY to enable checkout.',
      };
    }
    // Stripe Checkout session creation goes here once keys are configured.
    return { ok: false as const, error: 'Checkout is not implemented yet.' };
  }

  async cancel(workspaceId: UUID) {
    const store = await getStore();
    const subscription = await store.getSubscription(workspaceId);
    if (!subscription) return { ok: false as const, error: 'No subscription found.' };
    await store.upsertSubscription(workspaceId, { cancel_at_period_end: true });
    return { ok: true as const };
  }
}

export const billingService = new BillingService();
