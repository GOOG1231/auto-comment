from flask import Flask
import threading
import requests, base64, json, time

app = Flask(__name__)

# إعداد البيانات
email = "123456789xdf3@gmail.com"
password = "Gehrman3mk"
comment_text = "hello"
anime_id = "532"
comments_per_minute = 1  # عدد التعليقات في الدقيقة
delay = 60 / comments_per_minute
max_comments = None  # ← None = لا نهائي (غيّرها إذا أردت التوقف بعد عدد معين)

headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 (SevenZero) (C38AGCA1-3F3F-401C-B9DD-DEC5055B86FC)",
    "Content-Type": "application/x-www-form-urlencoded",
    "Origin": "https://ios.sanime.net",
    "Referer": "https://ios.sanime.net/",
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Accept-Language": "ar"
}

def send_comment_loop():
    count = 0
    while True:
        if max_comments is not None and count >= max_comments:
            print("✅ تم الوصول إلى العدد المطلوب من التعليقات. تم إيقاف الكود.")
            break

        try:
            item_data = {
                "post": comment_text,
                "id": anime_id,
                "fire": False,
                "color": "red"  # ← محاولة تلوين التعليق
            }
            item_base64 = base64.b64encode(json.dumps(item_data).encode()).decode()
            payload = {"email": email, "password": password, "item": item_base64}
            url = "https://app.sanime.net/function/h10.php?page=addcmd"
            response = requests.post(url, data=payload, headers=headers)

            if response.status_code == 200:
                print(f"✅ تم الإرسال ({count + 1})")
            else:
                print(f"❌ فشل الإرسال: {response.status_code}")
        except Exception as e:
            print(f"❗ خطأ: {e}")
        
        count += 1
        time.sleep(delay)

@app.route('/')
def home():
    return "🤖 Auto Comment Bot is running!"

if __name__ == "__main__":
    threading.Thread(target=send_comment_loop, daemon=True).start()
    app.run(host='0.0.0.0', port=10000)
