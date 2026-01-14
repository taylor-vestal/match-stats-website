/* Any group (or possibly individual) who organizes events
   Main examples would be CTWC, CTM, CTL */
create table organizations (
	organization_id integer primary key,
	/* Shorthand or acronym version of org name
	   eg: CTWC */
	organization_short_name text not null unique,
	/* Full name of org
	   eg: Classic Tetris World Championship */
	organization_long_name text not null unique
) strict;

/* Type of event
   Tournament, League, etc. */
create table event_types (
	event_type_id integer primary key,
	event_type text not null unique
) strict;

/* Any event that happens one or more times
   Specific instances are in the events table
   eg: CTWC, CTWC DAS, Jonas Cup, CTM Masters, CTM DAS Masters, CTM Challengers */
create table organization_events (
	organization_event_id integer primary key,
	organization_id integer not null,
	event_type_id integer not null,
	organization_event_name text not null unique,
	foreign key (organization_id) references organizations (organization_id) on update cascade,
	foreign key (event_type_id) references event_types (event_type_id) on update cascade
) strict;

/* Event playstyle restrictions
   eg: Open, DAS, Tap */
create table event_playstyles(
	event_playstyle_id integer primary key,
	event_playstyle text not null unique
) strict;

/* Specific instances of events
   eg: CTWC 2025, CTM Masters December 2017 */
create table events (
	event_id integer primary key,
	organization_event_id integer not null,
	--Check guarantees that dates are in ISO format (YYYY-MM-DD) or null
	start_date text check(
		(strftime('%F',start_date) and length(start_date)=10)
		or (start_date is null)),
	end_date text check(
		(strftime('%F',end_date) and length(start_date)=10)
		or (end_date is null)),
	/* Year associated with event, if any
	   Null for events like CTL Seasons  */
	year integer,
	/* Month associated with event, if any.
	   Null for events like CTL Seasons  */
	month integer,
	/* Season number for event, if any
	   eg: 31 for CTL Season 31 */
	season integer,
	/* 1 for in person, 0 for online */
	--Check guarantees boolean integer representation
	in_person integer not null check(in_person in (0,1)),
	event_playstyle_id integer not null,
	/* eg: CTM Masters Dec 2025 */
	event_short_name text not null unique,
	/* eg: Classic Tetris Monthly Masters December 2025 */
	event_long_name text not null unique,
	rounds integer not null,
	event_notes text,
	foreign key (organization_event_id) references organization_events (organization_event_id) on update cascade,
	foreign key (event_playstyle_id) references event_playstyles (event_playstyle_id) on update cascade
) strict;

/* Only in-person events will have a record in this table */
create table event_locations (
	event_location_id integer primary key,
	event_id integer not null,
	/* Name of the actual location */
	venue text,
	/* If part of a larger event, name of that event */
	convention text,
	city text,
	administrative_division text,
	country_id integer not null,
	foreign key (event_id) references events (event_id) on update cascade,
	foreign key (country_id) references countries (country_id) on update cascade
) strict;

/* Classify the type of round
   Especially useful for events like CTWC 2020 & 2021 that change from double-elim to single-elim mid tournament
   eg: Single Elmination Bracket, Winners Bracket, Losers Bracket, Round Robin, Double Round Robin */
create table round_types (
	round_type_id integer primary key,
	round_type text not null,
	/* 1 for elimination round, 0 for non-elmination round */
	--Check guarantees boolean integer representation
	elimination_round integer not null check(elimination_round in (0,1))
) strict;

/* Grouping of matches
   For single elmination tournaments this is fairly simple
   For CTL the round-robin stage has an event_rounds for each Division
   For double-elimination tournaments winners bracket and losers bracket have separate event_rounds */
