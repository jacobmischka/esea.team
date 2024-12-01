<script lang="ts">
	export let score: number | undefined = undefined;
	export let halfScores: [number, number] | undefined = undefined;
</script>

<div class="map-scores" title="First half - Second half">
	<span class="half-scores">
		{halfScores?.join(' - ')}
	</span>
	{score}
</div>

<style>
	.map-scores {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.half-scores {
		font-size: 0.7rem;
	}
</style>
