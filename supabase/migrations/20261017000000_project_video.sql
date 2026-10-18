-- Lets a portfolio project carry a playable video link (YouTube, Vimeo,
-- Google Drive or a direct video file URL).
alter table public.projects add column if not exists video_url text;
