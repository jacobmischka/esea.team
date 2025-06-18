import type {
	Match,
	MatchStats,
	MatchTeam,
	TeamChampionshipMatchesResponse,
	TeamPlayer,
	VoteHistory,
} from './schemas';

export interface MapBan {
	team: 'team' | 'opponent';
	map: string;
}

export interface MatchSummary {
	teamWin?: boolean;
	teamScore?: number;
	opponentScore?: number;
	opponent?: MatchTeam;
	mapBans?: MapBan[];
	teamMapBans?: string[];
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
