const storageKey = (projectId: string) => `new-exhibition-format/${projectId}`;

export function queueExhibitionFormatChooser(projectId: string) {
  window.sessionStorage.setItem(storageKey(projectId), "true");
}

export function takeExhibitionFormatChooser(projectId: string) {
  const key = storageKey(projectId);
  if (window.sessionStorage.getItem(key) !== "true") return false;
  window.sessionStorage.removeItem(key);
  return true;
}
