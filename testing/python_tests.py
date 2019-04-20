from fake_useragent import UserAgent
import requests

ua = UserAgent()

url = 'http://54.174.152.202/'
headers = {'User-Agent': ua.firefox}

response = requests.get(url, headers=headers)
print(response.content)
