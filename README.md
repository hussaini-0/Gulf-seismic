# Gulf Seismic site replication

This project hosts a new, private copy of the public pages at [gulfseismic.com](https://gulfseismic.com). `mirror-site.mjs` captures the reference's server-rendered HTML for its public sitemap and 128 city/service combinations, and stores the referenced styles, fonts, images, and evidence PDFs locally in `dist/`. `dist/replica.js` restores interactive elements that need client-side behavior in the static copy.

## Preview

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:4173`.

## Refresh public content

```powershell
node mirror-site.mjs
```

This requires network access. It updates captured public content and assets while retaining the local interaction files in `dist/replica.js` and `dist/replica.css`.

## Form delivery

The visual quote form and its validation are present. Submission currently prepares an email to `roadmarking@gulfseismic.com`; it does not send directly from the website. Connect a client-approved email or API endpoint before using the form as a production lead channel.
