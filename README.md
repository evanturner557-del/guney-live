# Güney Yaşam Köyü Website

Static web platform prototype for `guney.live`.

## Local Preview

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173`.

## GoDaddy Deployment

Upload these files and folders to the domain's `public_html` directory:

- `index.html`
- `src/`
- `.htaccess`
- `404.html`
- `robots.txt`
- `sitemap.xml`

The site is a hash-routed static app, so it works on basic shared hosting without server rewrite rules.

If GoDaddy hides dotfiles in the file manager, enable hidden files before uploading `.htaccess`.

## Included Surfaces

- Public website
- Charter and application flow
- Projects, opportunities, stays and house bank
- Producer marketplace
- Events, stories and transparency dashboards
- Member portal, contribution ledger, role model and governance demo

## Next Backend Step

The current build stores demo newsletter/application submissions in browser local storage. A production version should add authentication, a database, role-based permissions, file storage, payment integrations and admin workflows.
