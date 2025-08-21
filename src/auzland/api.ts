export const CONTACT_API_URL: string | undefined =
  (process.env.REACT_APP_CONTACT_API || process.env.VITE_CONTACT_API || '').trim() || undefined;

export const hasContactApi = (): boolean => Boolean(CONTACT_API_URL);


