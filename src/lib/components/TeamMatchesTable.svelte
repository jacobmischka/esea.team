<script lang="ts">
	import type { MatchData } from '$lib/types';
	import TeamMapScores from './TeamMapScores.svelte';
	import { assets } from '$app/paths';

	export let matchesData: MatchData[];
</script>

<table>
	<thead>
		<tr>
			<th>W / L</th>
			<th>Map</th>
			<th class="numeric">Team score</th>
			<th class="numeric">Opponent score</th>
			<th>Opponent</th>
			<th>Team ban 1</th>
			<th>Team ban 2</th>
			<th>Team ban 3</th>
		</tr>
	</thead>
	<tbody>
		{#each matchesData as matchData}
			{#each matchData.mapSummaries as mapSummary, i}
				<tr>
					<td data-win={mapSummary.teamWin}>{mapSummary.teamWin ? 'W' : 'L'}</td>
					<td>{mapSummary.mapName}</td>
					<td class="numeric">
						<TeamMapScores
							score={mapSummary.teamScore}
							halfScores={mapSummary.teamHalfScores}
						/>
					</td>
					<td class="numeric">
						<TeamMapScores
							score={mapSummary.opponentScore}
							halfScores={mapSummary.opponentHalfScores}
						/>
					</td>
					<td>
						{#if matchData.summary.opponent}
							<span class="opponent-contents">
								<img
									class="team-avatar"
									src={matchData.summary.opponent.avatar ||
										`${assets}/placeholder.svg`}
									alt=""
								/>
								<a href="/{matchData.summary.opponent.faction_id}">
									{matchData.summary.opponent.name}
								</a>
							</span>
						{/if}
					</td>
					{#if i === 0}
						<td>{matchData.summary.teamMapBans?.[0]}</td>
						<td>{matchData.summary.teamMapBans?.[1]}</td>
						<td>{matchData.summary.teamMapBans?.[2]}</td>
					{:else}
						<td></td>
						<td></td>
						<td></td>
					{/if}
				</tr>
			{:else}
				<tr class="ffw">
					<td data-win={matchData.summary.teamWin}
						>{matchData.summary.teamWin ? 'W' : 'L'}</td
					>
					<td>FFW</td>
					<td class="numeric"></td>
					<td class="numeric"></td>
					<td>
						{#if matchData.summary.opponent}
							<span class="opponent-contents">
								<img
									class="team-avatar"
									src={matchData.summary.opponent.avatar ||
										`${assets}/placeholder.svg`}
									alt=""
								/>
								<a href="/{matchData.summary.opponent.faction_id}">
									{matchData.summary.opponent.name}
								</a>
							</span>
						{/if}
					</td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
			{/each}
		{/each}
	</tbody>
</table>

<style>
	table {
		border-collapse: collapse;
		margin: 2rem auto;
	}

	tr.ffw {
		opacity: 0.5;
	}

	img {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
	}

	th,
	td {
		border: 1px solid var(--border-color);
		font-size: 1.1rem;
	}

	td {
		padding: 0.25rem 0.5rem;
	}

	th {
		font-weight: 600;
		text-align: left;
		padding: 0.5rem;
	}

	.opponent-contents {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.team-avatar {
		width: 1.5rem;
		height: 1.5rem;
	}

	.numeric {
		text-align: right;
	}

	td.numeric {
		font-family: monospace;
	}

	td[data-win] {
		text-align: center;
	}

	td[data-win='true'] {
		color: green;
	}

	td[data-win='false'] {
		color: red;
	}
</style>
