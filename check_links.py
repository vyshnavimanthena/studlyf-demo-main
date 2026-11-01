import re
import requests

with open('frontend/pages/Scholarships.tsx', 'r') as f:
    content = f.read()

urls = re.findall(r"link:\s*'(https?://[^']+)'", content)

for url in urls:
    try:
        response = requests.get(url, timeout=5, headers={'User-Agent': 'Mozilla/5.0'})
        print(f"[{response.status_code}] {url}")
    except Exception as e:
        print(f"[ERROR] {url} - {str(e)}")
