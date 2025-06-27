const axios = require("axios");
const express = require("express");

const app = express();
const port = 10000;

// ==== إعداداتك الأساسية ====
const email = "123456789xdf3@gmail.com";
const password = "Gehrman3mk";
const comment = "SSS";

// تأخير بين كل دفعة تعليقات (عددها = parallel_comments)
const commentPerMinute = 60 / 60; // مثال: 1 تعليق بالثانية
const delayBetweenBatches = (60 * 1000) / commentPerMinute;

// عدد التعليقات التي تُرسل في وقت واحد
const parallelComments = 10;

// قائمة anime_id + تفعيلها
const animeTargets = {
  anime_532: true,
  anime_11708: true,
  anime_11547: true,
  anime_11707: true,
  anime_11723: true,
  anime_11706: true,
  anime_11673: true,
  anime_11704: true,
  anime_11703: true,
  anime_11702: true,
  anime_11700: true,
  anime_11705: true,
  anime_11699: true,
  anime_11698: true,
  anime_11694: true,
  anime_11697: true,
  anime_11721: true,
  anime_11718: true,
  anime_11693: true,
  anime_11692: true,
  anime_11663: true,
  anime_11710: true,
  anime_11711: true,
  anime_11691: true,
  anime_11689: true,
  anime_653: true,
  anime_11686: true,
  anime_11688: true,
  anime_11684: true,
  anime_11712: true,
};

// headers كما في التطبيق الأصلي
const headers = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 (SevenZero) (C38AGCA1-3F3F-401C-B9DD-DEC5055B86FC)",
  "Content-Type": "application/x-www-form-urlencoded",
  Origin: "https://ios.sanime.net",
  Referer: "https://ios.sanime.net/",
  Accept: "*/*",
  Connection: "keep-alive",
  "Accept-Language": "ar",
};

// دالة إرسال تعليق
async function sendComment(animeId) {
  const itemData = {
    post: comment,
    id: animeId,
    fire: false,
  };
  const itemBase64 = Buffer.from(JSON.stringify(itemData)).toString("base64");

  const payload = new URLSearchParams({
    email,
    password,
    item: itemBase64,
  });

  try {
    const res = await axios.post(
      "https://app.sanime.net/function/h10.php?page=addcmd",
      payload,
      { headers }
    );
    console.log(`✅ [${animeId}] تم الإرسال`);
  } catch (err) {
    console.log(`❌ [${animeId}] فشل الإرسال: ${err.message}`);
  }
}

// دالة التكرار المتزامن
async function commentLoop() {
  const ids = Object.entries(animeTargets)
    .filter(([_, enabled]) => enabled)
    .map(([key]) => key.split("_")[1]);

  while (true) {
    const selected = ids.slice(0, parallelComments);
    await Promise.all(selected.map((id) => sendComment(id)));
    await new Promise((res) => setTimeout(res, delayBetweenBatches));
  }
}

// تشغيل الحلقة
commentLoop();

// واجهة بسيطة لـ Render
app.get("/", (req, res) => {
  res.send("🚀 Node Auto Comment Bot يعمل الآن بأقصى سرعة!");
});

app.listen(port, () => {
  console.log(`🚀 السيرفر يعمل على http://localhost:${port}`);
});
