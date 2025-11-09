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
        --cv-link-size: 1.05em;
        --cv-link-color: #0645AD;
        --cv-link-hover-color: #003399;
      }

      * {
        font-family: var(--cv-font) !important;
        font-style: var(--cv-remove-italics) !important;
        line-height: var(--cv-line-height) !important;
        letter-spacing: var(--cv-letter-spacing) !important;
      }

      a {
        font-size: var(--cv-link-size) !important;
        font-weight: 600 !important;
        color: var(--cv-link-color) !important;
        text-decoration: underline !important;
        padding: 2px 4px !important;
        border-radius: 4px !important;
      }

      a:hover, a:focus {
        background-color: #dbe9ff !important;
        color: var(--cv-link-hover-color) !important;
        outline: 2px solid #99c2ff !important;
      }
    `;
        document.head.appendChild(style);
    }

    // Apply CSS variables to root
    function updateVariables(opts) {
        const root = document.documentElement;
        // Use OpenDyslexic if selected
        const fontName = opts.font === "OpenDyslexic" ? "'OpenDyslexic', Arial, sans-serif" : (opts.font || "Arial, sans-serif");
        root.style.setProperty("--cv-font", fontName);
        root.style.setProperty("--cv-remove-italics", opts.removeItalics ? "normal" : "inherit");
        root.style.setProperty("--cv-line-height", opts.lineSpacing || 1.4);
        root.style.setProperty("--cv-letter-spacing", (opts.letterSpacing || 0.05) + "em");
        root.style.setProperty("--cv-link-size", (opts.linkSize || 1.05) + "em");
        root.style.setProperty("--cv-link-color", opts.linkColor || "#0645AD");
        root.style.setProperty("--cv-link-hover-color", opts.linkHoverColor || "#003399");
    }

    // Progressive viewport-first styling
    function styleViewportFirst(opts) {
        const allElements = Array.from(document.body.querySelectorAll("*"));
        const viewportHeight = window.innerHeight;

        const aboveFold = allElements.filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.top < viewportHeight && rect.bottom > 0;
        });
        const belowFold = allElements.filter(el => !aboveFold.includes(el));

        const fontName = opts.font === "OpenDyslexic" ? "'OpenDyslexic', Arial, sans-serif" : (opts.font || "Arial, sans-serif");

        aboveFold.forEach(el => {
            el.style.fontFamily = fontName;
            if (opts.removeItalics) el.style.fontStyle = "normal";
            el.style.lineHeight = opts.lineSpacing || 1.4;
            el.style.letterSpacing = (opts.letterSpacing || 0.05) + "em";

            if (el.tagName === "A") {
                el.style.fontSize = (opts.linkSize || 1.05) + "em";
                el.style.fontWeight = "600";
                el.style.color = opts.linkColor || "#0645AD";
                el.style.textDecoration = "underline";
                el.style.padding = "2px 4px";
                el.style.borderRadius = "4px";
            }
        });

        let index = 0;
        const chunkSize = 50;

        function styleChunk() {
            const chunk = belowFold.slice(index, index + chunkSize);
            chunk.forEach(el => {
                el.style.fontFamily = fontName;
                if (opts.removeItalics) el.style.fontStyle = "normal";
                el.style.lineHeight = opts.lineSpacing || 1.4;
                el.style.letterSpacing = (opts.letterSpacing || 0.05) + "em";

                if (el.tagName === "A") {
                    el.style.fontSize = (opts.linkSize || 1.05) + "em";
                    el.style.fontWeight = "600";
                    el.style.color = opts.linkColor || "#0645AD";
                    el.style.textDecoration = "underline";
                    el.style.padding = "2px 4px";
                    el.style.borderRadius = "4px";
                }
            });
            index += chunkSize;
            if (index < belowFold.length) requestAnimationFrame(styleChunk);
        }

        if (belowFold.length) requestAnimationFrame(styleChunk);
    }

    // Load saved settings and apply
    const settings = await chrome.storage.sync.get();
    updateVariables(settings);
    styleViewportFirst(settings);

    // Listen for live updates
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "updateSettings") {
            updateVariables(message.settings);
            styleViewportFirst(message.settings);
        }
    });
})();
