This directory stores private photo files that should NOT be served statically.

- Files here are served through `/api/photo/[id]` which requires a valid signed token
- Add your private photos here (jpg, png, webp, etc.)
- Reference them in `config/photography.json` as `"src": "./private-photos/your-photo.jpg"`

Note: `private-photos/` is NOT in `public/`, so Vercel will not serve these files directly.
