/**
 * Submits every public URL to IndexNow (Bing, Seznam, Naver, Yandex…).
 * Run manually after a production deploy: npm run indexnow
 *
 * Nothing about the site is restated here. The host comes from lib/site.ts and
 * the URL list from the sitemap the live site is actually serving, so this
 * script cannot drift from either: a page added to app/sitemap.ts is submitted
 * on the next run with no edit here.
 *
 * Reading the deployed sitemap rather than a local build is deliberate. It
 * means the URLs pinged are the ones a crawler will really find, and it makes
 * the script independent of whether anyone remembered to build first.
 *
 * The key file must be served at /<key>.txt : it lives in public/.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEY = '33e7ae70d2ea7034e4f12afd0a4f361e';

// Single source of truth for the canonical origin, shared with the app itself.
const site = readFileSync(join(root, 'lib', 'site.ts'), 'utf8');
const SITE = site.match(/https:\/\/[^"'\s]+/)?.[0];
if (!SITE) throw new Error('No SITE_URL found in lib/site.ts');

const res = await fetch(`${SITE}/sitemap.xml`);
if (!res.ok) throw new Error(`Sitemap unreachable: ${res.status} ${res.statusText}`);
const urlList = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urlList.length === 0) throw new Error('Sitemap served no URLs');

const host = new URL(urlList[0]).host;
const ping = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: KEY, keyLocation: `https://${host}/${KEY}.txt`, urlList }),
});

console.log(`IndexNow: ${ping.status} ${ping.statusText} : ${urlList.length} URLs submitted for ${host}`);
if (!ping.ok) console.log(await ping.text());
