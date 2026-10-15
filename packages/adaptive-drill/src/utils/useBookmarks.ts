import { useEffect, useState, useCallback } from "react";

type Sets = { bookmarks: Set<string>; flags: Set<string> };

function fromStorage(): Sets {
  try {
    const raw = localStorage.getItem("rr_marks");
    if (!raw) return { bookmarks: new Set(), flags: new Set() };
    const obj = JSON.parse(raw);
    return {
      bookmarks: new Set<string>(obj.bookmarks ?? []),
      flags: new Set<string>(obj.flags ?? []),
    };
  } catch {
    return { bookmarks: new Set(), flags: new Set() };
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [flags, setFlags] = useState<Set<string>>(new Set());

  useEffect(() => {
    const s = fromStorage();
    setBookmarks(s.bookmarks);
    setFlags(s.flags);
  }, []);

  useEffect(() => {
    const payload = { bookmarks: Array.from(bookmarks), flags: Array.from(flags) };
    const id = setTimeout(() => localStorage.setItem("rr_marks", JSON.stringify(payload)), 150);
    return () => clearTimeout(id);
  }, [bookmarks, flags]);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setFlag = useCallback((id: string, value: boolean) => {
    setFlags(prev => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  return {
    bookmarks,
    flags,
    toggleBookmark,
    setFlag,
    isBookmarked: (id?: string) => !!(id && bookmarks.has(id)),
    isFlagged: (id?: string) => !!(id && flags.has(id)),
  };
}


