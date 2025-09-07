export const CONTACT_API_URL: string | undefined =
  (process.env.REACT_APP_CONTACT_API || process.env.VITE_CONTACT_API || '').trim() || 
  'https://jni1diam3j.execute-api.ap-southeast-2.amazonaws.com/prod/contact';

export const hasContactApi = (): boolean => Boolean(CONTACT_API_URL);


