<script lang="ts">
	import TeamSummary from '$lib/components/TeamSummary.svelte';
	import type { PageData } from './$types';

	import { navigating } from '$app/stores';

	const { data }: { data: PageData } = $props();
</script>

{#snippet loading()}
	<div class="loading-container">
		<p>Loading data from FACEIT...</p>
	</div>
{/snippet}

{#if $navigating}
	{@render loading()}
{:else}
	{#await data.matchData}
		{@render loading()}
	{:then matchData}
		<TeamSummary {...data} {matchData} seasons={data.eseaSeasons} />
	{/await}
{/if}

<style>
	.loading-container {
		height: 80vh;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
