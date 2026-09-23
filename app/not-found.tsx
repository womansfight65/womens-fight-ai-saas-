import { ButtonLink } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-purple">404</p>
        <h1 className="mt-2 text-display-sm font-semibold">This page does not exist.</h1>
        <p className="mt-3 max-w-md text-ink-muted">
          The link may be old, or the page may have moved.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/dashboard" variant="outline">
          Go to dashboard
        </ButtonLink>
      </div>
    </main>
  );
}
