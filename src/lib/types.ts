import type {
	ConferenceStandingsTeam,
	Match,
	MatchStats,
	MatchTeam,
	TeamChampionshipMatchesResponse,
	TeamLeagueSummary,
	TeamPlayer,
	VoteHistory,
} from './schemas';

export interface MapChoice {
	team: 'team' | 'opponent';
	choice: 'drop' | 'pick';
	map: string;
}

export interface MatchSummary {
	teamWin?: boolean;
	teamScore?: number;
	opponentScore?: number;
	opponent?: MatchTeam;
	mapChoices?: MapChoice[];
	teamMapBans?: string[];
	teamMapPicks?: string[];
}

export interface MapSummary {
	teamWin?: boolean;
	mapName?: string;
	teamScore?: number;
	teamHalfScores?: [number, number];
	teamPlayers?: TeamPlayer[];
	opponentName?: string;
	opponentScore?: number;
	opponentHalfScores?: [number, number];
	opponentPlayers?: TeamPlayer[];
}

export interface MatchData {
	championshipMatch: TeamChampionshipMatchesResponse['payload']['items'][number];
	match?: Match;
	stats?: MatchStats;
	voteHistory?: VoteHistory;
	summary: MatchSummary;
	mapSummaries: MapSummary[];
	notes: string[];
}

export interface ConferenceTeamData {
	team: ConferenceStandingsTeam;
	summary: TeamLeagueSummary['payload'][number];
}
