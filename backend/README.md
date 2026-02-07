# Backend Task Service

A FastAPI-based RESTful API for Todo task management with user-scoped data access.

## Features

- ✅ Create, read, update, and delete tasks
- ✅ Toggle task completion status
- ✅ User-scoped data isolation (each user sees only their tasks)
- ✅ Persistent storage (Neon PostgreSQL)
- ✅ Auto-generated OpenAPI documentation (Swagger UI)

## Tech Stack

- **Framework**: FastAPI
- **ORM**: SQLModel (Pydantic + SQLAlchemy)
- **Database**: Neon PostgreSQL
- **Python**: 3.11+

## Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Neon PostgreSQL connection string:

```
DATABASE_URL=postgresql://user:password@host:5432/database_name
```

### 3. Run the Server

```bash
# From the backend directory
uvicorn src.main:app --reload
```

The API will be available at `http://localhost:8000`

### 4. Access API Documentation

Open your browser:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/{user_id}/tasks` | List all tasks for user |
| POST | `/api/{user_id}/tasks` | Create new task |
| GET | `/api/{user_id}/tasks/{task_id}` | Get single task |
| PUT | `/api/{user_id}/tasks/{task_id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{task_id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{task_id}/complete` | Toggle completion |

## Testing

### Run Tests

```bash
# From backend directory with venv activated
pytest tests/
```

### Manual Testing via Swagger

1. Go to http://localhost:8000/docs
2. Expand any endpoint
3. Click "Try it out"
4. Enter parameters (e.g., user_id: "test-user-123")
5. Execute and view results

## Project Structure

```
backend/
├── src/
│   ├── main.py          # FastAPI application
│   ├── config.py        # Environment configuration
│   ├── database.py      # Database engine and session
│   ├── models/          # SQLModel entities
│   ├── schemas/         # Pydantic schemas
│   ├── services/        # Business logic
│   └── routes/          # API endpoints
├── tests/
│   ├── conftest.py      # Pytest fixtures
│   └── integration/     # Integration tests
├── requirements.txt     # Python dependencies
├── .env.example         # Environment template
└── README.md            # This file
```

## Security

- All queries filter by `user_id` for strict data isolation
- Cross-user access returns 404 (doesn't reveal existence of other users' data)
- Environment variables for secrets (no hardcoded credentials)

## License

MIT
