import type { PageLoad } from './$types';
import { APIFaceitClient } from '$lib/faceit';
import type { MapSummary, MatchData } from '$lib/types';
import type { MapInfo } from '$lib/schemas';
import { PUBLIC_FACEIT_CLIENT_API_KEY } from '$env/static/public';

export const load: PageLoad = async ({ fetch, params, data }) => {
	const client = new APIFaceitClient(fetch, PUBLIC_FACEIT_CLIENT_API_KEY);
	const team = await client.team(params.teamID);
	const { matchIDs, matchesResponse, eseaSeasons, season } = data;

	const getMatchData = async () => {
		const [matches, matchStats] = await Promise.all([
			Promise.all(matchIDs.map((matchID) => client.match(matchID))),
			Promise.all(
				matchIDs.map(async (matchID) => {
					try {
						return [matchID, await client.matchStats(matchID)] as const;
					} catch {
						return [matchID, null] as const;
					}
				}),
			),
		]);

		const matchDataMap = new Map<string, MatchData>();
		for (const championshipMatch of matchesResponse.payload.items) {
			if (championshipMatch.origin) {
				matchDataMap.set(championshipMatch.origin.id, {
					championshipMatch,
					summary: {},
					mapSummaries: [],
					notes: [],
				});
			}
		}
		const mapsMap = new Map<string, MapInfo>();
		const matchTeamFactions = new Map<string, string>();
		for (const match of matches) {
			const data = matchDataMap.get(match.match_id);
			if (data) {
				data.match = match;
				if (match.voting) {
					for (const map of match.voting.map.entities) {
						mapsMap.set(map.guid, map);
					}
				}
				if (match.results) {
					for (const [factionName, matchTeam] of Object.entries(match.teams)) {
						if (matchTeam.faction_id === team.team_id) {
							matchTeamFactions.set(match.match_id, factionName);
							data.summary.teamWin = Boolean(match.results?.winner === factionName);
							data.summary.teamWin = match.results.winner === factionName;
							data.summary.teamScore = match.results?.score[factionName];
						} else {
							data.summary.opponentScore = match.results?.score[factionName];
							data.summary.opponent = matchTeam;
						}
					}
				}
			}
		}

		for (const [matchID, stats] of matchStats) {
			if (stats) {
				const data = matchDataMap.get(matchID);
				if (data) {
					data.stats = stats;
					for (const round of stats.rounds) {
						const map = round.round_stats.Map;
						const mapSummary: MapSummary = {};
						if (map) {
							mapSummary.mapName = mapsMap.get(map)?.name ?? map;
						}
						for (const roundTeam of round.teams) {
							if (roundTeam.team_id === team.team_id) {
								mapSummary.teamWin = roundTeam.team_stats['Team Win'] === 1;
								mapSummary.teamScore = roundTeam?.team_stats['Final Score'];
								if (
									roundTeam?.team_stats['First Half Score'] &&
									roundTeam?.team_stats['Second Half Score']
								) {
									mapSummary.teamHalfScores = [
										roundTeam?.team_stats['First Half Score'],
										roundTeam?.team_stats['Second Half Score'],
									];
								}
								mapSummary.teamPlayers = roundTeam.players;
							} else {
								mapSummary.opponentName = roundTeam?.team_stats.Team;
								mapSummary.opponentScore = roundTeam?.team_stats['Final Score'];
								mapSummary.opponentPlayers = roundTeam.players;
								if (
									roundTeam?.team_stats['First Half Score'] &&
									roundTeam?.team_stats['Second Half Score']
								) {
									mapSummary.opponentHalfScores = [
										roundTeam?.team_stats['First Half Score'],
										roundTeam?.team_stats['Second Half Score'],
									];
								}
							}
						}
						data.mapSummaries.push(mapSummary);
					}

					if (!data.mapSummaries.length) {
						data.notes.push('Match did not complete.');
					}
				}
			}
		}

		for (const voteHistory of await data.voteHistories) {
			if (voteHistory?.payload) {
				const data = matchDataMap.get(voteHistory.payload.match_id);

				const teamFaction = matchTeamFactions.get(voteHistory.payload.match_id);
				if (data) {
					data.voteHistory = voteHistory;
					const mapTicket = voteHistory.payload.tickets.find((t) => t.entity_type === 'map');
					if (mapTicket) {
						data.summary.mapChoices = mapTicket.entities.map((entity) => ({
							choice: entity.status,
							team: entity.selected_by === teamFaction ? 'team' : 'opponent',
							map: mapsMap.get(entity.guid)?.name ?? entity.guid,
						}));
						data.summary.teamMapBans = mapTicket.entities
							.filter((entity) => entity.status === 'drop' && entity.selected_by === teamFaction)
							.map((entity) => mapsMap.get(entity.guid)?.name ?? entity.guid);
					}
				}
			}
		}

		return matchIDs
			.map((matchID) => matchDataMap.get(matchID))
			.filter((data) => data !== undefined);
	};

	return { team, matchData: getMatchData(), matchIDs, eseaSeasons, season };
};
