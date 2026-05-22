const { JSDOM } = require("jsdom");
const { Readability } = require("@mozilla/readability");

/**
 * Extracts clean reader text content from a given web URL layout
 * @param {string} url - Target webpage link
 * @returns {Promise<string>} - Clean text string
 */
async function extractArticleText(url) {
  // ⚡ OPTIMIZED: Implemented explicit connection abort timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Website responded with status code: ${response.status}`);
    }

    const html = await response.text();
    const doc = new JSDOM(html, { url });

    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (
      article &&
      article.textContent &&
      article.textContent.trim().length > 100
    ) {
      return article.textContent.trim();
    }

    const paragraphs = doc.window.document.querySelectorAll("p");
    let fallbackText = "";
    paragraphs.forEach((p) => {
      if (p.textContent) fallbackText += p.textContent + " ";
    });

    return fallbackText.trim();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Target resource read timeout: Server request aborted.");
    }
    throw err;
  }
}

module.exports = { extractArticleText };
