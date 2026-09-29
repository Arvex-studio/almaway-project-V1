import { useState, type ReactNode } from "react";

type Tab = "explore" | "plan" | "map" | "saved" | "profile";
type Screen = Tab | "place" | "journey";

const photos = {
  lake: "https://images.unsplash.com/photo-1752583649031-a8a8cc17fb7d?auto=format&fit=crop&w=1200&q=85",
  canyon: "https://images.unsplash.com/photo-1666668973700-e45696248d3f?auto=format&fit=crop&w=1200&q=85",
  peak: "https://images.unsplash.com/photo-1727527817217-07d06eaebd0f?auto=format&fit=crop&w=1200&q=85",
  mountain: "https://images.unsplash.com/photo-1752584157449-a3c95f6b7b2d?auto=format&fit=crop&w=1200&q=85",
};

type IconName =
  | "compass" | "sparkles" | "map" | "bookmark" | "user" | "search"
  | "layers" | "locate" | "arrow" | "heart" | "route" | "clock"
  | "car" | "mountain" | "settings" | "chevron" | "shield" | "offline"
  | "flag" | "camera" | "back" | "send" | "play" | "check" | "plus";

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    compass: <><circle cx="12" cy="12" r="8"/><path d="m15 9-2 4-4 2 2-4 4-2Z"/></>,
    sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z"/><path d="m18.5 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3Z"/></>,
    map: <><path d="m3 6 5-2 8 3 5-2v13l-5 2-8-3-5 2V6Z"/><path d="M8 4v13m8-10v13"/></>,
    bookmark: <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.8L6 21V4.5Z"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>,
    layers: <><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="m5 13 7 4 7-4M5 17l7 4 7-4"/></>,
    locate: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></>,
    arrow: <path d="m5 12 14-7-5 14-2-5-7-2Z"/>,
    heart: <path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.4 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>,
    route: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18c6 0 2-12 8-12"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    car: <><path d="m5 16-1-1v-4l2-5h12l2 5v4l-1 1"/><path d="M4 12h16M7 16v2m10-2v2"/><circle cx="7" cy="13" r=".5"/><circle cx="17" cy="13" r=".5"/></>,
    mountain: <path d="m2 20 7-12 3 5 3-7 7 14H2Z"/>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.3-2.5h-4L10.4 6A8 8 0 0 0 8 7.1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1A8 8 0 0 0 10.4 18l.3 2.5h4L15 18a8 8 0 0 0 1.5-1.1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    shield: <><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/></>,
    offline: <><path d="M5 8a10 10 0 0 1 14 0M8 11a6 6 0 0 1 8 0m-5 4a2 2 0 0 1 2 0"/><path d="m3 3 18 18"/></>,
    flag: <><path d="M5 22V4"/><path d="M5 5h11l-2 4 2 4H5"/></>,
    camera: <><path d="M4 7h4l2-3h4l2 3h4v12H4V7Z"/><circle cx="12" cy="13" r="4"/></>,
    back: <path d="m15 18-6-6 6-6"/>,
    send: <path d="m3 11 18-8-8 18-2-8-8-2Z"/>,
    play: <path d="m9 7 8 5-8 5V7Z"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    plus: <path d="M12 5v14M5 12h14"/>,
  };
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Tap({ children, className = "", onClick, label }: { children: ReactNode; className?: string; onClick?: () => void; label?: string }) {
  return <div className={`tap ${className}`} role="button" tabIndex={0} aria-label={label} onClick={onClick} onKeyDown={(event) => event.key === "Enter" && onClick?.()}>{children}</div>;
}

function FutureBadge({ children = "Скоро" }: { children?: ReactNode }) {
  return <span className="future-badge">{children}</span>;
}

function Header({ title, eyebrow, action, onBack }: { title: string; eyebrow?: string; action?: ReactNode; onBack?: () => void }) {
  return <header className="page-header">
    <div className="header-left">
      {onBack && <Tap className="icon-button" onClick={onBack} label="Назад"><Icon name="back"/></Tap>}
      <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<div className="page-title">{title}</div></div>
    </div>
    {action}
  </header>;
}

