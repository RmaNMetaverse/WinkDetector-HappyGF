// app.js - Hand pose detection for love symbol gesture
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const videoElement = document.getElementById('input_video');
  const canvasElement = document.getElementById('output_canvas');
  const canvasCtx = canvasElement.getContext('2d');
  const loadingScreen = document.getElementById('loading');
  const cameraWrapper = document.getElementById('camera-wrapper');
  const statusBadge = document.getElementById('status-badge');
  const debugText = document.getElementById('debug-text');

  const imgNeutral = document.getElementById('img-neutral');
  const imgHappy = document.getElementById('img-happy');
  const moodText = document.getElementById('mood-text');

  // State
  let isLoveSymbolDetected = false;
  let isModelLoaded = false;
  let loveSymbolHoldCounter = 0;
  const LOVE_SYMBOL_HOLD_FRAMES = 3; // require gesture for 3+ frames

  // Constants for Hand Pose Detection
  const HAND_PROXIMITY_THRESHOLD = 150; // pixels — how close hands must be
  const HAND_GESTURE_THRESHOLD = 0.2; // distance threshold for love symbol fingers

  // Detect mobile devices
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '');

  // Euclidean distance helper
  function distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Check if two hands form a love symbol
  // Love symbol: both hands with thumbs and index fingers close together, forming a heart outline
  function checkLoveSymbol(landmarks1, landmarks2, w, h) {
    if (!landmarks1 || !landmarks2) return false;

    // Hand landmarks: thumb=4, index=8, middle=12, ring=16, pinky=20
    const thumb1 = { x: landmarks1[4].x * w, y: landmarks1[4].y * h };
    const index1 = { x: landmarks1[8].x * w, y: landmarks1[8].y * h };
    const thumb2 = { x: landmarks2[4].x * w, y: landmarks2[4].y * h };
    const index2 = { x: landmarks2[8].x * w, y: landmarks2[8].y * h };

    // Distance between thumb and index of same hand should be moderate (forming a "V")
    const v1_distance = distance(thumb1, index1);
    const v2_distance = distance(thumb2, index2);

    // Distance between the two hands (proximity check)
    const handProximity = distance(
      { x: (thumb1.x + index1.x) / 2, y: (thumb1.y + index1.y) / 2 },
      { x: (thumb2.x + index2.x) / 2, y: (thumb2.y + index2.y) / 2 }
    );

    // Love symbol detected if:
    // - Both hands have good V shape (thumb-index distance 30-100px)
    // - Hands are close together (< threshold)
    const isLoveGesture =
      v1_distance > 30 && v1_distance < 100 &&
      v2_distance > 30 && v2_distance < 100 &&
      handProximity < HAND_PROXIMITY_THRESHOLD;

    return isLoveGesture;
  }

  // Draw hand landmarks and skeleton
  function drawHands(ctx, results, w, h) {
    if (!results.multiHandLandmarks) return;

    const hands = results.multiHandLandmarks;
    const handedness = results.multiHandedness || [];

    hands.forEach((landmarks, idx) => {
      const hand = handedness[idx];
      const isRightHand = hand && hand.label === 'Right';
      const color = isRightHand ? '#ff006e' : '#4ade80'; // Pink for right, green for left

      // Draw finger bones
      const fingerConnections = [
        [0, 1, 2, 3, 4], // thumb
        [0, 5, 6, 7, 8], // index
        [0, 9, 10, 11, 12], // middle
        [0, 13, 14, 15, 16], // ring
        [0, 17, 18, 19, 20] // pinky
      ];

      fingerConnections.forEach(finger => {
        for (let i = 0; i < finger.length - 1; i++) {
          const from = landmarks[finger[i]];
          const to = landmarks[finger[i + 1]];
          const fromPixel = { x: from.x * w, y: from.y * h };
          const toPixel = { x: to.x * w, y: to.y * h };

          ctx.beginPath();
          ctx.moveTo(fromPixel.x, fromPixel.y);
          ctx.lineTo(toPixel.x, toPixel.y);
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      });

      // Draw landmarks (joints)
      landmarks.forEach((landmark, idx) => {
        const pixel = { x: landmark.x * w, y: landmark.y * h };
        ctx.beginPath();
        ctx.arc(pixel.x, pixel.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    });
  }

  // Handle Results from MediaPipe Hands
  function onResults(results) {
    if (!isModelLoaded) {
      isModelLoaded = true;
      loadingScreen.style.display = 'none';
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    const w = canvasElement.width;
    const h = canvasElement.height;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length === 2) {
      // Two hands detected
      const landmarks1 = results.multiHandLandmarks[0];
      const landmarks2 = results.multiHandLandmarks[1];

      // Check for love symbol gesture
      const isLoveGesture = checkLoveSymbol(landmarks1, landmarks2, w, h);

      // Draw hand overlays
      drawHands(canvasCtx, results, w, h);

      // Update hold counter
      if (isLoveGesture) {
        loveSymbolHoldCounter++;
      } else {
        loveSymbolHoldCounter = 0;
      }

      const loveSymbolConfirmed = loveSymbolHoldCounter >= LOVE_SYMBOL_HOLD_FRAMES;

      // Log on mobile
      if (isMobile) {
        console.log(`[Hand] Gesture: ${isLoveGesture ? 'LOVE' : 'NO'}, Hold: ${loveSymbolHoldCounter}`);
      }

      // Update UI
      if (loveSymbolConfirmed) {
        isLoveSymbolDetected = true;
        statusBadge.innerText = 'LOVE SYMBOL DETECTED!';
        statusBadge.className = 'absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-20';
        cameraWrapper.classList.add('active');

        imgHappy.classList.remove('hidden-img');
        imgHappy.classList.add('visible-img');
        imgNeutral.classList.remove('visible-img');
        imgNeutral.classList.add('hidden-img');

        moodText.innerText = 'She is Happy! ❤️';
        moodText.className = "text-3xl font-bold font-['Fredoka_One'] text-pink-400";

        if (isMobile) console.log('[Hand] LOVE SYMBOL CONFIRMED');
      } else {
        isLoveSymbolDetected = false;
        statusBadge.innerText = 'Make the love symbol...';
        statusBadge.className = 'absolute top-4 right-4 bg-gray-800/80 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold border border-gray-600 z-20';
        cameraWrapper.classList.remove('active');

        imgNeutral.classList.remove('hidden-img');
        imgNeutral.classList.add('visible-img');
        imgHappy.classList.remove('visible-img');
        imgHappy.classList.add('hidden-img');

        moodText.innerText = "Show her the love!";
        moodText.className = "text-3xl font-bold font-['Fredoka_One'] text-white";
      }

      debugText.innerText = `Hands: 2 | Hold: ${loveSymbolHoldCounter}/${LOVE_SYMBOL_HOLD_FRAMES}`;
    } else if (results.multiHandLandmarks && results.multiHandLandmarks.length === 1) {
      // One hand detected
      drawHands(canvasCtx, results, w, h);
      loveSymbolHoldCounter = 0;

      statusBadge.innerText = 'Raise both hands...';
      statusBadge.className = 'absolute top-4 right-4 bg-yellow-500/80 text-white px-3 py-1 rounded-full text-xs font-bold z-20';
      cameraWrapper.classList.remove('active');

      imgNeutral.classList.remove('hidden-img');
      imgNeutral.classList.add('visible-img');
      imgHappy.classList.remove('visible-img');
      imgHappy.classList.add('hidden-img');

      moodText.innerText = "Show her the love!";
      moodText.className = "text-3xl font-bold font-['Fredoka_One'] text-white";

      debugText.innerText = `Hands: 1 | Need both!`;
    } else {
      // No hands detected
      loveSymbolHoldCounter = 0;
      statusBadge.innerText = 'No hands detected';
      statusBadge.className = 'absolute top-4 right-4 bg-red-500/80 text-white px-3 py-1 rounded-full text-xs font-bold z-20';
      cameraWrapper.classList.remove('active');

      imgNeutral.classList.remove('hidden-img');
      imgNeutral.classList.add('visible-img');
      imgHappy.classList.remove('visible-img');
      imgHappy.classList.add('hidden-img');

      moodText.innerText = "Show her the love!";
      moodText.className = "text-3xl font-bold font-['Fredoka_One'] text-white";

      debugText.innerText = `Hands: 0`;
    }

    canvasCtx.restore();
  }

  // Initialize Hands
  const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }});

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: isMobile ? 0 : 1, // 0 = lite, 1 = full
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.5
  });

  hands.onResults(onResults);

  // Initialize Camera with mobile-friendly defaults
  const camera = new Camera(videoElement, {
    onFrame: async () => {
      await hands.send({image: videoElement});
    },
    width: isMobile ? 360 : 640,
    height: isMobile ? 480 : 480,
    facingMode: 'user'
  });

  // Handle Canvas Resizing
  function resizeCanvas() {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
  }
  videoElement.addEventListener('loadedmetadata', resizeCanvas);

  camera.start().catch(err => {
    console.error('Camera error:', err);
    loadingScreen.innerHTML = `<div class='text-red-500 text-center p-4'>Error accessing camera.<br>Please ensure you gave permission and reload.</div>`;
  });
});
