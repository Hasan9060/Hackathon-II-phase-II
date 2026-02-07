---
id: "001"
title: "Update CLAUDE.md with project requirements"
stage: general
date: 2026-02-02
surface: agent
model: glm-4.6
feature: none
branch: master
user: developer
command: /agents
labels: ["documentation", "project-setup", "agents"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - CLAUDE.md
  - history/prompts/general/001-update-claude-md.general.prompt.md
tests:
  - None (documentation only)
---

## Prompt

Update the "claude.md" file based on my project requirements.
In this file:

- Use Auth Agent for authentication
- Use Frontend Agent for frontend development (e.g., Next.js)
- Use DB Agent for database design and operations
- Use Backend Agent for FastAPI development

Below are my project requirements:
```"""
Phase III: Todo AI Chatbot
Basic Level Functionality
Objective: Create an AI-powered chatbot interface for managing todos through natural
language using MCP (Model Context Protocol) server architecture and using Claude Code
and Spec-Kit Plus.
Development Approach: Use the Agentic Dev Stack workflow: Write spec → Generate
plan → Break into tasks → Implement via Claude Code. No manual coding allowed. We will
review the process, prompts, and iterations to judge each phase and project.
Requirements
1. Implement conversational interface for all Basic Level features
2. Use OpenAI Agents SDK for AI logic
3. Build MCP server with Official MCP SDK that exposes task operations as tools
4. Stateless chat endpoint that persists conversation state to database
5. AI agents use MCP tools to manage tasks. The MCP tools will also be stateless and
will store state in the database.
Technology Stack
Component
Technology
Frontend
Backend
AI Framework
MCP Server
OpenAI ChatKit
Python FastAPI
OpenAI Agents SDK
Official MCP SDK
ORM
Database
Authentication
SQLModel
Neon Serverless PostgreSQL
Better Auth

Better Auth can be configured to issue JWT (JSON Web Token) tokens when users log in.
These tokens are self-contained credentials that include user information and can be verified
by any service that knows the secret key.
How It Works
● User logs in on Frontend → Better Auth creates a session and issues a JWT token
● Frontend makes API call → Includes the JWT token in the Authorization: Bearer
<token> header
● Backend receives request → Extracts token from header, verifies signature using
shared secret
● Backend identifies user → Decodes token to get user ID, email, etc. and matches it
with the user ID in the URL
● Backend filters data → Returns only tasks belonging to that user
 """```

## Response snapshot

Updated CLAUDE.md with:
- New "Todo AI Chatbot Project" section
- Specialized Agent Usage guidelines for all 4 agents:
  - Auth Agent (`auth-security-specialist`)
  - Frontend Agent (`nextjs-ui-builder`)
  - DB Agent (`neon-database-architect`)
  - Backend Agent (`fastapi-backend`)
- Technology Stack table
- Authentication Architecture flow
- Key Requirements list

## Outcome

- ✅ Impact: CLAUDE.md now contains project-specific agent guidance for the Todo AI Chatbot
- 🧪 Tests: None (documentation only)
- 📁 Files: Updated CLAUDE.md with 80+ new lines of project documentation
- 🔁 Next prompts: Consider running `/sp.specify` to begin feature specification
- 🧠 Reflection: The file now provides clear guidance on when to use each specialized agent for this project

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin feature specification with `/sp.specify`
