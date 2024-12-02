<script lang="ts">
	import type { Team, Member as TeamMember } from '$lib/schemas';
	import type { MatchData } from '$lib/types';
	import { trimTrailingZeroesAndDots } from '$lib/utils';
	import PieFigure from '$lib/components/PieFigure.svelte';
	import Member from '$lib/components/Member.svelte';
	import TeamMatchesTable from '$lib/components/TeamMatchesTable.svelte';
	import { assets } from '$app/paths';
	import { dev } from '$app/environment';

	export let matchData: MatchData[];
	export let team: Team;

	if (dev) {
		console.debug({ matchData, team });
	}

	const playerMap = new Map<string, { member: TeamMember; count: number }>();
	for (const member of team.members) {
		playerMap.set(member.nickname, { member, count: 0 });
	}

	const numMaps = matchData.reduce((acc, matchData) => acc + matchData.mapSummaries.length, 0);
	const mapWinCounts = new Map<string, number>();

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
			{trimTrailingZeroesAndDots(
				(((mapWinCounts.get(mapName) ?? 0) / mapCount) * 100).toFixed(2)
			)}% WR
		</span>
		<span class="map-play-count">
			{mapCount}
		</span>
	</span>
{/snippet}

<section>
	<header>
		<img src={team.avatar || `${assets}/placeholder.svg`} alt="{team.name} avatar" />

		<h1>{team.name}</h1>

		<a href="https://www.faceit.com/en/teams/{team.team_id}">FACEIT</a>
	</header>

	<div class="members">
		{#each sortedPlayers as { count, member }}
			<Member {member} {count} percentage={Math.round((count / numMaps) * 100)} />
		{/each}
	</div>

	<TeamMatchesTable matchesData={matchData} />

	<div class="charts">
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
	</div>
</section>

<style>
	h1 {
		font-size: 1.25rem;
	}

	section {
		margin: 0 6rem;
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

	.charts {
		display: flex;
		gap: 2rem;
	}

	.chart-container {
		border: 1px solid #333;
		border-radius: 2px;
		text-align: center;
		padding: 1rem;
		width: 20rem;
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
