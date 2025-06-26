import requests, time

# === بيانات المستخدم ===
email = "123456789xdf3@gmail.com"
password = "Gehrman3mk"
message_text = "Test"

# === الإعدادات ===
comments_per_minute = 1          # عدد الرسائل في الدقيقة
maximum_comments = None          # أو ضع رقمًا لإيقاف الكود بعد عدد معين من الرسائل

# === الهيدر مثل التطبيق بالضبط ===
headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 (SevenZero) (C38A6CA1-3F3F-401C-B9DD-DEC5055BB6FC)(Iphone6)15.8.3",
    "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundaryNvvx0BAO1r4vOtZg",
    "Origin": "https://ios.sanime.net",
    "Referer": "https://ios.sanime.net/",
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "ar",
    "Connection": "keep-alive"
}

# === الدالة التي ترسل الرسالة ===
def send_message():
    data = {
        "email": email,
        "password": password,
        "masseg": message_text
    }

    response = requests.post("https://app.sanime.net/secure/chat/send.php", files=data, headers=headers)

    if response.status_code == 200:
        print("✅ تم الإرسال! الرد:", response.text)
    else:
        print("❌ فشل الإرسال - الحالة:", response.status_code)

# === تكرار الإرسال ===
delay = 60 / comments_per_minute
sent = 0

while True:
    send_message()
    sent += 1
    if maximum_comments and sent >= maximum_comments:
        print("✅ تم إرسال", sent, "رسالة. التوقف.")
        break
    time.sleep(delay)
