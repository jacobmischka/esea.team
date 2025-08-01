<script lang="ts">
	import { mkConfig, generateCsv, download } from 'export-to-csv';

	import type { MatchData } from '$lib/types';
	import { assets } from '$app/paths';
	import { page } from '$app/stores';

	import TeamMapScores from './TeamMapScores.svelte';
	import { ucfirst } from '../utils';
	import { pushState } from '$app/navigation';

	const { matchesData }: { matchesData: MatchData[] } = $props();

	const csvConfig = mkConfig({
		filename: 'ESEA team match summary',
		columnHeaders: [
			{
				key: 'winLoss',
				displayLabel: 'W / L',
			},
			{
				key: 'mapName',
				displayLabel: 'Map',
			},
			{
				key: 'teamScore',
				displayLabel: 'Team score',
			},
			{
				key: 'teamHalfScores',
				displayLabel: 'Team half scores',
			},
			{
				key: 'opponentScore',
				displayLabel: 'Opponent score',
			},
			{
				key: 'opponentHalfScores',
				displayLabel: 'Opponent half scores',
			},
			{
				key: 'opponentName',
				displayLabel: 'Opponent',
			},
			...Array.from({ length: 6 }, (_, i) => i + 1).map((mapIndex) => ({
				key: `mapBan${mapIndex}`,
				displayLabel: `Map ban ${mapIndex}`,
			})),
		],
	});

	const generateCSV = generateCsv(csvConfig);
	const downloadCSV = download(csvConfig);

	const csvData = $derived(
		matchesData.flatMap((matchData) =>
			matchData.mapSummaries.length
				? matchData.mapSummaries.map((mapSummary) => ({
						winLoss: mapSummary.teamWin ? 'W' : 'L',
						mapName: mapSummary.mapName,
						teamScore: mapSummary.teamScore,
						teamHalfScores: mapSummary.teamHalfScores?.join(' - '),
						opponentName: mapSummary.opponentName,
						opponentScore: mapSummary.opponentScore,
						opponentHalfScores: mapSummary.opponentHalfScores?.join(' - '),
						...Object.fromEntries(
							matchData.summary.mapBans?.map((mapBan, mapIndex) => [
								`mapBan${mapIndex + 1}`,
								`${ucfirst(mapBan.team)}: ${mapBan.map}`,
							]) ?? []
						),
					}))
				: [
						{
							winLoss: matchData.summary.teamWin ? 'W' : 'L',
							opponentName: matchData.summary.opponent?.name,
						},
					]
		)
	);

	const mapsSummaryText = $derived(
		encodeURI(
			matchesData
				.map((matchData) =>
					matchData.mapSummaries.length
						? `${matchData.mapSummaries.map((mapSummary) => mapSummary.mapName).join(', ')} - ${matchData.summary.mapBans?.length ? `Banned ${matchData.summary.mapBans?.[0].team === 'team' ? 'first' : 'second'}; ${matchData.summary.teamMapBans?.join(', ')}` : 'Bans unavailable'}`
						: 'No map data, likely FF'
				)
				.join('\n')
		)
	);

	const hasNotes = $derived(matchesData.some((match) => Boolean(match.notes?.length)));

	let showPlayers = $state(Boolean($page.url.searchParams.get('show_players')));

	async function handleShowPlayersChange(
		event: Event & {
			currentTarget: HTMLInputElement;
		}
	) {
		const url = new URL(window.location.href);
		showPlayers = event.currentTarget.checked;
		if (showPlayers) {
			url.searchParams.set('show_players', '1');
		} else {
			url.searchParams.delete('show_players');
		}
		pushState(url, $page.state);
	}
</script>

