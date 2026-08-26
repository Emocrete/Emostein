alter table public.ops_events
    add column if not exists read_mobile boolean not null default false,
    add column if not exists read_desktop boolean not null default false;

update public.ops_events
set read_mobile = coalesce(read_mobile, false),
    read_desktop = coalesce(read_desktop, false)
where read_mobile is null or read_desktop is null;

create index if not exists ops_events_normal_mobile_unread_idx
    on public.ops_events (id)
    where event_stream = 'normal' and read_mobile = false;

create index if not exists ops_events_normal_desktop_unread_idx
    on public.ops_events (id)
    where event_stream = 'normal' and read_desktop = false;

create index if not exists ops_events_replay_mobile_unread_idx
    on public.ops_events (session_id, id)
    where event_stream = 'replay' and read_mobile = false;

create index if not exists ops_events_replay_desktop_unread_idx
    on public.ops_events (session_id, id)
    where event_stream = 'replay' and read_desktop = false;
