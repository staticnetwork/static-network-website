# STATIC Network

Production-ready landing page for [thestaticnetwork.com](https://thestaticnetwork.com), built with Vite and React.

## Local development

Requires Node.js 20.19+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Quality checks

```bash
npm run lint
npm run build
npm run preview
```

The production output is generated in `dist/`.

## Waitlist integration

The waitlist currently acknowledges form submission in the browser without
sending data. Search for `TODO` in `src/App.jsx` to connect a production
endpoint, email provider, or form service.

## Deployment

### Recommended: Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New > Project** and import the repository.
3. Vercel will detect Vite. Confirm:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy the project.
5. In **Project Settings > Domains**, add `thestaticnetwork.com` and
   `www.thestaticnetwork.com`.
6. At the domain registrar, add the exact DNS records Vercel displays for this
   project. Vercel uses an `A` record for an apex domain and a project-specific
   `CNAME` record for a subdomain such as `www`.
7. Do not alter unrelated `MX`, email-verification, or other service records.
   Remove conflicting old `A`, `AAAA`, or `CNAME` records for the same host
   names only after confirming they are no longer needed.
8. Vercel currently recommends making `www.thestaticnetwork.com` the primary
   domain and explicitly redirecting `thestaticnetwork.com` to it. Configure
   this from **Project Settings > Domains > Edit > Redirect to**.

### Netlify alternative

1. Import the GitHub repository in Netlify, or run `npm run build` and upload
   the generated `dist/` folder to Netlify Drop.
2. Use `npm run build` as the build command and `dist` as the publish directory.
3. Open **Domain management**, add `thestaticnetwork.com`, and follow Netlify's
   displayed DNS instructions.

To connect the domain, you need access to the registrar account and permission
to edit DNS records. No hosting credentials should be committed to this
repository.
