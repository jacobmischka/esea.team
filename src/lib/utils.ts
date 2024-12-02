export function replaceLang(url: string) {
	return url.replace('{lang}', 'en'); // TODO: Other languages exist
}

export function trimTrailingZeroesAndDots(numStr: string): string {
	return numStr.replace(/\.?0+$/, '');
}
