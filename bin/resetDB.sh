#! /bin/bash

sqlite3 $1 << 'END_SQL'

DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username NOT NULL,
  avathar_url
);
DROP TABLE IF EXISTS stories;
CREATE TABLE stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  created_by INTEGER,
  content TEXT
);
DROP TABLE IF EXISTS published_stories;
CREATE TABLE published_stories (
  story_id INTEGER PRIMARY KEY,
  published_at TIMESTAMP,
  views INTEGER DEFAULT 0
);
DROP TABLE IF EXISTS claps;
CREATE TABLE claps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER,
  clapped_by INTEGER
);
DROP TABLE IF EXISTS responses;
CREATE TABLE responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  response_on INTEGER,
  responded_by INTEGER,
  responded_at TIMESTAMP,
  response TEXT
);
DROP TABLE IF EXISTS followers;
CREATE TABLE followers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  follower_id INTEGER
);
DROP TABLE IF EXISTS tags;
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER,
  tag TEXT
);

END_SQL
