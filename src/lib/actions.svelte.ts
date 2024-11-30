import type { Action } from 'svelte/action';

export const imgFallback: Action<HTMLImageElement, string> = (node, fallbackURL) => {
	const handleError = (event: ErrorEvent) => {
		const img = event.target as HTMLImageElement;
		console.error('Failed loading image', img.src, 'using fallback', fallbackURL);
		img.src = fallbackURL;
	};

	$effect(() => {
		node.addEventListener('error', handleError);
		return () => {
			node.removeEventListener('error', handleError);
		};
	});
};