<div class="table-controls">
	<label>
		<input type="checkbox" checked={showPlayers} onchange={handleShowPlayersChange} />
		Show players
	</label>
	<a
		class="download-map-summary"
		download="ESEA team map summary.txt"
		href={`data:text/plain,${mapsSummaryText}`}
	>
		Download team maps summary
	</a>

	<button
		type="button"
		onclick={() => {
			downloadCSV(generateCSV(csvData));
		}}
	>
		Download as CSV
	</button>
</div>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th>W / L</th>
				<th>Map</th>
				<th class="numeric">Team score</th>
				<th class="numeric">Opponent score</th>
				{#if showPlayers}
					<th>Team players</th>
				{/if}
				<th>Opponent</th>
				<th>Map ban 1</th>
				<th>Map ban 2</th>
				<th>Map ban 3</th>
				{#if hasNotes}
					<th>Notes</th>
				{/if}
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
									href="https://www.faceit.com/en/cs2/room/{matchData.match
										.match_id}"
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
						{#if showPlayers}
							<td>
								{#if mapSummary.teamPlayers?.length}
									<ul class="player-list">
										{#each mapSummary.teamPlayers as player}
											<li>{player.nickname}</li>
										{/each}
									</ul>
								{/if}
							</td>
						{/if}
						<td class="opponent-cell">
							{#if matchData.summary.opponent}
								<div class="opponent-contents">
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
								</div>
							{/if}
							{#if showPlayers && mapSummary.opponentPlayers?.length}
								<ul class="player-list">
									{#each mapSummary.opponentPlayers as player}
										<li>{player.nickname}</li>
									{/each}
								</ul>
							{/if}
						</td>
						{#each [0, 1, 2] as mapIndex}
							{#if mapSummaryIndex === 0}
								<td>
									<div class="map-ban-cell">
										<span
											class="map-ban"
											data-team={matchData.summary.mapBans?.[mapIndex * 2]
												?.team}
											>{matchData.summary.mapBans?.[mapIndex * 2]?.map}</span
										>
										<span
											class="map-ban"
											data-team={matchData.summary.mapBans?.[mapIndex * 2 + 1]
												?.team}
											>{matchData.summary.mapBans?.[mapIndex * 2 + 1]
												?.map}</span
										>
									</div>
								</td>
							{:else}
								<td></td>
							{/if}
						{/each}
						{#if hasNotes}
							<td>
								{#if matchData.notes?.length}
									<ol>
										{#each matchData.notes as note}
											<li>{note}</li>
										{/each}
									</ol>
								{/if}
							</td>
						{/if}
					</tr>
				{:else}
					<tr class="ffw">
						<td data-win={matchData.summary.teamWin}
							>{matchData.summary.teamWin ? 'W' : 'L'}</td
						>
						<td>
							{#if matchData.match}
								<a
									href="https://www.faceit.com/en/cs2/room/{matchData.match
										.match_id}"
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
						{#if showPlayers}
							<td></td>
						{/if}
						<td></td>
						<td></td>
						<td></td>
						{#if hasNotes}
							<td>
								{#if matchData.notes?.length}
									<ol>
										{#each matchData.notes as note}
											<li>{note}</li>
										{/each}
									</ol>
								{/if}
							</td>
						{/if}
					</tr>
				{/each}
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-controls {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
		align-items: center;
		margin-bottom: 1rem;
	}

	.download-map-summary {
		font-size: 0.8rem;
	}

	img {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
	}

	.table-container {
		max-width: 100%;
		overflow: auto;
		border: 1px solid var(--border-color);
	}

	table {
		border-collapse: collapse;
		width: 100%;
	}

	tr.ffw {
		opacity: 0.5;
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
		text-wrap: nowrap;
	}

	thead tr:first-child th {
		border-top: none;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	th:first-child,
	td:first-child {
		border-left: none;
	}

	th:last-child,
	td:last-child {
		border-right: none;
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

	ul.player-list {
		font-size: 0.9rem;
		margin: 0;
		padding-left: 1rem;
	}

	.opponent-cell ul.player-list {
		padding-left: 2rem;
	}
</style>
