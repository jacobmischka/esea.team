import { ESEA_LEAGUE_ID, UnofficialFaceitClient } from '$lib/faceit';
import type { RequestHandler } from '@sveltejs/kit';

const HEADERS = ['Team name', 'Team ID', 'Team URL', 'Player name', 'Player role', 'Player URL'];

export const GET: RequestHandler<{ divisionID: string }> = async ({ fetch, params }) => {
	const client = new UnofficialFaceitClient(fetch);
	const leagueInfo = await client.leagueInfo(ESEA_LEAGUE_ID);
	const results = await client.conferenceTeamData(
		leagueInfo.payload.current_season_id,
		'North America',
		params.divisionID
	);

	const response = [HEADERS.join(',')];
	for (const result of results) {
		if (!result?.summary) continue;
		for (const player of result.summary.active_members) {
			response.push(
				[
					result.team.name,
					result.team.premade_team_id,
					`https://faceit.com/en/teams/${result.team.premade_team_id}/leagues`,
					player.user_name,
					player.game_role,
					`https://www.faceit.com/en/players/${player.user_name}`,
				].join(',')
			);
		}
	}
	return new Response(response.join('\n'));
};
