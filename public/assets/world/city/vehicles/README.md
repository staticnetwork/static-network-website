# STATIC City Vehicle Assets

Target production file:

- `stone-suv.glb`

This replaces the procedural SUV shell in the owner-only `/city?owner-preview=1` prototype.

## Required Model Structure

- Separate wheel meshes for animation.
- Separate left rear passenger door mesh or animation track.
- Separate window/glass mesh or animation track for Vibe Mode window-down.
- Cabin/dashboard mesh with a visible radio screen.
- Low-poly web LOD first, with higher-detail source file kept privately.

## Required Animation Clips

- `idle`
- `door_open`
- `door_close`
- `window_down`
- `window_up`
- `drive_loop`

## Runtime Notes

- Keep first web prototype under 12 MB.
- Forward direction should be negative Z.
- Origin should sit at ground center.
- Use baked black paint, violet cabin glow, champagne/gold trim, and optional emissive accents.
- Do not include licensed logos, music, or third-party brand marks.
