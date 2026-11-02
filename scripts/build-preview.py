"""Builds a one-file web preview of the app (for sharing as a link).
Run:  EXPO_PUBLIC_WEB_PREVIEW=1 npx expo export --platform web && python3 scripts/build-preview.py OUT.html"""
import glob, sys

js = open(glob.glob('dist/_expo/static/js/web/index-*.js')[0], encoding='utf-8').read().replace('</script', '<\\/script')
page = f'''<title>rChiv prototype</title>
<style>
/* Same tokens as src/theme/tokens.ts: light glass default, muted cool greys in dark. */
:root {{ --bg: #F1F3F7; }}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{ --bg: #0E0F12; color-scheme: dark; }} }}
:root[data-theme="dark"] {{ --bg: #0E0F12; color-scheme: dark; }}
html, body {{ height: 100%; }}
body {{ margin: 0; overflow: hidden; background: var(--bg); font-family: -apple-system, 'SF Pro Text', Inter, system-ui, sans-serif; }}
#root {{ display: flex; height: 100%; flex: 1; }}
</style>
<div id="root"></div>
<script>{js}</script>
'''
open(sys.argv[1], 'w', encoding='utf-8').write(page)
print(f'{len(page) // 1024} KB -> {sys.argv[1]}')
