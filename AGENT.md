# AGENTS.md - Annadata Project

## CRITICAL: SKILL LOADING PROTOCOL

> **MANDATORY:** Before working on ANY task, you MUST load the relevant skills from `.agent/skills/`. This is the highest priority rule. Also after all changes make git commits.

### Skill Loading Rules

1. **Read SKILL.md first**: Before implementing anything, check `.agent/skills/` for relevant skills
2. **Selective reading**: Read the skill index, then only relevant sections matching your task
3. **Apply rules**: All SKILL.md rules are binding and must be followed
4. **Skills location**: `.agent/skills/` contains 38 skills including:
   - `python-patterns`, `api-patterns` - Backend development
   - `react-patterns`, `nextjs-best-practices`, `tailwind-patterns` - Frontend
   - `clean-code`, `testing-patterns`, `tdd-workflow` - Code quality
   - `database-design`, `deployment-procedures` - Infrastructure
   - `vulnerability-scanner`, `security` - Security

### Request Classification

| Request Type | Action |
|--------------|--------|
| Question | Direct answer |
| Survey/Intel | Analyze and report |
| Simple Code | Inline edit |
| Complex Code | Load relevant skills first |
| Design/UI | Load frontend skills first |

---

## CODE STYLE GUIDELINES

### Python Conventions
- **Imports**: Standard library → Third-party → Local. Use absolute imports (`from src.api.routes import x`)
- **Formatting**: Follow PEP 8. Use Black for formatting if available.
- **Types**: Use Pydantic v2 models with `BaseModel`. Enable strict typing.
- **Naming**: `snake_case` for functions/variables, `PascalCase` for classes. Max 79 chars per line.
- **Error Handling**: Use custom exceptions, return proper HTTPException with meaningful messages.

### TypeScript/React Conventions
- **Strict Mode**: Always enabled in tsconfig.json
- **Components**: Use functional components with hooks. Prefer `const` over `function`.
- **Types**: Define interfaces for all data structures. Avoid `any`.
- **Imports**: Order: React/Next → External libs → Internal components/utils

### Security - NO HARDCODED SECRETS
- **NEVER hardcode secrets** in source code
- **Use environment variables**: Reference via `os.environ.get()` or Pydantic Settings
- **Settings pattern**: All config in `src/config/settings.py` using `pydantic_settings.BaseSettings`
- **.env files**: Keep in project root, add to `.gitignore`

---

## BUILD/LINT/TEST COMMANDS

### Python Backend (FastAPI)
```bash
# Install dependencies
pip install -r requirements.txt
pip install -r protein_engineering/backend/requirements.txt

# Run development server
cd protein_engineering/backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Run with Python directly
cd src
python -m uvicorn api.app:app --reload
```

### Frontend (Next.js)
```bash
# Install dependencies
cd protein_engineering/frontend
npm install

# Run development
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

### Running Tests
```bash
# Python - pytest (if configured)
pytest                          # Run all tests
pytest tests/unit/             # Unit tests only
pytest tests/unit/test_file.py::test_function  # Single test
pytest -v                     # Verbose output
pytest -k "test_name"         # Run tests matching pattern

# Frontend - ESLint
cd protein_engineering/frontend
npm run lint                  # Run ESLint
```

### Project Structure
```
Annadata/
├── src/                      # Main Python source
│   ├── api/                  # FastAPI routes, schemas
│   ├── config/               # Settings, configurations
│   ├── models/               # ML models (classical, quantum, hybrid)
│   ├── features/             # Feature engineering
│   └── utils/                # Utility functions
├── protein_engineering/
│   ├── backend/              # FastAPI backend
│   └── frontend/             # Next.js frontend
├── tests/                    # Python tests (unit, integration, performance)
├── notebooks/                # Jupyter notebooks
├── docs/                     # Documentation
└── data/                     # Raw and processed data
```

---

## LLM BOOSTING TRICKS

### For Better Code Generation
1. **Provide context**: Include relevant file paths and code snippets in prompts
2. **Specify constraints**: Mention performance requirements, compatibility needs
3. **Show examples**: Reference existing patterns in the codebase
4. **Iterative refinement**: Start simple, then add complexity incrementally

### For Debugging
1. **Paste error messages exactly**: Include full stack traces
2. **Describe expected vs actual behavior**: Clear problem statement
3. **Provide minimal reproduction**: Smallest code that triggers the issue

### For Design Decisions
1. **State the goal**: What problem are you solving?
2. **Mention constraints**: Time, performance, compatibility
3. **Ask for trade-offs**: "What are the pros/cons of approach X vs Y?"

### General Tips
- Use the Socratic method: Ask clarifying questions before implementing
- Break complex tasks into smaller steps
- Verify changes work before moving on
- Run linters/tests after making changes

---

## FINAL CHECKLIST

Before completing any task:
1. ✅ No hardcoded secrets - use env variables
2. ✅ Code follows style guidelines above
3. ✅ Lint passes (`npm run lint` or equivalent)
4. ✅ Tests pass (run relevant test commands)
5. ✅ No console errors or warnings

Run validation: `python .agent/scripts/checklist.py .` (if available)
