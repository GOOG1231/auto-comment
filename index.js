const axios = require("axios");
const https = require("https");
const express = require("express");
const fetch = require("node-fetch");
const app = express();

// معلومات الحساب والتعليق
const email = "GOOG1412123@gmail.com";
const password = "GOOG";
const commentText = "N..";

// إعدادات التعليقات
const commentsPerMinute = 60;
const delay = (60 / commentsPerMinute) * 1000;

// قائمة البروكسيات المجانية (HTTP فقط)
const proxies = [
  "http://194.87.102.239:3128",
  "http://159.203.61.169:3128",
  "http://51.159.115.233:3128",
  "http://18.190.95.74:3128",
  "http://104.248.63.15:30588",
  "http://178.62.193.19:3128",
  "http://134.209.29.120:3128"
];

// قائمة الأنميات
const animeTargets = {
  532: true,
  11708: true,
  11547: true,
  11707: true,
  11723: true,
  11706: true,
  11673: true,
  11704: true,
  11703: true,
  11702: true,
  11700: true,
  11705: true,
  11699: true,
  11698: true,
  11694: true,
  11697: true,
  11721: true,
  11718: true,
  11693: true,
  11692: true,
  11663: true,
  11710: true,
  11711: true,
  11691: true,
  11689: true,
  653: true,
  11686: true,
  11688: true,
  11684: true,
  11712: true,
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

let botActive = true;

function sendComment(animeId, proxy) {
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
    {
      headers,
      httpsAgent: new https.Agent({ keepAlive: true }),
      proxy: proxy ? {
        host: proxy.split(":")[1].replace("//", ""),
        port: parseInt(proxy.split(":")[2])
      } : false,
      timeout: 8000
    }
  );
}

async function sendWithRetry(animeId) {
  for (let i = 0; i < proxies.length; i++) {
    try {
      await sendComment(animeId, proxies[i]);
      console.log(`✅ [${animeId}] تعليق تم بواسطة البروكسي ${proxies[i]}`);
      return;
    } catch (err) {
      console.warn(`⚠️ [${animeId}] فشل في البروكسي ${proxies[i]}: ${err.message}`);
    }
  }

  // إذا فشلت كل البروكسيات
  console.error(`❌ [${animeId}] فشل في كل البروكسيات`);
}

async function startContinuousCommenting() {
  const activeAnimeIds = Object.keys(animeTargets).filter(id => animeTargets[id]);

  setInterval(() => {
    if (!botActive) return;

    activeAnimeIds.forEach(animeId => {
      sendWithRetry(animeId);
    });
  }, delay);
}

startContinuousCommenting();

// 🟢 صفحة رئيسية
app.get("/", (req, res) => {
  res.send("🤖 Bot is running...");
});

// 🔘 إيقاف مؤقت
app.get("/stop", (req, res) => {
  botActive = false;
  res.send("🛑 Bot has been stopped.");
});

// 🔘 إعادة التشغيل
app.get("/start", (req, res) => {
  botActive = true;
  res.send("✅ Bot has been started.");
});

// 🔁 إبقاء الخدمة حية
const KEEP_ALIVE_URL = "https://auto-comment-5g7d.onrender.com/";

setInterval(() => {
  fetch(KEEP_ALIVE_URL)
    .then(() => console.log("🔁 Keep-alive ping sent"))
    .catch(err => console.error("⚠️ Keep-alive ping failed:", err.message));
}, 5 * 60 * 1000);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});
