# W.E.B.U - Web Engineering of Bachkhoa Univeristy

**Personalized Code Learning Platform** — Backend application built with NestJS + TypeScript

## 🚀 Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) + [TypeScript](https://www.typescriptlang.org/)
- **Runtime:** Node.js v20
- **Package Manager:** Yarn
- **Code quality:** ESLint (flat config) + Prettier + Husky + lint-staged
- **CI:** GitHub Actions

## 📋 Prerequisitesx

- Node.js `>= 20`
- Yarn `>= 1.22` (or npm/pnpm — adjust commands accordingly)

## 🛠 Getting Started

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd webu-backend

# 2. Install dependencies (strictly follow yarn.lock)
yarn install --frozen-lockfile

# 3. Initialize Husky hooks (runs automatically via "prepare" script)
yarn prepare

# 4. Start dev server in watch mode
yarn start:dev
```

The API will be available at **http://localhost:3000**.

## 📜 Available Scripts

| Command             | Description                                    |
| ------------------- | ---------------------------------------------- |
| `yarn start:dev`    | Start NestJS dev server with watch mode        |
| `yarn build`        | Compile TypeScript into dist/ folder           |
| `yarn start`:prod   | Run the compiled production build              |
| `yarn lint`         | Run ESLint to catch syntax & logic issues      |
| `yarn lint:fix`     | Run ESLint and auto-fix import & format issues |
| `yarn format`       | Format all files with Prettier                 |
| `yarn format:check` | Check formatting without writing (used in CI)  |
| `yarn test`         | Run unit tests with Jest                       |
| `yarn test:e2e`     | Run end-to-end tests                           |

## 📁 Project Structure

```
webu-backend/
├── .github/workflows/    # GitHub Actions CI (Lint, Format, Build, Test)
├── .husky/               # Git hooks (pre-commit -> yarn lint)
├── src/
│   ├── common/           # Shared guards, interceptors, constants, decorators
│   ├── config/           # Environment variables and app configurations
│   ├── modules/          # Feature modules (Auth, User, etc.)
│   │   └── user/
│   │       ├── dto/                  # Data Transfer Objects
│   │       ├── user.controller.ts    # API Endpoints
│   │       ├── user.service.ts       # Business Logic
│   │       └── user.module.ts        # Module Encapsulation
│   ├── app.module.ts     # Root module
│   └── main.ts           # App entry point
├── eslint.config.mjs     # ESLint flat config (Strict Naming & Type Rules)
├── .prettierrc           # Prettier config
├── nest-cli.json         # NestJS CLI configuration
└── tsconfig.json         # TypeScript configurations
```

## ⚠️ Coding Conventions & Rules

Our project enforces strict coding guidelines to maintain clean code:

Naming Convention: All folders and files inside src/ MUST use kebab-case (e.g., user-profile.controller.ts).

Imports: Imports are automatically sorted and grouped. Unused imports will cause a lint error.

Strict Types: Avoid using any. Utilize proper DTOs and Interfaces.

No Floating Promises: Ensure database calls and async functions use await.

Complexity: Maximum depth of nested blocks (if/for) is set to 4.

## 🎯 Code Quality Workflow

Pre-commit: Husky runs yarn lint to ensure no broken code, unused variables, or wrong file names are committed.

CI/CD: On every push or pull request to main, GitHub Actions automatically runs Checkout, Setup Node, Install dependencies, Lint, Format Check, Build, and Test. PRs will be blocked if any step fails.
