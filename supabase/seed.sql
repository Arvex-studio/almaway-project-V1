-- LOCAL reviewed fixture only. See seeds/reviewed-five.json and docs/backend-foundation.md.
-- Never invoked as a hosted data migration. Fail on existing identities; no overwrites.
begin;
insert into public.places (id, slug, title, region, description, why, category, latitude, longitude, tags, image_url) values ('10000000-0000-4000-8000-000000000001', 'bolshoe-almatinskoe-ozero', 'Большое Алматинское озеро', 'Заилийский Алатау', 'Большое Алматинское озеро в Заилийском Алатау.', 'Озеро в горном окружении.', 'lake', 43.0510419, 76.9853383, array['lakes','scenic','weekend']::text[], null);
insert into public.place_sources (id, kind, field_key, provider, source_url, retrieved_at, is_primary, method, feature, attribution, license, place_id) values ('20000000-0000-4000-8000-000000000001', 'coordinates', 'coordinates', 'OpenStreetMap', 'https://www.openstreetmap.org/relation/3427772', '2026-09-30', true, 'bounding-box-center', 'Big Almaty Lake; natural=water; water=lake', 'OpenStreetMap contributors', 'ODbL-1.0', '10000000-0000-4000-8000-000000000001');
insert into public.places (id, slug, title, region, description, why, category, latitude, longitude, tags, image_url) values ('10000000-0000-4000-8000-000000000002', 'medeo', 'Медео', 'Заилийский Алатау', 'Высокогорный спортивный комплекс в Малоалматинском ущелье.', 'Горное окружение и отправная точка для знакомства с Малоалматинским ущельем.', 'sports_complex', 43.1570802, 77.059452, array['mountains','scenic']::text[], null);
insert into public.place_sources (id, kind, field_key, provider, source_url, retrieved_at, is_primary, method, feature, attribution, license, place_id) values ('20000000-0000-4000-8000-000000000002', 'coordinates', 'coordinates', 'OpenStreetMap', 'https://www.openstreetmap.org/way/171504564', '2026-09-30', true, 'bounding-box-center', 'Medeu; leisure=sports_centre; Wikidata Q864796', 'OpenStreetMap contributors', 'ODbL-1.0', '10000000-0000-4000-8000-000000000002');
insert into public.places (id, slug, title, region, description, why, category, latitude, longitude, tags, image_url) values ('10000000-0000-4000-8000-000000000003', 'kok-tobe', 'Кок-Тобе', 'Алматы', 'Гора Кок-Тобе с видом на Алматы.', 'Панорама города на фоне гор Заилийского Алатау.', 'mountain', 43.2328701, 76.9760743, array['mountains','scenic']::text[], null);
insert into public.place_sources (id, kind, field_key, provider, source_url, retrieved_at, is_primary, method, feature, attribution, license, place_id) values ('20000000-0000-4000-8000-000000000003', 'coordinates', 'coordinates', 'OpenStreetMap', 'https://www.openstreetmap.org/node/12985379969', '2026-09-30', true, 'node', 'Kok-Tobe; natural=peak; ele=1130', 'OpenStreetMap contributors', 'ODbL-1.0', '10000000-0000-4000-8000-000000000003');
insert into public.places (id, slug, title, region, description, why, category, latitude, longitude, tags, image_url) values ('10000000-0000-4000-8000-000000000004', 'butakovskiy-vodopad', 'Бутаковский водопад', 'Заилийский Алатау', 'Водопад в Бутаковском ущелье.', 'Природная точка в горном ущелье рядом с Алматы.', 'waterfall', 43.1723059, 77.1140067, array['mountains','scenic']::text[], null);
insert into public.place_sources (id, kind, field_key, provider, source_url, retrieved_at, is_primary, method, feature, attribution, license, place_id) values ('20000000-0000-4000-8000-000000000004', 'coordinates', 'coordinates', 'OpenStreetMap', 'https://www.openstreetmap.org/node/1843570839', '2026-09-30', true, 'node', 'Butakovskiy waterfall; tourism=attraction', 'OpenStreetMap contributors', 'ODbL-1.0', '10000000-0000-4000-8000-000000000004');
insert into public.places (id, slug, title, region, description, why, category, latitude, longitude, tags, image_url) values ('10000000-0000-4000-8000-000000000005', 'furmanovka', 'Фурмановка', 'Заилийский Алатау', 'Вершина Фурманова в Заилийском Алатау.', 'Горная вершина над Малоалматинским ущельем.', 'peak', 43.1498971, 77.115667, array['mountains','scenic']::text[], null);
insert into public.place_sources (id, kind, field_key, provider, source_url, retrieved_at, is_primary, method, feature, attribution, license, place_id) values ('20000000-0000-4000-8000-000000000005', 'coordinates', 'coordinates', 'OpenStreetMap', 'https://www.openstreetmap.org/node/3718134916', '2026-09-30', true, 'node', 'Furmanov; natural=peak; loc_name=Фурмановка', 'OpenStreetMap contributors', 'ODbL-1.0', '10000000-0000-4000-8000-000000000005');

-- Publication gate: exactly one compatible primary for every local seed place.
do $$
begin
  if exists (
    select 1 from public.places p
    where (select count(*) from public.place_sources s
      where s.place_id = p.id and s.kind = 'coordinates' and s.field_key = 'coordinates'
      and s.is_primary and s.provider = 'OpenStreetMap'
      and s.method in ('node', 'bounding-box-center')
      and s.source_url ~ '^https://www[.]openstreetmap[.]org/(node|way|relation)/[0-9]+$'
      and s.attribution = 'OpenStreetMap contributors' and s.license = 'ODbL-1.0') <> 1
      or p.image_url is not null
  ) then
    raise exception 'Local seed publication validation failed';
  end if;
end $$;
update public.places set status = 'published';
commit;
