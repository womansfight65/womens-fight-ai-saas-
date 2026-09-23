import { NextResponse } from 'next/server';

import { publishingService } from '@/lib/scheduler/publishing-service';

/**
 * Worker entry point for the publishing queue.
 *
 * Point a cron job (Vercel Cron, GitHub Actions, a server crontab) at this
 * route every few minutes. It is protected by a shared secret so it can never
 * be triggered from a browser.
 */
export async function POST(request: Request) {
  const secret = process.env.SCHEDULER_WORKER_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'SCHEDULER_WORKER_SECRET is not configured, so the worker is disabled.' },
      { status: 503 },
    );
  }

  const header = request.headers.get('authorization') ?? '';
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const result = await publishingService.runDueJobs();
  return NextResponse.json(result);
}

export async function GET() {
  return NextResponse.json({ error: 'Use POST with the worker secret.' }, { status: 405 });
}
