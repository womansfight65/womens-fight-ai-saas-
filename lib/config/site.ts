export const site = {
  name: "Woman's Fight AI",
  shortName: "Woman's Fight",
  tagline: 'AI does the work. You approve.',
  description:
    "Tell Woman's Fight AI about your business once. Let AI plan, create, organize and prepare your social media content for the entire month.",
  supportEmail: 'hello@womansfight.ai',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;

export const marketingNav = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/faq' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

export const footerNav = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'How it works', href: '/#how-it-works' },
      { label: '30-day plan', href: '/#plan-preview' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { label: 'Create account', href: '/signup' },
      { label: 'Log in', href: '/login' },
    ],
  },
] as const;
