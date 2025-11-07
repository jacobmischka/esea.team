<script lang="ts">
	import type { MapChoice, MapSummary, MatchData } from '$lib/types';
	import { assets } from '$app/paths';

	import TeamMapScores from './TeamMapScores.svelte';

	interface Props {
		matchData: MatchData;
		mapSummary?: MapSummary;
		mapSummaryIndex?: number;
		hasMapPicks: boolean;
		hasNotes: boolean;
		showPlayers: boolean;
		showMapPicks: boolean;
	}

	const {
		matchData,
		mapSummary,
		mapSummaryIndex,
		hasMapPicks,
		hasNotes,
		showPlayers,
		showMapPicks,
	}: Props = $props();

	const mapBans: MapChoice[] | undefined = $derived(
		matchData.summary.mapChoices?.filter((choice) => choice.choice === 'drop')
	);
	const mapPicks: MapChoice[] | undefined = $derived(
		matchData.summary.mapChoices?.filter((choice) => choice.choice === 'pick')
	);
</script>

{#if mapSummary}
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
			<TeamMapScores score={mapSummary.teamScore} halfScores={mapSummary.teamHalfScores} />
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
						src={matchData.summary.opponent.avatar || `${assets}/placeholder.svg`}
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
					<div class="map-choice-cell">
						<span class="map-choice" data-team={mapBans?.[mapIndex * 2]?.team}>
							{mapBans?.[mapIndex * 2]?.map}
						</span>
						<span class="map-choice" data-team={mapBans?.[mapIndex * 2 + 1]?.team}>
							{mapBans?.[mapIndex * 2 + 1]?.map}
						</span>
					</div>
				</td>
			{:else}
				<td></td>
			{/if}
		{/each}
		{#if hasMapPicks && showMapPicks}
			{#each [0, 1, 2] as mapIndex}
				{#if mapSummaryIndex === 0}
					<td>
						<div class="map-choice-cell">
							<span class="map-choice" data-team={mapPicks?.[mapIndex * 2]?.team}>
								{mapPicks?.[mapIndex * 2]?.map}
							</span>
							<span class="map-choice" data-team={mapPicks?.[mapIndex * 2 + 1]?.team}>
								{mapPicks?.[mapIndex * 2 + 1]?.map}
							</span>
						</div>
					</td>
				{:else}
					<td></td>
				{/if}
			{/each}
		{/if}
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
		<td data-win={matchData.summary.teamWin}>{matchData.summary.teamWin ? 'W' : 'L'}</td>
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
						src={matchData.summary.opponent.avatar || `${assets}/placeholder.svg`}
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
{/if}

<style>
	tr.ffw {
		opacity: 0.5;
	}

	td {
		border: 1px solid var(--border-color);
		font-size: 1.1rem;
	}

	td {
		padding: 0.25rem 0.5rem;
	}

	tr:last-child td {
		border-bottom: none;
	}

	td:first-child {
		border-left: none;
	}

	td:last-child {
		border-right: none;
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

	img {
		width: 1rem;
		height: 1rem;
		border-radius: 50%;
	}

	.map-choice-cell {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.map-choice-cell .map-choice[data-team='opponent'] {
		font-size: 0.7rem;
	}

	.map-choice-cell .map-choice[data-team='opponent']::before {
		content: 'Opponent: ';
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
