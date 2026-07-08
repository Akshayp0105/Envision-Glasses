# Contributing to Envision Glasses

Thank you for your interest in contributing to Envision Glasses! This project aims to improve accessibility and independence for visually impaired individuals. Every contribution helps.

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Open a new issue with a clear title and description
3. Include steps to reproduce, expected behavior, and actual behavior
4. Specify which module is affected (Hardware, Mobile App, or Simulator)

### Suggesting Features

1. Open an issue with the `enhancement` label
2. Describe the feature, its use case, and how it improves accessibility
3. Include mockups or examples if applicable

### Submitting Code

1. Fork the repository
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following the coding conventions below
4. Test your changes thoroughly
5. Commit with a clear message:
   ```bash
   git commit -m "feat(module): describe your change"
   ```
6. Push to your fork and open a Pull Request

## Coding Conventions

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(hardware):` — New hardware feature
- `fix(mobile):` — Bug fix in mobile app
- `docs(simulator):` — Documentation changes
- `chore:` — Maintenance tasks

### ESP32 Firmware (C++/Arduino)

- Use `#define` for constants and pin mappings
- Add comments for non-obvious hardware interactions
- Keep functions focused on a single responsibility

### Raspberry Pi (Python)

- Follow PEP 8 style guidelines
- Use type hints where practical
- Include docstrings for public functions

### Mobile App (React Native/Expo)

- Use functional components with hooks
- Keep screen components under 400 lines
- Extract reusable logic into services

### Simulator (HTML/CSS/JS)

- Use semantic HTML elements
- Maintain the dark theme color scheme
- Add JSDoc comments for public functions

## Testing

- **Hardware**: Test on actual ESP32-CAM or Raspberry Pi when possible
- **Mobile**: Test on both iOS and Android via Expo Go
- **Simulator**: Test in Chrome, Firefox, and Edge

## Accessibility

Since this project serves visually impaired users, always consider:

- Screen reader compatibility
- High contrast and clear visual hierarchy
- Voice feedback for critical actions
- Keyboard navigation support

## Questions?

Open an issue with the `question` label or reach out to the maintainers.
