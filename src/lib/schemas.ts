import { z } from 'zod';

function transformEmptyString(val: string | undefined): string | undefined {
	if (val === '') return undefined;
	return val;
}

const nonemptyURLSchema = z
	.string()
	.optional()
	.transform(transformEmptyString)
	.pipe(z.string().url().optional());

export const Member = z.object({
	avatar: nonemptyURLSchema,
	country: z.string().optional(),
	faceit_url: z.string().url().optional(),
	membership_type: z.string().optional(),
	memberships: z.array(z.string()).optional(),
	nickname: z.string(),
	skill_level: z.number().optional(),
	user_id: z.string().optional(),
});
export type Member = z.infer<typeof Member>;

export const MatchPlayer = z.object({
	anticheat_required: z.boolean(),
	avatar: nonemptyURLSchema,
	game_player_id: z.string(),
	game_player_name: z.string(),
	game_skill_level: z.number(),
	membership: z.string(),
	nickname: z.string(),
	player_id: z.string(),
});
export type MatchPlayer = z.infer<typeof MatchPlayer>;

export const Team = z.object({
	avatar: nonemptyURLSchema,
	chat_room_id: z.string(),
	cover_image: z.string().url().optional(),
	description: z.string().optional(),
	facebook: z.string().url().optional(),
	faceit_url: z.string().url(),
	game: z.enum(['csgo', 'cs2']),
	leader: z.string(),
	members: z.array(Member),
	name: z.string(),
	nickname: z.string(),
	team_id: z.string(),
	team_type: z.enum(['premade']),
	twitter: z.string().url().optional(),
	website: z.string().url().optional(),
	youtube: z.string().url().optional(),
});
export type Team = z.infer<typeof Team>;

export const MatchTeam = z.object({
	avatar: nonemptyURLSchema,
	faction_id: z.string().optional(),
	leader: z.string(),
	name: z.string(),
	roster: z.array(MatchPlayer).optional(),
	stats: z
		.object({
			rating: z.number(),
			skillLevel: z.object({
				average: z.number(),
				range: z.object({
					max: z.number(),
					min: z.number(),
				}),
			}),
			winProbability: z.number(),
		})
		.optional(),
	substituted: z.boolean().optional(),
	type: z.string(),
});
export type MatchTeam = z.infer<typeof MatchTeam>;

export const MapInfo = z.object({
	guid: z.string(),
	name: z.string(),
	image_sm: nonemptyURLSchema,
});
export type MapInfo = z.infer<typeof MapInfo>;

export const Match = z.object({
	best_of: z.number(),
	broadcast_start_time: z.number().optional(),
	broadcast_start_time_label: z.string().optional(),
	calculate_elo: z.boolean().optional(),
	chat_room_id: z.string().optional(),
	competition_id: z.string().optional(),
	competition_name: z.string().optional(),
	competition_type: z.string().optional(),
	configured_at: z.number().optional(),
	demo_url: z.array(nonemptyURLSchema).optional(),
	detailed_results: z
		.array(
			z.object({
				asc_score: z.boolean(),
				factions: z.record(
					z.object({
						score: z.number(),
					}),
				),
				winner: z.string().optional(),
			}),
		)
		.optional(),
	faceit_url: z.string().url(),
	finished_at: z.number().optional(),
	game: z.string(),
	group: z.number().optional(),
	match_id: z.string(),
	organizer_id: z.string().optional(),
	region: z.string(),
	results: z
		.object({
			score: z.record(z.number()),
			winner: z.string(),
		})
		.optional(),
	round: z.number().optional(),
	scheduled_at: z.number().optional(),
	started_at: z.number().optional(),
	status: z.string(),
	teams: z.record(MatchTeam),
	version: z.number(),
	voting: z
		.object({
			map: z.object({
				entities: z.array(MapInfo),
				pick: z.array(z.string()).nullish(),
			}),
		})
		.optional(),
});
export type Match = z.infer<typeof Match>;

export const TeamPlayer = z.object({
	nickname: z.string(),
	player_id: z.string(),
	// player_stats: z.record(z.any()),
});
export type TeamPlayer = z.infer<typeof TeamPlayer>;

