# 🔤 Anti-Caps Lock — Day 8/365

Detects messages with excessive uppercase letters in Haxball rooms and warns or mutes repeat offenders.  
Lightweight, fast, and easy to plug into any host script.

✨ By TLS / Teleese

---

## Features
- Detects "caps lock" messages (configurable ratio & minimum length)
- Counts offenses in a sliding window
- Auto-mutes when offenses exceed threshold
- Whitelist for exempt players
- Console helpers for stats and config

---

## Installation
1. Copy `anti-caps.js` into your Haxball host script.
2. Adjust configuration at the top if needed:
   ```js
   const CAPS_RATIO_THRESHOLD = 0.70;  // fraction of uppercase letters
   const MIN_LETTERS = 5;              // ignore short messages
   const OFFENSE_WINDOW = 30000;       // timeframe in ms
   const OFFENSES_TO_MUTE = 2;         // offenses to trigger mute
   const MUTE_DURATION = 60000;        // mute time in ms
   const WHITELIST = ["AdminNick1"];   // exempt player names
Run your room.

Console Helpers
dumpCapsStats() → prints current offenses and muted players

showCapsConfig() → prints current configuration

License
Apache 2.0 — keep NOTICE and LICENSE intact.

By TLS / Teleese — Day 8/365
---
