'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { site } from '@/lib/config/site';

/**
 * No mail provider ships with this build, so the form composes a message the
 * visitor sends themselves rather than pretending it was delivered.
 */
export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const body = encodeURIComponent(`${message}\n\n— ${name || 'A visitor'} (${email || 'no email given'})`);
  const subject = encodeURIComponent(`Woman's Fight AI enquiry from ${name || 'a visitor'}`);
  const mailto = `mailto:${site.supportEmail}?subject=${subject}&body=${body}`;

  return (
    <form
      className="wf-card space-y-5 p-7"
      onSubmit={(event) => {
        event.preventDefault();
        window.location.href = mailto;
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Your name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ayesha Rahman"
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@business.com"
          required
        />
      </div>
      <Textarea
        label="How can we help?"
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tell us about your business and what you are trying to solve."
        required
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs text-ink-muted">
          No mail service is connected yet, so this opens your own email app with the message ready.
        </p>
        <Button type="submit" icon={<Mail className="h-4 w-4" />}>
          Compose email
        </Button>
      </div>
    </form>
  );
}
