How to run this web app locally

Option 1 — Python (quick, no install if Python is present):

1. Open a terminal in this project folder (where index.html lives).
2. Run:

```powershell
python -m http.server 8000
```

3. Open your browser to http://localhost:8000

Option 2 — Node/npm (if you have Node):

```powershell
npm install -g serve
serve -s . -l 8000
```

Option 3 — VS Code Live Server extension:

- Install the Live Server extension and click "Go Live".

Using the App

1. Allow camera access when prompted.
2. Raise both hands into the frame.
3. Form a love symbol ❤️ by bringing your thumbs and index fingers together (touching or very close).
4. Hold the gesture for a moment (3+ frames) until "She is Happy! ❤️" appears.
5. Watch the image swap and the status change to confirm the gesture was detected.

Tips
- Make sure your hands are well-lit and fully visible in the camera frame.
- The green and pink skeletal overlays on the hands guide you to position them correctly.
- If the gesture isn't triggering, bring your hands closer together.
- Replace the placeholder images in `images/` with your own photos (keep filenames or update the `src` attributes in `index.html`).

Testing on Mobile (via ngrok)

To test on a mobile device with HTTPS (required for camera access):

```powershell
# Terminal 1: Start local server
python -m http.server 8000

# Terminal 2: Start ngrok tunnel (if installed)
ngrok http 8000
```

Then open the HTTPS URL shown by ngrok on your mobile device and allow camera access.


