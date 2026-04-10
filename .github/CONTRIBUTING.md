# Contributing to AI-Writer

Thank you for your interest in contributing to AI-Writer! 🎉

## Ways to Contribute

- 🐛 **Report Bugs** - Open an issue with clear steps to reproduce
- 💡 **Suggest Features** - Open an issue with your idea
- 📖 **Improve Docs** - Submit PR to improve documentation
- 🔧 **Submit PRs** - Fix bugs or add features

## Development Setup

```bash
# Clone the repository
git clone https://github.com/wuleiyuan/ai-writer.git
cd ai-writer

# Install dependencies
npm install

# Start web interface
npm run web

# Or use CLI
./ai-writer.js --help
```

## Project Structure

```
ai-writer/
├── ai-writer.js          # CLI entry point
├── web/
│   ├── server.js         # Express web server
│   └── public/
│       └── index.html    # Web UI
├── publishers/           # Platform publishers
│   ├── index.js         # Factory
│   └── *.js             # Individual platforms
└── src/
    ├── videoConverter.js # Video to article
    └── imageGenerator.js # AI cover image
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## Code Style

- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
