"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Search,
  X,
  Map,
  Mountain,
  Bookmark,
  ArrowRight,
} from "lucide-react";
import { AppShell, FilterChip } from "@/components/almaway";
import { SaveButton } from "@/components/demo-state";
import { PhotoCredit } from "@/components/editorial";
import { touristPlaces } from "@/lib/tourist-places";
const ideas = [
  { title: "Ущелье Аюсай", tag: "Рядом" },
  { title: "Кольсайские озёра", tag: "На выходные" },
];
export default function Explore() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Все места");
  const search = query.trim().toLocaleLowerCase("ru");
  const places = touristPlaces.filter(
    (p) =>
      (!search ||
        `${p.title} ${p.region}`.toLocaleLowerCase("ru").includes(search)) &&
      (filter === "Все места" ||
        p.filters.includes(filter as "Горы" | "Озёра")),
  );
  const lake = places.find((p) => p.slug === "bolshoe-almatinskoe-ozero");
  return (
    <AppShell className="content-shell">
      <main className="content-page discover-page">
        <header className="product-heading">
          <div>
            <span className="eyebrow">КАЗАХСТАН · НАЧИНАЕМ С АЛМАТЫ</span>
            <h1>Куда тебя тянет?</h1>
          </div>
          <Link
            href="/map"
            className="icon-button"
            aria-label="Исследовать карту"
          >
            <Map />
          </Link>
        </header>
        <div className="discovery-search">
          <Search aria-hidden="true" />
          <input
            type="search"
            aria-label="Найти место"
            placeholder="Озеро, гора или любимое место"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button aria-label="Очистить поиск" onClick={() => setQuery("")}>
              <X />
            </button>
          )}
        </div>
        <div className="chip-row discovery-filters">
          {["Все места", "Озёра", "Горы", "С видом"].map((x) => (
            <FilterChip
              key={x}
              active={filter === x}
              onClick={() => setFilter(x)}
            >
              {x}
            </FilterChip>
          ))}
        </div>
        <div className="discovery-layout">
          <div>
            {lake && (
              <article className="discovery-feature">
                <figure>
                  <Link
                    href={`/places/${lake.slug}`}
                    aria-label={`Открыть: ${lake.title}`}
                  >
                    <img
                      src="/images/bao.webp"
                      alt="Большое Алматинское озеро зимой, снежные склоны и открытая вода"
                      width="1350"
                      height="1800"
                      fetchPriority="high"
                    />
                  </Link>
                  <span className="image-label">01 / ОЗЕРО</span>
                  <SaveButton
                    slug={lake.slug}
                    title={lake.title}
                    className="image-save"
                  >
                    <Bookmark />
                  </SaveButton>
                </figure>
                <div className="feature-caption">
                  <div>
                    <span className="eyebrow">ЗАИЛИЙСКИЙ АЛАТАУ</span>
                    <Link href={`/places/${lake.slug}`}>
                      <h2>{lake.title}</h2>
                    </Link>
                  </div>
                  <Link
                    className="icon-button"
                    href={`/map?place=${lake.slug}`}
                    aria-label="Большое Алматинское озеро на карте"
                  >
                    <ArrowUpRight />
                  </Link>
                </div>
                <PhotoCredit />
              </article>
            )}
            {!places.length && (
              <section className="search-empty" role="status">
                <Search />
                <h2>Место не найдено</h2>
                <p>
                  В каталоге пока пять мест рядом с Алматы. Попробуй другое
                  название или категорию.
                </p>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setQuery("");
                    setFilter("Все места");
                  }}
                >
                  Показать все места
                </button>
              </section>
            )}
            {places.filter((p) => p !== lake).length > 0 && (
              <section className="place-directory">
                <div className="section-head">
                  <h2>{search ? "Результаты поиска" : "Ещё ближе к горам"}</h2>
                  <span className="count-label">
                    {places.filter((p) => p !== lake).length} места
                  </span>
                </div>
                {places
                  .filter((p) => p !== lake)
                  .map((p, i) => (
                    <article className="discovery-row" key={p.slug}>
                      <Link
                        href={`/places/${p.slug}`}
                        className="directory-photo"
                        aria-label={`Открыть: ${p.title}`}
                      >
                        {p.slug === "medeo" ? (
                          <img
                            src="/images/medeo.webp"
                            alt="Медео, вид на спортивный комплекс"
                            width="1150"
                            height="776"
                            loading="lazy"
                          />
                        ) : (
                          <Mountain aria-hidden="true" />
                        )}
                      </Link>
                      <Link href={`/places/${p.slug}`}>
                        <span className="eyebrow">
                          0{i + 2} / {p.category}
                        </span>
                        <h3>{p.title}</h3>
                        <span className="row-region">
                          {p.region}
                          {p.slug !== "medeo" ? " · фото готовится" : ""}
                        </span>
                      </Link>
                      <SaveButton
                        slug={p.slug}
                        title={p.title}
                        className="icon-button"
                      >
                        <Bookmark />
                      </SaveButton>
                    </article>
                  ))}
                {places.some((p) => p.slug === "medeo") && (
                  <PhotoCredit photo="medeo" />
                )}
              </section>
            )}
          </div>
          <aside className="discovery-aside">
            <Link href="/journal" className="journal-invite">
              <span className="eyebrow">ПОЛЕВОЙ ЖУРНАЛ · ДЕМО</span>
              <h2>
                Места становятся
                <br />
                <em>историями.</em>
              </h2>
              <p>
                Фотографии, заметки и моменты, которые хочется оставить себе.
              </p>
              <span className="text-action">
                Заглянуть в журнал <ArrowRight />
              </span>
            </Link>
            <Link href="/plan" className="trip-invite">
              <span className="eyebrow">СЛЕДУЮЩИЙ ШАГ</span>
              <h2>От идеи к поездке</h2>
              <p>Познакомься с демо планировщика.</p>
              <ArrowUpRight />
            </Link>
            <p className="demo-notice">
              Сохранения — на время сессии. Перед поездкой проверь погоду и
              ограничения.
            </p>
          </aside>
        </div>
        {!search && filter === "Все места" && (
          <section className="coming-places">
            <h2>На горизонте</h2>
            <p>Расширяем атлас. Эти места ещё не готовы к открытию.</p>
            {ideas.map((x) => (
              <article key={x.title}>
                <h3>{x.title}</h3>
                <p>Скоро в каталоге · сведения проверяются.</p>
              </article>
            ))}
          </section>
        )}
      </main>
    </AppShell>
  );
}
