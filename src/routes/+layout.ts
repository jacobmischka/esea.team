import { injectAnalytics } from '@vercel/analytics/sveltekit';

import { dev } from '$app/environment';

injectAnalytics({ mode: dev ? 'development' : 'production' });

export const ssr = false;
