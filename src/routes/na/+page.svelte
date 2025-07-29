<script lang="ts">
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<h1>North American ESEA teams</h1>

<ul>
	{#each data.divisions as division}
		<li>
			<a href="/na/{division.id}" download="{division.name}.csv">{division.name}</a>
		</li>
	{/each}
</ul>
