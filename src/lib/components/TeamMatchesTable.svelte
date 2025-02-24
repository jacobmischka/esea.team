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
			<th>Map ban 1</th>
			<th>Map ban 2</th>
			<th>Map ban 3</th>
		</tr>
	</thead>
	<tbody>
		{#each matchesData as matchData}
			{#each matchData.mapSummaries as mapSummary, mapSummaryIndex}
				<tr>
					<td data-win={mapSummary.teamWin}>{mapSummary.teamWin ? 'W' : 'L'}</td>
					<td>
						{#if matchData.match}
							<a
								href="https://www.faceit.com/en/cs2/room/{matchData.match.match_id}"
								target="_blank"
								rel="noreferrer noopener"
							>
								{mapSummary.mapName}
							</a>
						{:else}
							{mapSummary.mapName}
						{/if}
					</td>
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
								<a
									href="/{matchData.summary.opponent.faction_id}"
									target="_blank"
									rel="noreferrer noopener"
								>
									{matchData.summary.opponent.name}
								</a>
							</span>
						{/if}
					</td>
					{#each [0, 1, 2] as mapIndex}
						{#if mapSummaryIndex === 0}
							<td>
								<div class="map-ban-cell">
									<span
										class="map-ban"
										data-team={matchData.summary.mapBans?.[mapIndex * 2].team}
										>{matchData.summary.mapBans?.[mapIndex * 2].map}</span
									>
									<span
										class="map-ban"
										data-team={matchData.summary.mapBans?.[mapIndex * 2 + 1]
											.team}
										>{matchData.summary.mapBans?.[mapIndex * 2 + 1].map}</span
									>
								</div>
							</td>
						{:else}
							<td></td>
						{/if}
					{/each}
				</tr>
			{:else}
				<tr class="ffw">
					<td data-win={matchData.summary.teamWin}
						>{matchData.summary.teamWin ? 'W' : 'L'}</td
					>
					<td>
						{#if matchData.match}
							<a
								href="https://www.faceit.com/en/cs2/room/{matchData.match.match_id}"
								target="_blank"
								rel="noreferrer noopener"
							>
								FFW
							</a>
						{:else}
							FFW
						{/if}
					</td>
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
								<a
									href="/{matchData.summary.opponent.faction_id}"
									target="_blank"
									rel="noreferrer noopener"
								>
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
		width: 100%;
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

	.map-ban-cell {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.map-ban-cell .map-ban[data-team='opponent'] {
		font-size: 0.7rem;
	}

	.map-ban-cell .map-ban[data-team='opponent']::before {
		content: 'Opponent: ';
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
