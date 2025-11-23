# RepoFinder 🔍

> **Discover GitHub repositories instantly with AI-powered search**

A modern web application for searching and exploring GitHub repositories with a beautiful UI, real-time GitHub API integration, and intelligent search capabilities powered by Deepseek AI.

![RepoFinder](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Python](https://img.shields.io/badge/Python-3.8+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

- 🔍 **Smart Search** - AI-powered repository search with Deepseek integration
- 🌐 **Real-time GitHub Data** - Live data from GitHub's official API
- 📋 **One-Click Clone** - Copy git clone commands instantly
- 🔗 **Direct Preview** - Open repositories on GitHub in new tabs
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ⚡ **Fast & Efficient** - Built with FastAPI for optimal performance
- 🔐 **Secure** - Rate limiting and authentication support

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd IBM_Project
   ```

2. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Required
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ADMIN_SECRET=your_admin_secret_here
   
   # Optional (for higher GitHub API rate limits)
   GITHUB_TOKEN=your_github_personal_access_token
   
   # Optional (for GitHub OAuth)
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

3. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   uvicorn app.main:app --reload
   ```

5. **Open your browser**
   
   Navigate to: `http://localhost:8000`

---

## 📁 Project Structure

```
IBM_Project/
├── index.html              # Landing page
├── chat.html               # Search interface
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI application
│   │   ├── models.py      # Database models
│   │   ├── db.py          # Database configuration
│   │   ├── deepseek_client.py  # Deepseek API integration
│   │   ├── github_search.py    # GitHub API integration
│   │   └── auth_github.py      # GitHub OAuth
│   └── requirements.txt   # Python dependencies
├── .env                   # Environment variables (create this)
└── README.md             # This file
```

---

## 🎯 Usage

### Landing Page (`/`)
- View application features and benefits
- Click "Start Searching" to begin

### Search Page (`/chat`)
1. Enter your search query (e.g., "React frameworks", "Python machine learning")
2. View results in a clean grid layout
3. Click any repository card to see options
4. Choose to:
   - **Copy** the git clone command
   - **Preview** the repository on GitHub

---

## 🔧 API Endpoints

### Public Endpoints

- `GET /` - Landing page
- `GET /chat` - Search interface
- `POST /api/chat` - Search repositories
  ```json
  {
    "text": "search query",
    "session_id": "optional-session-id"
  }
  ```
- `GET /health` - Health check

### Admin Endpoints

- `GET /admin/stats` - View statistics (requires `X-Admin-Secret` header)

### GitHub OAuth

- `GET /auth/github` - Initiate GitHub OAuth
- `GET /auth/github/callback` - OAuth callback

---

## 🛠️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DEEPSEEK_API_KEY` | Yes | API key for Deepseek AI search |
| `ADMIN_SECRET` | Yes | Secret for admin endpoints |
| `GITHUB_TOKEN` | No | GitHub personal access token (increases rate limits) |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |
| `DATABASE_URL` | No | Database connection string (defaults to SQLite) |
| `RATE_LIMIT_PER_MIN` | No | API rate limit per minute (default: 30) |

---

## 🔄 Search Flow

1. **Primary**: Deepseek AI search (if API key configured)
2. **Secondary**: GitHub API search (fallback)
3. **Final**: Sample data (if both APIs fail)

---

## 🎨 Tech Stack

### Frontend
- **HTML5** - Structure
- **Tailwind CSS** - Styling
- **Vanilla JavaScript** - Interactivity
- **Spline** - 3D background animations

### Backend
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **SQLite** - Database
- **Requests** - HTTP client
- **Python-dotenv** - Environment management

---

## 📊 Database Schema

- **User** - User accounts
- **Session** - User sessions
- **Message** - Chat messages
- **QueryLog** - Search query logs

---

## 🚦 Rate Limiting

- Default: 30 requests per minute per IP
- Configurable via `RATE_LIMIT_PER_MIN` environment variable
- Returns `429 Too Many Requests` when exceeded

---

## 🔐 Security Features

- ✅ Rate limiting per IP address
- ✅ Admin endpoint protection
- ✅ XSS prevention with safe DOM manipulation
- ✅ CORS middleware configured
- ✅ Environment variable protection

---

## 🧪 Development

### Running in Development Mode

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Database Migrations

The application automatically creates database tables on startup using SQLAlchemy.

---

## 📝 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

## 🙏 Acknowledgments

- **GitHub API** - Repository data
- **Deepseek AI** - Intelligent search
- **FastAPI** - Modern Python web framework
- **Tailwind CSS** - Utility-first CSS framework
- **Spline** - 3D design tool

---

**Made with ❤️ for developers who love discovering great repositories**
