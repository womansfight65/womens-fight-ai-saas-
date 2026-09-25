'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useToast } from '@/components/ui/toast';
import { PLATFORMS } from '@/lib/config/platforms';
import type { PlatformId } from '@/types';

/** Surfaces the result of the Facebook OAuth redirect, then cleans the URL. */
export function SocialCallbackToast() {
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('social_error');
    if (!connected && !error) return;

    if (connected) {
      const name = PLATFORMS[connected as PlatformId]?.name ?? connected;
      toast.push(`${name} is connected.`, 'success');
    } else if (error) {
      toast.push(error, 'error');
    }

    router.replace('/dashboard/social');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
