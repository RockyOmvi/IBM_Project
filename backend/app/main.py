# backend/app/main.py
# file path: backend/app/main.py
from fastapi import FastAPI, Request, HTTPException, Depends, Header
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
import uuid, os, json, time
from .db import SessionLocal, engine, Base
from .models import User, Session, Message, QueryLog
from .deepseek_client import deepseek_search
from .github_search import github_search_repos
from .auth_github import github_oauth_url, github_exchange_code
from sqlalchemy.orm import Session as DBSession
from sqlalchemy.exc import IntegrityError
from typing import Optional

# Create DB
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Deepseek ChatOps Demo (Python)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static
app.mount("/static", StaticFiles(directory=os.path.join(os.path.dirname(__file__), "..", "static")), name="static")

ADMIN_SECRET = os.getenv("ADMIN_SECRET", "dev_secret_change_me")
RATE_LIMIT_PER_MIN = int(os.getenv("RATE_LIMIT_PER_MIN", "30"))
rate_limits = {}  # simple in-memory {key: (count, window_start_ts)}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_rate_limit(key):
    now = int(time.time())
    window = 60
    count, start = rate_limits.get(key, (0, now))
    if now - start >= window:
        rate_limits[key] = (1, now)
        return True
    if count + 1 > RATE_LIMIT_PER_MIN:
        return False
    rate_limits[key] = (count + 1, start)
    return True

@app.get("/", response_class=HTMLResponse)
async def index():
    # serve landing page from root
    path = os.path.join(os.path.dirname(__file__), "..", "..", "index.html")
    return FileResponse(path)

@app.get("/chat", response_class=HTMLResponse)
async def chat_page():
    # serve chat page
    path = os.path.join(os.path.dirname(__file__), "..", "..", "chat.html")
    return FileResponse(path)

@app.post("/api/chat")
async def api_chat(payload: dict, request: Request, db: DBSession = Depends(get_db)):
    text = payload.get("text", "").strip()
    session_id = payload.get("session_id")
    if not text:
        raise HTTPException(status_code=400, detail="empty text")
    client_ip = request.client.host or "anon"
    rl_key = f"{client_ip}"
    if not check_rate_limit(rl_key):
        raise HTTPException(status_code=429, detail="rate limit exceeded")
    # create or load session
    if not session_id:
        session_id = str(uuid.uuid4())
        s = Session(id=session_id)
        db.add(s); db.commit()
    else:
        s = db.query(Session).filter(Session.id == session_id).first()
        if not s:
            s = Session(id=session_id)
            db.add(s); db.commit()
    # save user message
    msg = Message(session_id=session_id, role="user", text=text)
    db.add(msg); db.commit()
    # Query Deepseek
    results, err = deepseek_search(text, limit=6)
    source = "deepseek"
    
    if results is None:
        # Fallback to GitHub API
        results, err = github_search_repos(text, limit=6)
        source = "github" if results is not None else "fallback"
        
        if results is None:
            # Final fallback: simple search from local JSON sample
            sample_path = os.path.join(os.path.dirname(__file__), "..", "static", "repos_sample.json")
            try:
                with open(sample_path, "r", encoding="utf-8") as f:
                    sample = json.load(f)
            except Exception:
                sample = []
            qwords = [w.lower() for w in text.split() if len(w) > 2]
            scored = []
            for r in sample:
                score = 0
                text_blob = (r.get("name","") + " " + r.get("description","") + " " + r.get("language","")).lower()
                for w in qwords:
                    if w in text_blob:
                        score += 1
                if score>0:
                    scored.append((score, r))
            scored.sort(key=lambda x: (-x[0], -int(x[1].get("stars",0))))
            results = [ dict(name=r.get("name"), owner=r.get("owner"), stars=r.get("stars",0),
                            description=r.get("description",""), language=r.get("language",""), url=r.get("url")) for _, r in scored[:6]]
            if not results:
                # empty fallback hint
                results = []
    # log query
    qlog = QueryLog(session_id=session_id, query_text=text, source=source, result_count=len(results))
    db.add(qlog); db.commit()
    # save bot message summary
    bot_text = f"Found {len(results)} repositories" if results else "No repositories found."
    bmsg = Message(session_id=session_id, role="bot", text=bot_text)
    db.add(bmsg); db.commit()
    return {"session_id": session_id, "results": results, "source": source}

