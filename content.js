// content.js - Runs in the context of web pages
// This script extracts text content from the current page

// Function to extract the main text content from the webpage
function extractPageContent() {
  // Get title
  const title = document.title;

  // Get URL
  const url = window.location.href;

  // Get meta description
  let metaDescription = "";
  const metaDescTag = document.querySelector("meta[name='description']");
  if (metaDescTag) {
    metaDescription = metaDescTag.getAttribute("content");
  }

  // Get main content by various methods
  let mainContent = "";

  // Try to get content from main element
  const mainElement = document.querySelector("main");
  if (mainElement) {
    mainContent = mainElement.innerText;
  } 
  // If no main element, try article
  else if (document.querySelector("article")) {
    mainContent = document.querySelector("article").innerText;
  } 
  // If no article, try body content excluding navigation, header, footer, and ads
  else {
    // Create a temporary clone of the body to manipulate
    const tempBody = document.body.cloneNode(true);

    // Remove common non-content elements
    const elementsToRemove = [
      "nav", "header", "footer", "aside", 
      "[role='banner']", "[role='navigation']", "[role='complementary']",
      ".nav", ".navigation", ".menu", ".sidebar", ".footer", ".header", 
      ".ad", ".ads", ".advertisement"
    ];

    elementsToRemove.forEach(selector => {
      const elements = tempBody.querySelectorAll(selector);
      elements.forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    });

    mainContent = tempBody.innerText;
  }

  // Trim content and remove excessive whitespace
  mainContent = mainContent.replace(/\s+/g, " ").trim();

  // Limit content length if necessary (adjust as needed)
  const maxLength = 15000;
  if (mainContent.length > maxLength) {
    mainContent = mainContent.substring(0, maxLength) + "...";
  }

  // Return the extracted content
  return {
    title,
    url,
    metaDescription,
    content: mainContent
  };
}

// Listen for messages from the background script
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "getPageContent") {
    return Promise.resolve(extractPageContent());
  }
});

// Log that the content script has been loaded
console.log("Perplexity AI Sidebar: Content script loaded");
