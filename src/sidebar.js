// Perplexity AI Firefox Extension - Corrected JavaScript
// Fixes for layout stretching and 400 API errors

class PerplexityChat {
  constructor() {
    this.apiKey = null;
    this.messages = [];
    this.isProcessing = false;

    // Initialize the chat when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    console.log('Initializing Perplexity Chat Extension');

    // Load saved API key
    await this.loadApiKey();

    // Attach event listeners
    this.attachEventListeners();

    // Update UI state
    this.updateUIState();

    console.log('Extension initialized successfully');
  }

  attachEventListeners() {
    // API Key button
    const apiKeyBtn = document.getElementById('api-key-btn');
    if (apiKeyBtn) {
      apiKeyBtn.addEventListener('click', () => this.showApiKeyModal());
    }

    // Send button and Enter key
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input');

    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.handleSendMessage());
    }

    if (messageInput) {
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    // Clear chat button
    const clearBtn = document.getElementById('clear-chat-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearChat());
    }

    // API Key modal buttons
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    const testApiKeyBtn = document.getElementById('test-api-key-btn');

    if (saveApiKeyBtn) {
      saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
    }

    if (testApiKeyBtn) {
      testApiKeyBtn.addEventListener('click', () => this.testApiKey());
    }
  }

  async loadApiKey() {
    try {
      const result = await browser.storage.local.get(['perplexityApiKey']);
      if (result.perplexityApiKey) {
        this.apiKey = result.perplexityApiKey;
        console.log('API key loaded from storage');
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  }

  updateUIState() {
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');

    const hasApiKey = !!this.apiKey;

    if (messageInput) {
      messageInput.disabled = !hasApiKey;
      messageInput.placeholder = hasApiKey
        ? 'Ask me about this webpage...'
        : 'Configure API key first...';
    }

    if (sendBtn) {
      sendBtn.disabled = !hasApiKey || this.isProcessing;
    }
  }

  showApiKeyModal() {
    const modal = document.getElementById('api-key-modal');
    const input = document.getElementById('api-key-input');

    if (modal && input) {
      input.value = this.apiKey || '';
      modal.showModal();
    }
  }

  async testApiKey() {
    const input = document.getElementById('api-key-input');
    const status = document.getElementById('api-key-status');
    const testBtn = document.getElementById('test-api-key-btn');

    if (!input || !status || !testBtn) return;

    const testKey = input.value.trim();
    if (!testKey) {
      this.showStatus('Please enter an API key', 'error');
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';

    try {
      // CORRECTED: Proper API request format for Perplexity
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testKey}`, // CRITICAL: Proper Bearer format
          'Content-Type': 'application/json', // CRITICAL: Required header
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online', // CORRECTED: Valid model name
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a test message.'
            }
          ],
          max_tokens: 50,
          temperature: 0.1
        })
      });

      if (response.ok) {
        this.showStatus('✅ API key is valid!', 'success');
      } else {
        const errorData = await response.text();
        console.error('API test failed:', response.status, errorData);
        this.showStatus(`❌ API key test failed: ${response.status}`, 'error');
      }
    } catch (error) {
      console.error('API test error:', error);
      this.showStatus('❌ Connection failed. Check your internet connection.', 'error');
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = 'Test Connection';
    }
  }

  async saveApiKey() {
    const input = document.getElementById('api-key-input');
    const modal = document.getElementById('api-key-modal');

    if (!input) return;

    const newApiKey = input.value.trim();
    if (!newApiKey) {
      this.showStatus('Please enter a valid API key', 'error');
      return;
    }

    try {
      await browser.storage.local.set({ perplexityApiKey: newApiKey });
      this.apiKey = newApiKey;
      this.updateUIState();

      if (modal) {
        modal.close();
      }

      console.log('API key saved successfully');
    } catch (error) {
      console.error('Error saving API key:', error);
      this.showStatus('Failed to save API key', 'error');
    }
  }

  showStatus(message, type) {
    const status = document.getElementById('api-key-status');
    if (!status) return;

    status.textContent = message;
    status.className = `text-sm ${type === 'error' ? 'text-error' : 'text-success'}`;
    status.classList.remove('hidden');

    setTimeout(() => {
      status.classList.add('hidden');
    }, 5000);
  }

  async handleSendMessage() {
    if (!this.apiKey || this.isProcessing) return;

    const messageInput = document.getElementById('message-input');
    if (!messageInput) return;

    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    // Clear input and disable UI
    messageInput.value = '';
    this.isProcessing = true;
    this.updateUIState();
    this.showLoading(true);

    // Add user message to chat
    this.addMessage('user', userMessage);

    try {
      // Get current page content
      const pageContent = await this.getCurrentPageContent();

      // Send to Perplexity with corrected format
      const response = await this.sendToPerplexity(userMessage, pageContent);

      // Add AI response to chat
      this.addMessage('assistant', response);

    } catch (error) {
      console.error('Error sending message:', error);
      this.addMessage('assistant', 'Sorry, I encountered an error while processing your message. Please check your API key and try again.');
    } finally {
      this.isProcessing = false;
      this.updateUIState();
      this.showLoading(false);
    }
  }

  async sendToPerplexity(userMessage, pageContent) {
    // CORRECTED: Build proper message array for Perplexity API
    const messages = [];

    // Add system message with page context if available
    if (pageContent && pageContent.content) {
      messages.push({
        role: 'system',
        content: `You are an AI assistant helping analyze web page content. 

Current page information:
- Title: ${pageContent.title || 'Unknown'}
- URL: ${pageContent.url || 'Unknown'}
- Description: ${pageContent.metaDescription || 'Not available'}

Page content:
${pageContent.content.substring(0, 8000)} // Limit content to avoid token limits

Please provide helpful and concise responses about this page content.`
      });
    }

    // Add conversation history (excluding previous system messages)
    const conversationHistory = this.messages.filter(msg =>
      msg.role === 'user' || msg.role === 'assistant'
    );
    messages.push(...conversationHistory);

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    console.log('Sending request to Perplexity API with messages:', messages.length);

    // CORRECTED: Proper API request with all required headers and valid model
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`, // CRITICAL: Proper Bearer format
        'Content-Type': 'application/json', // CRITICAL: Required header
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online', // CORRECTED: Valid model name with dashes
        messages: messages,
        max_tokens: 1000,
        temperature: 0.2,
        top_p: 0.9,
        search_domain_filter: ["perplexity.ai"], // Optional: helps with search quality
        return_images: false,
        return_related_questions: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API Error:', response.status, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Perplexity API Response:', data);

    if (data.choices && data.choices.length > 0) {
      const assistantMessage = data.choices[0].message.content;

      // Store the message in conversation history
      this.messages.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: assistantMessage }
      );

      return assistantMessage;
    } else {
      throw new Error('No response content received from API');
    }
  }

  async getCurrentPageContent() {
    try {
      // Get the active tab
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) return null;

      const tab = tabs[0];

      // Execute content script to get page content
      const results = await browser.tabs.executeScript(tab.id, {
        code: `
                    // Extract meaningful page content
                    const getPageContent = () => {
                        // Remove script and style elements
                        const scripts = document.querySelectorAll('script, style, noscript');
                        scripts.forEach(el => el.remove());
                        
                        // Get main content areas
                        const contentSelectors = [
                            'main', 
                            'article', 
                            '[role="main"]',
                            '.content',
                            '.main-content',
                            '.post-content',
                            '.entry-content'
                        ];
                        
                        let content = '';
                        for (const selector of contentSelectors) {
                            const element = document.querySelector(selector);
                            if (element) {
                                content = element.innerText;
                                break;
                            }
                        }
                        
                        // Fallback to body content if no main content found
                        if (!content) {
                            content = document.body.innerText;
                        }
                        
                        // Clean up content
                        content = content.replace(/\\s+/g, ' ').trim();
                        
                        return {
                            title: document.title,
                            url: window.location.href,
                            metaDescription: document.querySelector('meta[name="description"]')?.content,
                            content: content.substring(0, 10000) // Limit to prevent token overflow
                        };
                    };
                    
                    getPageContent();
                `
      });

      return results && results[0] ? results[0] : null;
    } catch (error) {
      console.error('Error getting page content:', error);
      return null;
    }
  }

  addMessage(role, content) {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat ${role === 'user' ? 'chat-end' : 'chat-start'}`;

    messageDiv.innerHTML = `
            <div class="chat-image avatar">
                <div class="w-8 rounded-full ${role === 'user' ? 'bg-secondary text-secondary-content' : 'bg-primary text-primary-content'} flex items-center justify-center text-sm">
                    ${role === 'user' ? '👤' : '🤖'}
                </div>
            </div>
            <div class="chat-bubble ${role === 'user' ? 'chat-bubble-secondary' : 'chat-bubble-primary'}">
                ${this.formatMessage(content)}
            </div>
        `;

    chatContainer.appendChild(messageDiv);

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  formatMessage(content) {
    // Basic formatting for better readability
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  clearChat() {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    // Keep only the welcome message
    const welcomeMessage = chatContainer.querySelector('.chat');
    chatContainer.innerHTML = '';
    if (welcomeMessage) {
      chatContainer.appendChild(welcomeMessage);
    }

    // Clear message history
    this.messages = [];

    console.log('Chat cleared');
  }

  showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.toggle('hidden', !show);
    }
  }
}

// Initialize the chat extension
const perplexityChat = new PerplexityChat();

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerplexityChat;
}