const axios = require("axios");

const email = "123456789xdf3@gmail.com";
const password = "Gehrman3mk";
const commentText = "HHH";
const commentsPerMinute = 1000; // عدد التعليقات لكل انمي في الدقيقة
const delayBetweenComments = 60000 / commentsPerMinute; // بين كل تعليق وآخر

// القائمة الكاملة مع إمكانية التفعيل والتعطيل
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
  11712: true
};

const headers = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 (SevenZero) (C38AGCA1-3F3F-401C-B9DD-DEC5055B86FC)",
  "Content-Type": "application/x-www-form-urlencoded",
  "Origin": "https://ios.sanime.net",
  "Referer": "https://ios.sanime.net/",
  "Accept": "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Connection": "keep-alive",
  "Accept-Language": "ar"
};

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

function startCommenting() {
  const activeAnimeIds = Object.keys(animeTargets).filter(id => animeTargets[id]);

  setInterval(() => {
    const commentTasks = [];

    activeAnimeIds.forEach(animeId => {
      for (let i = 0; i < commentsPerMinute; i++) {
        const task = new Promise((resolve) => {
          setTimeout(() => {
            sendComment(animeId)
              .then(() => console.log(`✅ sent to anime ${animeId}`))
              .catch(err => console.error(`❌ error for anime ${animeId}:`, err.message));
            resolve();
          }, i * delayBetweenComments);
        });
        commentTasks.push(task);
      }
    });

    Promise.all(commentTasks).then(() => {
      console.log("✅ All comments sent for this minute.");
    });
  }, 60000);
}

startCommenting();
