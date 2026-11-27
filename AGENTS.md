<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Padrinhos site
- The landing page is the migrated Manus static site: markup in src/padrinhos/page.html (rendered raw), styles in src/padrinhos/padrinhos.css, scroll animation in src/padrinhos/burger-scrub.ts. Why: keeps the approved design identical to the source.
- The burger animation uses the first 27 source frames from the Salada Bacon ZIP, motion-interpolated and retimed to 80 WebP frames at 50 fps (1.6 s playback). Frame 27 leaves 16 source pixels above the bun; frame 30 is the first clipped source frame. Desktop scrubs the canvas sequence with scroll; mobile plays it once. The processed frame background and all main page sections match #ED72A8.