function BottomNav({ active, go }: { active: Tab; go: (tab: Tab) => void }) {
  const items: { id: Tab; label: string; icon: IconName }[] = [
    { id: "explore", label: "Открытия", icon: "compass" },
    { id: "plan", label: "План", icon: "sparkles" },
    { id: "map", label: "Карта", icon: "map" },
    { id: "saved", label: "Сохранено", icon: "bookmark" },
    { id: "profile", label: "Профиль", icon: "user" },
  ];
  return <nav className="bottom-nav" aria-label="Основная навигация">
    {items.map((item) => <Tap key={item.id} className={`nav-item ${active === item.id ? "active" : ""} ${item.id === "map" ? "map-tab" : ""}`} onClick={() => go(item.id)}>
      <span className="nav-icon"><Icon name={item.icon}/></span><span>{item.label}</span>
    </Tap>)}
  </nav>;
}

function FilterChip({ children, active = false, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return <Tap className={`filter-chip ${active ? "active" : ""}`} onClick={onClick}>{children}</Tap>;
}

function SearchBar() {
  return <div className="search-bar"><Icon name="search"/><span>Куда хочешь отправиться?</span><Tap className="avatar-mini"><span>AK</span></Tap></div>;
}

function ContextChip({ children }: { children: ReactNode }) {
  return <span className="context-chip">{children}</span>;
}

function MetricItem({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return <div className="metric-chip"><Icon name={icon} size={19}/><div><span>{label}</span><strong>{value}</strong></div></div>;
}

function PrimaryButton({ children, icon, onClick }: { children: ReactNode; icon?: IconName; onClick?: () => void }) {
  return <Tap className="primary-button" onClick={onClick}>{icon && <Icon name={icon} size={19}/>}<span>{children}</span></Tap>;
}

function SecondaryButton({ children, icon, onClick, compact = false }: { children: ReactNode; icon?: IconName; onClick?: () => void; compact?: boolean }) {
  return <Tap className={`secondary-button ${compact ? "compact" : ""}`} onClick={onClick}>{icon && <Icon name={icon} size={19}/>}<span>{children}</span></Tap>;
}

function MapPin({ className, selected, count, saved, routePoint, onClick }: { className: string; selected?: boolean; count?: number; saved?: boolean; routePoint?: boolean; onClick?: () => void }) {
  if (count) return <Tap className={`cluster-pin ${className}`} onClick={onClick}>{count}</Tap>;
  return <Tap className={`map-pin ${className} ${selected ? "selected" : ""} ${saved ? "saved" : ""} ${routePoint ? "route-point" : ""}`} onClick={onClick}>
    <span>{saved ? <Icon name="bookmark" size={15}/> : <Icon name={routePoint ? "flag" : selected ? "mountain" : "arrow"} size={15}/>}</span>
  </Tap>;
}

function BottomSheet({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return <section className="place-sheet"><Tap className="sheet-handle" onClick={onClose} label="Закрыть карточку"/>{children}</section>;
}

function EmptyState({ title, text, action }: { title: string; text: string; action: string }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="bookmark"/></span><strong>{title}</strong><p>{text}</p><SecondaryButton icon="compass">{action}</SecondaryButton></div>;
}

function LoadingSkeleton() {
  return <div className="loading-skeleton" aria-label="Загрузка"><i/><span/><span/><span/></div>;
}

function ErrorState() {
  return <div className="error-state"><Icon name="compass"/><strong>Не удалось загрузить места</strong><span>Проверь связь и попробуй снова</span><SecondaryButton>Повторить</SecondaryButton></div>;
}

function MapCanvas({ selected, selectPlace }: { selected: boolean; selectPlace: () => void }) {
  return <div className="map-canvas">
    <div className="terrain terrain-a"/><div className="terrain terrain-b"/><div className="terrain terrain-c"/>
    <svg className="topo-lines" viewBox="0 0 400 800" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-40 180C70 110 90 260 210 180s170 40 250-30M-30 210C80 140 110 285 220 210s160 35 240-25M-40 245C70 180 130 310 235 240s155 30 230-20M-60 500c90-100 150 30 235-60s180 15 270-80M-50 540c100-100 160 35 245-55s170 20 260-70M-30 580c100-95 150 30 250-45s150 20 230-60"/>
      <path className="river" d="M325-30c-80 120-35 190-110 280s-20 175-120 260S70 700-10 850"/>
      <path className="trail" d="M45 680c45-90 140-60 145-170s130-85 105-210 55-145 90-205"/>
    </svg>
    <div className="map-label peak-label"><Icon name="mountain" size={14}/> пик Молодёжный <small>4147 м</small></div>
    <div className="map-label lake-label">Большое Алматинское озеро</div>
    <div className="route-mark r1"/><div className="route-mark r2"/><div className="route-mark r3"/>
    <MapPin className="pin-one" selected={selected} onClick={selectPlace}/>
    <MapPin className="pin-two" saved/><MapPin className="pin-three" routePoint/>
    <MapPin className="pin-four" count={8}/>
  </div>;
}

function PlaceSheet({ openDetail, close }: { openDetail: () => void; close: () => void }) {
  return <BottomSheet onClose={close}>
    <div className="sheet-content">
      <div className="sheet-photo" style={{ backgroundImage: `url(${photos.lake})` }}><span className="photo-tag">Выбор AlmaWay</span></div>
      <div className="sheet-info">
        <div className="sheet-title-row"><div><div className="place-name">Большое Алматинское озеро</div><div className="place-location">Заилийский Алатау · 28 км</div></div><Tap className="save-round"><Icon name="bookmark" size={20}/></Tap></div>
        <div className="mini-metrics"><ContextChip>Средне</ContextChip><ContextChip>3–4 часа</ContextChip><ContextChip>8,4 км</ContextChip><ContextChip>+420 м</ContextChip></div>
        <p className="why">Бирюзовая вода, хвойные склоны и горный воздух — идеальный первый маршрут из Алматы.</p>
        <div className="sheet-actions"><SecondaryButton icon="bookmark" compact>Сохранить</SecondaryButton><PrimaryButton icon="sparkles" onClick={openDetail}>План</PrimaryButton><Tap className="detail-link" onClick={openDetail}>Подробнее <Icon name="chevron" size={16}/></Tap></div>
      </div>
    </div>
  </BottomSheet>;
}

function MapHome({ openDetail }: { openDetail: () => void }) {
  const [selected, setSelected] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Рядом");
  return <main className="map-screen">
    <MapCanvas selected={selected} selectPlace={() => setSelected(true)}/>
    <div className="map-overlay">
      <SearchBar/>
      <div className="filter-row">{["Рядом", "Горы", "Озёра", "Маршруты", "Лёгкие", "С видом", "На выходные"].map((filter) => <FilterChip key={filter} active={activeFilter === filter} onClick={() => setActiveFilter(filter)}>{filter}</FilterChip>)}</div>
    </div>
    <div className={`map-controls ${selected ? "raised" : ""}`}><Tap label="Слои карты"><Icon name="layers"/></Tap><Tap label="Моё местоположение"><Icon name="locate"/></Tap></div>
    {!selected && <div className="map-hint"><Icon name="sparkles" size={18}/><span><strong>12 мест</strong> подходят для поездки сегодня</span><Icon name="chevron" size={17}/></div>}
    {selected && <PlaceSheet openDetail={openDetail} close={() => setSelected(false)}/>}
  </main>;
}

function PlaceCard({ image, tag, title, meta, wide, onClick, onMap, onPlan, actions = false }: { image: string; tag: string; title: string; meta: string; wide?: boolean; onClick?: () => void; onMap?: () => void; onPlan?: () => void; actions?: boolean }) {
  const [saved, setSaved] = useState(false);
  return <div className={`photo-card ${wide ? "wide" : ""} ${actions ? "with-actions" : ""}`}>
    <Tap className="photo-card-main" onClick={onClick}>
      <img src={image} alt="Природа Казахстана"/>
      <div className="photo-overlay"><span className="content-tag">{tag}</span><div className="card-title">{title}</div><div className="card-meta">{meta}</div></div>
      <span className="card-save"><Icon name="bookmark" size={18}/></span>
    </Tap>
    {actions && <div className="card-actions"><Tap onClick={onMap ?? onClick}><Icon name="map" size={16}/>На карте</Tap><Tap className={saved ? "saved" : ""} onClick={() => setSaved(!saved)}><Icon name={saved ? "check" : "bookmark"} size={16}/>{saved ? "Сохранено" : "Сохранить"}</Tap><Tap onClick={onPlan}><Icon name="sparkles" size={16}/>План</Tap></div>}
  </div>;
}

function RouteCard({ image, title, meta, onClick, onMap, onPlan }: { image: string; title: string; meta: string; onClick?: () => void; onMap?: () => void; onPlan?: () => void }) {
  return <PlaceCard image={image} tag="Маршрут" title={title} meta={meta} wide actions onClick={onClick} onMap={onMap} onPlan={onPlan}/>;
}

function Explore({ openDetail, goMap, goPlan }: { openDetail: () => void; goMap: () => void; goPlan: () => void }) {
  return <main className="page scroll-page">
    <Header eyebrow="Пятница, 14 июня" title="Открывай Казахстан" action={<Tap className="header-avatar">AK</Tap>}/>
    <div className="section-head"><div><span className="section-kicker">На эти выходные</span><div className="section-title">Ближе, чем кажется</div></div><Tap className="text-action">Смотреть все</Tap></div>
    <div className="horizontal-cards">
      <PlaceCard image={photos.lake} tag="28 км от вас" title="Большое Алматинское озеро" meta="Средне · 3–4 часа" wide actions onClick={openDetail} onMap={goMap} onPlan={goPlan}/>
      <RouteCard image={photos.mountain} title="Кимасаровское ущелье" meta="Легко · 2 часа" onClick={openDetail} onMap={goMap} onPlan={goPlan}/>
    </div>
    <div className="prompt-card"><div className="prompt-icon"><Icon name="sparkles"/></div><div><strong>Куда сбежать завтра?</strong><span>Подберём место под время и бюджет</span></div><Tap className="round-arrow"><Icon name="chevron" size={18}/></Tap></div>
    <div className="section-head compact"><div className="section-title">Скрытые рядом</div><Tap className="text-action">На карте</Tap></div>
    <div className="editorial-grid">
      <PlaceCard image={photos.canyon} tag="Тихое место" title="Ущелье Аюсай" meta="18 км · Водопады" actions onClick={openDetail} onMap={goMap} onPlan={goPlan}/>
      <PlaceCard image={photos.peak} tag="Панорама" title="Плато Асы" meta="90 км · 4×4" actions onClick={openDetail} onMap={goMap} onPlan={goPlan}/>
    </div>
    <div className="future-strip"><div><FutureBadge>Скоро</FutureBadge><strong>Vibe Map</strong><span>Места глазами путешественников</span></div><div className="vibe-dots"><i/><i/><i/></div></div>
  </main>;
}

function PlaceDetail({ back, plan }: { back: () => void; plan: () => void }) {
  return <main className="detail-page scroll-page">
    <div className="hero-photo" style={{ backgroundImage: `url(${photos.lake})` }}>
      <div className="hero-top"><Tap className="floating-icon" onClick={back}><Icon name="back"/></Tap><div><Tap className="floating-icon"><Icon name="send"/></Tap><Tap className="floating-icon"><Icon name="bookmark"/></Tap></div></div>
      <div className="hero-caption"><span>Заилийский Алатау</span><div>Большое Алматинское озеро</div></div>
    </div>
    <div className="detail-body">
      <p className="lead">Высокогорное озеро цвета неба — одно из тех мест, ради которых хочется выйти из дома пораньше.</p>
      <div className="metrics-scroll">
        <MetricItem icon="mountain" label="Сложность" value="Средне"/>
        <MetricItem icon="clock" label="Время" value="3–4 часа"/>
        <MetricItem icon="route" label="Маршрут" value="8,4 км"/>
        <MetricItem icon="arrow" label="Набор" value="420 м"/>
      </div>
      <div className="season-note"><Icon name="compass"/><div><span>Лучшее время</span><strong>Май — октябрь · утром меньше людей</strong></div><span className="budget">≈ 8 000 ₸</span></div>
      <div className="action-grid"><SecondaryButton icon="bookmark">Сохранить</SecondaryButton><PrimaryButton icon="sparkles" onClick={plan}>Спланировать</PrimaryButton><SecondaryButton icon="sparkles">Спросить AI</SecondaryButton></div>
      <InfoSection icon="route" title="Как добраться" text="Из Алматы по улице Дулати до поста нацпарка. Последние 8 км — пешком или на экотранспорте."/>
      <div className="info-grid">
        <InfoTile icon="car" title="Транспорт" text="Авто + шаттл"/>
        <InfoTile icon="shield" title="Безопасность" text="Погода меняется быстро"/>
        <InfoTile icon="bookmark" title="Что взять" text="Вода, ветровка, SPF"/>
        <InfoTile icon="clock" title="Выход" text="До 08:00"/>
      </div>
      <div className="route-preview"><div className="route-line"><i/><i/><i/><i/></div><div><span>Пеший участок</span><strong>Визит-центр → озеро</strong><small>4,2 км в одну сторону · плавный подъём</small></div><Tap className="round-arrow"><Icon name="chevron" size={18}/></Tap></div>
      <div className="section-head compact"><div className="section-title">Рядом по пути</div><Tap className="text-action">Все места</Tap></div>
      <div className="nearby-row"><PlaceCard image={photos.mountain} tag="По пути" title="Космостанция" meta="6 км"/><PlaceCard image={photos.canyon} tag="Водопад" title="Аюсай" meta="11 км"/></div>
      <div className="community-block"><div className="section-title">Глазами путешественников</div><div className="community-row"><div className="people"><span>AM</span><span>DI</span><span>+38</span></div><div><strong>4,8</strong><span>126 отзывов</span></div><Tap className="text-action"><Icon name="camera" size={18}/> Добавить</Tap></div></div>
      <InfoSection icon="compass" title="История места" text="Озеро сформировалось после древних землетрясений. Сегодня оно остаётся важной частью природного наследия Иле-Алатауского парка."/>
    </div>
  </main>;
}

function InfoSection({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return <section className="info-section"><div className="info-heading"><span><Icon name={icon}/></span><div className="section-title">{title}</div></div><p>{text}</p><Tap className="inline-link">Подробнее <Icon name="chevron" size={16}/></Tap></section>;
}

function InfoTile({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return <div className="info-tile"><Icon name={icon}/><strong>{title}</strong><span>{text}</span></div>;
}

function Planner() {
  const [generated, setGenerated] = useState(true);
  const [mood, setMood] = useState("Природа");
  return <main className="page scroll-page planner-page">
    <Header eyebrow="Твой день, твой темп" title="Куда отправимся?" action={<span className="alma-mark"><Icon name="sparkles" size={20}/></span>}/>
    <div className="natural-input"><div className="input-copy">Куда можно съездить завтра возле Алматы на 15 000 ₸?</div><Tap className="send-button" onClick={() => setGenerated(true)}><Icon name="arrow"/></Tap></div>
    <div className="planner-label">Или настрой поездку</div>
    <div className="planner-fields">
      <div className="select-card"><span>Когда</span><strong>Завтра</strong><small>Весь день</small></div>
      <div className="select-card"><span>Бюджет</span><strong>до 15 000 ₸</strong><small>на человека</small></div>
      <div className="select-card"><span>Транспорт</span><strong>Машина</strong><small>из Алматы</small></div>
      <div className="select-card"><span>Сложность</span><strong>Легко — средне</strong><small>без спец. подготовки</small></div>
      <div className="select-card"><span>Компания</span><strong>Вдвоём</strong><small>спокойный темп</small></div>
    </div>
    <div className="planner-label">Какое настроение?</div>
    <div className="mood-row">{["Природа", "Приключение", "Спокойствие", "Виды", "Скрытые места"].map((item) => <FilterChip key={item} active={mood === item} onClick={() => setMood(item)}>{item}</FilterChip>)}</div>
    <PrimaryButton icon="sparkles" onClick={() => setGenerated(true)}>Собрать мой день</PrimaryButton>
    {generated ? <div className="results">
      <div className="result-heading"><div><span className="section-kicker">AlmaWay подобрал</span><div className="section-title">2 маршрута для тебя</div></div><span className="match">94% подходит</span></div>
      <PlanCard image={photos.lake} title="Большое Алматинское озеро" time="08:00 — 18:30" budget="≈ 12 500 ₸" note="Лучший баланс видов и спокойного темпа"/>
      <PlanCard image={photos.canyon} title="Водопады Аюсай" time="09:00 — 16:00" budget="≈ 8 200 ₸" note="Короче путь и больше времени у воды"/>
    </div> : <div className="planner-empty"><div className="path-illustration"><i/><i/><i/></div><strong>План будет готов за несколько секунд</strong><span>Учтём погоду, дорогу и твой темп</span></div>}
  </main>;
}

function PlanCard({ image, title, time, budget, note }: { image: string; title: string; time: string; budget: string; note: string }) {
  return <div className="plan-card"><img src={image} alt="Горный маршрут"/><div className="plan-card-body"><div className="plan-title-row"><div><span>План на 1 день</span><strong>{title}</strong></div><Tap className="save-round"><Icon name="bookmark" size={19}/></Tap></div><div className="plan-data"><span><Icon name="clock" size={17}/>{time}</span><span><Icon name="car" size={17}/>На машине</span><span><Icon name="bookmark" size={17}/>{budget}</span></div><p>{note}</p><Tap className="plan-route">Смотреть план <Icon name="chevron" size={17}/></Tap></div></div>;
}

function Saved({ openDetail }: { openDetail: () => void }) {
  const [section, setSection] = useState("Места");
  return <main className="page scroll-page">
    <Header eyebrow="Твоя коллекция" title="Сохранено" action={<Tap className="icon-button"><Icon name="plus"/></Tap>}/>
    <div className="segmented">{["Места", "Маршруты", "Планы"].map((item) => <Tap className={section === item ? "active" : ""} onClick={() => setSection(item)} key={item}>{item}</Tap>)}</div>
    <div className="saved-summary"><div><strong>{section === "Места" ? "12" : section === "Маршруты" ? "4" : "3"}</strong><span>{section.toLowerCase()}</span></div><p>Следующее приключение уже здесь. Выбери место и собери маршрут.</p></div>
    {section === "Места" && <div className="saved-list">
      <SavedItem image={photos.lake} title="Большое Алматинское озеро" meta="Средне · 8,4 км" tag="Озеро" onClick={openDetail}/>
      <SavedItem image={photos.canyon} title="Водопады Аюсай" meta="Легко · 5,2 км" tag="Водопад"/>
      <SavedItem image={photos.peak} title="Плато Асы" meta="На машине · 90 км" tag="Панорама"/>
    </div>}
    {section === "Маршруты" && <div className="saved-list">
      <SavedItem image={photos.mountain} title="Кимасаровское ущелье" meta="Средне · 9,8 км" tag="Маршрут"/>
      <SavedItem image={photos.canyon} title="Тропа трёх водопадов" meta="Легко · 5,2 км" tag="Маршрут"/>
    </div>}
    {section === "Планы" && <EmptyState title="Пока нет сохранённых планов" text="Собери поездку с AlmaWay AI — время, дорога и бюджет будут в одном месте." action="Создать план"/>}
    <Tap className="collection-card"><span className="collection-icon"><Icon name="plus"/></span><div><strong>Создать подборку</strong><span>Например, «Лето с друзьями»</span></div><Icon name="chevron"/></Tap>
  </main>;
}

function SavedItem({ image, title, meta, tag, onClick }: { image: string; title: string; meta: string; tag: string; onClick?: () => void }) {
  return <Tap className="saved-item" onClick={onClick}><img src={image} alt="Сохранённое место"/><div><span>{tag}</span><strong>{title}</strong><small>{meta}</small></div><Icon name="chevron" size={18}/></Tap>;
}

function Profile({ openJourney }: { openJourney: () => void }) {
  return <main className="page scroll-page profile-page">
    <Header title="Профиль" action={<Tap className="icon-button"><Icon name="settings"/></Tap>}/>
    <div className="profile-identity"><div className="profile-avatar">AK<span><Icon name="camera" size={14}/></span></div><div><div className="profile-name">Алия Касымова</div><p>Люблю горы, ранние выезды и чай у воды.</p><span className="profile-location">Алматы, Казахстан</span></div></div>
    <div className="profile-stats"><div><strong>18</strong><span>посещено</span></div><div><strong>7</strong><span>маршрутов пройдено</span></div><div><strong>26</strong><span>сохранено</span></div></div>
    <div className="progress-card"><div className="progress-top"><div><span className="section-kicker">Твой сезон</span><strong>Исследователь Алатау</strong></div><span>68%</span></div><div className="progress-bar"><i/></div><p>Ещё 3 маршрута до нового уровня</p></div>
    <div className="section-head compact"><div className="section-title">Достижения</div><Tap className="text-action">Все</Tap></div>
    <div className="badges"><div className="achievement earned"><Icon name="mountain"/><span>Первый пик</span></div><div className="achievement earned"><Icon name="clock"/><span>Ранний старт</span></div><div className="achievement"><Icon name="route"/><span>50 км</span></div></div>
    <div className="section-head compact"><div><span className="section-kicker">Мои истории</span><div className="section-title">Поездки и публикации</div></div><Tap className="text-action">Все 6</Tap></div>
    <div className="trip-posts">
      <PlaceCard image={photos.canyon} tag="12 фото" title="День в Аюсае" meta="2 дня назад"/>
      <PlaceCard image={photos.mountain} tag="Маршрут пройден" title="Кимасар на рассвете" meta="8,6 км · 3 часа"/>
    </div>
    <Tap className="passport-card"><div className="passport-top"><div className="passport-logo"><Icon name="compass"/></div><FutureBadge>Скоро</FutureBadge></div><div><span>TRAVEL PASSPORT</span><strong>Казахстан ждёт твоих отметок</strong><p>Личная карта открытий, регионов и историй.</p></div><Icon name="chevron"/></Tap>
    <div className="section-head compact"><div className="section-title">В пути</div></div>
    <Tap className="journey-teaser" onClick={openJourney}><div className="teaser-map"><div className="teaser-route"/><i/><i/><i/></div><div className="teaser-content"><FutureBadge>В разработке</FutureBadge><strong>Journey Mode</strong><span>Маршрут, безопасность и прогресс — прямо в пути.</span><div className="teaser-link">Посмотреть будущее <Icon name="chevron" size={16}/></div></div></Tap>
    <div className="future-list"><div><Icon name="user"/><span><strong>Co-op Trips</strong><small>Путешествия с друзьями</small></span><FutureBadge/></div><div><Icon name="map"/><span><strong>Vibe Map</strong><small>Атмосфера мест на карте</small></span><FutureBadge/></div></div>
  </main>;
}

function Journey({ back }: { back: () => void }) {
  return <main className="journey-page">
    <div className="journey-map"><MapCanvas selected={false} selectPlace={() => {}}/><div className="journey-shade"/></div>
    <div className="journey-top"><Tap className="floating-icon" onClick={back}><Icon name="back"/></Tap><FutureBadge>В разработке</FutureBadge><Tap className="floating-icon"><Icon name="settings"/></Tap></div>
    <div className="journey-route-info"><span>Маршрут к озеру</span><strong>Большое Алматинское</strong><div><Icon name="clock" size={17}/> 1 ч 24 мин <i/> 3,8 км осталось</div></div>
    <div className="guide-marker"><div className="guide-shape"><span/></div><small>Твой проводник</small></div>
    <div className="journey-sheet"><div className="sheet-handle"/><div className="journey-progress"><div><span>Пройдено</span><strong>4,6 <small>км</small></strong></div><div className="circle-progress"><span>54%</span></div><div><span>Подъём</span><strong>280 <small>м</small></strong></div></div><div className="checkpoint-line"><i className="done"><Icon name="check" size={13}/></i><span/><i className="done"><Icon name="check" size={13}/></i><span/><i><Icon name="flag" size={13}/></i></div><div className="checkpoint-copy"><span>Старт</span><span>Водопад</span><span>Озеро</span></div><div className="journey-tools"><div><Icon name="offline"/><span>Карта офлайн</span></div><div><Icon name="shield"/><span>Безопасность</span></div><div><Icon name="flag"/><span>Достижения</span></div></div><div className="coming-note">Journey Mode появится в одной из следующих версий AlmaWay</div></div>
  </main>;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("map");
  const mainTab: Tab = ["explore", "plan", "map", "saved", "profile"].includes(screen) ? screen as Tab : "map";
  const go = (tab: Tab) => setScreen(tab);
  return <div className="app-shell">
    <div className="desktop-brand"><span className="brand-symbol"><Icon name="compass"/></span><strong>AlmaWay</strong><small>Открой Казахстан ближе</small></div>
    <div className="phone-frame">
      {screen === "map" && <MapHome openDetail={() => setScreen("place")}/>}
      {screen === "explore" && <Explore openDetail={() => setScreen("place")} goMap={() => setScreen("map")} goPlan={() => setScreen("plan")}/>}
      {screen === "place" && <PlaceDetail back={() => setScreen("map")} plan={() => setScreen("plan")}/>}
      {screen === "plan" && <Planner/>}
      {screen === "saved" && <Saved openDetail={() => setScreen("place")}/>}
      {screen === "profile" && <Profile openJourney={() => setScreen("journey")}/>}
      {screen === "journey" && <Journey back={() => setScreen("profile")}/>}
      {!["place", "journey"].includes(screen) && <BottomNav active={mainTab} go={go}/>}
    </div>
    <aside className="desktop-context">
      <span>ALMAWAY V1</span><strong>Из вдохновения —<br/>в настоящее путешествие.</strong><p>Исследуй места, собирай планы и открывай Казахстан в своём темпе.</p><div className="context-pills"><span>Алматы</span><span>+18°C</span><span>Ясно</span></div>
    </aside>
  </div>;
}
