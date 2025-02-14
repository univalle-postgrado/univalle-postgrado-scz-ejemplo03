CREATE TABLE movies (
    id serial PRIMARY KEY,
    title character varying(150) NOT NULL,
    year integer,
    created_at timestamp WITHOUT time zone DEFAULT NOW(),
    updated_at timestamp WITHOUT time zone,
    UNIQUE(title)
);

-- Ejecutar en psql Tool de pgAdmin
CREATE USER univalle WITH PASSWORD '123456';
CREATE DATABASE univalle_dbmovies OWNER univalle;