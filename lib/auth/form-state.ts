/**
 * Shared form state for the auth forms.
 *
 * Lives outside `actions.ts` because a `'use server'` module may only export
 * async functions — a plain constant there is a build error.
 */
export interface FormState {
  status: 'idle' | 'error' | 'success';
  message: string;
  /** Field level errors, keyed by input name. */
  fieldErrors?: Record<string, string>;
  /** Development-mode payload, e.g. a password reset link that has no mailer. */
  devHint?: string;
}

export const initialFormState: FormState = { status: 'idle', message: '' };
