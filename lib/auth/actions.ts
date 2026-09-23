'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { integrations } from '@/lib/config/env';
import { getStore } from '@/lib/data';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { uuid } from '@/lib/utils/id';
import { notificationService } from '@/lib/notifications/notification-service';
import { logger } from '@/lib/utils/logger';
import { DEV_SESSION_COOKIE, encodeDevSession, getCurrentUserId } from './session';
import type { FormState } from './form-state';

const signUpSchema = z.object({
  full_name: z.string().min(2, 'Please enter your name.').max(80),
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.').max(128),
});

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

async function bootstrapUser(params: {
  userId: string;
  email: string;
  fullName: string;
}): Promise<void> {
  const store = await getStore();
  const existing = await store.getProfile(params.userId);
  if (existing) return;

  // The very first account in a fresh deployment owns the admin panel.
  const isFirstUser = (await store.countProfiles()) === 0;

  const profile = await store.createProfile({
    id: params.userId,
    email: params.email,
    full_name: params.fullName,
    role: isFirstUser ? 'admin' : 'user',
  });

  const workspace = await store.createWorkspace({
    owner_id: profile.id,
    name: params.fullName ? `${params.fullName.split(' ')[0]}'s workspace` : 'My workspace',
  });
  await store.addWorkspaceMember({
    workspace_id: workspace.id,
    user_id: profile.id,
    role: 'owner',
  });
  await store.upsertBusinessProfile(workspace.id, {});
  await store.upsertBrandProfile(workspace.id, {});
  await store.upsertSubscription(workspace.id, {
    plan_id: 'free',
    status: integrations.billing ? 'active' : 'not_configured',
  });

  await notificationService.notify({
    workspaceId: workspace.id,
    userId: profile.id,
    kind: 'welcome',
    title: "Welcome to Woman's Fight AI",
    body: 'Tell the assistant about your business and it will build your Business Brain.',
    href: '/onboarding',
  });

  await logger.info('auth', 'New account created', { workspaceId: workspace.id });
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse({
    full_name: String(formData.get('full_name') ?? '').trim(),
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  });

  if (!parsed.success) {
    return { status: 'error', message: 'Please fix the fields below.', fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const { full_name, email, password } = parsed.data;

  if (integrations.supabase) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { status: 'error', message: 'Supabase is not available right now.' };
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });
    if (error) return { status: 'error', message: error.message };
    if (data.user) await bootstrapUser({ userId: data.user.id, email, fullName: full_name });
    if (!data.session) {
      return {
        status: 'success',
        message: 'Check your inbox to confirm your email address, then log in.',
      };
    }
  } else {
    const store = await getStore();
    if (await store.getProfileByEmail(email)) {
      return {
        status: 'error',
        message: 'That email already has an account.',
        fieldErrors: { email: 'Already registered.' },
      };
    }
    const userId = uuid();
    await store.devCreateCredentials?.(email, password, userId);
    await bootstrapUser({ userId, email, fullName: full_name });
    const cookieStore = await cookies();
    cookieStore.set(DEV_SESSION_COOKIE, encodeDevSession(userId), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse({
    email: String(formData.get('email') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  });
  if (!parsed.success) {
    return { status: 'error', message: 'Please fix the fields below.', fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const nextPath = String(formData.get('next') ?? '') || '/dashboard';
  const { email, password } = parsed.data;

  if (integrations.supabase) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { status: 'error', message: 'Supabase is not available right now.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { status: 'error', message: 'Email or password is incorrect.' };
  } else {
    const store = await getStore();
    const userId = await store.devVerifyCredentials?.(email, password);
    if (!userId) return { status: 'error', message: 'Email or password is incorrect.' };
    const cookieStore = await cookies();
    cookieStore.set(DEV_SESSION_COOKIE, encodeDevSession(userId), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  revalidatePath('/', 'layout');
  redirect(nextPath.startsWith('/') ? nextPath : '/dashboard');
}

export async function signOutAction(): Promise<void> {
  if (integrations.supabase) {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.signOut();
  }
  const cookieStore = await cookies();
  cookieStore.delete(DEV_SESSION_COOKIE);
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function requestPasswordResetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get('email') ?? '').trim();
  if (!z.string().email().safeParse(email).success) {
    return { status: 'error', message: 'Enter a valid email address.', fieldErrors: { email: 'Invalid email.' } };
  }

  if (integrations.supabase) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { status: 'error', message: 'Supabase is not available right now.' };
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/reset-password`,
    });
    return {
      status: 'success',
      message: 'If that address has an account, a reset link is on its way.',
    };
  }

  const store = await getStore();
  const token = await store.devCreateResetToken?.(email);
  return {
    status: 'success',
    message: 'If that address has an account, a reset link is on its way.',
    devHint: token
      ? `No mail provider is configured, so here is the link: /reset-password?token=${token}`
      : undefined,
  };
}

export async function resetPasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm_password') ?? '');
  const token = String(formData.get('token') ?? '');

  if (password.length < 8) {
    return { status: 'error', message: 'Use at least 8 characters.', fieldErrors: { password: 'Too short.' } };
  }
  if (password !== confirm) {
    return {
      status: 'error',
      message: 'Passwords do not match.',
      fieldErrors: { confirm_password: 'Passwords do not match.' },
    };
  }

  if (integrations.supabase) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { status: 'error', message: 'Supabase is not available right now.' };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { status: 'error', message: error.message };
    return { status: 'success', message: 'Password updated. You can log in now.' };
  }

  const store = await getStore();
  let userId: string | null = null;
  if (token) userId = (await store.devConsumeResetToken?.(token)) ?? null;
  else userId = await getCurrentUserId();

  if (!userId) {
    return { status: 'error', message: 'That reset link is invalid or has expired.' };
  }
  await store.devSetPassword?.(userId, password);
  return { status: 'success', message: 'Password updated. You can log in now.' };
}
