"use client";

import { useState } from "react";
import Link from "next/link";
import { PhotoCredit } from "@/components/editorial";
import { Bookmark, ChevronRight, Map, Route } from "lucide-react";
import { AppShell } from "@/components/almaway";
import { useDemoSaved, SaveButton } from "@/components/demo-state";
import { touristPlaces } from "@/lib/tourist-places";
export default function SavedPage() {
  const [tab, setTab] = useState("Места");
  const { savedSlugs } = useDemoSaved();
  const places = touristPlaces.filter((place) =>
    savedSlugs.includes(place.slug),
  );
  return (
    <AppShell className="content-shell">
      <main className="content-page">
        <header className="page-header">
          <div>
            <span className="eyebrow">ALMAWAY / ТВОЁ</span>
            <h1>Сохранённое</h1>
            <p>Места и планы, к которым хочется вернуться.</p>
          </div>
          <Bookmark className="page-mark" />
        </header>
        <p className="demo-notice">
          Демо-сохранения · одно место добавлено для примера. Изменения хранятся
          только в памяти этой вкладки и сбрасываются при перезагрузке. Аккаунт
          не подключён.
        </p>
        <div className="segmented" aria-label="Тип сохранённого">
          {["Места", "Маршруты", "Планы"].map((item) => (
            <button
              type="button"
              aria-pressed={tab === item}
              className={tab === item ? "selected" : ""}
              onClick={() => setTab(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        {tab === "Места" && places.length > 0 ? (
          places.map((place) => (
            <article key={place.slug} className="saved-card">
              <figure>
                <div
                  className="saved-image"
                  style={{
                    backgroundImage: place.image
                      ? `url(${place.image})`
                      : undefined,
                  }}
                />
                {place.image && <PhotoCredit />}
              </figure>
              <div>
                <span className="eyebrow">{place.region}</span>
                <h2>{place.title}</h2>
                <p>Параметры маршрута уточняются.</p>
                <SaveButton
                  slug={place.slug}
                  title={place.title}
                  className="saved-remove"
                >
                  Убрать из сохранённого
                </SaveButton>
                <div className="card-actions">
                  <Link
                    href={`/places/${place.slug}`}
                    className="secondary-button"
                  >
                    Открыть <ChevronRight />
                  </Link>
                  <Link
                    href={`/map?place=${place.slug}`}
                    className="primary-button"
                  >
                    На карте <Map />
                  </Link>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            <Route />
            <h2>Здесь появятся {tab.toLowerCase()}</h2>
            <p>
              {tab === "Места"
                ? "Сохрани место из Открытий — оно появится здесь до перезагрузки страницы."
                : "Сохранение маршрутов и планов пока не подключено."}
            </p>
            <Link
              href={tab === "Планы" ? "/plan" : "/explore"}
              className="primary-button"
            >
              Найти идеи
            </Link>
          </div>
        )}
        <section className="saved-note">
          <span>Совет AlmaWay</span>
          <p>
            Сохранённые места доступны в этой вкладке. Синхронизация между
            устройствами появится после подключения аккаунтов.
          </p>
        </section>
      </main>
    </AppShell>
  );
}
