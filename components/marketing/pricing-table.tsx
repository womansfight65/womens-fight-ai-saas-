'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

import { ButtonLink } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { PLANS, yearlySavingPercent } from '@/lib/config/plans';
import type { BillingInterval } from '@/types';

export function PricingTable({
  compact = false,
  paymentsConnected = false,
}: {
  compact?: boolean;
  /** Passed in by the server so the client never reads a server-only key. */
  paymentsConnected?: boolean;
}) {
  const [interval, setInterval] = useState<BillingInterval>('monthly');

  return (
    <div>
      <div className="flex justify-center">
        <div
          role="group"
          aria-label="Billing interval"
          className="inline-flex items-center gap-1 rounded-full bg-surface-muted p-1"
        >
          {(['monthly', 'yearly'] as BillingInterval[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setInterval(option)}
              aria-pressed={interval === option}
              className={cn(
                'rounded-full px-5 py-2 text-sm font-medium capitalize transition-all duration-200',
                interval === option ? 'bg-white text-ink shadow-soft' : 'text-ink-muted hover:text-ink',
              )}
            >
              {option}
              {option === 'yearly' ? (
                <span className="ml-2 text-xs font-semibold text-brand-purple">−17%</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className={cn('mt-10 grid gap-4 lg:grid-cols-3', compact && 'mt-8')}>
        {PLANS.map((plan) => {
          const price = interval === 'monthly' ? plan.price_monthly : plan.price_yearly;
          const saving = yearlySavingPercent(plan);
          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-4xl border bg-white p-7 transition-all duration-300 ease-premium',
                plan.highlighted
                  ? 'border-brand-purple/35 shadow-glow lg:-translate-y-2'
                  : 'border-line shadow-soft hover:shadow-lift',
              )}
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-7 rounded-full bg-brand-gradient px-3 py-1 text-2xs font-semibold uppercase tracking-wider text-white">
                  Most popular
                </span>
              ) : null}

              <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
              <p className="mt-1.5 text-sm text-ink-muted">{plan.tagline}</p>

              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold tracking-tight text-ink">${price}</span>
                <span className="text-sm text-ink-muted">/{interval === 'monthly' ? 'month' : 'year'}</span>
              </p>
              {interval === 'yearly' && saving > 0 ? (
                <p className="mt-1 text-xs text-brand-purple">Saves {saving}% against monthly</p>
              ) : null}

              <ButtonLink
                href="/signup"
                variant={plan.highlighted ? 'primary' : 'outline'}
                className="mt-6"
                fullWidth
              >
                {plan.id === 'free' ? 'Start free' : `Choose ${plan.name}`}
              </ButtonLink>

              <ul className="mt-7 space-y-3 border-t border-line pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-ink-soft">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {!paymentsConnected ? (
        <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-ink-muted">
          <Badge tone="warning">Payments not connected</Badge>
          Plans and limits are live; checkout switches on when a payment provider is configured.
        </p>
      ) : null}
    </div>
  );
}
