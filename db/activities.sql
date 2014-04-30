create table if not exists activities(
    a_when timestamp not null,
    a_userhash varchar(32) not null,
    a_username varchar(30) not null,
    a_verb smallint not null, --0:upvoted 1:created
    a_partyhash varchar(32) not null,
    a_partyname varchar(32) not null,
    a_description varchar(140),
    primary key(a_when, a_username)
);
