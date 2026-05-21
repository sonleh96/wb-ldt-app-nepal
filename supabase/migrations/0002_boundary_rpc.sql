create or replace function analytics.upsert_municipality_boundary(
  p_municipality_id uuid,
  p_source_feature_key text,
  p_geojson text,
  p_raw_properties jsonb
)
returns void
language sql
security definer
set search_path = analytics, public
as $$
  insert into analytics.municipality_boundaries (
    municipality_id,
    source_feature_key,
    geom,
    raw_properties
  )
  values (
    p_municipality_id,
    p_source_feature_key,
    st_multi(st_setsrid(st_geomfromgeojson(p_geojson), 4326)),
    coalesce(p_raw_properties, '{}'::jsonb)
  )
  on conflict (municipality_id) do update
  set
    source_feature_key = excluded.source_feature_key,
    geom = excluded.geom,
    raw_properties = excluded.raw_properties;
$$;

comment on function analytics.upsert_municipality_boundary(uuid, text, text, jsonb) is
'Upserts a municipality boundary from a GeoJSON geometry payload.';
