import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
      {description ? <p className="mt-2 text-sm text-ink-muted">{description}</p> : null}
      <div className="mt-8">{children}</div>
      {footer ? <div className="mt-8 text-sm text-ink-muted">{footer}</div> : null}
    </div>
  );
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-medium text-brand-purple transition-colors hover:text-brand-pink">
      {children}
    </Link>
  );
}
