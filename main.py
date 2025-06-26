import requests, base64, json, time

# بيانات الدخول
email = "123456789xdf3@gmail.com"
password = "Gehrman3mk"
comment_text = "TT"
anime_id = "532"

# إعدادات التكرار
comments_per_minute = 60  # عدد التعليقات في الدقيقة
maximum_comments = 1   # عدد التعليقات الكلي، None يعني لا نهائي

# تزوير بيانات المشرف
item_data = {
    "post": comment_text,
    "id": anime_id,
    "fire": False,
    "admin": "true",
    "hasPremium": 1,
    "userId": 1,
    "username": "ibb",
    "userimage": "https://i.pinimg.com/736x/69/7a/27/697a27601e1ejpg",
    "useragent": "SawRaven",
    "userIp": "104.219.248.62",
    "userAddress": "ShBaR3xZRBoDE0VARlEXGhVcXEdYUVZdURQNGnoDcgEEAQMNGHNzCQAcBQdychgOdg19HAICcQcFdXQODAUHABNP",
    "story": [],
    "anime": [],
    "commant": [],
    "expended": False,
    "isAndroid": False
}

# تحويل item إلى base64
item_base64 = base64.b64encode(json.dumps(item_data).encode()).decode()

# البيانات النهائية
payload = {
    "email": email,
    "password": password,
    "item": item_base64
}

headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 (SevenZero)",
    "Content-Type": "application/x-www-form-urlencoded",
    "Origin": "https://ios.sanime.net",
    "Referer": "https://ios.sanime.net/",
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Accept-Language": "ar"
}

# رابط الطلب
url = "https://app.sanime.net/function/h10.php?page=addcmd"

# التكرار
sent = 0
delay = 60 / comments_per_minute

while True:
    response = requests.post(url, data=payload, headers=headers)

    if response.status_code == 200 and '"status":1' in response.text:
        print(f"✅ تم الإرسال رقم {sent + 1}")
    else:
        print(f"❌ فشل الإرسال رقم {sent + 1}. الحالة: {response.status_code}")

    sent += 1
    if maximum_comments and sent >= maximum_comments:
        break

    time.sleep(delay)
