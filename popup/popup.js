// DOM elements
const fontSelect = document.getElementById("fontSelect");
const removeItalics = document.getElementById("removeItalics");
const linkSize = document.getElementById("linkSize");
const linkColor = document.getElementById("linkColor");
const linkHoverColor = document.getElementById("linkHoverColor");
const lineSpacing = document.getElementById("lineSpacing");
const letterSpacing = document.getElementById("letterSpacing");

// Debounce helper
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Save and send settings to current tab
const applySettings = debounce(() => {
    const options = {
        font: fontSelect.value,
        removeItalics: removeItalics.checked,
        linkSize: parseFloat(linkSize.value),
        linkColor: linkColor.value,
        linkHoverColor: linkHoverColor.value,
        lineSpacing: parseFloat(lineSpacing.value),
        letterSpacing: parseFloat(letterSpacing.value)
    };

    // Save to Chrome storage
    chrome.storage.sync.set(options);

    // Send immediately to current tab for live updates
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "updateSettings", settings: options });
        }
    });
}, 50); // small debounce for performance

// Initialize popup with saved settings
chrome.storage.sync.get().then((settings) => {
    if (settings.font) fontSelect.value = settings.font;
    removeItalics.checked = settings.removeItalics || false;
    linkSize.value = settings.linkSize || 1.05;
    linkColor.value = settings.linkColor || "#0645AD";
    linkHoverColor.value = settings.linkHoverColor || "#003399";
    lineSpacing.value = settings.lineSpacing || 1.4;
    letterSpacing.value = settings.letterSpacing || 0.05;
});

// Event listeners
fontSelect.addEventListener("change", applySettings);
removeItalics.addEventListener("change", applySettings);
linkSize.addEventListener("input", applySettings);
linkColor.addEventListener("input", applySettings);
linkHoverColor.addEventListener("input", applySettings);
lineSpacing.addEventListener("input", applySettings);
letterSpacing.addEventListener("input", applySettings);
