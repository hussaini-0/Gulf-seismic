# Gulf Seismic website rebuild

Responsive static rebuild of the public Gulf Seismic website. The source files are in `dist/`; `generate-routes.mjs` creates direct-link entry points for all implemented pages.

## Preview

```powershell
node generate-routes.mjs
python -m http.server 4173 --directory dist
```

Open `http://localhost:4173`.

The quote form prepares an email to `roadmarking@gulfseismic.com`; it does not send or store submissions. A production form endpoint can be connected when the client provides one.
