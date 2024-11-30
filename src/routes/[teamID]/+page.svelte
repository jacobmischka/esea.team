<script lang="ts">
	import TeamSummary from '$lib/components/TeamSummary.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

{#await data.matchData}
	<div class="loading-container">
		<p>Loading...</p>
	</div>
{:then matchData}
	<TeamSummary {matchData} team={data.team} />
{/await}

<style>
	.loading-container {
		height: 80vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
