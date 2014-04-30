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
