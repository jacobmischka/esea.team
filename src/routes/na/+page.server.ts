import type { PageServerLoad } from './$types';
import { ESEA_LEAGUE_ID, UnofficialFaceitClient } from '$lib/faceit';

export const load: PageServerLoad = async ({ fetch }) => {
	const client = new UnofficialFaceitClient(fetch);
	const leagueInfo = await client.leagueInfo(ESEA_LEAGUE_ID);
	const filters = await client.leagueFilters(leagueInfo.payload.current_season_id);
	const na = filters.payload.regions.find((r) => r.name === 'North America');
	return { divisions: na?.divisions ?? [] };
};
