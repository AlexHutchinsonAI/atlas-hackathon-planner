-- Review and approve before executing on the existing database. Not run automatically.
-- No existing planner table, record, role or permission is modified.
CREATE TABLE IF NOT EXISTS atlas_member_profiles (
 scope text NOT NULL CHECK (scope IN ('production','preview')),
 member_key char(64) NOT NULL,
 display_name varchar(60) NOT NULL DEFAULT 'Workspace member',
 photo_png bytea,
 photo_version uuid,
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (scope,member_key),
 CHECK (photo_png IS NULL OR octet_length(photo_png)<=300000),
 CHECK ((photo_png IS NULL)=(photo_version IS NULL))
);
CREATE TABLE IF NOT EXISTS atlas_member_sessions (
 scope text NOT NULL CHECK (scope IN ('production','preview')),
 member_key char(64) NOT NULL,
 session_id uuid NOT NULL,
 last_seen timestamptz NOT NULL DEFAULT now(),
 ended_at timestamptz,
 PRIMARY KEY (scope,member_key,session_id)
);
CREATE INDEX IF NOT EXISTS atlas_member_sessions_live ON atlas_member_sessions(scope,member_key,last_seen) WHERE ended_at IS NULL;
