"use client";
import Link from "next/link";
import {
  Bookmark,
  BookOpen,
  ChevronRight,
  Route,
  Settings,
  UserRound,
} from "lucide-react";
import { AppShell } from "@/components/almaway";
import { DemoAction } from "@/components/future/demo-dialog";
import { useDemoSaved } from "@/components/demo-state";
export default function ProfilePage() {
  const { savedSlugs } = useDemoSaved();
  return (
    <AppShell className="content-shell">
      <main className="content-page profile-page">
        <header className="guest-header">
          <span className="guest-avatar">
            <UserRound />
          </span>
          <div>
            <span className="eyebrow">ТВОЙ ALMAWAY</span>
            <h1>Твой путь начинается здесь</h1>
            <p>Исследуй места и собирай идеи для следующей поездки.</p>
          </div>
          <DemoAction
            className="icon-button"
            label="Настройки"
            title="Настройки"
            description="Настройки профиля появятся после подключения аккаунтов."
          >
            <Settings />
          </DemoAction>
        </header>
        <p className="demo-notice">
          Ты в гостевом режиме. Аккаунты не подключены. Сохранения и черновики
          доступны только в памяти этой вкладки.
        </p>
        <section className="profile-tools">
          <Link href="/saved">
            <Bookmark />
            <div>
              <strong>Мои места</strong>
              <small>{savedSlugs.length} в демо-сохранениях</small>
            </div>
            <ChevronRight />
          </Link>
          <Link href="/journal">
            <BookOpen />
            <div>
              <strong>Полевой журнал</strong>
              <small>Истории, фото и локальные черновики</small>
            </div>
            <ChevronRight />
          </Link>
          <Link href="/plan">
            <Route />
            <div>
              <strong>Подготовить поездку</strong>
              <small>Демо планировщика</small>
            </div>
            <ChevronRight />
          </Link>
          <Link href="/map">
            <Route />
            <div>
              <strong>Открыть карту</strong>
              <small>Найти свою следующую точку</small>
            </div>
            <ChevronRight />
          </Link>
        </section>
        <DemoAction
          className="journey-banner"
          title="Journey Mode · концепт"
          description="Режим путешествия пока проектируется. Здесь нет отслеживания GPS, навигации или проверенного трека. Иллюстрация — художественный образ."
        >
          <img src="/images/journey.webp" alt="" width="1200" height="400" />
          <div>
            <span className="eyebrow">JOURNEY MODE · СКОРО</span>
            <h2>
              Быть в моменте.
              <br />
              Помнить дорогу.
            </h2>
            <p>
              Личный дневник путешествия — от первой идеи до последнего кадра.
            </p>
            <span className="text-action">
              О концепте <ChevronRight />
            </span>
          </div>
        </DemoAction>
      </main>
    </AppShell>
  );
}
