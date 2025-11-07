import { error } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import { ESEA_LEAGUE_ID, UnofficialFaceitClient } from '$lib/faceit';
import { matchIDRegex } from '$lib/constants';

export const load: PageServerLoad = async ({ fetch, url, params }) => {
	const client = new UnofficialFaceitClient(fetch);

	if (matchIDRegex.test(params.teamID)) {
		return error(400, { message: 'Match ID provided, please provide a team ID instead.' });
	}

	const leagueSummary = await client.teamLeagueSummary(params.teamID);

	const eseaLeague = leagueSummary.payload.find((league) => league.league_id === ESEA_LEAGUE_ID);
	const eseaSeasons = eseaLeague?.league_seasons_info ?? [];
	const seasonID = url.searchParams.get('season_id');
	const season = seasonID
		? eseaSeasons.find((season) => season.season_id === seasonID)
		: eseaSeasons[0];

	const latestESEAChampionships =
		season?.season_standings?.map((stage) => stage.championship_id) ?? [];

	const matchesResponse = await client.teamChampionshipMatches(
		params.teamID,
		latestESEAChampionships,
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
		}),
	);
	return { eseaSeasons, season, matchesResponse, matchIDs, voteHistories };
};
