export type JournalEntry = {
  id: string;
  savedAt: string;
  mode: "camera" | "text";
  imageThumb?: string;
  question: string;
  answer: string;
};

const KEY = "journalEntries";

export function loadJournal(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveEntry(
  entry: Omit<JournalEntry, "id" | "savedAt">,
): JournalEntry {
  const e: JournalEntry = {
    ...entry,
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
  };
  const entries = loadJournal();
  entries.unshift(e);
  localStorage.setItem(KEY, JSON.stringify(entries));
  return e;
}

export function deleteEntry(id: string): void {
  const entries = loadJournal().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(entries));
}

export function clearJournal(): void {
  localStorage.removeItem(KEY);
}

export function makeThumb(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 320;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) {
          height = Math.round((height / width) * MAX);
          width = MAX;
        } else {
          width = Math.round((width / height) * MAX);
          height = MAX;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.55));
    };
    img.src = dataUrl;
  });
}

export function formatSavedAt(iso: string): string {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd}  ${hh}:${min}`;
}
