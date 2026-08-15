# 🏁 Rockin Racer - 99-Level Arcade Grand Prix

[![HTML5 Canvas](https://img.shields.io/badge/Tech-HTML5_Canvas_%26_SVG-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Audio-Web_Audio_API-brightgreen.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**Rockin Racer** is a fast-paced retro-arcade racing game built with pure HTML5, CSS3, JavaScript, and Web Audio API. Steer through **99 progressive arcade stages**, dodge cones, oil slicks, and aggressive AI rival traffic, collect power-ups, manage your nitro tank, and cross the checkered finish line to become the **Grand Champion**!

---

## 🌟 Key Features

- 🏎️ **Car Selection Garage**: Pick from 4 racecars with distinct traits:
  - 🔴 **Red Firestar**: Classic balanced acceleration & handling.
  - 🔵 **Neon Specter**: **+50% Nitro Recharge Rate**.
  - 🟡 **Gold Phantom**: **+25% Score Multiplier**.
  - 🟢 **Cyber Lightning**: **Free Energy Shield every stage**.
- 🏆 **99-Stage Progressive Grand Prix**: Single continuous arcade campaign alternating between high-speed horizontal speedways and vertical 3-lane expressways.
- 🌌 **6 Dynamic Racing Biomes**: Procedural cache-proof road surfaces evolving every 5 stages:
  - 🏙️ **Cyber Metropolis**: Obsidian asphalt & neon cyan/magenta curbs.
  - 🌅 **Outrun Sunset**: Indigo twilight speedway & radiant sunset gold/pink curbs.
  - 🌃 **Tokyo Drift Midnight**: Wet charcoal expressway & emerald green/violet curbs.
  - 🔥 **Solar Flare Desert**: Scorching canyon tarmac & blazing crimson/gold curbs.
  - ⚡ **Neo Matrix Grid**: Pitch black cyber road & ultra-bright matrix lime laser rails.
  - 🌌 **Cosmic Hyperway**: Deep sapphire speedway & iridescent starfield curbs.
- 🏁 **Dynamic In-World Finish Line**: Overhead illuminated truss racing gantry with flashing strobe beacons and a **breakable checkered ribbon** that bursts into golden/cyan confetti cannons when struck!
- 🏎️ **Dynamic AI Rival Traffic**: Weave past civilian and competitor racers who switch lanes and block your path.
- 📊 **Real-Time HUD Track Progress Bar**: Visual distance indicator (`START ───🏎️───🏁 FINISH`) showing your exact progress to the finish line.
- 📖 **In-Game How To Play & Controls Guide**: Accessible directly from the title screen or pause menu with arcade keycap diagrams.
- ⏸️ **Pause & Menu System**: Press `P` or `ESC` anytime to pause the race, review objectives, or restart.
- ⚡ **Power-Up System**:
  - ⚡ **Nitro Boost**: Hold `Spacebar` to surge forward at 1.75x speed with invulnerability.
  - 🛡️ **Energy Shield**: Absorbs 1 obstacle, traffic, or hazard impact.
  - ⭐ **Gold Star**: +500 bonus score points.
  - ⏱️ **Bullet-Time**: Slows down hazards for 4 seconds for surgical steering.
- 🚧 **Hazard Systems**: Traffic cones, oil slicks causing 360° spinouts, and rival traffic.
- 🎵 **Web Audio API Synth Engine**: 100% reliable synthesized SFX (pickups, shield shatter, traffic smash, nitro whoosh, crash explosions, victory fanfare).
- 💾 **High Score Persistence**: Automatically saves your highest score and current level progress in `localStorage`.

---

## 🕹️ Controls Guide

| Action | Control Keys |
|---|---|
| **Steer / Accelerate / Brake (4-Way)** | `W` `A` `S` `D` or `Arrow Keys` |
| **Nitro Boost (Hold)** | `Spacebar` |
| **Pause / Resume Race** | `P` or `Escape` |
| **Toggle Sound Mute** | `M` or HUD `🔊` / `🔇` button |
| **Open How To Play** | Click `📖 HOW TO PLAY & CONTROLS` in menu |
| **Choose Racecar** | Click car card in Garage |

---

## 🏆 How To Win

1. **Stage Clear**: Avoid crashing into cones or rival cars, manage your nitro, and cross the **Checkered Finish Line (`🏁`)** at the end of each track.
2. **Grand Champion Victory**: Beat all **99 Stages** to earn the Grand Champion title and set the all-time high score!

---

## 🚀 How to Run Locally

### Option 1: Node.js / NPX (Recommended)
From the project directory, run:

```bash
cd rockinracer
npx -y serve .
```

Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

### Option 2: Python HTTP Server (Built-in)
If you have Python 3 installed:

```bash
cd rockinracer
python3 -m http.server 8000
```

Open your browser at: **[http://localhost:8000](http://localhost:8000)**

---

### Option 3: Direct Browser Launch
You can open `index.html` directly in macOS Safari, Chrome, or Firefox:

```bash
open index.html
```

---

## 📁 Project Structure

```
rockinracer/
├── index.html       # Game HTML structure, HUD bar, how-to-play guide, pause & win modals
├── styles.css       # Neon arcade styling, keycaps, progress bar, glassmorphism HUD
├── engine.js        # Core game engine, 99-level progression, rival AI, vector SVGs & audio synth
├── package.json     # Node project configuration
├── README.md        # Documentation and setup instructions
├── sound/           # Preloaded audio assets
│   ├── intro.mp3
│   ├── background.wav
│   └── driving.mp3
└── *.png / *.jpg    # Background textures and media assets
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

