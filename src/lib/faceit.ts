const API_BASE_URL = 'https://open.faceit.com/data/v4';

export const ESEA_LEAGUE_ID = 'a14b8616-45b9-4581-8637-4dfd0b5f6af8';

import {
	Match,
	MatchStats,
	Team,
	TeamChampionshipMatchesResponse,
	TeamLeaugeSummary,
	VoteHistory,
	type TeamLeagueSummary,
} from './schemas';

export class APIError extends Error {
	response: Response;

	constructor(response: Response) {
		super(response.statusText);
		this.response = response;
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
			throw new APIError(response);
		}

		return response.json();
	}
}

export class UnofficialFaceitClient extends BaseFaceitClient {
	public async teamChampionshipMatches(teamID: string, championshipIDs: string[]) {
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
			`https://www.faceit.com/api/team-leagues/v1/teams/${teamID}/profile/leagues/summary`
		);
		return TeamLeaugeSummary.parseAsync(data);
	}

	public async voteHistory(matchID: string): Promise<VoteHistory> {
		const data = await this.fetch(
			`https://www.faceit.com/api/democracy/v1/match/${matchID}/history`
		);
		return VoteHistory.parseAsync(data);
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
