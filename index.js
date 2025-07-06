const axios = require("axios");
const https = require("https");
const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.urlencoded({ extended: true }));

let email = "GOOG1412123@gmail.com";
let password = "03TwthiR";
let commentText = "انمي حْرا";
let commentsPerMinute = 60;
let delay = (60 / commentsPerMinute) * 1000;
let botActive = true;
let maxCommentsPerAnime = 500;

let animeOrder = [];
let logText = "";

const animeTargets = {
  532: { active: true, name: "One Piece" },
  11729: { active: true, name: "Necronomico no Cosmic Horror Show" },
  11728: { active: true, name: "Kanojo, Okarishimasu 4th Season" },
  11751: { active: true, name: "Hikaru ga Shinda Natsu" },
  11750: { active: true, name: "Sono Bisque Doll wa Koi wo Suru Season 2" },
  11749: { active: true, name: "Seishun Buta Yarou wa Santa Claus no Yume wo Minai" },
  11673: { active: true, name: "Kijin Gentoushou" },
  11733: { active: true, name: "Clevatess: Majuu no Ou to Akago to Shikabane no Yuusha" },
  11702: { active: true, name: "Summer Pockets" },
  11732: { active: true, name: "Dandadan 2nd Season" },
  11736: { active: true, name: "Jigoku Sensei Nube (2025)" },
  11697: { active: true, name: "Witch Watch" },
  11721: { active: true, name: "The All-devouring whale" },
  11724: { active: true, name: "Takopii no Genzai" },
  11735: { active: true, name: "Tsuyokute New Saga" },
  11734: { active: true, name: "Onmyou Kaiten Re:Birth" },
  653: { active: true, name: "Detective Conan" },
  11686: { active: true, name: "Anne shirley" },
  11730: { active: true, name: "Mattaku Saikin no Tantei to Kitara" },
  11725: { active: true, name: "Lord of Mysteries" },
  11726: { active: true, name: "Koujo Denka no Kateikyoushi" },
  11748: { active: true, name: "Yuusha Party wo Tsuihou sareta Shiromadoushi, S-Rank Boukensha ni Hirowareru: Kono Shiromadoushi ga Kikakugai Sugiru" },
  11731: { active: true, name: "Jidou Hanbaiki ni Umarekawatta Ore wa Meikyuu wo Samayou 2nd" },
  11746: { active: true, name: "Yofukashi no Uta Season 2" },
  11745: { active: true, name: "Busu ni Hanataba wo." },
  11744: { active: true, name: "Silent Witch: Chinmoku no Majo no Kakushigoto" },
  11743: { active: true, name: "Zutaboro Reijou wa Ane no Moto Konyakusha ni Dekiai sareru" },
  11737: { active: true, name: "Tsuihousha Shokudou e Youkoso!" },
  11738: { active: true, name: "Kamitsubaki-shi Kensetsuchuu." },
  11740: { active: true, name: "Mizu Zokusei no Mahoutsukai" },
  11741: { active: true, name: "Arknights: Rise from Ember" },
  11742: { active: true, name: "Watari-kun no xx ga Houkai Sunzen" },
};

const headers = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X)",
  "Content-Type": "application/x-www-form-urlencoded",
  "Origin": "https://ios.sanime.net",
  "Referer": "https://ios.sanime.net/",
  "Accept": "*/*"
};

const agent = new https.Agent({ keepAlive: true });

async function sendComment(animeId) {
  const itemData = {
    post: commentText,
    id: animeId,
    fire: true
  };
  const itemBase64 = Buffer.from(JSON.stringify(itemData)).toString("base64");
  const payload = new URLSearchParams({ email, password, item: itemBase64 });

  await axios.post(
    "https://app.sanime.net/function/h10.php?page=addcmd",
    payload.toString(),
    { headers, httpsAgent: agent }
  );
}

// دورة الإرسال
let currentIndex = 0;
let currentCount = 0;
let currentAnimeId = null;
let intervalId = null;

function updateLogText() {
  const currentName = animeTargets[currentAnimeId]?.name || "؟";
  const nextId = animeOrder[(currentIndex + 1) % animeOrder.length];
  const nextName = animeTargets[nextId]?.name || "؟";
  logText = `📺 الحالي: [${currentAnimeId}] ${currentName} | التالي: [${nextId}] ${nextName}`;
}

function startNextAnime() {
  const activeIds = animeOrder.filter(id => animeTargets[id]?.active);
  if (activeIds.length === 0) return;

  if (currentIndex >= activeIds.length) currentIndex = 0;
  currentAnimeId = activeIds[currentIndex];
  currentCount = 0;
  updateLogText();
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

// صفحة التحكم
app.get("/", (req, res) => {
  const animeControls = Object.entries(animeTargets)
    .map(([id, info]) => `
      <div style="margin-bottom:8px">
        <label>
          <input type="checkbox" name="anime_${id}" ${info.active ? "checked" : ""}>
          [${id}] ${info.name}
        </label><br>
        ترتيب: <input name="order_${id}" type="number" value="${animeOrder.indexOf(id)}" style="width: 40px"/>
      </div>
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
      سرعة (تعليق/دقيقة): <input name="commentsPerMinute" type="number" value="${commentsPerMinute}" /><br>
      عدد التعليقات قبل الانتقال: <input name="maxComments" type="number" value="${maxCommentsPerAnime}" /><br><br>
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

// ✅ تعديل الترتيب بشكل ذكي
app.post("/update", (req, res) => {
  commentText = req.body.commentText || commentText;
  commentsPerMinute = parseInt(req.body.commentsPerMinute) || commentsPerMinute;
  maxCommentsPerAnime = parseInt(req.body.maxComments) || maxCommentsPerAnime;
  delay = (60 / commentsPerMinute) * 1000;

  for (const [id, info] of Object.entries(animeTargets)) {
    animeTargets[id].active = !!req.body[`anime_${id}`];
  }

  const tempList = [];
  const unordered = [];

  for (const [id] of Object.entries(animeTargets)) {
    const orderVal = parseInt(req.body[`order_${id}`]);
    if (!isNaN(orderVal)) {
      tempList.push({ id, order: orderVal });
    } else {
      unordered.push(id);
    }
  }

  tempList.sort((a, b) => a.order - b.order);
  animeOrder = tempList.map(i => i.id).concat(unordered.filter(id => !tempList.find(item => item.id === id)));

  updateLogText();
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

// إبقاء الخدمة حية
const KEEP_ALIVE_URL = "https://auto-comment-5g7d.onrender.com/";
setInterval(() => {
  fetch(KEEP_ALIVE_URL)
    .then(() => console.log("🔁 Keep-alive"))
    .catch(err => console.error("❌ Keep-alive:", err.message));
}, 1000 * 60 * 5);

// تشغيل السيرفر
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🌐 Server on port ${PORT}`);
  animeOrder = Object.keys(animeTargets); // ترتيب افتراضي
  startNextAnime();
});
