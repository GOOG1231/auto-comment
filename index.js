const axios = require("axios");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;

// بيانات الدخول والتعليق
const email = "123456789xdf3@gmail.com";
const password = "Gehrman3mk";
const commentText = "HHH";
const commentsPerMinute = 20;
const delayBetweenComments = 60000 / commentsPerMinute; // 3000 ms = 3 ثواني

// قائمة الأنميات المفعلة
const animeTargets = {
  532: true, 11708: true, 11547: true, 11707: true, 11723: true,
  11706: true, 11673: true, 11704: true, 11703: true, 11702: true,
  11700: true, 11705: true, 11699: true, 11698: true, 11694: true,
  11697: true, 11721: true, 11718: true, 11693: true, 11692: true,
  11663: true, 11710: true, 11711: true, 11691: true, 11689: true,
  653: true, 11686: true, 11688: true, 11684: true, 11712: true
};

// رؤوس الطلب
const headers = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X)...",
  "Content-Type": "application/x-www-form-urlencoded",
  "Origin": "https://ios.sanime.net",
  "Referer": "https://ios.sanime.net/",
  "Accept": "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Accept-Language": "ar"
};

// إرسال تعليق واحد
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
    { headers }
  );
}

// بدء التعليق بتوازي لجميع الأنميات
function startCommenting() {
  const activeAnimeIds = Object.keys(animeTargets).filter(id => animeTargets[id]);

  setInterval(() => {
    for (const animeId of activeAnimeIds) {
      // إرسال 20 تعليق لهذا الأنمي كل دقيقة (موزعة على مدى الدقيقة)
      for (let i = 0; i < commentsPerMinute; i++) {
        setTimeout(() => {
          sendComment(animeId)
            .then(() => console.log(`✅ [${animeId}] Sent comment ${i + 1}`))
            .catch(err => console.error(`❌ [${animeId}] Error:`, err.message));
        }, i * delayBetweenComments); // لكل تعليق تأخير بسيط ضمن نفس الدقيقة
      }
    }
  }, 60000); // كل دقيقة تعليقات جديدة
}

// Web Server لـ Render
app.get("/", (req, res) => {
  res.send("✅ Comment sender is running!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
  startCommenting();
});
