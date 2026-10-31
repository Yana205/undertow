# Drop-in tops workflow (Gemini → game, guaranteed fit)

1. Generate tops in Gemini with the prompt below — **one garment per image**.
2. Save the PNGs into this folder (any filename, any resolution).
3. Tell Claude "fit the new tops" — each becomes an entry in
   `tools/incoming_items.json` with `fitwidth` (auto-scales to the body,
   no proportions math needed) and lands in the wardrobe.

## The prompt (attach BOTH the APC body base AND one mermaid sheet as references)

> Draw ONLY a garment, no body, no mannequin: a [kelp-wrap top / pearl-scale
> bralette / torn sailor-shirt tied at the waist / seaweed shawl] for the
> attached character. Front view, laid out exactly as it would sit worn on
> the attached body's torso and arms (same pose: left arm down, right arm
> bent up). Painterly semi-realistic style matching the attached mermaid
> art. Soft front lighting, muted sea-gothic palette. Solid white
> background, nothing else in the image, no text, no watermark, clean
> edges with a subtle dark outline.

Tips that matter (from the pipeline research):
- one item per image — sheets of garments drift in placement
- avoid lace / fishnet / wispy veils — they cut out badly
- keep sleeves following the pose (right sleeve bent up) so it hugs the arms
- ask for 3–4 ideas in separate messages, keep the best

## Fitting numbers (for reference)
- fitted top width on canvas ≈ 300–340 px (`fitwidth`), anchored at the neck
- the auto-fit measures the garment's own width, so export size is irrelevant
