<script lang="ts">
	const SIDE_LENGTH = 42;
	export let holeRatio = 0.7;
	export let series: number[];
	export let label: string | undefined = undefined;
	export let strokeWidth = 8;
	export let colors = [
		'#008ffb',
		'#00e396',
		'#feb019',
		'#ff4560',
		'#775dd0',
		'#1b998b',
		'#f86624',
		'#5a2a27',
		'#f9a3a4',
		'#2e294e',
	];
	export let getColor = (index: number) => {
		return colors[index % colors.length];
	};

	const STARTING_OFFSET = 25;

	let sum, strokes: { dasharray: string; dashoffset: number }[];
	$: sum = series.reduce((sum, x) => sum + x, 0);
	$: if (series) {
		strokes = [];
		if (sum > 0) {
			let preceedingTotal = 0;
			for (const value of series) {
				const percent = (value / sum) * 100;
				strokes.push({
					dasharray: `${percent} ${100 - percent}`,
					dashoffset: 100 - preceedingTotal + STARTING_OFFSET,
				});
				preceedingTotal += percent;
			}
		}
	}
</script>

<svg width="100%" height="100%" viewBox="0 0 {SIDE_LENGTH} {SIDE_LENGTH}" class="pie-chart">
	<circle
		class="donut-hole"
		cx={SIDE_LENGTH / 2}
		cy={SIDE_LENGTH / 2}
		r={(SIDE_LENGTH / 2) * holeRatio}
		fill="transparent"
	></circle>
	<circle
		class="donut-ring"
		cx={SIDE_LENGTH / 2}
		cy={SIDE_LENGTH / 2}
		r={(SIDE_LENGTH / 2) * holeRatio}
		fill="transparent"
		stroke="#e3e3e3"
		stroke-width={strokeWidth}
	></circle>

	{#each strokes as { dasharray, dashoffset }, i}
		<circle
			class="donut-segment"
			cx={SIDE_LENGTH / 2}
			cy={SIDE_LENGTH / 2}
			r={(SIDE_LENGTH / 2) * holeRatio}
			fill="transparent"
			stroke={getColor(i)}
			stroke-width={strokeWidth}
			stroke-dasharray={dasharray}
			stroke-dashoffset={dashoffset}
		></circle>
	{/each}

	<g class="chart-text">
		{#if label}
			<text x="50%" y="50%" class="chart-label">
				{label}
			</text>
		{/if}
	</g>
</svg>

<style>
	.chart-text {
		font: 16px/1.4rem sans-serif;
		transform: translateY(0.25em);
	}

	.chart-label {
		font-size: 0.2rem;
		text-anchor: middle;
		transform: translateY(0.7rem);
	}
</style>
