<script lang="ts">
	import type { Team, LeagueSeason, Member as TeamMember } from '$lib/schemas';
	import type { MatchData } from '$lib/types';
	import PieFigure from '$lib/components/PieFigure.svelte';
	import Member from '$lib/components/Member.svelte';
	import TeamMatchesTable from '$lib/components/TeamMatchesTable.svelte';
	import { assets } from '$app/paths';
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';

	const {
		matchData,
		team,
		seasons,
		season,
	}: {
		matchData: MatchData[];
		team: Team;
		seasons: LeagueSeason[];
		season?: LeagueSeason | undefined;
	} = $props();

	if (dev) {
		console.debug({ matchData, team, seasons, season });
	}

	const playerMap = new Map<string, { member: TeamMember; count: number }>();
	for (const member of team.members) {
		playerMap.set(member.nickname, { member, count: 0 });
	}

	const numMaps = matchData.reduce((acc, matchData) => acc + matchData.mapSummaries.length, 0);
	const mapWinCounts = new Map<string, number>();

	async function handleSeasonChange(
		event: Event & {
			currentTarget: HTMLSelectElement;
		}
	) {
		const url = new URL(window.location.href);
		url.searchParams.set('season_id', event.currentTarget.value);
		return goto(url);
	}

	for (const data of matchData) {
		for (const mapSummary of data.mapSummaries) {
			if (mapSummary.mapName && mapSummary.teamWin) {
				mapWinCounts.set(
					mapSummary.mapName,
					(mapWinCounts.get(mapSummary.mapName) ?? 0) + 1
				);
			}
			if (mapSummary.teamPlayers) {
				for (const player of mapSummary.teamPlayers) {
					let val = playerMap.get(player.nickname);
					if (val) {
						val.count += 1;
					}
				}
			}
		}
	}

	const sortedPlayers = Array.from(playerMap.values()).sort((a, b) => b.count - a.count);

	function countAndSort(items: string[]) {
		const mapMap = new Map<string, { name: string; count: number }>();
		for (const item of items) {
			let val = mapMap.get(item);
			if (!val) {
				val = { name: item, count: 0 };
				mapMap.set(item, val);
			}
			val.count += 1;
		}

		return Array.from(mapMap.values()).sort((a, b) => b.count - a.count);
	}

	const playedCounts = countAndSort(
		matchData
			.flatMap((matchData) => matchData.mapSummaries.map((mapSummary) => mapSummary.mapName))
			.filter((v) => typeof v === 'string')
	);
	const ban1Counts = countAndSort(
		matchData
			.map((matchData) => matchData.summary.teamMapBans?.[0])
			.filter((v) => typeof v === 'string')
	);
	const ban2Counts = countAndSort(
		matchData
			.map((matchData) => matchData.summary.teamMapBans?.[1])
			.filter((v) => typeof v === 'string')
	);
	const ban3Counts = countAndSort(
		matchData
			.map((matchData) => matchData.summary.teamMapBans?.[2])
			.filter((v) => typeof v === 'string')
	);
</script>

{#snippet mapWinRateSnippet({ value: mapCount, label: mapName }: { value: number; label: string })}
	<span class="map-win-rate">
		<span class="map-win-percentage" title="Win rate">
			{Math.round(((mapWinCounts.get(mapName) ?? 0) / mapCount) * 100)}% WR
		</span>
		<span class="map-play-count">
			{mapCount}
		</span>
	</span>
{/snippet}

<section class="team-summary">
	<header>
		<img src={team.avatar || `${assets}/placeholder.svg`} alt="{team.name} avatar" />

		<h1>{team.name}</h1>

		<a
			href="https://www.faceit.com/en/teams/{team.team_id}"
			target="_blank"
			rel="noreferrer noopener"
		>
			FACEIT
		</a>
	</header>

	<section class="members">
		{#each sortedPlayers as { count, member }}
			<Member {member} {count} percentage={Math.round((count / numMaps) * 100)} />
		{/each}
	</section>

	<section class="season">
		{#if season}
			<h2>
				Season
				<select value={season.season_id} onchange={handleSeasonChange}>
					{#each seasons as s}
						<option value={s.season_id}>{s.season_number}</option>
					{/each}
				</select>
			</h2>
		{/if}

		<TeamMatchesTable matchesData={matchData} />
	</section>

	<section class="charts">
		<div class="chart-container">
			<span class="figure-heading"> Maps played </span>
			<PieFigure
				series={playedCounts.map((c) => c.count)}
				labels={playedCounts.map((c) => c.name)}
				renderLegendValue={mapWinRateSnippet}
				legendPosition="below"
				showValue
			/>
		</div>

		<div class="chart-container">
			<span class="figure-heading"> First bans </span>
			<PieFigure
				series={ban1Counts.map((c) => c.count)}
				labels={ban1Counts.map((c) => c.name)}
				legendPosition="below"
				showValue
			/>
		</div>

		<div class="chart-container">
			<span class="figure-heading"> Second bans </span>
			<PieFigure
				series={ban2Counts.map((c) => c.count)}
				labels={ban2Counts.map((c) => c.name)}
				legendPosition="below"
				showValue
			/>
		</div>

		<div class="chart-container">
			<span class="figure-heading"> Third bans </span>
			<PieFigure
				series={ban3Counts.map((c) => c.count)}
				labels={ban3Counts.map((c) => c.name)}
				legendPosition="below"
				showValue
			/>
		</div>
	</section>
</section>

<style>
	h1 {
		font-size: 1.25rem;
	}

	.team-summary {
		margin: var(--app-margin);
		padding: 1rem;
	}

	header {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: center;
		margin-bottom: 1rem;
	}

	img {
		width: 5rem;
		height: 5rem;
		border-radius: 50%;
	}

	.members {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		flex-wrap: wrap;
		gap: 0.5rem;
		margin: 0 auto;
		width: 100%;
	}

	.season {
		margin: 2em auto;
	}

	.season h2 {
		line-height: 1rem;
	}

	.charts {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 2rem;
	}

	.chart-container {
		border: 1px solid #333;
		border-radius: 2px;
		text-align: center;
		padding: 1rem;
		width: 12rem;
	}

	.figure-heading {
		font-size: 1.2rem;
	}

	.map-win-rate {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.map-win-percentage {
		font-size: 0.75rem;
		text-align: left;
	}
</style>
