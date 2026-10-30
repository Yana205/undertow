# Reference Board — "The Lure" (Halloween Jam 2026)

Research synthesized from three threads: genre comps, theme/folklore, asset pipeline. Compiled 2026-10-30.
Sources note: itch.io and some wikis blocked direct fetching, so a few details come from search snippets — links included so you can verify.

## Verdict

A **gothic siren dress-up with live NPC reactions and vibe-tag endings** sits in a genuine gap: scored dress-up is a proven commercial pattern (Nikki series, Fashion Battle), jam-sized versions exist (Killer Couture, *Dressing To Impress (a Probably Not Magical Prince)*), yet **no comp reacts to items as you equip them**, and **no gothic/dark mermaid dress-up exists** — existing mermaid dress-ups are all cute/chibi. Pure dress-up toys rank mid-pack at jams (judges need something to complete); a 2-tag readable scoring loop fixes that for ~3 extra hours. Sirens are on-trend (Nolan's *Odyssey*, Greek-myth Halloween costumes).

## Comps that shaped the design

| Comp | What we take | What we avoid |
|---|---|---|
| [Infinity Nikki](https://en.wikipedia.org/wiki/Infinity_Nikki) / [Love Nikki](https://lovenikki.fandom.com/wiki/Styling_Battle) | Stage brief = tags; items carry tag values; grade tiers. ~$70M first-year mobile revenue proves the scoring model | 5 hidden attribute axes, 30,000-point opaque math — our vibes are visible icons |
| [Dress to Impress](https://en.wikipedia.org/wiki/Dress_to_Impress_(video_game)) (Roblox, ~10B visits) | The reveal moment + tiered result ceremony | Needs live voters — we use one NPC judge instead |
| [Fashion Battle](https://www.crazygames.com/game/fashion-battle) (CrazyGames 8.4) | Proof ~15 items is enough for a real game | Judges who never explain — our items show their vibe |
| [Dress Up! Time Princess](https://dress-up-time-princess.fandom.com/wiki/Calculating_Your_Score) | Brief as plot beat; outfit moves story | Branching chapters (art explosion) — we branch only the ending |
| [Killer Couture](https://lemonink.itch.io/killer-couture) (Girly Game Jam) | Outfit decides life or death — fatal stakes in dress-up work | VN writing load — we use animation reactions instead of prose |
| [Vortella's Dress Up](https://poki.com/en/g/vortellas-dress-up) (16M plays/mo; [dev blog](https://medium.com/feed/poki)) | No text modals (half their players dropped at one); one-tap equip; auto camera | Sandbox-only design — jam judges need a goal |
| [Dress Code: Human](https://ghostbutter.itch.io/dress-code-human) | Halloween disguise premise charm | Timer with no consequence |
| [frankenstyle](https://kindanice.itch.io/frankenstyle) (4.9/5) | Cute-horror dress-up audience exists | Collection phase longer than dressing |
| [Dressing To Impress (…Prince)](https://littlerat.itch.io/dressing-to-impress) | 11 endings from outfit choice, in a 20-min jam game | — |
| Dress Up Vault [Halloween entries](https://dressupvault.itch.io/witch-dress-up) | Annual Halloween dress-up audience on itch | **Their lesson: no-goal toys rank mid-pack** |

### Table stakes (every successful comp)
1-second-readable brief · instant equip feedback, no modals · a reveal moment · tiered judgment · 4–6 slots × 3–5 real choices · freeplay escape hatch after the story.

### The gap we exploit
- **Live reaction while dressing** — no comp has the judge react per-item. Ours is the sailor: lean in / step back / breath catch.
- **Scoring that explains itself** — visible vibe icon per item (Lure / Mercy / Memory).
- **Bittersweet consequence** — horror dress-ups attach stakes to story, scored ones to numbers; we attach them to one quiet character moment.

## Folklore & theme

- **Rusalka** ([Wikipedia](https://en.wikipedia.org/wiki/Rusalka)) — drowned girl's spirit; lures with beauty/song; some versions **change their looks to suit the man being lured** → dress-up IS the lore. Appears in Castlevania, The Witcher (2025), Dvořák's opera.
- **Sirens** ([Encyclopedia.com](https://www.encyclopedia.com/history/encyclopedias-almanacs-transcripts-and-maps/sirens)) — song draws sailors; medieval tradition merged sirens into mermaids (sirena/sirène). Timely: *The Odyssey* (2026), Greek myth is a [2026 costume trend](https://www.ldnfashion.com/features/halloween-costumes-2026/).
- **Selkie** ([Wikipedia](https://en.wikipedia.org/wiki/Selkie)) — clothing as identity; a stolen garment decides land or sea. Feeds the "Memory" ending.
- Jewelry as **trophies from drowned sailors** — each item carries history.
- Tone precedent: "cozy about death" sells — [Spiritfarer](https://nintendowire.com/news/2021/12/14/spiritfarer-surpasses-1-million-copies-sold/) (1M+), [Dredge](https://gamingbolt.com/dredge-crosses-1-million-units-sold-smashes-internal-expectations/amp)'s calm-then-dread (1M+), [Moonlight Peaks](https://nichegamer.com/moonlight-peaks-tops-200000-copies-sold/) gothic-cozy (200k+).

## Asset pipeline findings

- **Per fitted AI item**: ~25 min average (generate → pick → cutout → align → clean), 10–15 min for unfitted accessories. Budget accordingly.
- **Inpainting onto a locked base** beats whole-image edits (no re-alignment). Gemini/Nano Banana keeps identity but drifts alignment — fix with Difference-blend + Auto-Align; [start a fresh chat every ~4 edits](https://ud.hk/en/blogs/insight/article/nano-banana-21-consistency-2026-10-12).
- **Generation hygiene** ([roboticape write-up](https://roboticape.com/2026/03/07/generating-game-sprites-with-gemini-image-generation-nano-banana-pro-lessons-learned/)): `#00FF00` background + HSV keying; ask for a 2–3px white outline; generate in neutral grey and recolor; **sheets of 3–6 items stay consistent**, separate calls drift.
- **Cutout**: BiRefNet / [ToonOut](https://arxiv.org/html/2509.06839v1) for anime-style; rembg `isnet-anime` as fallback. **Lace/veils/wisps are the hardest cutouts — favor opaque shapes.**
- **Recolor multiplier**: generate neutral, tint via gradient-map/palette shader → every item = 3–4 colorways. One shared post-process (palette + grain + outline) hides AI style drift. This is where Yana's shader skills pay off most.
- **Web tech**: stacked absolutely-positioned full-canvas PNGs (no anchor math); click-to-equip ≈ 1h vs drag-and-drop ≈ 3–5h+bugs; [hackrew](https://github.com/ksadov/hackrew) is a forkable Picrew-style reference (`parts.json` order = z-order); [meiker.io's labels](https://meiker.io/instructions) are a good layer-organization spec (`[fixed]`, `[ref:name]` front/back links, `[dynamic]` recolor).
- **itch.io packaging**: zip with `index.html` at root; case-sensitive filenames; set embed to the game's aspect; mobile gets click-to-play fullscreen — rescale on resize; **mandatory [GenAI disclosure field](https://www.gamingonlinux.com/2024/11/itchio-store-now-requires-ai-generated-content-disclosures-for-assets)** — and check the jam's own AI-art rules before submitting.
- Thumbnails: don't reuse full layers (a 1024×1536 RGBA ≈ 6MB decoded) — make small WebP thumbs.

## Yana's existing assets (the real head start)

- 4 tail+body bases in one consistent style: Oceanic, Pale Pearlescent, Deep Current, Shallow Reef — **used whole, never cut tail from body**.
- 8 hair options (4 gothic + 4 colored) — a full wardrobe slot already done, free vibe carriers.
- APC human wardrobe pack — reserve pieces as potential "Memory" items (her old locket/scarf angle) or skip.