create table event_rounds (
	event_round_id integer primary key,
	event_id integer not null,
	round_type_id integer not null,
	/* round_number is used for ordering
	   The main purpose is to be able to order an individual players matches in order
	   Except for round-robin/group/swiss rounds, different event_rounds do not share a round_number
	   For standardization: double-elim rounds are numbered biased towards the losers bracket
	     ie: If two rounds of a losers bracket can be played before a winners bracket match
	       is required to "feed into" the losers bracket, they are numbered sequentially and
	       followed by the winners bracket round */
	round_number integer not null,
	/* Preferred nomenclature is Top 32, Top 16, Top 8, Semis, Finals, etc with the first round rounding up
	   For double-elim losers bracket round names will often be unbalanced with the winners bracket
		   to prevent imprecise naming (ie, having Losers Top 8 & Losers Eighths)
		   is is preferred to use the number of players remaining (Losers Top 8 may be followed by Losers Top 6) */
	event_round_name text not null,
	/* Number of players included in this round (forfeits, DQs included) */
	number_of_players_in_round integer not null,
	/* Number of players left in the event as of this round (forfeits, DQs included) */
	number_of_players_remaining integer not null,
	foreign key (event_id) references events (event_id) on update cascade,
	foreign key (round_type_id) references round_types (round_type_id) on update cascade,
	/* An event should never have two rounds with the exact same name */
	unique (event_id, event_round_name)
) strict;

/* Cap imposed on games
   In Open events post-crash, None is assumed to be Tetris Gym with no crashing
   In Open events pre-crash, None is assumed to be vanilla Tetris behavior
   While this is usually decided at the event level it is connected to the match level
     to accomodate for rule changes mid-event
  This is meant to convey what the rules of the match were, not what actually happened
  If something out of the ordinary that should be noted in the match_notes and/or game_notes field
	  and game stats should be adjusted accordingly */
create table cap_types (
	cap_type_id integer primary key,
	cap_type text not null unique
) strict;

/* Country associated with player/event (for in-person events) */
create table countries (
	country_id integer primary key,
	/* This is the IOC 3-letter country code (ie GER for Germany instead of DEU [ISO]) */
	country_code text not null unique,
	/* Full name of country (as defined by ??) */
	country_full_name text not null,
	/* URL of image file for country flag (possibly not necessary if files are IOC.png) */
	country_flag text not null
) strict;

create table players (
	player_id integer primary key,
	username text not null unique,
	/* URL of profile picture */
	profile_picture text,
	country_id integer not null,
	/* URL of main Twitch channel */
	twitch text,
	/* URL of main YouTube channel */
	youtube text,
	foreign key (country_id) references countries (country_id) on update cascade
) strict;

/* Used to signal how a match was decided (eg: played, forfeit, dq)
   Not necessarily sold on the naming */
create table match_outcomes (
	match_outcome_id integer primary key,
	match_outcome text not null unique
) strict;

/* Used to differentiate competitive from friendly matches
   May also have special types like Third Place */
create table match_types (
	match_type_id integer primary key,
	match_type text not null unique
) strict;

/* An individual match between 2 or more players
   There are two separate paths from here: match_results & games -> game_results -> detailed_game_results
	   Every match should have a record in match_results, but not all matches have game level data.
		 And not all matches will game level data have detailed data */
create table matches (
	match_id integer primary key,
	event_round_id integer not null,
	cap_type_id integer not null,
	max_games integer not null default 5,
	/* Not all matches have a single winner so this can be null
	   eg: DAS League has Best of 6 which can tie, CTWC 2010 first round was weird */
	match_winner_player_id integer,
	/* This is used to flag competitive/friendly matches */
	match_type_id integer not null,
	/* This is used to flag regular played matches, forfeits, and DQs */
	match_outcome_id integer not null,
	/* Not expected to be very precise, just enough to allow date range queries */
	--Check guarantees timestamps are in format 'YYYY-MM-DD HH:MM:SS"
	match_timestamp text check(
		(strftime('%F %T',match_timestamp) and length(match_timestamp)=10)
		or (match_timestamp is null)),
	/* Mostly used for anamolies (forfeit, dq reasons) */
	match_notes text,
	foreign key (event_round_id) references event_rounds (event_round_id) on update cascade,
	foreign key (cap_type_id) references cap_types (cap_type_id) on update cascade,
	foreign key (match_type_id) references match_types (match_type_id) on update cascade,
	foreign key (match_outcome_id) references match_outcomes (match_outcome_id) on update cascade,
	foreign key (match_winner_player_id) references players (player_id) on update cascade
) strict;

