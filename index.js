const axios = require("axios");
const https = require("https");
const express = require("express");
const fetch = require("node-fetch");
const HttpsProxyAgent = require("https-proxy-agent");
const app = express();

const email = "GOOG1412123@gmail.com";
const password = "GOOG";
const commentText = "N..";

// عدد التعليقات في الدقيقة (واحد كل ثانية)
const commentsPerMinute = 60;
const delay = (60 / commentsPerMinute) * 1000;

// الأنميات المُفعّلة
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

// بروكسيات مجانية مضمونة (HTTPS)
const proxies = [
  "154.6.190.79:443",
  "188.132.221.126:443",
  "64.225.70.191:443",
  "103.204.129.42:443",
  "147.75.34.105:443"
];

let currentProxyIndex = 0;
function getNextAgent() {
  const proxy = proxies[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % proxies.length;
  const [host, port] = proxy.split(":");
  return new HttpsProxyAgent({ host, port });
}

async function sendComment(animeId) {
  const payload = new URLSearchParams({
    email,
    password,
    item: Buffer.from(JSON.stringify({ post: commentText, id: animeId, fire: false })).toString("base64")
  });

  for (let i = 0; i < proxies.length; i++) {
    try {
      await axios.post(
        "https://app.sanime.net/function/h10.php?page=addcmd",
        payload.toString(),
        { headers, httpsAgent: getNextAgent(), timeout: 8000 }
      );
      return true;
    } catch (err) {
      console.warn(`⚠️ [${animeId}] فشل في البروكسي ${proxies[i]}: ${err.message}`);
      continue;
    }
  }
  return false;
}

async function startAllAnimeLoop() {
  const activeAnimeIds = Object.keys(animeTargets).filter(id => animeTargets[id]);

  setInterval(() => {
    if (!botActive) return;
    activeAnimeIds.forEach(async animeId => {
      const success = await sendComment(animeId);
      if (success) {
        console.log(`✅ [${animeId}] تم إرسال التعليق`);
      } else {
        console.log(`❌ [${animeId}] فشل الإرسال بجميع البروكسيات`);
      }
    });
  }, delay);
}

startAllAnimeLoop();

// 🟢 صفحة العرض الرئيسية
app.get("/", (req, res) => {
  res.send("🤖 Bot is running...");
});

// 🔘 إيقاف البوت مؤقتًا
app.get("/stop", (req, res) => {
  botActive = false;
  res.send("🛑 Bot stopped.");
});

// 🔘 إعادة تشغيل البوت
app.get("/start", (req, res) => {
  botActive = true;
  res.send("✅ Bot resumed.");
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
