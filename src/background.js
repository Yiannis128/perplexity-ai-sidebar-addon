// Background script for Perplexity AI Extension
console.log('Perplexity AI Extension background script loaded');

// Handle extension installation
browser.runtime.onInstalled.addListener(function (details) {
  console.log('Extension installed/updated:', details.reason);

  if (details.reason === 'install') {
    // Open sidebar on first install
    browser.sidebarAction.open().catch(err => {
      console.log('Could not open sidebar:', err);
    });
  }
});

// Handle browser action click (if needed)
browser.browserAction.onClicked.addListener(function (tab) {
  browser.sidebarAction.toggle();
});

// Handle messages from content script or sidebar
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Background received message:', request);

  switch (request.action) {
    case 'openSidebar':
      browser.sidebarAction.open();
      break;
    case 'closeSidebar':
      browser.sidebarAction.close();
      break;
    default:
      console.log('Unknown action:', request.action);
  }

  return true; // Keep message channel open for async response
});