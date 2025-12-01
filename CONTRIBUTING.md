# Contributing to Meri Shikayat

Thank you for your interest in contributing to Meri Shikayat! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "Add your message"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Development Setup

### Prerequisites
- Node.js v16 or higher
- MongoDB v5 or higher
- Git

### Installation
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Running Locally
```bash
# Terminal 1 - Start MongoDB
mongod

# Terminal 2 - Start backend server
cd server
npm run dev

# Terminal 3 - Start frontend
cd client
npm run dev
```

## Code Style

### JavaScript
- Use ES6+ features
- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code patterns

### CSS
- Use CSS custom properties for theming
- Follow BEM naming convention for classes
- Keep styles modular and reusable

### Commits
- Use clear and descriptive commit messages
- Follow conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for formatting changes
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

## Pull Request Guidelines

1. **Description**: Provide a clear description of what your PR does
2. **Testing**: Ensure all tests pass
3. **Documentation**: Update documentation if needed
4. **Code Quality**: Follow the code style guidelines
5. **Small PRs**: Keep PRs focused on a single feature or fix

## Reporting Issues

When reporting issues, please include:
- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

## Feature Requests

We welcome feature requests! Please:
- Check if the feature already exists
- Provide a clear use case
- Explain why this feature would be useful
- Be open to discussion

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community

## Questions?

Feel free to open an issue for any questions or clarifications.

Thank you for contributing! 🙏
