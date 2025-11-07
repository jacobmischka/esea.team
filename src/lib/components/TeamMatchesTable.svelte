<script lang="ts">
	import { mkConfig, generateCsv, download } from 'export-to-csv';

	import type { MatchData } from '$lib/types';

	import { ucfirst } from '../utils';
	import TeamMatchRow from './TeamMatchRow.svelte';

	interface Props {
		matchesData: MatchData[];
		showPlayers: boolean;
		showMapPicks: boolean;
	}

	const { matchesData, showPlayers, showMapPicks }: Props = $props();

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
			...Array.from({ length: 6 }, (_, i) => i + 1).map((mapIndex) => ({
				key: `mapPick${mapIndex}`,
				displayLabel: `Map pick ${mapIndex}`,
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
							matchData.summary.mapChoices
								?.filter((choice) => choice.choice === 'drop')
								?.map((mapBan, mapIndex) => [
									`mapBan${mapIndex + 1}`,
									`${ucfirst(mapBan.team)}: ${mapBan.map}`,
								]) ?? []
						),
						...Object.fromEntries(
							matchData.summary.mapChoices
								?.filter((choice) => choice.choice === 'pick')
								?.map((mapPick, mapIndex) => [
									`mapPick${mapIndex + 1}`,
									`${ucfirst(mapPick.team)}: ${mapPick.map}`,
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
						? `${matchData.mapSummaries.map((mapSummary) => mapSummary.mapName).join(', ')} - ${matchData.summary.mapChoices?.length ? `Banned ${matchData.summary.mapChoices?.filter((choice) => choice.choice === 'drop')?.[0].team === 'team' ? 'first' : 'second'}; ${matchData.summary.teamMapBans?.join(', ')}` : 'Bans unavailable'}`
						: 'No map data, likely FF'
				)
				.join('\n')
		)
	);

	const hasNotes = $derived(matchesData.some((match) => Boolean(match.notes?.length)));
	const hasMapPicks = $derived(matchesData.some((match) => Boolean(match.mapSummaries?.length)));
</script>

<div class="table-controls">
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
				<th>Ban 1</th>
				<th>Ban 2</th>
				<th>Ban 3</th>
				{#if hasMapPicks && showMapPicks}
					<th>Pick 1</th>
					<th>Pick 2</th>
					<th>Pick 3</th>
				{/if}
				{#if hasNotes}
					<th>Notes</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each matchesData as matchData}
				{#each matchData.mapSummaries as mapSummary, mapSummaryIndex}
					<TeamMatchRow
						{matchData}
						{mapSummary}
						{mapSummaryIndex}
						{hasMapPicks}
						{hasNotes}
						{showPlayers}
						{showMapPicks}
					/>
				{:else}
					<TeamMatchRow
						{matchData}
						{hasMapPicks}
						{hasNotes}
						{showPlayers}
						{showMapPicks}
					/>
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

	.table-container {
		max-width: 100%;
		overflow: auto;
		border: 1px solid var(--border-color);
	}

	table {
		border-collapse: collapse;
		width: 100%;
	}

	th {
		border: 1px solid var(--border-color);
		font-size: 1.1rem;
		font-weight: 600;
		text-align: left;
		padding: 0.5rem;
		text-wrap: nowrap;
	}

	thead tr:first-child th {
		border-top: none;
	}

	th:first-child {
		border-left: none;
	}

	th:last-child {
		border-right: none;
	}

	.numeric {
		text-align: right;
	}
</style>