@app.get("/api/snippet")
async def api_snippet(repo: str, path: Optional[str] = None):
    """
    repo: owner/repo
    path: optional file path to fetch (if omitted, we attempt to return README or top files)
    """
    # try raw.githubusercontent for public repos quickly
    owner_repo = repo.strip()
    if "/" not in owner_repo:
        raise HTTPException(status_code=400, detail="repo must be owner/repo")
    owner, rname = owner_repo.split("/",1)
    # prefer README
    candidates = []
    if path:
        candidates = [path]
    else:
        candidates = ["README.md","README","readme.md","README.rst"]
    for p in candidates:
        raw_url = f"https://raw.githubusercontent.com/{owner}/{rname}/master/{p}"
        try:
            import requests
            resp = requests.get(raw_url, timeout=6)
            if resp.status_code == 200 and resp.text.strip():
                text = resp.text
                snippet = "\n".join(text.splitlines()[:200])
                return {"repo": repo, "path": p, "snippet": snippet}
        except Exception:
            continue
    raise HTTPException(status_code=404, detail="no snippet found")

@app.get("/api/admin/stats")
async def admin_stats(x_admin_secret: Optional[str] = Header(None), db: DBSession = Depends(get_db)):
    if x_admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="forbidden")
    recent_queries = db.query(QueryLog).order_by(QueryLog.created_at.desc()).limit(50).all()
    def q_to_d(q):
        return {"id": q.id, "session_id": q.session_id, "q": q.query_text, "src": q.source, "count": q.result_count, "err": q.error, "t": q.created_at.isoformat()}
    return {"recent_queries": [q_to_d(q) for q in recent_queries], "rate_limit_map": rate_limits}

@app.get("/api/health")
async def health():
    return {"ok": True}

# OAuth endpoints (scaffold)
@app.get("/api/github/login")
async def github_login(state: Optional[str] = None):
    state = state or str(uuid.uuid4())
    url = github_oauth_url(state)
    return RedirectResponse(url)

@app.get("/api/github/callback")
async def github_callback(code: Optional[str] = None, state: Optional[str] = None, db: DBSession = Depends(get_db)):
    if not code:
        raise HTTPException(status_code=400, detail="missing code")
    token = github_exchange_code(code)
    # fetch user info
    import requests
    resp = requests.get("https://api.github.com/user", headers={"Authorization": f"token {token}"}, timeout=8)
    resp.raise_for_status()
    data = resp.json()
    gh_id = str(data.get("id"))
    username = data.get("login")
    # upsert user
    u = db.query(User).filter(User.github_id == gh_id).first()
    if not u:
        u = User(github_id=gh_id, username=username, access_token=token)
        db.add(u)
    else:
        u.access_token = token
    db.commit()
    # NOTE: production would set a secure cookie / JWT. For demo we just return token info.
    return {"status": "ok", "github_id": gh_id, "username": username}

@app.post("/api/github/action")
async def github_action(payload: dict, db: DBSession = Depends(get_db)):
    """
    payload: { action, repo, title?, body? , github_id? }
    For demo we accept github_id to locate token. Production: use secure session auth.
    """
    action = payload.get("action")
    repo = payload.get("repo")
    github_id = payload.get("github_id")
    if not (action and repo and github_id):
        raise HTTPException(status_code=400, detail="missing fields")
    user = db.query(User).filter(User.github_id == str(github_id)).first()
    if not user or not user.access_token:
        return {"oauth_required": True, "message": "user not logged in or token missing"}
    token = user.access_token
    import requests
    owner, repo_name = repo.split("/",1)
    if action == "create_issue":
        title = payload.get("title","Issue from Deepseek ChatOps")
        body = payload.get("body","Created via demo")
        url = f"https://api.github.com/repos/{owner}/{repo_name}/issues"
        resp = requests.post(url, json={"title": title, "body": body}, headers={"Authorization": f"token {token}", "Accept":"application/vnd.github.v3+json"}, timeout=8)
        if resp.status_code in (200,201):
            return {"ok": True, "issue": resp.json()}
        return {"ok": False, "status_code": resp.status_code, "detail": resp.text}
    elif action == "star":
        url = f"https://api.github.com/user/starred/{owner}/{repo_name}"
        resp = requests.put(url, headers={"Authorization": f"token {token}", "Accept":"application/vnd.github.v3+json"}, timeout=8)
        return {"ok": resp.status_code in (204,304), "status_code": resp.status_code}
    else:
        raise HTTPException(status_code=400, detail="unknown action")
