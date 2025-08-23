# Contributing to AlurAI

We love your input! We want to make contributing to AlurAI as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/alur-ai.git
   cd alur-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and fill in your values

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Code Style

### TypeScript
- Use TypeScript for all new code
- Follow existing patterns and conventions
- Use proper typing, avoid `any` when possible
- Use interfaces for object shapes

### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use proper prop typing with TypeScript
- Keep components focused and reusable

### Styling
- Use Tailwind CSS for styling
- Follow the existing design system
- Use Radix UI components when possible
- Maintain responsive design principles

### File Organization
- Place components in appropriate directories
- Use descriptive file names
- Follow the existing folder structure
- Keep related files together

## Commit Messages

We follow conventional commit format:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Example:
```
feat: add form validation for email fields
fix: resolve form submission error on mobile
docs: update installation instructions
```

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test on different browsers and devices
- Test with different screen sizes

## Reporting Bugs

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/yourusername/alur-ai/issues).

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature has already been requested
2. Provide a clear description of the feature
3. Explain why this feature would be useful
4. Consider providing a basic implementation plan

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to creating a positive environment include:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at conduct@alurai.com.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to reach out:

- 📧 Email: dev@alurai.com
- 💬 Discord: [Join our community](https://discord.gg/alurai)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/alur-ai/issues)

Thank you for contributing to AlurAI! 🚀