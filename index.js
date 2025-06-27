const axios = require("axios");
const base64 = require("base-64");
const express = require("express");

const app = express();
const port = process.env.PORT || 10000;

// إعداد بيانات المستخدم
const email = "123456789xdf3@gmail.com";
const password = "Gehrman3mk";
const commentText = "TTS";

// عدد التعليقات بالدقيقة لكل أنمي
const commentPerMinute = 1000; // مثال: 60 تعليق في الدقيقة = تعليق كل ثانية

// عدد التعليقات لكل أنمي قبل التوقف (null = لا نهائي)
const maxComments = null;

// عدد التعليقات المتوازية بالضبط لكل إرسال
const parallelComments = 1000;

// قائمة الأنميات المفعلة
const animeList = {
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
  anime_11712: true
};

const headers = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 (SevenZero)",
  "Content-Type": "application/x-www-form-urlencoded",
  "Origin": "https://ios.sanime.net",
  "Referer": "https://ios.sanime.net/",
  "Accept": "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Accept-Language": "ar"
};

// إرسال تعليق لأنمي معين
async function sendComment(animeId) {
  const item = {
    post: commentText,
    id: animeId,
    fire: false
  };

  const itemEncoded = base64.encode(JSON.stringify(item));
  const payload = new URLSearchParams({
    email,
    password,
    item: itemEncoded
  });

  try {
    const response = await axios.post(
      "https://app.sanime.net/function/h10.php?page=addcmd",
      payload,
      { headers }
    );
    console.log(`✅ (${animeId}) تم الإرسال`);
  } catch (err) {
    console.error(`❌ (${animeId}) خطأ في الإرسال:`, err.message);
  }
}

// وظيفة الإرسال المتزامن
function startCommenting() {
  const ids = Object.keys(animeList)
    .filter((key) => animeList[key])
    .map((key) => key.split("_")[1]);

  const intervalMs = 60000 / commentPerMinute;

  for (const animeId of ids) {
    let count = 0;
    setInterval(() => {
      if (maxComments && count >= maxComments) return;
      count += parallelComments;

      // إرسال بالتوازي
      for (let i = 0; i < parallelComments; i++) {
        sendComment(animeId);
      }
    }, intervalMs);
  }
}

app.get("/", (req, res) => {
  res.send("✅ Auto Comment Bot is running (Node.js)!");
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
  startCommenting();
});
