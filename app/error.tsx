'use client';

import { useEffect } from 'react';

import { Button, ButtonLink } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/states';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <ErrorState
          title="Something went wrong."
          description="The page could not be loaded. Try again, and if it keeps happening the details are in the system logs."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={reset}>Try again</Button>
              <ButtonLink href="/dashboard" variant="outline">
                Back to dashboard
              </ButtonLink>
            </div>
          }
        />
      </div>
    </main>
  );
}
