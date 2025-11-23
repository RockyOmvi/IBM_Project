import os
import requests
import logging

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")  # Optional, for higher rate limits
logger = logging.getLogger(__name__)

def github_search_repos(query, limit=6):
    """
    Search GitHub repositories using the GitHub Search API.
    Returns (results_list, error)
    """
    try:
        url = "https://api.github.com/search/repositories"
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Deepseek-ChatOps-Demo"
        }
        
        # Add authentication if token is available
        if GITHUB_TOKEN:
            headers["Authorization"] = f"token {GITHUB_TOKEN}"
        
        params = {
            "q": query,
            "sort": "stars",
            "order": "desc",
            "per_page": limit
        }
        
        resp = requests.get(url, headers=headers, params=params, timeout=8)
        resp.raise_for_status()
        
        data = resp.json()
        
        # Normalize to our expected format
        results = []
        for item in data.get("items", []):
            results.append({
                "name": item.get("name", ""),
                "owner": item.get("owner", {}).get("login", ""),
                "stars": item.get("stargazers_count", 0),
                "description": item.get("description") or "",
                "language": item.get("language") or "",
                "url": item.get("html_url", ""),
                "matched_keywords": []  # GitHub doesn't provide this in basic search
            })
        
        return results, None
        
    except requests.exceptions.RequestException as e:
        logger.exception("GitHub search failed")
        return None, str(e)
    except Exception as e:
        logger.exception("Unexpected error in GitHub search")
        return None, str(e)
