create table organizations (
	organization_id integer primary key,
	organization_short_name text not null unique,
	organization_long_name text not null unique
) strict;

create table event_types (
	event_type_id integer primary key,
	event_type text not null unique
) strict;

create table organization_events (
	organization_event_id integer primary key,
	organization_id integer not null,
	event_type_id integer not null,
	organization_event_name text not null unique,
	foreign key (organization_id) references organizations (organization_id) on update cascade,
	foreign key (event_type_id) references event_types (event_type_id) on update cascade
) strict;

create table event_playstyles(
	event_playstyle_id integer primary key,
	event_playstyle text not null unique
) strict;

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
	year integer,
	month integer,
	season integer,
	--Check guarantees boolean integer representation
	in_person integer not null check(in_person in (0,1)),
	event_playstyle_id integer not null,
	event_short_name text not null unique,
	event_long_name text not null unique,
	rounds integer not null,
	event_notes text,
	foreign key (organization_event_id) references organization_events (organization_event_id) on update cascade,
	foreign key (event_playstyle_id) references event_playstyles (event_playstyle_id) on update cascade
) strict;

create table event_locations (
	event_location_id integer primary key,
	event_id integer not null,
	venue text,
	convention text,
	city text,
	administrative_division text,
	country_id integer not null,
	foreign key (event_id) references events (event_id) on update cascade,
	foreign key (country_id) references countries (country_id) on update cascade
) strict;

create table round_types (
	round_type_id integer primary key,
	round_type text not null,
	--Check guarantees boolean integer representation
	elimination_round integer not null check(elimination_round in (0,1))
) strict;

create table event_rounds (
	event_round_id integer primary key,
	event_id integer not null,
	round_type_id integer not null,
	round_number integer not null,
	event_round_name text not null,
	number_of_players_in_round integer not null,
	number_of_players_remaining integer not null,
	foreign key (event_id) references events (event_id) on update cascade,
	foreign key (round_type_id) references round_types (round_type_id) on update cascade,
	unique (event_id, event_round_name)
) strict;

create table cap_types (
	cap_type_id integer primary key,
	cap_type text not null unique
) strict;

create table countries (
	country_id integer primary key,
	country_code text not null unique,
	country_full_name text not null,
	country_flag text not null
) strict;

create table players (
	player_id integer primary key,
	username text not null unique,
	profile_picture text,
	country_id integer not null,
	twitch text,
	youtube text,
	foreign key (country_id) references countries (country_id) on update cascade
) strict;

create table match_outcomes (
	match_outcome_id integer primary key,
	match_outcome text not null unique
) strict;

create table match_types (
	match_type_id integer primary key,
	match_type text not null unique
) strict;

create table matches (
	match_id integer primary key,
	event_round_id integer not null,
	cap_type_id integer not null,
	max_games integer not null default 5,
	match_winner_player_id integer,
	match_type_id integer not null,
	match_outcome_id integer not null,
	--Check guarantees timestamps are in format 'YYYY-MM-DD HH:MM:SS"
	match_timestamp text check(
		(strftime('%F %T',match_timestamp) and length(match_timestamp)=19)
		or (match_timestamp is null)),
	match_notes text,
	foreign key (event_round_id) references event_rounds (event_round_id) on update cascade,
	foreign key (cap_type_id) references cap_types (cap_type_id) on update cascade,
	foreign key (match_type_id) references match_types (match_type_id) on update cascade,
	foreign key (match_outcome_id) references match_outcomes (match_outcome_id) on update cascade,
	foreign key (match_winner_player_id) references players (player_id) on update cascade
) strict;

create table match_results (
	match_result_id integer primary key,
	match_id integer not null,
	player_id integer not null,
	games_won integer,
	foreign key (player_id) references players (player_id),
	foreign key (match_id) references matches (match_id),
	unique (match_id, player_id)
) strict;

create table game_outcomes (
	game_outcome_id integer primary key,
	game_outcome text not null unique
) strict;

create table games (
	game_id integer primary key,
	match_id integer not null,
	game_number integer not null,
	starting_level integer default 18,
	--Check guarantees boolean integer representation
	same_piece_sets integer not null check(same_piece_sets in (0,1)),
	video_link text,
	game_winner_player_id integer,
	game_outcome_id integer not null,
	game_notes text,
	foreign key (match_id) references matches (match_id) on update cascade,
	foreign key (game_winner_player_id) references players (player_id) on update cascade,
	foreign key (game_outcome_id) references game_outcomes (game_outcome_id) on update cascade,
	unique (match_id, game_number)
) strict;

create table playstyles (
	playstyle_id integer primary key,
	playstyle text not null unique
) strict;

create table topout_types (
	topout_type_id integer primary key,
	topout_type text not null unique
) strict;

create table game_results (
	game_result_id integer primary key,
	game_id integer not null,
	player_id integer not null,
	playstyle_id integer not null,
	score integer,
	lines integer,
	no_mullen_score integer,
	no_mullen_lines integer,
	level_19_transition_score integer,
	level_19_lines_start integer,
	level_29_transition_score integer,
	level_29_lines_start integer,
	level_39_transition_score integer,
	level_39_lines_start integer,
	topout_type_id integer,
	foreign key (game_id) references games (game_id) on update cascade,
	foreign key (player_id) references players (player_id) on update cascade,
	foreign key (playstyle_id) references playstyles (playstyle_id) on update cascade,
	foreign key (topout_type_id) references topout_types (topout_type_id) on update cascade,
	unique (game_id, player_id)
) strict;
