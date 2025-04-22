import requests

url = "https://libretranslate.com/translate"
payload = {
    "q": "Hello world!",
    "source": "en",
    "target": "fr",
    "format": "text"
}

response = requests.post(url, data=payload)
print(response.json())
