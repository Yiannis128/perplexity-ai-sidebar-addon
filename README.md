# Perplexity AI Sidebar Chat for Firefox

A Firefox extension that shows a chat interface for Perplexity AI in the sidebar and allows you to ask questions about the current webpage. __✨Vibe-coded in 1 hour using Perplexity AI ironically__.

## Features

- Native Firefox sidebar integration
- Page content is automatically exposed to Perplexity AI
- DaisyUI-based chat interface
- API key management for Perplexity
- Ability to restart conversations
- Real-time interaction with the current page

## Installation

### From ZIP File
1. Download the ZIP file
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on" and select the ZIP file

### From Source Code
1. Clone the repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on" and select any file in the extension directory (e.g., manifest.json)

## Usage

1. Click the Perplexity icon in the Firefox toolbar to open the sidebar
2. Enter your Perplexity API key (obtain one from https://www.perplexity.ai/settings/api)
3. The extension will automatically extract the content of the current page
4. Type your questions about the page content in the chat interface
5. Use the "Restart Chat" button to clear the conversation history and start fresh

## Technical Details

- Built using Firefox WebExtensions API
- Uses DaisyUI for the chat interface components
- Communicates with Perplexity API for intelligent responses
- Extracts page content using content scripts

## Requirements

- Firefox
- A valid Perplexity API key

## License

See [License File](LICENSE)
