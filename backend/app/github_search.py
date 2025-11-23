import os
import requests
import logging

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")  # Optional, for higher rate limits
logger = logging.getLogger(__name__)

def github_search_repos(query, filters=None, sort_by="stars", limit=6):
    """
    Search GitHub repositories using the GitHub Search API.
    filters: dict with keys 'language', 'stars_min', 'stars_max', 'created_after'
    sort_by: 'stars', 'updated', 'forks', 'help-wanted-issues'
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
        
        # Build query string with filters
        q = query
        if filters:
            if filters.get("language"):
                q += f" language:{filters['language']}"
            
            min_stars = filters.get("stars_min")
            max_stars = filters.get("stars_max")
            if min_stars is not None or max_stars is not None:
                if min_stars is not None and max_stars is not None:
                    q += f" stars:{min_stars}..{max_stars}"
                elif min_stars is not None:
                    q += f" stars:>={min_stars}"
                elif max_stars is not None:
                    q += f" stars:<={max_stars}"
            
            if filters.get("created_after"):
                q += f" created:>{filters['created_after']}"

        params = {
            "q": q,
            "sort": sort_by or "stars",
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
