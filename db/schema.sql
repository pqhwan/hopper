create table if not exists users(
    u_hash varchar(32) not null primary key, --MD5 (name+email)
    u_name varchar(30) not null,
    u_email varchar(50) not null,
    u_pw varchar(32) not null --MD5 (plaintext)
);


create table if not exists parties(
    p_hash varchar(32) not null primary key, --MD5(name+hosthash)
    p_hosthash varchar(32) not null,
    p_hostname varchar(30) not null,
    p_name varchar(30) not null,
    p_created timestamp not null,
    p_coord_x float not null,
    p_coord_y float not null,
    p_description varchar(140),
    p_start timestamp,
    p_end timestamp, 
    p_upvotes smallint
);

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
