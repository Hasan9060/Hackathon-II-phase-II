# Quickstart Guide: Backend Task Service

**Feature**: 001-backend-task-service
**Date**: 2026-02-02

This guide provides step-by-step instructions for setting up and running the Backend Task Service locally.

## Prerequisites

- Python 3.11 or higher
- pip or poetry for dependency management
- Neon PostgreSQL account (free tier available at https://neon.tech)
- git for version control

## Step 1: Get the Code

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd Todo-phase-02

# Checkout the feature branch
git checkout 001-backend-task-service
```

## Step 2: Create Neon Database

1. Sign up/log in to https://neon.tech
2. Create a new project
3. Copy the connection string (looks like `postgresql://user:pass@host/dbname`)

## Step 3: Set Up Python Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install fastapi sqlmodel psycopg2-binary uvicorn python-dotenv pytest
```

## Step 4: Configure Environment

Create a `.env` file in the backend directory:

```bash
# .env
DATABASE_URL=postgresql://your-user:your-password@your-host/your-database
```

Example `.env`:

```bash
DATABASE_URL=postgresql://todo_owner:abc123@ep-cool-xyz.us-east-2.aws.neon.tech/todo_db
```

**IMPORTANT**: Never commit `.env` to version control. Use `.env.example` as a template.

## Step 5: Run the Server

```bash
# From backend directory
uvicorn src.main:app --reload
```

Expected output:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Step 6: Access API Documentation

Open your browser and navigate to:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These interactive docs allow you to test all endpoints directly in the browser.

## Step 7: Test the API

### Using Swagger UI (Recommended)

1. Go to http://localhost:8000/docs
2. Click on any endpoint (e.g., `POST /api/{user_id}/tasks`)
3. Click "Try it out"
4. Enter a user_id (e.g., "user-123")
5. Enter request body:
   ```json
   {
     "title": "Buy groceries",
     "description": "Milk, eggs, bread"
   }
   ```
6. Click "Execute"
7. View the response

### Using cURL

```bash
# Create a task
curl -X POST "http://localhost:8000/api/user-123/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'

# List all tasks for user
curl "http://localhost:8000/api/user-123/tasks"

# Get a specific task (replace {task_id} with actual ID)
curl "http://localhost:8000/api/user-123/tasks/{task_id}"

# Update a task
curl -X PUT "http://localhost:8000/api/user-123/tasks/{task_id}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries and cook dinner"}'

# Toggle completion
curl -X PATCH "http://localhost:8000/api/user-123/tasks/{task_id}/complete"

# Delete a task
curl -X DELETE "http://localhost:8000/api/user-123/tasks/{task_id}"
```

## Step 8: Verify Data Persistence

1. Create a task via POST
2. Note the returned `id`
3. Stop the server (Ctrl+C)
4. Restart the server: `uvicorn src.main:app --reload`
5. GET the task by ID - data should still exist

## Step 9: Verify User Isolation

1. Create a task for user-123
2. Try to access it with user-456 in the URL
3. Expected result: 404 "Task not found"

Example:

```bash
# Create task for user-123
curl -X POST "http://localhost:8000/api/user-123/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title": "Secret task"}'

# Response includes task ID, e.g., "id": "abc-123-def"

# Try to access with different user ID
curl "http://localhost:8000/api/user-456/tasks/abc-123-def"

# Expected: 404 {"detail": "Task not found"}
```

## Project Structure

```
backend/
├── src/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py          # SQLModel entity
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py          # Pydantic schemas
│   ├── services/
│   │   ├── __init__.py
│   │   └── task.py          # CRUD functions
│   ├── routes/
│   │   ├── __init__.py
│   │   └── tasks.py         # API endpoints
│   ├── database.py          # DB engine + session
│   └── config.py            # Environment config
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── unit/
│   └── integration/
├── .env                     # Environment (not in git)
├── .env.example             # Template
└── requirements.txt         # Dependencies
```

## Running Tests

```bash
# From backend directory with venv activated
pytest tests/

# Run with coverage
pytest tests/ --cov=src --cov-report=html

# Run specific test file
pytest tests/integration/test_tasks_api.py
```

## Troubleshooting

### Database Connection Error

**Error**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution**:
- Verify DATABASE_URL is correct in `.env`
- Check Neon database is active (not paused)
- Ensure network allows connection to Neon

### Module Import Error

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

### Port Already in Use

**Error**: `Address already in use`

**Solution**:
- Stop other process using port 8000
- Or use different port: `uvicorn src.main:app --port 8001`

## Next Steps

After verifying the API works:

1. Review the generated code in `backend/src/`
2. Run integration tests to verify all endpoints
3. Proceed to the next feature (JWT authentication)

## Cleanup

```bash
# Deactivate virtual environment
deactivate

# Delete virtual environment (if needed)
rm -rf backend/venv
```

## Support

- Feature spec: `specs/001-backend-task-service/spec.md`
- Implementation plan: `specs/001-backend-task-service/plan.md`
- API contracts: `specs/001-backend-task-service/contracts/openapi.yaml`
