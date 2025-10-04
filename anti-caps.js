const CAPS_RATIO_THRESHOLD = 0.70;
const MIN_LETTERS = 5;
const OFFENSE_WINDOW = 30000;
const OFFENSES_TO_MUTE = 4;
const MUTE_DURATION = 60000;
const WHITELIST = ["AdminNick1", "AdminNick2"];
const fancyFont = "font-family: monospace; color: #ff66cc; font-weight: bold;";

const offenseMap = new Map();
const muted = new Map();

function now() { return Date.now(); }

function cleanupOldOffenses(id) {
  const arr = offenseMap.get(id) || [];
  const cutoff = now() - OFFENSE_WINDOW;
  const kept = arr.filter(ts => ts >= cutoff);
  if (kept.length) offenseMap.set(id, kept);
  else offenseMap.delete(id);
}

function recordOffense(id) {
  const arr = offenseMap.get(id) || [];
  arr.push(now());
  offenseMap.set(id, arr);
  cleanupOldOffenses(id);
  return arr.length;
}

function isMuted(id) {
  if (!muted.has(id)) return false;
  if (now() >= muted.get(id)) {
    muted.delete(id);
    return false;
  }
  return true;
}

function setMute(id, secs) {
  muted.set(id, now() + secs * 1000);
}

function countLettersAndUpper(s) {
  let letters = 0, upper = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z')) {
      letters++;
      if (ch >= 'A' && ch <= 'Z') upper++;
    }
  }
  return { letters, upper };
}

room.onPlayerChat = function(player, message) {
  try {
    const id = player.id;
    if (WHITELIST.includes(player.name)) return true;
    if (isMuted(id)) {
      room.sendAnnouncement("You are muted for caps/spam. Wait a bit — By TLS", id, 0xFF4444, "bold", 1);
      console.log(`%c[MUTED] ${player.name} tried to chat while muted — By TLS`, fancyFont);
      return false;
    }

    const { letters, upper } = countLettersAndUpper(message || "");
    if (letters < MIN_LETTERS) return true;

    const ratio = upper / letters;
    if (ratio >= CAPS_RATIO_THRESHOLD) {
      const offenses = recordOffense(id);
      console.log(`%c[OFFENSE] ${player.name} caps ratio ${ratio.toFixed(2)} offenses=${offenses} — By TLS`, fancyFont);
      room.sendAnnouncement(`${player.name}: please avoid excessive CAPS. (${offenses}/${OFFENSES_TO_MUTE})`, null, 0xFFAA00, "bold", 2);

      if (offenses >= OFFENSES_TO_MUTE) {
        setMute(id, MUTE_DURATION / 1000);
        offenseMap.delete(id);
        room.sendAnnouncement(`${player.name} muted for ${MUTE_DURATION/1000}s for caps/spam — By TLS`, null, 0xFF0000, "bold", 2);
        console.log(`%c[MUTE] ${player.name} muted for caps/spam — By TLS`, fancyFont);
      }
      return false;
    }

    cleanupOldOffenses(id);
    return true;
  } catch (e) { console.warn("%cError in anti-caps handler:", fancyFont, e); return true; }
};

room.onPlayerLeave = function(playerId) {
  offenseMap.delete(playerId);
  muted.delete(playerId);
};

globalThis.dumpCapsStats = function() {
  console.log("%c=== Anti-Caps Stats Dump ===", fancyFont);
  console.log("Offenses:");
  for (const [id, arr] of offenseMap.entries()) console.log({ id, offenses: arr.length, times: arr.slice(-5) });
  console.log("Muted:");
  for (const [id, until] of muted.entries()) console.log({ id, unmuteAt: new Date(until).toISOString() });
  console.log("%c=== End Dump ===", fancyFont);
};

globalThis.showCapsConfig = function() {
  console.log(`%cConfig: CAPS_RATIO_THRESHOLD=${CAPS_RATIO_THRESHOLD}, MIN_LETTERS=${MIN_LETTERS}, OFFENSE_WINDOW=${OFFENSE_WINDOW}ms, OFFENSES_TO_MUTE=${OFFENSES_TO_MUTE}, MUTE_DURATION=${MUTE_DURATION}ms`, fancyFont);
};

room.onRoomLink = function() {
  console.log("%cAnti-Caps Lock active — By TLS", fancyFont);
  globalThis.showCapsConfig();
};
