export const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  return response;
}
