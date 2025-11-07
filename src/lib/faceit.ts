const API_BASE_URL = 'https://open.faceit.com/data/v4';

export const ESEA_LEAGUE_ID = 'a14b8616-45b9-4581-8637-4dfd0b5f6af8';

import {
	ConferenceStandingsResponse,
	ConferenceStandingsTeam,
	LeagueFiltersResponse,
	LeagueInfo,
	LeagueTeamsResponse,
	Match,
	MatchStats,
	Team,
	TeamChampionshipMatchesResponse,
	TeamLeaugeSummary,
	VoteHistory,
	type TeamLeagueSummary,
} from './schemas';
import type { ConferenceTeamData } from './types';

export class APIError extends Error {
	pathOrURL: string | URL | undefined;
	response: Response;

	constructor(response: Response, pathOrURL?: string | URL) {
		super(response.statusText);
		this.response = response;
		this.pathOrURL = pathOrURL;
	}
}

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

class BaseFaceitClient {
	protected fetcher: Fetcher;

	constructor(fetcher: Fetcher) {
		this.fetcher = fetcher;
	}

	protected async fetch(pathOrURL: string | URL, init: RequestInit = {}): Promise<Response> {
		let url = pathOrURL;
		const headers: HeadersInit = {
			...init.headers,
			'Content-Type': 'application/json',
		};

		if (typeof pathOrURL === 'string' && pathOrURL.startsWith('/')) {
			url = `${API_BASE_URL}/${pathOrURL.substring(1)}`;
		}

		const response = await this.fetcher(url, {
			headers,
			...init,
		});

		if (!response.ok) {
			throw new APIError(response, url);
		}

		return response.json();
	}
}

export class UnofficialFaceitClient extends BaseFaceitClient {
	public async leagueInfo(leagueID: string): Promise<LeagueInfo> {
		const data = await this.fetch(`https://www.faceit.com/api/team-leagues/v2/leagues/${leagueID}`);
		return LeagueInfo.parseAsync(data);
	}

	public async teamChampionshipMatches(
		teamID: string,
		championshipIDs: string[],
	): Promise<TeamChampionshipMatchesResponse> {
		const url = new URL('https://www.faceit.com/api/championships/v1/matches');
		url.searchParams.set('participantId', teamID);
		url.searchParams.set('participantType', 'TEAM');
		url.searchParams.set('limit', '100');
		url.searchParams.set('offset', '0');
		url.searchParams.set('sort', 'ASC');
		for (const championshipID of championshipIDs) {
			url.searchParams.append('championshipId', championshipID);
		}
		const data = await this.fetch(url);
		return TeamChampionshipMatchesResponse.parseAsync(data);
	}

	public async teamLeagueSummary(teamID: string): Promise<TeamLeagueSummary> {
		const data = await this.fetch(
			`https://www.faceit.com/api/team-leagues/v1/teams/${teamID}/profile/leagues/summary`,
		);
		return TeamLeaugeSummary.parseAsync(data);
	}

	public async voteHistory(matchID: string): Promise<VoteHistory> {
		const data = await this.fetch(
			`https://www.faceit.com/api/democracy/v1/match/${matchID}/history`,
		);
		return VoteHistory.parseAsync(data);
	}

	public async conferenceTeams(
		conferenceID: string,
		offset: number = 0,
		limit: number = 25,
	): Promise<LeagueTeamsResponse> {
		const searchParams = new URLSearchParams({
			conferenceId: conferenceID,
			offset: offset.toString(),
			limit: limit.toString(),
		});
		const data = await this.fetch(
			`https://www.faceit.com/api/team-leagues/v2/conferences/${conferenceID}/registrations?${searchParams}`,
		);
		return LeagueTeamsResponse.parseAsync(data);
	}

	public async conferenceStandings(
		conferenceID: string,
		offset: number = 0,
		limit: number = 100,
	): Promise<ConferenceStandingsResponse> {
		const searchParams = new URLSearchParams({
			entityType: 'conference',
			entityId: conferenceID,
			offset: offset.toString(),
			limit: limit.toString(),
		});
		const data = await this.fetch(
			`https://www.faceit.com/api/team-leagues/v2/standings?${searchParams}`,
		);
		return ConferenceStandingsResponse.parseAsync(data);
	}

	public async leagueFilters(seasonID: string): Promise<LeagueFiltersResponse> {
		const data = await this.fetch('https://www.faceit.com/api/team-leagues/v1/get_filters', {
			method: 'POST',
			body: JSON.stringify({
				seasonId: seasonID,
			}),
		});
		return LeagueFiltersResponse.parseAsync(data);
	}

	public async conferenceTeamData(
		seasonID: string,
		regionName: string,
		divisionID: string,
	): Promise<ConferenceTeamData[]> {
		const filters = await this.leagueFilters(seasonID);
		const na = filters.payload.regions.find((r) => r.name === regionName);
		const division = na?.divisions.find((d) => d.id === divisionID);

		const teamMap = new Map<string, ConferenceStandingsTeam>();
		const promises: Promise<ConferenceTeamData | null>[] = [];
		if (division) {
			for (const stage of division.stages) {
				for (const conference of stage.conferences) {
					let offset = 0;
					while (true) {
						const page = await this.conferenceStandings(conference.id, offset);
						if (!page.payload.standings.length) break;

						offset += page.payload.standings.length;
						for (const team of page.payload.standings) {
							if (!teamMap.has(team.premade_team_id)) {
								promises.push(
									this.teamLeagueSummary(team.premade_team_id)
										.catch((err) => {
											console.debug('Failed to find team', team, err);
											return null;
										})
										.then((resp) => {
											if (!resp?.payload?.length) {
												console.debug('Failed to find team', team, resp);
												return null;
											}
											return {
												team,
												summary: resp?.payload[0],
											};
										}),
								);
							}
							teamMap.set(team.premade_team_id, team);
						}
					}
				}
			}
		}

		const results = (await Promise.allSettled(promises))
			.filter((r) => r.status === 'fulfilled')
			.filter((r) => !!r.value?.summary)
			.map((r) => r.value)
			.filter((r) => !!r)
			.sort((a, b) => {
				if (!a && b) return -1;
				if (a && !b) return 1;
				if (a && b) return a.team.name.localeCompare(b.team.name);
				return 0;
			});

		for (const s of results) {
			s.summary.active_members.sort((a, b) => {
				if (a.game_role === 'player' && b.game_role !== 'player') return -1;
				if (b.game_role === 'player' && a.game_role !== 'player') return 1;
				return a.user_name.localeCompare(b.user_name);
			});
		}
		return results;
	}
}

export class APIFaceitClient extends BaseFaceitClient {
	private apiKey: string | undefined;

	constructor(fetcher: Fetcher, apiKey: string) {
		super(fetcher);
		this.apiKey = apiKey;
	}

	protected async fetch(pathOrURL: string | URL, init: RequestInit = {}): Promise<Response> {
		return super.fetch(pathOrURL, {
			...init,
			headers: {
				...init.headers,
				Authorization: `Bearer ${this.apiKey}`,
			},
		});
	}

	public async team(teamID: string): Promise<Team> {
		const data = await this.fetch(`/teams/${teamID}`);
		return Team.parseAsync(data);
	}

	public async match(matchID: string): Promise<Match> {
		const data = await this.fetch(`/matches/${matchID}`);
		return Match.parseAsync(data);
	}

	public async matchStats(matchID: string): Promise<MatchStats> {
		const data = await this.fetch(`/matches/${matchID}/stats`);
		return MatchStats.parseAsync(data);
	}
}
