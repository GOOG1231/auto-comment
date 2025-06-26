from flask import Flask
import threading
import time
import requests

# إعدادات الحساب والرسالة
email = "123456789xdf3@gmail.com"
password = "Gehrman3mk"
message_text = "TT"
comments_per_minute = 1
max_comments = None

# إعدادات HTTP
boundary = "----WebKitFormBoundaryNvvx0BAO1r4vOtZg"
multipart_data = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="email"\r\n\r\n'
    f"{email}\r\n"
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="password"\r\n\r\n'
    f"{password}\r\n"
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="masseg"\r\n\r\n'
    f"{message_text}\r\n"
    f"--{boundary}--\r\n"
)

headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "Content-Type": f"multipart/form-data; boundary={boundary}",
    "Origin": "https://ios.sanime.net",
    "Referer": "https://ios.sanime.net/",
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "ar",
    "Connection": "keep-alive"
}

url = "https://app.sanime.net/secure/chat/send.php"

# دالة إرسال الرسائل
def send_messages_forever():
    delay = 60 / comments_per_minute
    sent = 0
    while True:
        response = requests.post(url, headers=headers, data=multipart_data.encode())
        if response.status_code == 200:
            print("✅ تم الإرسال! الرد:", response.text)
        else:
            print("❌ فشل - الحالة:", response.status_code)
        sent += 1
        if max_comments and sent >= max_comments:
            break
        time.sleep(delay)

# إعداد Flask لإرضاء Render
app = Flask(__name__)

@app.route("/")
def home():
    return "🚀 Bot is running."

@app.before_first_request
def activate_bot():
    threading.Thread(target=send_messages_forever).start()

# تشغيل الخادم
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
