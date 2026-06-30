// react-native-dotenv `@env` moduli tiplari (.env → compile-time).
declare module '@env' {
  export const SUPABASE_URL: string | undefined;
  export const SUPABASE_ANON_KEY: string | undefined;
  export const GOOGLE_WEB_CLIENT_ID: string | undefined;
}
