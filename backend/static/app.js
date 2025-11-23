// static/app.js
// file path: backend/static/app.js
(() => {
  const messagesEl = document.getElementById("messages");
  const resultsEl = document.getElementById("repo-results");
  const form = document.getElementById("inputForm");
  const input = document.getElementById("inputText");
  let session_id = null;

  function addMessage(text, role="user"){
    const div = document.createElement("div");
    div.className = "msg " + (role==="user" ? "user":"bot");
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderResults(results){
    resultsEl.innerHTML = "";
    if(!results || results.length===0){
      resultsEl.textContent = "No repos found.";
      return;
    }
    results.forEach(r => {
      const card = document.createElement("div");
      card.className = "repo-card";
      card.innerHTML = `<h3><a href="${r.url}" target="_blank">${r.owner}/${r.name}</a> <span class="small">★ ${r.stars || 0} • ${r.language || ''}</span></h3>
        <p class="small">${r.description || ''}</p>
        <div class="actions">
          <button class="btn" onclick="window.open('${r.url}','_blank')">Open</button>
          <button class="btn" onclick="starRepo('${r.owner}/${r.name}')">Star</button>
          <button class="btn" onclick="getSnippet('${r.owner}/${r.name}')">Snippet</button>
        </div>`;
      resultsEl.appendChild(card);
    });
  }

  async function postChat(text){
    addMessage(text,"user");
    const res = await fetch("/api/chat", {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({text, session_id})
    });
    if(!res.ok){
      const err = await res.text();
      addMessage("Error: " + err, "bot");
      return;
    }
    const data = await res.json();
    session_id = data.session_id;
    addMessage((data.source === "deepseek" ? "Results from Deepseek" : "Fallback results"), "bot");
    renderResults(data.results);
  }

  async function getSnippet(repo){
    const res = await fetch(`/api/snippet?repo=${encodeURIComponent(repo)}`);
    if(!res.ok){
      addMessage("Snippet not available.", "bot");
      return;
    }
    const d = await res.json();
    addMessage(`Snippet (${d.path}) from ${repo}:\n\n` + (d.snippet || ""), "bot");
  }

  async function starRepo(repo){
    addMessage(`Requesting to star ${repo} (demo)`, "user");
    // demo: action requires oauth; the backend will reply oauth_required for unauthenticated
    const res = await fetch("/api/github/action", {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({action:"star", repo, github_id: "demo"})
    });
    const d = await res.json();
    if(d.oauth_required){
      addMessage("OAuth required. Use /api/github/login to authenticate in a new tab.", "bot");
      window.open("/api/github/login", "_blank");
    } else {
      addMessage("Star result: " + JSON.stringify(d), "bot");
    }
  }

  form.addEventListener("submit", e=>{
    e.preventDefault();
    const t = input.value.trim();
    if(!t) return;
    input.value = "";
    postChat(t);
  });

  // expose for buttons
  window.getSnippet = getSnippet;
  window.starRepo = starRepo;
})();
