// === ClearView Visual Word Highlighter (No Audio) ===

window.ClearViewVisual = {
    isInitialized: false,

    // Reading state
    isReading: false,
    isPaused: false,
    words: [],
    wordElements: [],
    currentWordIndex: 0,
    pace: 300, // milliseconds per word — adjustable dynamically

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        // Initialize pace from storage
        chrome.storage.sync.get("visualPace", (data) => {
            this.pace = data.visualPace || 300;
        });

        console.log("✅ ClearView Visual Reader initialized (no screenreader)");
    },

    // --- Start highlighting entire page ---
    start() {
        if (this.isReading) return;

        this.reset();
        this.prepareWords();

        if (this.words.length === 0) {
            console.warn("No readable content found.");
            return;
        }

        this.isReading = true;
        this.isPaused = false;
        this.readLoop();
    },

    pause() {
        this.isPaused = true;
        this.isReading = false;
    },

    resume() {
        if (!this.words.length) return;
        this.isPaused = false;
        this.isReading = true;
        this.readLoop();
    },

    stop() {
        this.isPaused = false;
        this.isReading = false;
        this.currentWordIndex = 0;
        this.clearHighlights();
    },

    setPace(msPerWord) {
        this.pace = Math.max(50, msPerWord); // prevent too fast
        console.log("Visual pace set to:", this.pace);
    },

    // --- Reset all states ---
    reset() {
        this.clearHighlights();
        this.words = [];
        this.wordElements = [];
        this.currentWordIndex = 0;
        this.isPaused = false;
        this.isReading = false;
    },

    // --- Find and wrap words ---
    prepareWords() {
        // NOTE: Must clear existing .clearview-word spans before re-wrapping
        this.clearHighlights(); // Clear highlights
        document.querySelectorAll(".clearview-word").forEach(span => {
            // Unwrap by replacing the span with its text content
            span.parentNode.replaceChild(document.createTextNode(span.textContent + " "), span);
        });

        const elements = Array.from(
            document.querySelectorAll("h1, h2, h3, h4, h5, h6, p")
        ).filter(el => el.offsetParent !== null && el.innerText.trim().length > 0);

        elements.forEach(el => {
            // Use innerText to get clean text before splitting
            let text = el.innerText.trim().split(/\s+/);

            el.innerHTML = text
                .map(w => `<span class="clearview-word">${w}</span>`)
                .join(" ");

            const spans = el.querySelectorAll(".clearview-word");
            spans.forEach(span => {
                this.words.push(span.innerText);
                this.wordElements.push(span);
            });
        });
    },

    clearHighlights() {
        document.querySelectorAll(".clearview-word").forEach(span => {
            span.style.backgroundColor = "";
            span.style.fontWeight = "";
            span.style.transform = "scale(1)";
        });
    },

    highlightWord(index) {
        if (index < 0 || index >= this.wordElements.length) return;
        this.clearHighlights();

        const span = this.wordElements[index];
        span.style.backgroundColor = "yellow";
        span.style.fontWeight = "bold";
        span.style.transform = "scale(1.15)";
        span.scrollIntoView({ behavior: "smooth", block: "center" });
    },

    // --- Main highlight loop ---
    readLoop() {
        if (!this.isReading || this.isPaused) return;

        this.highlightWord(this.currentWordIndex);
        this.currentWordIndex++;

        if (this.currentWordIndex >= this.wordElements.length) {
            this.stop();
            return;
        }

        setTimeout(() => this.readLoop(), this.pace);
    }
};

// Auto-init
window.ClearViewVisual.init();

// NEW: Message Listener for Popup Control
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "VISUAL_TOGGLE_READING") {
        if (window.ClearViewVisual.isReading) {
            window.ClearViewVisual.stop();
            sendResponse({ status: "Visual reading stopped" });
        } else {
            window.ClearViewVisual.start();
            sendResponse({ status: "Visual reading started" });
        }
        return true;
    } else if (message.action === "VISUAL_SET_PACE") {
        window.ClearViewVisual.setPace(message.pace);
        sendResponse({ status: `Visual pace set to ${message.pace}` });
        return true;
    }
});

// REMOVED: window.ClearViewVisual.start();