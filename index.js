const axios = require("axios");
const https = require("https");
const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.urlencoded({ extended: true }));

let email = "GOOG1412123@gmail.com";
let password = "GOOG";
let commentText = "انمي حْرا ";
let commentsPerMinute = 60;
let delay = (60 / commentsPerMinute) * 1000;
let botActive = true;
const maxCommentsPerAnime = 500;

const animeTargets = {
  532: { active: true, name: "One Piece" },
  11729: { active: true, name: "Necronomico no Cosmic Horror Show" },
  11728: { active: true, name: "Kanojo, Okarishimasu 4th Season" },
  1: { active: false, name: "Apocalypse Hotel" },
  2: { active: false, name: "Kidou Senshi Gundam" },
  3: { active: false, name: "Shiunji-ke no Kodomotachi" },
  11673: { active: true, name: "Kijin Gentoushou" },
  4: { active: false, name: "Compass 2.0: Sentou" },
  11703: { active: true, name: "Vigilante: Boku no Hero" },
  11702: { active: true, name: "Summer Pockets" },
  5: { active: false, name: "Aharen-san wa Hakarenai" },
  11705: { active: true, name: "Lazarus" },
  6: { active: false, name: "Maebashi Witches" },
  7: { active: false, name: "Gorilla no kami kara kago" },
  11694: { active: true, name: "Shin Samurai-den Yaiba" },
  11697: { active: true, name: "Witch Watch" },
  11721: { active: true, name: "The All-devouring whale" },
  11718: { active: false, name: "Ore wa Seikan Kokka no" },
  11724: { active: true, name: "Takopii no Genzai" },
  8: { active: false, name: "Classic*Stars" },
  9: { active: false, name: "A-Rank Party wo" },
  11710: { active: true, name: "Hibi wa Sugiredo Meshi" },
  11711: { active: true, name: "Mono" },
  10: { active: false, name: "Kuroshitsuji: Midori no Majo" },
  11: { active: false, name: "Katainaka no Ossan Kensei" },
  653: { active: true, name: "Detective Conan" },
  11686: { active: true, name: "Anne shirley" },
  12: { active: false, name: "Slime Taoshite 300-nen" },
  13: { active: false, name: "Nazotoki wa Dinner no Ato d" },
  14: { active: false, name: "Chuuzenji-sensei Mononoke" },
  15: { active: false, name: "Teogonia" },
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

// ⏱️ إرسال تعليقات إلى أنمي واحد فقط
async function sendToAnimeSequentially(animeId) {
  for (let i = 1; i <= maxCommentsPerAnime; i++) {
    if (!botActive || !animeTargets[animeId].active) break;

    try {
      await sendComment(animeId);
      console.log(`✅ [${animeId}] تعليق رقم ${i}`);
    } catch (err) {
      console.error(`❌ [${animeId}] خطأ:`, err.message);
    }

    await new Promise(r => setTimeout(r, delay));
  }
}

// 🔄 الدورة الرئيسية - ترسل إلى أنمي واحد فقط كل مرة
async function startLoop() {
  const animeIds = Object.keys(animeTargets);
  let current = 0;

  while (true) {
    if (!botActive) {
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    const animeId = animeIds[current];
    if (animeTargets[animeId].active) {
      console.log(`🚀 إرسال إلى: ${animeId} - ${animeTargets[animeId].name}`);
      await sendToAnimeSequentially(animeId);
    }

    current = (current + 1) % animeIds.length;
  }
}
startLoop();

// 🌐 واجهة التحكم
app.get("/", (req, res) => {
  const animeControls = Object.entries(animeTargets)
    .map(([id, info]) => `
      <label style="display:block">
        <input type="checkbox" name="anime_${id}" ${info.active ? "checked" : ""}>
        [${id}] ${info.name}
      </label>
    `).join("");

  res.send(`
    <html><head><style>
      body { background: #111; color: #eee; font-family: sans-serif; padding: 20px; }
      input, button { margin: 5px; padding: 5px; background: #222; color: white; border: none; }
    </style></head><body>
    <h2>🤖 البوت ${botActive ? "✅ يعمل" : "🛑 متوقف"}</h2>
    <form method="POST" action="/update">
      تعليق: <input name="commentText" value="${commentText}" /><br>
      سرعة (تعليق/دقيقة): <input name="commentsPerMinute" type="number" value="${commentsPerMinute}" /><br>
      <br><strong>📺 الأنميات المفعّلة:</strong><br>
      ${animeControls}
      <br><button type="submit">🔄 تحديث الإعدادات</button>
    </form>
    <form action="/start"><button>تشغيل البوت</button></form>
    <form action="/stop"><button>إيقاف البوت</button></form>
    </body></html>
  `);
});

app.post("/update", (req, res) => {
  commentText = req.body.commentText || commentText;
  commentsPerMinute = parseInt(req.body.commentsPerMinute) || commentsPerMinute;
  delay = (60 / commentsPerMinute) * 1000;

  for (const [id, obj] of Object.entries(animeTargets)) {
    animeTargets[id].active = !!req.body[`anime_${id}`];
  }

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

// 🔁 إبقاء الخدمة حية
const KEEP_ALIVE_URL = "https://auto-comment-5g7d.onrender.com/";
setInterval(() => {
  fetch(KEEP_ALIVE_URL)
    .then(() => console.log("🔁 Keep-alive ping"))
    .catch(err => console.error("⚠️ Keep-alive error:", err.message));
}, 1000 * 60 * 5);

// 🚪 تشغيل السيرفر
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});
