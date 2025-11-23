import os, requests, logging
DEEPSEEK_KEY = os.getenv("DEEPSEEK_API_KEY")
DEEPSEEK_URL = os.getenv("DEEPSEEK_API_URL", "https://api.deepseek.ai/v1/search")  # adjust if different

logger = logging.getLogger(__name__)

def deepseek_search(query, limit=6):
    """Call Deepseek API and normalize results. Return (results_list, error)"""
    if not DEEPSEEK_KEY:
        return None, "no_deepseek_key"
    try:
        payload = {"q": query, "size": limit}
        headers = {"Authorization": f"Bearer {DEEPSEEK_KEY}", "Content-Type": "application/json"}
        resp = requests.post(DEEPSEEK_URL, json=payload, headers=headers, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        # normalize to RepoCard list
        out = []
        for item in data.get("hits", []):
            repo = item.get("repo") or {}
            out.append({
                "name": repo.get("name") or item.get("name"),
                "owner": repo.get("owner") or item.get("owner"),
                "stars": repo.get("stars", 0),
                "description": repo.get("description") or item.get("description") or "",
                "language": repo.get("language") or "",
                "url": repo.get("url") or repo.get("html_url") or item.get("url"),
                "matched_keywords": item.get("matches") or [],
            })
        return out, None
    except Exception as e:
        logger.exception("Deepseek search failed")
        return None, str(e)