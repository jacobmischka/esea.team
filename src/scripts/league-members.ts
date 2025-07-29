import { UnofficialFaceitClient } from '$lib/faceit';

const HEADERS = ['Team name', 'Team ID', 'Team URL', 'Player name', 'Player role', 'Player URL'];

async function fetchConferencePlayers(divisionID: string) {
	const client = new UnofficialFaceitClient(fetch);
	const results = await client.conferenceTeamData('North America', divisionID);

	console.log(HEADERS.join(','));
	for (const result of results) {
		if (!result?.summary) continue;
		for (const player of result.summary.active_members) {
			console.log(
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
}

// adv
// fetchConferencePlayers('84065e93-393d-49e9-8972-f557f80a4922');

// main
// fetchConferencePlayers('a33b73fa-59f6-47d1-bc65-d3ec124e719d');

// IM
fetchConferencePlayers('e283afce-1ed7-4121-a257-0ad3920fe9a6');
