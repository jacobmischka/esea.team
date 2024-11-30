import type { PageServerLoad } from './$types';
import { ESEA_LEAGUE_ID, UnofficialFaceitClient } from '$lib/faceit';

export const load: PageServerLoad = async ({ fetch, params }) => {
	const client = new UnofficialFaceitClient(fetch);

	const leagueSummary = await client.teamLeagueSummary(params.teamID);

	const latestESEAChampionships =
		leagueSummary.payload
			.find((league) => league.league_id === ESEA_LEAGUE_ID)
			?.league_seasons_info[0]?.season_standings?.map((stage) => stage.championship_id) ?? [];

	const matchesResponse = await client.teamChampionshipMatches(
		params.teamID,
		latestESEAChampionships
	);

	const matchIDs = matchesResponse.payload.items
		.filter((item) => item.status === 'finished')
		.map((item) => item.origin?.id)
		.filter((id) => typeof id === 'string');

	const voteHistories = Promise.all(
		matchIDs.map(async (matchID) => {
			try {
				return await client.voteHistory(matchID);
			} catch {
				return null;
			}
		})
	);
	return { matchesResponse, matchIDs, voteHistories };
};
