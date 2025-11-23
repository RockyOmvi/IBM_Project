import os, requests
from fastapi import HTTPException
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
GITHUB_OAUTH_CALLBACK = os.getenv("GITHUB_OAUTH_CALLBACK", "/api/github/callback")

def github_oauth_url(state):
    return f"https://github.com/login/oauth/authorize?client_id={GITHUB_CLIENT_ID}&scope=repo%20public_repo&state={state}"

def github_exchange_code(code):
    url = "https://github.com/login/oauth/access_token"
    resp = requests.post(url, json={
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code
    }, headers={"Accept": "application/json"}, timeout=8)
    resp.raise_for_status()
    data = resp.json()
    if "access_token" not in data:
        raise HTTPException(status_code=400, detail="OAuth failed")
    return data["access_token"]