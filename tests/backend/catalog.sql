-- Additional catalog/integrity checks as postgres. This file is NOT the RLS proof.
-- Authorization assertions run through PostgREST in local.integration.ts.
do $$
declare
  t text;
  code text;
  place uuid := gen_random_uuid();
  source uuid;
  other_source uuid;
  long_url text;
begin
  foreach t in array array['profiles','places','place_sources','saved_places'] loop
    if not exists (select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public' and c.relname=t and c.relrowsecurity and pg_get_userbyid(c.relowner)='postgres') then
      raise exception 'Missing RLS or wrong owner for %', t;
    end if;
    if has_table_privilege('anon','public.'||t,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') then
      raise exception 'Unexpected anon write privilege for %', t;
    end if;
    if has_table_privilege('authenticated','public.'||t,'TRUNCATE,REFERENCES,TRIGGER') then
      raise exception 'Unexpected privileged operation for %', t;
    end if;
  end loop;
  if has_table_privilege('anon','public.profiles','SELECT')
    or has_table_privilege('anon','public.saved_places','SELECT')
    or has_column_privilege('authenticated','public.profiles','id','UPDATE')
    or has_column_privilege('authenticated','public.profiles','created_at','INSERT,UPDATE')
    or has_column_privilege('authenticated','public.saved_places','created_at','INSERT,UPDATE')
    or has_table_privilege('authenticated','public.profiles','DELETE')
    or has_table_privilege('authenticated','public.saved_places','UPDATE') then
    raise exception 'Unexpected private-table/column privileges';
  end if;
  foreach t in array array['places','place_sources'] loop
    if has_table_privilege('authenticated','public.'||t,'INSERT,UPDATE,DELETE') then
      raise exception 'Unexpected catalog writer';
    end if;
  end loop;
  if exists (select 1 from pg_roles where rolname in ('anon','authenticated') and (rolbypassrls or rolsuper)) then
    raise exception 'Unsafe API role';
  end if;

  insert into public.places(id,slug,title,region,description,why,category,latitude,longitude)
    values(place,'constraint-fixture','Fixture','Fixture','Fixture','Fixture','lake',1,1);
  -- All named contract codes plus an unknown reviewed code remain distinct.
  foreach code in array array['lake','sports_complex','mountain','waterfall','peak','lake_group',
    'waterfall_group','summit','gorge','canyon','plateau','mountain_resort','viewpoint_area','national_park','new_research_category'] loop
    update public.places set category=code where id=place;
    if (select category from public.places where id=place) <> code then raise exception 'Category rewritten'; end if;
  end loop;
  begin
    update public.places set category='Lake Group' where id=place;
    raise exception 'Invalid category accepted';
  exception when check_violation then null; end;
  begin
    update public.places set latitude='NaN'::float8 where id=place;
    raise exception 'NaN accepted';
  exception when check_violation then null; end;
  begin
    update public.places set longitude='Infinity'::float8 where id=place;
    raise exception 'Infinity accepted';
  exception when check_violation then null; end;
  begin
    update public.places set tags=array['unreviewed'] where id=place;
    raise exception 'Invalid tag accepted';
  exception when check_violation then null; end;
  begin
    update public.places set tags=array[null]::text[] where id=place;
    raise exception 'Null tag accepted';
  exception when check_violation then null; end;

  select 'https://example.invalid/' || string_agg(md5(i::text),'') into long_url from generate_series(1,64) i;
  long_url := left(long_url,2048);
  insert into public.place_sources(place_id,kind,field_key,provider,source_url,retrieved_at,is_primary,method,feature,attribution,license)
    values(place,'coordinates','coordinates','Fixture',long_url,'2026-09-30',true,'node','Fixture','Fixture attribution','Fixture license') returning id into source;
  -- Same kind/field, different URL: independent alternate citation survives.
  insert into public.place_sources(place_id,kind,field_key,provider,source_url,retrieved_at,is_primary,method,feature,attribution,license)
    values(place,'coordinates','coordinates','Fixture','https://example.invalid/second','2026-09-30',false,'node','Fixture','Other attribution','Other license') returning id into other_source;
  begin
    update public.place_sources set is_primary=true where id=other_source;
    raise exception 'Two primaries accepted';
  exception when unique_violation then null; end;
  update public.place_sources set is_primary=false where id=source;
  update public.place_sources set is_primary=true where id=other_source;
  if (select count(*) from public.place_sources where place_id=place) <> 2 then raise exception 'Alternative lost during primary swap'; end if;
  begin
    insert into public.place_sources(place_id,kind,field_key,provider,source_url,retrieved_at,method,feature,attribution,license)
      values(place,'coordinates','coordinates','Fixture',long_url,'2026-09-30','node','Fixture','CONFLICT','Fixture license');
    raise exception 'Conflicting duplicate accepted';
  exception when unique_violation then null; end;
  -- Same URL can document another field or a different observation date.
  insert into public.place_sources(place_id,kind,field_key,provider,source_url,retrieved_at,attribution,license)
    values(place,'content','description','Fixture',long_url,'2026-09-30','Fixture attribution','Fixture license');
  insert into public.place_sources(place_id,kind,field_key,provider,source_url,retrieved_at,attribution,license)
    values(place,'content','description','Fixture',long_url,'2026-10-01','Fixture attribution','Fixture license');
  begin
    insert into public.place_sources(place_id,kind,field_key,provider,source_url,retrieved_at,attribution,license)
      values(place,'content','description','Fixture',long_url||'x','2026-09-30','Fixture','Fixture');
    raise exception '2049-byte URL accepted';
  exception when check_violation then null; end;
  begin
    insert into public.place_sources(place_id,kind,field_key,provider,source_url,retrieved_at,attribution,license)
      values(place,'content','description','Fixture','https://example.invalid/'||repeat('я',1024),'2026-09-30','Fixture','Fixture');
    raise exception 'Oversize multibyte URL accepted';
  exception when check_violation then null; end;
  begin
    insert into public.place_sources(place_id,kind,field_key,provider,source_url,retrieved_at,attribution,license)
      values(gen_random_uuid(),'content','description','Fixture','https://example.invalid/missing','2026-09-30','Fixture','Fixture');
    raise exception 'Orphan source accepted';
  exception when foreign_key_violation then null; end;
  insert into public.saved_places(user_id,place_id) select id,place from auth.users limit 1;
  delete from public.places where id=place;
  if exists(select 1 from public.place_sources where place_id=place)
    or exists(select 1 from public.saved_places where place_id=place) then raise exception 'Place cascade failed'; end if;
end $$;
