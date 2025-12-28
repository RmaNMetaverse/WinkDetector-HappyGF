https://github.com/user-attachments/assets/74c6d2aa-e81e-43ad-ba7f-4098dfd0ffc5

# Show Her the ❤️

Small browser-based demo that uses MediaPipe Hands to detect a love symbol gesture (two hands forming a heart) and swap an image reaction.

Features
- Real-time hand pose detection using MediaPipe Hands (runs in-browser).
- Draws hand skeletal overlays (pink and green) to guide the user in forming the love symbol.
- Shows a "neutral" image and switches to a "happy" version when the love symbol gesture is detected and held for 3+ frames.
- Minimal, dependency-free static site (uses CDN for MediaPipe and Tailwind).

Quick start

Prerequisites: modern browser with webcam access.


Run Online: https://rmanmetaverse.github.io/mediapipe-LoveDetector-HappyGF/

Run Locally

Clone the project on your system and use one of the options below:

Run with Python http.server (quick):

```powershell
python -m http.server 8000
# open http://localhost:8000
```

Or with Node `serve`:

```powershell
npm install -g serve
serve -s . -l 8000
```

Or use the VS Code Live Server extension.

Usage
- Allow camera access when prompted.
- Raise both hands into the frame.
- Form a love symbol by bringing your thumbs and index fingers together (creating a heart outline).
- Hold the gesture for a moment (3+ frames) until "She is Happy! ❤️" appears.
- Replace the placeholder images in `images/` with your own photos (keep filenames or update `index.html`).

How It Works
- The app detects both hands and checks if they form a love symbol gesture.
- Green skeletal overlay = left hand, Pink skeletal overlay = right hand.
- Status badge shows live feedback: "No hands detected" → "Raise both hands..." → "Make the love symbol..." → "LOVE SYMBOL DETECTED!".
- Debug text at the bottom shows hand count and gesture hold progress.

Privacy
- Video frames are processed locally in the browser and are not sent to any server.

Troubleshooting
- If hands aren't detected, ensure good lighting on your hands and that they're fully in frame.
- If the gesture isn't triggering, try bringing your hands closer together (adjust `HAND_PROXIMITY_THRESHOLD` in `app.js` if needed).
- Use the hand skeleton overlays as a guide to position your hands correctly.

License
- MIT — feel free to fork and adapt.
