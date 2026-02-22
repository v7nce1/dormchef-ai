# Contributing to DormChef AI

Thanks for wanting to contribute! Here's how to get started.

## Quick Start

```bash
git clone https://github.com/yourusername/dormchef-ai.git
cd dormchef-ai
cp .env.example .env        # fill in your API keys
npm install
npm run dev
```

## Making Changes

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Commit with a clear message: `git commit -m "feat: add weekly meal planner"`
5. Push: `git push origin feature/your-feature`
6. Open a Pull Request

## Commit Convention

| Prefix | When to use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `style:` | UI/styling changes |
| `refactor:` | Code cleanup, no behavior change |
| `docs:` | README or docs only |
| `chore:` | Build, deps, config |

## What to Work On

Check the [Roadmap in README](README.md#roadmap) or open [Issues](issues) for ideas.

Good first issues are labeled `good first issue`.

## Code Style

- Functional React components only
- Inline styles using the `S` object pattern (see `App.jsx`)
- Async storage always uses the helpers in `src/utils/storage.js`
- No external UI libraries (keep the bundle lean)

## Questions?

Open an issue or ping us in [Discord](#).
