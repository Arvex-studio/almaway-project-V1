"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  Bookmark,
  MessageCircle,
  Plus,
  MapPin,
  ArrowUpRight,
  BookOpen,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/almaway";
import { PhotoCredit } from "@/components/editorial";
import { JournalDialog } from "@/components/journal/journal-dialog";
import { Composer } from "@/components/journal/composer";
import { useJournal } from "@/components/journal/journal-state";
import { touristPlaces, getTouristPlace } from "@/lib/tourist-places";
export default function Journal() {
  const state = useJournal();
  const [compose, setCompose] = useState(false),
    [commentsOpen, setCommentsOpen] = useState(false),
    [profileOpen, setProfileOpen] = useState(false),
    [comment, setComment] = useState(""),
    [tab, setTab] = useState("Лента"),
    [placeFilter, setPlaceFilter] = useState("");
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get("place");
    if (slug && getTouristPlace(slug)) setPlaceFilter(slug);
  }, []);
  const lake = "bolshoe-almatinskoe-ozero",
    selected = getTouristPlace(placeFilter);
  const showExample =
    (tab === "Лента" || state.bookmarked) &&
    (!placeFilter || placeFilter === lake);
  const drafts = state.drafts.filter(
    (d) => !placeFilter || d.placeSlug === placeFilter,
  );
  return (
    <AppShell className="content-shell">
      <main className="content-page journal-page">
        <header className="product-heading">
          <div>
            <span className="eyebrow">ALMAWAY / FIELD JOURNAL</span>
            <h1>Истории снаружи</h1>
            <p>У каждого места — свой взгляд.</p>
          </div>
          <button
            className="icon-button"
            aria-label="Создать запись"
            onClick={() => setCompose(true)}
          >
            <Plus />
          </button>
        </header>
        <div className="journal-toolbar">
          <span className="demo-badge">Демо-журнал</span>
          <p>
            Пример интерфейса, а не реальные публикации. Действия остаются в
            этой вкладке до перезагрузки.
          </p>
        </div>
        <div className="journal-tabs" aria-label="Раздел журнала">
          {["Лента", "Сохранённые записи", "Мои черновики"].map((t) => (
            <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        {selected && (
          <p className="journal-filter">
            Место: {selected.title}{" "}
            <button className="text-action" onClick={() => setPlaceFilter("")}>
              Все места ×
            </button>
          </p>
        )}
        <div className="journal-layout">
          <div className="journal-feed">
            {tab !== "Сохранённые записи" &&
              drafts.map((d) => (
                <article className="draft-post" key={d.id}>
                  <span className="demo-badge">
                    Черновик · только в этой вкладке
                  </span>
                  {d.photo && (
                    <img src={d.photo} alt="Фотография из твоего черновика" />
                  )}
                  <p>{d.caption}</p>
                  <Link className="story-place" href={`/places/${d.placeSlug}`}>
                    <MapPin />
                    {getTouristPlace(d.placeSlug)?.title}
                  </Link>
                  <button
                    className="text-action"
                    onClick={() => state.removeDraft(d.id)}
                  >
                    <Trash2 size={16} />
                    Удалить черновик
                  </button>
                </article>
              ))}
            {showExample && tab !== "Мои черновики" && (
              <article className="story-post">
                <div className="story-byline">
                  <button
                    className="story-author"
                    onClick={() => setProfileOpen(true)}
                  >
                    <span className="story-avatar">AW</span>
                    <span>
                      <strong>Полевой журнал</strong>
                      <small>Редакционный пример · не аккаунт</small>
                    </span>
                  </button>
                </div>
                <figure>
                  <Link
                    href={`/places/${lake}`}
                    aria-label="Открыть место из фотографии"
                  >
                    <img
                      className="story-image"
                      src="/images/bao.webp"
                      alt="Зимняя фотография Большого Алматинского озера"
                      width="1350"
                      height="1800"
                      fetchPriority="high"
                    />
                  </Link>
                  <PhotoCredit />
                </figure>
                <Link className="story-place" href={`/map?place=${lake}`}>
                  <MapPin />
                  Большое Алматинское озеро
                  <ArrowUpRight size={16} />
                </Link>
                <div className="story-actions">
                  <button
                    aria-label="Нравится"
                    aria-pressed={state.liked}
                    onClick={() => state.setLiked(!state.liked)}
                  >
                    <Heart />
                  </button>
                  <button
                    aria-label="Комментарии"
                    onClick={() => setCommentsOpen(true)}
                  >
                    <MessageCircle />
                    {state.comments.length > 0 && (
                      <span>{state.comments.length}</span>
                    )}
                  </button>
                  <button
                    aria-label="Сохранить запись"
                    aria-pressed={state.bookmarked}
                    onClick={() => state.setBookmarked(!state.bookmarked)}
                  >
                    <Bookmark />
                  </button>
                </div>
                <p className="local-feedback" aria-live="polite">
                  {state.liked
                    ? "Твоя реакция добавлена · только локально"
                    : "Без вымышленных лайков и просмотров"}
                </p>
                <h2>
                  Тишина между
                  <br />
                  снегом и водой
                </h2>
                <p className="story-copy">
                  Фотография может стать началом поездки. Здесь появятся личные
                  истории, небольшие наблюдения и места, к которым хочется
                  вернуться.
                </p>
                <Link className="text-action" href={`/places/${lake}`}>
                  Узнать о месте <ArrowUpRight />
                </Link>
              </article>
            )}
            {((tab === "Сохранённые записи" && !showExample) ||
              (tab === "Мои черновики" && !drafts.length) ||
              (!showExample && !drafts.length)) && (
              <section className="journal-empty">
                <BookOpen />
                <h2>
                  {tab === "Сохранённые записи"
                    ? "Сохрани историю для вдохновения"
                    : "Здесь начинается твоя история"}
                </h2>
                <p>
                  {tab === "Сохранённые записи"
                    ? "Нажми закладку под записью в ленте."
                    : "Реальных публикаций пока нет. Попробуй создать локальный черновик о месте."}
                </p>
                <button
                  className="secondary-button"
                  onClick={() =>
                    tab === "Сохранённые записи"
                      ? setTab("Лента")
                      : setCompose(true)
                  }
                >
                  {tab === "Сохранённые записи"
                    ? "Открыть ленту"
                    : "Написать заметку"}
                </button>
              </section>
            )}
          </div>
          <aside className="journal-aside">
            <span className="eyebrow">СОБИРАЙ НЕ ТОЛЬКО ТОЧКИ</span>
            <h2>Память о дороге</h2>
            <p>
              Заметка, фотография и место на карте. Личный журнал начинается с
              простого.
            </p>
            <img
              src="/images/journey.webp"
              alt="Авторская иллюстрация гор и путешественника; не карта маршрута"
              width="1200"
              height="400"
              loading="lazy"
            />
            <button className="text-action" onClick={() => setCompose(true)}>
              Начать запись <Plus size={16} />
            </button>
            <p>
              Сейчас доступны только черновики и локальные реакции. Публикации,
              подписки и синхронизация появятся после подключения социальной
              платформы.
            </p>
          </aside>
        </div>
        {compose && (
          <Composer
            initialPlace={placeFilter || lake}
            onClose={() => setCompose(false)}
          />
        )}
        {commentsOpen && (
          <JournalDialog
            title="Комментарии · демо"
            onClose={() => setCommentsOpen(false)}
          >
            <p className="demo-notice">
              Только твои локальные записи. Другие пользователи их не увидят.
            </p>
            {state.comments.length ? (
              <ul className="comment-list">
                {state.comments.map((text, i) => (
                  <li key={i}>
                    <strong>Ты · в этой вкладке</strong>
                    {text}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Комментариев пока нет.</p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (comment.trim()) {
                  state.addComment(comment.trim());
                  setComment("");
                }
              }}
            >
              <label htmlFor="comment">Комментарий</label>
              <textarea
                id="comment"
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button className="primary-button" disabled={!comment.trim()}>
                Добавить комментарий
              </button>
            </form>
          </JournalDialog>
        )}
        {profileOpen && (
          <JournalDialog
            title="Профиль путешественника · демо"
            onClose={() => setProfileOpen(false)}
          >
            <div className="guest-header">
              <span className="story-avatar">AW</span>
              <div>
                <h3>Мой полевой журнал</h3>
                <p>Пример оформления, не реальный аккаунт.</p>
              </div>
            </div>
            <p>
              Здесь будут истории и фотоальбомы путешественника. Подписчики и
              достижения пока не подключены.
            </p>
            <h3>Альбом: два взгляда на Алматы</h3>
            <div className="album-grid">
              <Link href={`/places/${lake}`}>
                <img src="/images/bao.webp" alt="Большое Алматинское озеро" />
                Озеро
              </Link>
              <Link href="/places/medeo">
                <img src="/images/medeo.webp" alt="Медео" />
                Медео
              </Link>
            </div>
            <PhotoCredit />
            <PhotoCredit photo="medeo" />
            <p className="demo-notice">
              Редакционная подборка лицензированных фотографий. Не подтверждает
              личную поездку или текущее состояние мест.
            </p>
          </JournalDialog>
        )}
      </main>
    </AppShell>
  );
}