export const MatchStats = z.object({
	rounds: z.array(
		z.object({
			best_of: z.coerce.number(),
			competition_id: z.string().nullish(),
			game_id: z.string(),
			game_mode: z.string(),
			match_id: z.string(),
			match_round: z.coerce.number(),
			played: z.coerce.number(),
			round_stats: z.object({
				Map: z.string().optional(),
				Region: z.string().optional(),
				Rounds: z.coerce.number().optional(),
				Score: z.string().optional(),
				Winner: z.string().optional(),
			}),
			teams: z.array(
				z.object({
					players: z.array(TeamPlayer),
					premade: z.boolean().optional(),
					team_id: z.string(),
					team_stats: z.object({
						'Final Score': z.coerce.number().optional(),
						'First Half Score': z.coerce.number().optional(),
						'Second Half Score': z.coerce.number().optional(),
						Team: z.string().optional(),
						'Team Headshots': z.string().optional(),
						'Team Win': z.coerce.number().optional(),
					}),
				}),
			),
		}),
	),
});
export type MatchStats = z.infer<typeof MatchStats>;

export const TeamChampionshipMatchesResponse = z.object({
	payload: z.object({
		start: z.number(),
		end: z.number(),
		items: z.array(
			z.object({
				status: z.enum(['finished', 'dummy']).or(z.string()),
				origin: z
					.object({
						id: z.string(),
						state: z.enum(['FINISHED']).or(z.string()),
					})
					.optional(),
				championshipId: z.string().optional(),
			}),
		),
	}),
});
export type TeamChampionshipMatchesResponse = z.infer<typeof TeamChampionshipMatchesResponse>;

export const LeagueSeason = z.object({
	season_number: z.coerce.number(),
	season_id: z.string(),
	season_standings: z.array(
		z.object({
			stage_id: z.string(),
			stage_name: z.string(),
			championship_id: z.string(),
		}),
	),
});
export type LeagueSeason = z.infer<typeof LeagueSeason>;

export const TeamLeaugeSummary = z.object({
	payload: z.array(
		z.object({
			league_name: z.string(),
			league_id: z.string(),
			game_id: z.string(),
			league_seasons_info: z.array(LeagueSeason),
			active_members: z.array(
				z.object({
					user_id: z.string(),
					user_name: z.string(),
					team_role: z.enum(['member']).or(z.string()),
					game_role: z.enum(['player', 'substitute', 'coach']).or(z.string()),
				}),
			),
		}),
	),
});
export type TeamLeagueSummary = z.infer<typeof TeamLeaugeSummary>;

export const VoteHistory = z.object({
	payload: z.object({
		match_id: z.string(),
		tickets: z.array(
			z.object({
				entity_type: z.string(),
				vote_type: z.enum(['drop_pick']),
				entities: z.array(
					z.object({
						guid: z.string(),
						status: z.enum(['drop', 'pick']),
						random: z.boolean(),
						round: z.number(),
						selected_by: z.enum(['faction1', 'faction2', '']),
					}),
				),
			}),
		),
	}),
});
export type VoteHistory = z.infer<typeof VoteHistory>;

export const LeagueInfo = z.object({
	payload: z.object({
		league_id: z.string(),
		name: z.string(),
		current_season_id: z.string(),
	}),
});
export type LeagueInfo = z.infer<typeof LeagueInfo>;

export const LeagueTeam = z.object({
	id: z.string(),
	league_team_id: z.string(),
	premade_team_id: z.string(),
	name: z.string(),
	nickname: z.string(),
});
export type LeagueTeam = z.infer<typeof LeagueTeam>;

export const LeagueTeamsResponse = z.object({
	team_count: z.number(),
	offset: z.number(),
	limit: z.number(),
	payload: z.array(LeagueTeam),
});
export type LeagueTeamsResponse = z.infer<typeof LeagueTeamsResponse>;

export const ConferenceStandingsTeam = z.object({
	entity_id: z.string(),
	league_team_id: z.string(),
	premade_team_id: z.string(),
	name: z.string(),
	nickname: z.string(),
});
export type ConferenceStandingsTeam = z.infer<typeof ConferenceStandingsTeam>;

export const ConferenceStandingsResponse = z.object({
	offset: z.number(),
	limit: z.number(),
	payload: z.object({
		standings: z.array(ConferenceStandingsTeam),
	}),
});
export type ConferenceStandingsResponse = z.infer<typeof ConferenceStandingsResponse>;

export const LeagueConference = z.object({
	id: z.string(),
	name: z.string(),
});
export type LeagueConference = z.infer<typeof LeagueConference>;

export const LeagueDivision = z.object({
	id: z.string(),
	name: z.string(),
	stages: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			conferences: z.array(LeagueConference),
		}),
	),
});
export type LeagueDivision = z.infer<typeof LeagueDivision>;

export const LeagueFiltersResponse = z.object({
	payload: z.object({
		season_id: z.string(),
		regions: z.array(
			z.object({
				id: z.string(),
				name: z.string(),
				divisions: z.array(LeagueDivision),
			}),
		),
	}),
});
export type LeagueFiltersResponse = z.infer<typeof LeagueFiltersResponse>;
