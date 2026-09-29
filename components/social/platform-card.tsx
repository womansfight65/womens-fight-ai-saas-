'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Link2, Unlink, Users } from 'lucide-react';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlatformIcon } from '@/components/ui/platform-icon';
import { useToast } from '@/components/ui/toast';
import { connectSocialAction, disconnectSocialAction } from '@/app/dashboard/actions';
import type { PlatformConnectionView } from '@/lib/social/social-service';
import type { SocialConnectionStatus } from '@/types';

const STATUS_LABEL: Record<SocialConnectionStatus, string> = {
  not_connected: 'Not connected',
  coming_soon: 'Coming soon',
  connected: 'Connected',
  expired: 'Reconnect needed',
  error: 'Error',
};

const STATUS_TONE: Record<SocialConnectionStatus, BadgeTone> = {
  not_connected: 'neutral',
  coming_soon: 'neutral',
  connected: 'success',
  expired: 'warning',
  error: 'danger',
};

export function PlatformCard({ connection }: { connection: PlatformConnectionView }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const connected = connection.status === 'connected';

  function connect() {
    startTransition(async () => {
      const result = await connectSocialAction(connection.platform);
      if (result.ok && result.url) {
        window.location.href = result.url;
        return;
      }
      toast.push(result.message ?? 'Not available yet.', result.ok ? 'success' : 'info');
      router.refresh();
    });
  }

  function disconnect() {
    startTransition(async () => {
      const result = await disconnectSocialAction(connection.platform);
      toast.push(result.message ?? 'Disconnected.', 'success');
      router.refresh();
    });
  }

  const avatarUrl = connection.account?.avatar_url ?? null;
  const followerCount = connection.account?.follower_count ?? null;

  return (
    <div className="flex flex-col rounded-3xl border border-line bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <div className="relative h-10 w-10 shrink-0">
              {/* External CDN URL from the platform itself — not run through next/image's remote-pattern allowlist. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt=""
                className="h-10 w-10 rounded-2xl border border-line object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white">
                <PlatformIcon platform={connection.platform} className="h-full w-full" />
              </span>
            </div>
          ) : (
            <PlatformIcon platform={connection.platform} className="h-10 w-10" />
          )}
          <div>
            <h3 className="text-base font-semibold text-ink">{connection.name}</h3>
            {connection.account?.display_name ? (
              <p className="text-xs text-ink-muted">{connection.account.display_name}</p>
            ) : null}
            {followerCount !== null ? (
              <p className="mt-0.5 flex items-center gap-1 text-2xs text-ink-faint">
                <Users className="h-3 w-3" />
                {followerCount.toLocaleString()} followers
              </p>
            ) : null}
          </div>
        </div>
        <Badge tone={STATUS_TONE[connection.status]}>{STATUS_LABEL[connection.status]}</Badge>
      </div>

      <p className="mt-3.5 flex-1 text-sm leading-relaxed text-ink-muted">{connection.style}</p>

      <div className="mt-5 border-t border-line pt-4">
        {connected ? (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            loading={pending}
            icon={<Unlink className="h-4 w-4" />}
            onClick={disconnect}
          >
            Disconnect
          </Button>
        ) : connection.isConfigured ? (
          <Button size="sm" fullWidth loading={pending} icon={<Link2 className="h-4 w-4" />} onClick={connect}>
            Connect {connection.name}
          </Button>
        ) : (
          <div className="space-y-2">
            <Button variant="subtle" size="sm" fullWidth disabled>
              Coming soon
            </Button>
            <p className="text-2xs leading-relaxed text-ink-faint">
              The provider and publishing queue are built. Connecting switches on when {connection.name} app
              credentials are configured.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
