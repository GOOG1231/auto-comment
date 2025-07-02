const axios = require("axios");
const https = require("https");
const express = require("express");
const fetch = require("node-fetch");
const app = express();

const email = "GOOG1412123@gmail.com";
const password = "GOOG";
const commentText = "انمي حْرا .";

// ✳️ عدد التعليقات لكل أنمي قبل الانتقال للثاني
const maxCommentsPerAnime = 75;

// ✅ عدد التعليقات في الدقيقة
const commentsPerMinute = 60;
const delay = (60 / commentsPerMinute) * 1000;

// ✴️ عدد الأنميات التي يتم الإرسال لها في نفس اللحظة
const parallelAnimeCount = 3;

const animeTargets = {
  532: "One Piece",
  11708: "Ninja to Koroshiya no",
  11547: "Kimi to Boku no Saigo no",
  11707: "Apocalypse Hotel",
  11723: "Kidou Senshi Gundam",
  11706: "Shiunji-ke no Kodomotachi",
  11673: "Kijin Gentoushou",
  11704: "Compass 2.0: Sentou",
  11703: "Vigilante: Boku no Hero",
  11702: "Summer Pockets",
  11700: "Aharen-san wa Hakarenai",
  11705: "Lazarus",
  11699: "Maebashi Witches",
  11698: "Gorilla no kami kara kago",
  11694: "Shin Samurai-den Yaiba",
  11697: "Witch Watch",
  11721: "The All-devouring whale",
  11718: "Ore wa Seikan Kokka no",
  11693: "Shoushimin Series 2nd",
  11692: "Classic*Stars",
  11663: "A-Rank Party wo",
  11710: "Hibi wa Sugiredo Meshi",
  11711: "Mono",
  11691: "Kuroshitsuji: Midori no Majo",
  11689: "Katainaka no Ossan Kensei",
  653: "Detective Conan",
  11686: "Anne shirley",
  11688: "Slime Taoshite 300-nen",
  11684: "Nazotoki wa Dinner no Ato d",
  11712: "Chuuzenji-sensei Mononoke",
  11715: "Teogonia",
  11658: "Kusuriya no Hitorigoto 2nd",
  11725: "Lord of Mysteries",
  11726: "Koujo Denka no Kateikyoushi"
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
let botActive = true;

function sendComment(animeId) {
  const itemData = {
    post: commentText,
    id: animeId,
    fire: false
  };
  const itemBase64 = Buffer.from(JSON.stringify(itemData)).toString("base64");
  const payload = new URLSearchParams({
    email,
    password,
    item: itemBase64
  });

  return axios.post(
    "https://app.sanime.net/function/h10.php?page=addcmd",
    payload.toString(),
    { headers, httpsAgent: agent }
  );
}

async function sendCommentsToAnime(animeId) {
  console.log(`🚀 بدء إرسال ${maxCommentsPerAnime} تعليق إلى الأنمي: ${animeId}`);
  for (let i = 1; i <= maxCommentsPerAnime; i++) {
    if (!botActive) break;
    try {
      await sendComment(animeId);
      console.log(`✅ [${animeId}] تعليق رقم ${i}`);
    } catch (err) {
      console.error(`❌ [${animeId}] خطأ:`, err.message);
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

async function startLoop() {
  const activeAnimeIds = Object.keys(animeTargets);
  let index = 0;

  while (true) {
    if (!botActive) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue;
    }

    const batch = activeAnimeIds.slice(index, index + parallelAnimeCount);
    if (batch.length === 0) {
      index = 0;
      continue;
    }

    console.log(`🔄 إرسال إلى ${batch.length} أنمي دفعة واحدة: ${batch.join(", ")}`);
    await Promise.all(batch.map(id => sendCommentsToAnime(id)));

    index += parallelAnimeCount;
    if (index >= activeAnimeIds.length) {
      index = 0;
    }
  }
}

startLoop();

// 🟢 صفحة رئيسية تعرض أسماء الأنميات وأزرار التحكم
app.get("/", (req, res) => {
  const activeAnimeList = Object.entries(animeTargets)
    .map(([id, name]) => `🔹 [${id}] ${name}`)
    .join("<br>");

  res.send(`
    <h2>🤖 Bot is ${botActive ? "✅ يعمل" : "🛑 متوقف"}...</h2>
    <p>🧩 عدد الأنميات الفعّالة: ${Object.keys(animeTargets).length}</p>
    <p>📥 عدد التعليقات لكل أنمي: ${maxCommentsPerAnime}</p>
    <p>⚙️ سرعة الإرسال: ${commentsPerMinute} تعليق/دقيقة</p>
    <p>🧠 موازاة الإرسال: ${parallelAnimeCount} أنميات</p>
    <hr>
    <form action="/start" method="get">
      <button style="padding:8px 20px; background:green; color:white; border:none;">تشغيل البوت</button>
    </form>
    <form action="/stop" method="get" style="margin-top:10px;">
      <button style="padding:8px 20px; background:red; color:white; border:none;">إيقاف البوت</button>
    </form>
    <hr>
    <h4>📺 قائمة الأنميات:</h4>
    ${activeAnimeList}
  `);
});

// 🔘 إيقاف البوت مؤقتًا
app.get("/stop", (req, res) => {
  botActive = false;
  res.redirect("/");
});

// 🔘 إعادة تشغيل البوت
app.get("/start", (req, res) => {
  botActive = true;
  res.redirect("/");
});

// 🔁 إبقاء الخدمة حية
const KEEP_ALIVE_URL = "https://auto-comment-5g7d.onrender.com/";
setInterval(() => {
  fetch(KEEP_ALIVE_URL)
    .then(() => console.log("🔁 Keep-alive ping sent"))
    .catch(err => console.error("⚠️ Keep-alive ping failed:", err.message));
}, 5 * 60 * 1000);

// 🚪 بدء السيرفر
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});