/* Simple match data - main source for this data is the Match DB */
create table match_results (
	match_result_id integer primary key,
	match_id integer not null,
	player_id integer not null,
	games_won integer,
	foreign key (player_id) references players (player_id),
	foreign key (match_id) references matches (match_id),
	unique (match_id, player_id)
) strict;

/* Used to signal how a game was decided (eg: played, forfeit, dq)
   Not necessarily sold on the naming */
create table game_outcomes (
	game_outcome_id integer primary key,
	game_outcome text not null unique
) strict;

/* Individual games attached to matches */
create table games (
	game_id integer primary key,
	match_id integer not null,
	game_number integer not null,
	starting_level integer default 18,
	/* 1 = same piece sets, 0 = random pieces */
	--Check guarantees boolean integer representation
	same_piece_sets integer not null check(same_piece_sets in (0,1)),
	video_link text,
	game_winner_player_id integer,
	/* This is used to flag regular played games, forfeits, and DQs */
	game_outcome_id integer not null,
	/* Mostly used for anamolies (forfeit, dq reasons) */
	game_notes text,
	foreign key (match_id) references matches (match_id) on update cascade,
	foreign key (game_winner_player_id) references players (player_id) on update cascade,
	foreign key (game_outcome_id) references game_outcomes (game_outcome_id) on update cascade,
	/* Only one game 1, 2, 3, etc per match */
	unique (match_id, game_number)
) strict;

/* Playstyle used by player */
create table playstyles (
	playstyle_id integer primary key,
	playstyle text not null unique
) strict;

/* Type of topout */
create table topout_types (
	topout_type_id integer primary key,
	topout_type text not null unique
) strict;

/* Simple game results, one for each player in a game - main source of data is Match Stats sheets
   for some older matches only score or score & lines may be available */
create table game_results (
	game_result_id integer primary key,
	game_id integer not null,
	player_id integer not null,
	/* playstyle used in game */
	playstyle_id integer not null,
	/* actual end score */
	score integer,
	/*  actual end lines */
	lines integer,
	foreign key (game_id) references games (game_id) on update cascade,
	foreign key (player_id) references players (player_id) on update cascade,
	foreign key (playstyle_id) references playstyles (playstyle_id) on update cascade,
	unique (game_id, player_id)
) strict;

/* Detailed game stats, one for each player in a game - main source of data is Match Stats sheets */
create table detailed_game_results (
	detailed_game_result_id integer primary key,
	game_id integer not null,
	player_id integer not null,
	/* score without mullening */
	no_mullen_score integer,
	/* lines without mullening */
	no_mullen_lines integer,
	/* score at level 19 transition, if transition */
	level_19_transition_score integer,
	/* lines at level 19 transition, if transistion */
	level_19_lines_start integer,
	/* score at level 29 transition, if transition */
	level_29_transition_score integer,
	/* lines at level 29 transition, if transistion */
	level_29_lines_start integer,
	/* score at level 39 transition, if transition */
	level_39_transition_score integer,
	/* lines at level 39 transition, if transistion */
	level_39_lines_start integer,
	topout_type_id integer,
	foreign key (game_id) references games (game_id) on update cascade,
	foreign key (player_id) references players (player_id) on update cascade,
	foreign key (topout_type_id) references topout_types (topout_type_id) on update cascade,
	/* Only one record per player per game */
	unique (game_id, player_id)
) strict;
