"use client";
import { useState, useEffect, useRef } from "react";
import { touristPlaces } from "@/lib/tourist-places";
import { JournalDialog } from "./journal-dialog";
import { useJournal } from "./journal-state";
export function Composer({
  onClose,
  initialPlace,
}: {
  onClose: () => void;
  initialPlace: string;
}) {
  const { addDraft } = useJournal();
  const [caption, setCaption] = useState(""),
    [place, setPlace] = useState(initialPlace),
    [photo, setPhoto] = useState<string>(),
    [error, setError] = useState(""),
    [confirmClose, setConfirmClose] = useState(false);
  const owned = useRef<string | undefined>(undefined);
  const fileInput = useRef<HTMLInputElement>(null);
  const clearPhoto = () => {
    if (owned.current) URL.revokeObjectURL(owned.current);
    owned.current = undefined;
    if (fileInput.current) fileInput.current.value = "";
    setPhoto(undefined);
    setError("");
  };
  useEffect(
    () => () => {
      if (owned.current) URL.revokeObjectURL(owned.current);
    },
    [],
  );
  const close = () => {
    if (caption.trim() || photo) setConfirmClose(true);
    else onClose();
  };
  return (
    <JournalDialog title="Новая запись" onClose={close}>
      <p className="demo-notice">
        Демо редактора. Фото не загружается на сервер. Черновик исчезнет при
        перезагрузке; публикация пока недоступна.
      </p>
      {confirmClose ? (
        <div role="alert">
          <h3>Закрыть без сохранения?</h3>
          <p>Текст и выбранное фото будут потеряны.</p>
          <div className="card-actions">
            <button
              className="secondary-button"
              onClick={() => setConfirmClose(false)}
            >
              Продолжить запись
            </button>
            <button className="primary-button" onClick={onClose}>
              Удалить изменения
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!caption.trim() || error) return;
            addDraft({ caption: caption.trim(), placeSlug: place, photo });
            owned.current = undefined;
            onClose();
          }}
        >
          <label htmlFor="story-photo">
            Твоя фотография · JPEG, PNG или WebP, до 8 МБ
          </label>
          <input
            ref={fileInput}
            id="story-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (
                !["image/jpeg", "image/png", "image/webp"].includes(
                  file.type,
                ) ||
                file.size > 8 * 1024 * 1024
              ) {
                setError("Выбери JPEG, PNG или WebP размером до 8 МБ.");
                e.target.value = "";
                return;
              }
              setError("");
              if (owned.current) URL.revokeObjectURL(owned.current);
              const url = URL.createObjectURL(file);
              owned.current = url;
              setPhoto(url);
            }}
          />
          {photo && (
            <>
              <img
                className="composer-preview"
                src={photo}
                alt="Предпросмотр выбранной фотографии"
                onError={() =>
                  setError("Не удалось открыть фотографию. Выбери другой файл.")
                }
              />
              <button
                type="button"
                className="text-action"
                onClick={clearPhoto}
              >
                Убрать фото
              </button>
            </>
          )}
          {error && (
            <div>
              <p className="form-error" role="alert">
                {error}
              </p>
              <button
                type="button"
                className="text-action"
                onClick={clearPhoto}
              >
                Продолжить без фото
              </button>
            </div>
          )}
          <label htmlFor="story-place">Место</label>
          <select
            id="story-place"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
          >
            {touristPlaces.map((p) => (
              <option value={p.slug} key={p.slug}>
                {p.title}
              </option>
            ))}
          </select>
          <label htmlFor="story-caption">Заметка</label>
          <textarea
            id="story-caption"
            maxLength={1200}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Что хочется запомнить об этом месте?"
          />
          <div className="composer-footer">
            <span>{caption.length} / 1200</span>
            <button
              className="primary-button"
              disabled={!caption.trim() || Boolean(error)}
            >
              Сохранить черновик
            </button>
          </div>
        </form>
      )}
    </JournalDialog>
  );
}
