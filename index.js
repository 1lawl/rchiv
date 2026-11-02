// App entry. On the web preview the page can be served from any path
// (e.g. a shared link), so start the router at Home in that case.
if (typeof window !== 'undefined' && window.history && process.env.EXPO_PUBLIC_WEB_PREVIEW === '1') {
  try {
    window.history.replaceState(null, '', '/');
  } catch {}
}
require('expo-router/entry');
