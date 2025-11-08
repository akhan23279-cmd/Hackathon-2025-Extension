// Wait until the popup DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
    const fontSelect = document.getElementById("fontSelect");

    // Load the last used font from Chrome storage
    const { selectedFont } = await chrome.storage.sync.get("selectedFont");
    if (selectedFont) {
        fontSelect.value = selectedFont;
    }

    // Apply stored font immediately
    applyFontToPage(fontSelect.value);

    // Listen for font changes
    fontSelect.addEventListener("change", async () => {
        const newFont = fontSelect.value;
        await chrome.storage.sync.set({ selectedFont: newFont });
        applyFontToPage(newFont);
    });
});

// Inject CSS into the active tab
async function applyFontToPage(selectedFont) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        css: `
      @font-face {
        font-family: 'OpenDyslexic';
        src: url('${chrome.runtime.getURL("fonts/OpenDyslexic-Regular.woff")}') format('woff');
        font-weight: normal;
        font-style: normal;
      }

      /* General text styling */
      * {
        font-family: ${selectedFont}, Arial, sans-serif !important;
        font-style: normal !important;
      }

      em, i {
        font-style: normal !important;
      }

      /* Accessibility-enhanced links */
      a {
        font-size: 1.05em !important;       /* Slightly larger for readability */
        font-weight: 600 !important;        /* Bolder for clarity */
        color: #0645AD !important;          /* WCAG-compliant blue */
        text-decoration: underline !important;
        padding: 2px 4px !important;        /* Increases click area */
        border-radius: 4px !important;
        transition: background-color 0.2s ease, color 0.2s ease;
      }

      a:hover, a:focus {
        background-color: #dbe9ff !important;  /* Soft highlight on hover/focus */
        color: #003399 !important;             /* Darker blue for contrast */
        outline: 2px solid #99c2ff !important; /* Visible focus ring */
      }
    `
    });
}
