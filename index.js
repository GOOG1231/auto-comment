const axios = require("axios");
const https = require("https");
const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.urlencoded({ extended: true }));

let email = "GOOG1412123@gmail.com";
let password = "GOOG";
let commentText = "انمي زق ";
let commentsPerMinute = 120;
let delay = (60 / commentsPerMinute) * 1000;
let botActive = true;
const maxCommentsPerAnime = 999999;

let animeOrder = []; // لترتيب الإرسال يدويًا
let logText = ""; // سجل الأنمي الحالي

const animeTargets = {
  532: { active: true, name: "One Piece" },
  11729: { active: true, name: "Necronomico no Cosmic Horror Show" },
  11728: { active: true, name: "Kanojo, Okarishimasu 4th Season" },
  1: { active: false, name: "Apocalypse Hotel" },
  2: { active: false, name: "Kidou Senshi Gundam" },
  3: { active: false, name: "Shiunji-ke no Kodomotachi" },
  11673: { active: true, name: "Kijin Gentoushou" },
  11703: { active: true, name: "Vigilante: Boku no Hero" },
  11702: { active: true, name: "Summer Pockets" },
  11705: { active: true, name: "Lazarus" },
  11694: { active: true, name: "Shin Samurai-den Yaiba" },
  11697: { active: true, name: "Witch Watch" },
  11721: { active: true, name: "The All-devouring whale" },
  11724: { active: true, name: "Takopii no Genzai" },
  11710: { active: true, name: "Hibi wa Sugiredo Meshi" },
  11711: { active: true, name: "Mono" },
  653: { active: true, name: "Detective Conan" },
  11686: { active: true, name: "Anne shirley" },
  11658: { active: true, name: "Kusuriya no Hitorigoto 2nd" },
  11725: { active: true, name: "Lord of Mysteries" },
  11726: { active: true, name: "Koujo Denka no Kateikyoushi" }
};

const headers = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X)",
  "Content-Type": "application/x-www-form-urlencoded",
  "Origin": "https://ios.sanime.net",
  "Referer": "https://ios.sanime.net/",
  "Accept": "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Accept-Language": "ar"
};

const agent = new https.Agent({ keepAlive: true });

async function sendComment(animeId) {
  const itemData = {
    post: commentText,
    id: animeId,
    fire: false
  };
  const itemBase64 = Buffer.from(JSON.stringify(itemData)).toString("base64");
  const payload = new URLSearchParams({ email, password, item: itemBase64 });

  await axios.post(
    "https://app.sanime.net/function/h10.php?page=addcmd",
    payload.toString(),
    { headers, httpsAgent: agent }
  );
}

// دورة الإرسال لأنمي واحد فقط
let currentIndex = 0;
let currentCount = 0;
let currentAnimeId = null;
let intervalId = null;

function startNextAnime() {
  const activeIds = animeOrder.filter(id => animeTargets[id] && animeTargets[id].active);
  if (activeIds.length === 0) return;

  if (currentIndex >= activeIds.length) currentIndex = 0;

  currentAnimeId = activeIds[currentIndex];
  currentCount = 0;
  logText = `📺 جاري الإرسال إلى: [${currentAnimeId}] ${animeTargets[currentAnimeId].name}`;
  console.log(logText);

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(async () => {
    if (!botActive || !animeTargets[currentAnimeId].active) return;

    try {
      await sendComment(currentAnimeId);
      currentCount++;
      console.log(`✅ [${currentAnimeId}] تعليق ${currentCount}`);
    } catch (err) {
      console.error(`❌ [${currentAnimeId}] خطأ:`, err.message);
    }

    if (currentCount >= maxCommentsPerAnime) {
      clearInterval(intervalId);
      currentIndex++;
      setTimeout(startNextAnime, 1000);
    }
  }, delay);
}

function restartCycle() {
  currentIndex = 0;
  startNextAnime();
}

app.get("/", (req, res) => {
  const animeControls = Object.entries(animeTargets)
    .map(([id, info]) => `
      <label style="display:block">
        <input type="checkbox" name="anime_${id}" ${info.active ? "checked" : ""}>
        [${id}] ${info.name}
      </label>
      ترتيب: <input name="order_${id}" type="number" value="${animeOrder.indexOf(id)}" style="width: 40px"/>
    `).join("");

  res.send(`
    <html><head><style>
      body { background: #111; color: #eee; font-family: sans-serif; padding: 20px; }
      input, button { margin: 5px; padding: 7px 12px; background: #222; color: white; border: none; }
    </style></head><body>
    <h2>🤖 البوت ${botActive ? "✅ يعمل" : "🛑 متوقف"}</h2>
    <p>${logText}</p>
    <form method="POST" action="/update">
      تعليق: <input name="commentText" value="${commentText}" /><br>
      سرعة (تعليق/دقيقة): <input name="commentsPerMinute" type="number" value="${commentsPerMinute}" /><br><br>
      <strong>📺 الأنميات المفعّلة وترتيب الإرسال:</strong><br>
      ${animeControls}
      <br><button type="submit">🔄 تحديث</button>
    </form>
    <form action="/start"><button>تشغيل</button></form>
    <form action="/stop"><button>إيقاف</button></form>
    <form action="/restart"><button>إعادة إرسال التعليقات</button></form>
    </body></html>
  `);
});

app.post("/update", (req, res) => {
  commentText = req.body.commentText || commentText;
  commentsPerMinute = parseInt(req.body.commentsPerMinute) || commentsPerMinute;
  delay = (60 / commentsPerMinute) * 1000;

  animeOrder = [];

  for (const [id, info] of Object.entries(animeTargets)) {
    animeTargets[id].active = !!req.body[`anime_${id}`];
    const orderVal = parseInt(req.body[`order_${id}`]);
    if (!isNaN(orderVal)) {
      animeOrder[orderVal] = id;
    }
  }

  animeOrder = animeOrder.filter(Boolean);
  res.redirect("/");
});

app.get("/start", (req, res) => {
  botActive = true;
  res.redirect("/");
});

app.get("/stop", (req, res) => {
  botActive = false;
  res.redirect("/");
});

app.get("/restart", (req, res) => {
  restartCycle();
  res.redirect("/");
});

// Keep Alive
const KEEP_ALIVE_URL = "https://auto-comment-5g7d.onrender.com/";
setInterval(() => {
  fetch(KEEP_ALIVE_URL)
    .then(() => console.log("🔁 Keep-alive"))
    .catch(err => console.error("❌ Keep-alive:", err.message));
}, 1000 * 60 * 5);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🌐 Server on port ${PORT}`);
  animeOrder = Object.keys(animeTargets); // الترتيب الافتراضي
  startNextAnime(); // بدء الإرسال فورًا
});
