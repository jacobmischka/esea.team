<script lang="ts">
	import type { Snippet } from 'svelte';
	import PieChart from './PieChart.svelte';

	export let series: number[], labels: string[];
	export let showValue = false;
	export let formatter = (value: number) => value;
	export let renderLegendValue:
		| Snippet<[{ value: number; label: string; index: number }]>
		| undefined = undefined;
	export let showTotal = false;
	export let legendPosition: 'right' | 'below' = 'right';
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
</script>

<figure class:column={legendPosition === 'below'}>
	<PieChart {series} {getColor} {colors} />
	<figcaption class="legend">
		<ol>
			{#each labels as label, i}
				<li style={`--label-color: ${getColor(i)}`}>
					{#if showValue}
						<div class="label-container">
							<span class="label-label">{label}</span>
							<span class="label-value">
								{#if renderLegendValue}
									{@render renderLegendValue({
										value: series[i],
										label,
										index: i,
									})}
								{:else}
									{formatter(series[i])}
								{/if}
							</span>
						</div>
					{:else}
						{label}
					{/if}
				</li>
			{/each}
			{#if showValue && showTotal}
				<li class="total-label">
					<div class="label-container">
						<span class="label-label">Total</span>
						<span class="label-value">{formatter(series.reduce((acc, x) => acc + x, 0))}</span>
					</div>
				</li>
			{/if}
		</ol>
	</figcaption>
</figure>

<style>
	figure {
		margin: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	figure.column {
		flex-direction: column;
	}

	.legend {
		margin-left: 1rem;
	}

	figure.column .legend {
		margin-top: 1rem;
		margin-left: 0;
	}

	figure :global(svg) {
		flex-grow: 1;
	}

	ol {
		padding-left: 1rem;
	}

	li {
		list-style: disc;
	}

	li::marker {
		color: var(--label-color);
	}

	li.total-label {
		list-style: none;
		border-top: 1px solid #333;
	}

	.label-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.label-value {
		margin-left: 1rem;
		text-align: right;
	}
</style>
