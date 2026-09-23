'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { generatePlanAction } from '@/app/dashboard/actions';

const STAGES = [
  'Reading your Business Brain…',
  'Creating your content strategy…',
  'Building your 30-day plan…',
  'Writing captions and hooks…',
];

export function GeneratePlanButton({
  label = 'Create my 30-day plan',
  autoStart = false,
  variant = 'primary',
}: {
  label?: string;
  autoStart?: boolean;
  variant?: 'primary' | 'outline';
}) {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [stage, setStage] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2600);
    return () => clearInterval(timer);
  }, [pending]);

  function generate() {
    startTransition(async () => {
      const result = await generatePlanAction();
      if (result.ok) {
        toast.push(`Your plan is ready — ${result.message}`, 'success');
        router.replace('/dashboard/planner');
        router.refresh();
      } else {
        toast.push(result.message ?? 'The plan could not be generated.', 'error');
      }
    });
  }

  // `?generate=1` arrives from the end of onboarding.
  useEffect(() => {
    if (!autoStart || started.current) return;
    if (searchParams.get('generate') !== '1') return;
    started.current = true;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, searchParams]);

  return (
    <div className="flex flex-col items-center gap-2 sm:items-start">
      <Button
        onClick={generate}
        loading={pending}
        variant={variant}
        icon={pending ? undefined : <Sparkles className="h-4 w-4" />}
      >
        {pending ? STAGES[stage] : label}
      </Button>
      {pending ? (
        <p className="text-xs text-ink-muted">This can take up to a minute. You can leave this page open.</p>
      ) : null}
    </div>
  );
}
