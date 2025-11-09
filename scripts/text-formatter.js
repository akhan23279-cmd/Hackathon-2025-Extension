(async function () {
    const openDyslexicURL = chrome.runtime.getURL("fonts/OpenDyslexic-Regular.woff");

    // Insert style once (for CSS variables)
    let style = document.getElementById("clearview-style");
    if (!style) {
        style = document.createElement("style");
        style.id = "clearview-style";
        style.textContent = `
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('${openDyslexicURL}') format('woff');
        font-weight: normal;
        font-style: normal;
      }

      :root {
        --cv-font: 'OpenDyslexic', Arial, sans-serif;
        --cv-remove-italics: normal;
        --cv-line-height: 1.4;
        --cv-letter-spacing: 0.05em;
        --cv-text-size: 1em;
        --cv-text-color: inherit;
        --cv-background-color: #FFFFFF;
        --cv-link-size: 1.05em;
        --cv-link-color: #0645AD;
        --cv-link-hover-color: #003399;
      }

      html, body {
        background-color: var(--cv-background-color) !important;
      }

      /* MODIFIED: Universal styles (excluding size/color) */
      * {
        font-family: var(--cv-font) !important;
        font-style: var(--cv-remove-italics) !important;
        line-height: var(--cv-line-height) !important;
        letter-spacing: var(--cv-letter-spacing) !important;
      }
      
      /* MODIFIED: Apply size/color/bg only to text containers */
      body div, body section, body main, body article, body aside, body header, body footer, body nav, body p, body li, body span {
         background-color: transparent !important;
         font-size: var(--cv-text-size) !important;
         color: var(--cv-text-color) !important;
      }

      /* NEW: Apply color/bg to headings, but PRESERVE font-size */
      h1, h2, h3, h4, h5, h6 {
         background-color: transparent !important;
         color: var(--cv-text-color) !important;
      }

      a {
        font-size: var(--cv-link-size) !important;
        font-weight: 600 !important;
        color: var(--cv-link-color) !important;
        text-decoration: underline !important;
        padding: 2px 4px !important;
        border-radius: 4px !important;
        background-color: transparent !important;
      }

      a:hover, a:focus {
        background-color: #dbe9ff !important;
        color: var(--cv-link-hover-color) !important;
        outline: 2px solid #99c2ff !important;
      }

      /* NEW: Universal focus style for keyboard navigation */
      *:focus-visible:not(a) {
        outline: 2px solid #005fcc !important;
        box-shadow: 0 0 5px #005fcc !important;
        border-radius: 2px !important;
      }
    `;
        document.head.appendChild(style);
    }

    // Apply CSS variables to root
    function updateVariables(opts) {
        const root = document.documentElement;
        const fontName = opts.font === "OpenDyslexic" ? "'OpenDyslexic', Arial, sans-serif" : (opts.font || "Arial, sans-serif");

        root.style.setProperty("--cv-font", fontName);
        root.style.setProperty("--cv-remove-italics", opts.removeItalics ? "normal" : "inherit");
        root.style.setProperty("--cv-text-size", (opts.textSize || 1.0) + "em");
        root.style.setProperty("--cv-text-color", opts.textColor || "inherit");
        root.style.setProperty("--cv-background-color", opts.backgroundColor || "#FFFFFF");
        root.style.setProperty("--cv-line-height", opts.lineSpacing || 1.4);
        root.style.setProperty("--cv-letter-spacing", (opts.letterSpacing || 0.05) + "em");
        root.style.setProperty("--cv-link-size", (opts.linkSize || 1.05) + "em");
        root.style.setProperty("--cv-link-color", opts.linkColor || "#0645AD");
        root.style.setProperty("--cv-link-hover-color", opts.linkHoverColor || "#003399");
    }

    // Load saved settings and apply
    const settings = await chrome.storage.sync.get();
    updateVariables(settings);

    // Listen for live updates
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "updateSettings") {
            updateVariables(message.settings);
        }
    });
})();