/**
 * Convert common Google Drive share links to a direct image URL usable in <img src>.
 * If the URL is already a direct image link it is returned unchanged.
 */
export function toDirectImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const s = url.trim();

  // /d/<id>/view or /d/<id>
  let m = s.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m && m[1]) return `https://drive.google.com/uc?export=download&id=${m[1]}`;

  // ?id=<id> or &id=<id>
  m = s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m && m[1]) return `https://drive.google.com/uc?export=download&id=${m[1]}`;

  // open?id=<id>
  m = s.match(/open\?id=([a-zA-Z0-9_-]+)/);
  if (m && m[1]) return `https://drive.google.com/uc?export=download&id=${m[1]}`;

  // already direct googleusercontent/uc link
  if (s.includes('googleusercontent.com') || s.includes('drive.google.com/uc')) return s;

  // fallback: strip common preview query params
  return s.replace(/\/view(\?.*)?$/, '').replace(/\?usp=sharing$/, '');
}