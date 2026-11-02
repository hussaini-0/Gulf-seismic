import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const origin = 'https://gulfseismic.com';
const output = join(process.cwd(), 'dist');
await mkdir(output, { recursive:true });
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const serviceSlugs = ['road-marking','thermoplastic-road-marking','parking-lot-marking','warehouse-marking','airport-marking','industrial-marking','safety-signage','epoxy-flooring'];
const cities = { uae:['Abu Dhabi','Dubai','Sharjah','Ajman','Ras Al Khaimah','Fujairah','Al Ain','Umm Al Quwain'], 'saudi-arabia':['Riyadh','Jeddah','Dammam','Al Khobar','Jubail','Yanbu','Makkah','Madinah'] };

async function request(path, allow404 = false) {
  const response = await fetch(new URL(path, origin), { signal: AbortSignal.timeout(30000), headers: { 'user-agent':'GulfSeismicClientRebuild/1.0' } });
  if (!response.ok && !(allow404 && response.status === 404)) throw new Error(`${response.status} ${path}`);
  return response;
}

async function parallel(items, limit, task) {
  let index = 0;
  const errors = [];
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const item = items[index++];
      try { await task(item); } catch (error) { errors.push(`${item}: ${error.message}`); }
    }
  }));
  if (errors.length) console.error(errors.join('\n'));
  return errors;
}

const sitemap = await (await request('/sitemap.xml')).text();
await writeFile(join(output, 'sitemap.xml'), sitemap);
const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
const cityServicePaths = Object.entries(cities).flatMap(([country, list]) => list.flatMap(city => serviceSlugs.map(service => `/${country}/${city === 'Al Khobar' ? 'khobar' : slug(city)}/${service}`)));
const source404Routes = ['/projects/abu-dhabi-highway-thermoplastic', '/projects/dammam-airport-taxiway-marking', '/projects/dubai-mall-parking-marking', '/projects/jubail-petrochemical-hazard-marking', '/projects/riyadh-warehouse-epoxy-marking', '/projects/sharjah-factory-epoxy-floor'];
const paths = [...new Set([...sitemapPaths, ...cityServicePaths, '/services/infrastructure-works', ...source404Routes])];
const assets = new Set(['/logo.png','/site.webmanifest','/favicon.ico','/favicon-32.png','/favicon-16.png','/apple-touch-icon.png']);
const source404 = [];
const failures = await parallel(paths, 10, async path => {
  const response = await request(path, source404Routes.includes(path));
  if (response.status === 404) source404.push(path);
  const html = await response.text();
  for (const match of html.matchAll(/(?:\/_next\/static\/[^"'<>\s)\\]+|\/images\/[^"'<>\s)\\]+|\/downloads\/[^"'<>\s)\\]+|\/logo\.png)/g)) {
    const asset = match[0].replace(/&amp;/g, '&').split(/[?#]/)[0];
    assets.add(asset);
  }
  for (const match of html.matchAll(/\/_next\/image\?url=([^&"'<> ]+)/g)) assets.add(decodeURIComponent(match[1]));
  const cleaned = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b[^>]*\bas="script"[^>]*>/gi, '')
    .replace(/<link\b[^>]*\brel="modulepreload"[^>]*>/gi, '')
    .replace(/style="opacity:0;transform:[^"]*"/g, 'style="opacity:1;transform:none"')
    .replace(/\/_next\/image\?url=([^&"'<> ]+)(?:&amp;|&)w=\d+(?:&amp;|&)q=\d+/g, (_, encoded) => decodeURIComponent(encoded))
    .replace(/https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[^" ]+/g, '/images/blog/hot-thermoplastic-vs-cold-paint.jpg')
    .replace('</head>', '<link rel="stylesheet" href="/replica.css"/></head>')
    .replace('</body>', '<script defer src="/replica.js"></script></body>');
  const target = join(output, path, 'index.html');
  await mkdir(dirname(target), { recursive:true });
  await writeFile(target, cleaned);
});

let downloaded = 0;
let pending = [...assets];
while (pending.length) {
  const batch = pending;
  pending = [];
  await parallel(batch, 10, async path => {
    if (path.startsWith('/_next/static/chunks/') && path.endsWith('.js')) return;
    const response = await request(path);
    const bytes = Buffer.from(await response.arrayBuffer());
    const target = join(output, path);
    await mkdir(dirname(target), { recursive:true });
    await writeFile(target, bytes);
    downloaded++;
    if (path.endsWith('.css')) {
      const css = bytes.toString('utf8');
      for (const match of css.matchAll(/url\((?:["']?)([^)"']+)(?:["']?)\)/g)) {
        if (match[1].startsWith('data:')) continue;
        const url = new URL(match[1], new URL(path, origin));
        if (url.origin === origin && !assets.has(url.pathname)) { assets.add(url.pathname); pending.push(url.pathname); }
      }
    }
  });
}
const blogThumb = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1tp95sAUpyu5pT2v6N833bJiD9gm7EAHMUi4dDc148gMJn-Aa3Xv2hSMN&s=10';
const thumbResponse = await fetch(blogThumb, { signal:AbortSignal.timeout(30000) });
if (thumbResponse.ok) {
  const target = join(output, 'images/blog/hot-thermoplastic-vs-cold-paint.jpg');
  await mkdir(dirname(target), { recursive:true });
  await writeFile(target, Buffer.from(await thumbResponse.arrayBuffer()));
}
console.log(JSON.stringify({ listedRoutes:sitemapPaths.length, cityServiceRoutes:cityServicePaths.length, mirroredRoutes:paths.length-failures.length-source404.length, source404:source404.length, failedRoutes:failures.length, assets:downloaded }));
