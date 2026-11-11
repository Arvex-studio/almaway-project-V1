"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
export type Draft = {
  id: string;
  caption: string;
  placeSlug: string;
  photo?: string;
};
type JournalState = {
  liked: boolean;
  setLiked: (liked: boolean) => void;
  bookmarked: boolean;
  setBookmarked: (saved: boolean) => void;
  comments: string[];
  addComment: (comment: string) => void;
  drafts: Draft[];
  addDraft: (draft: Omit<Draft, "id">) => void;
  removeDraft: (id: string) => void;
};
const Context = createContext<JournalState | null>(null);
export function JournalProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = useState(false),
    [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<string[]>([]),
    [drafts, setDrafts] = useState<Draft[]>([]);
  const photos = useRef(new Set<string>());
  useEffect(
    () => () => {
      for (const url of photos.current) URL.revokeObjectURL(url);
    },
    [],
  );
  return (
    <Context.Provider
      value={{
        liked,
        setLiked,
        bookmarked,
        setBookmarked,
        comments,
        addComment: (text) => setComments((old) => [...old, text]),
        drafts,
        addDraft: (draft) => {
          if (draft.photo) photos.current.add(draft.photo);
          setDrafts((old) => [{ ...draft, id: crypto.randomUUID() }, ...old]);
        },
        removeDraft: (id) =>
          setDrafts((old) => {
            const draft = old.find((d) => d.id === id);
            if (draft?.photo) {
              URL.revokeObjectURL(draft.photo);
              photos.current.delete(draft.photo);
            }
            return old.filter((d) => d.id !== id);
          }),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useJournal() {
  const state = useContext(Context);
  if (!state) throw new Error("JournalProvider required");
  return state;
}
