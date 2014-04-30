create table if not exists users(
    u_hash varchar(32) not null primary key,
    u_name varchar(30) not null,
    u_email varchar(50) not null,
    u_pw varchar(32) not null
);
