/* ==================================================
   文字数カウント - Production JavaScript Engine
   app.js
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==================================================
       DOM References
    ================================================== */

    const textInput = document.getElementById("textInput");

    const charWithSpaces = document.getElementById("charWithSpaces");
    const charWithoutSpaces = document.getElementById("charWithoutSpaces");
    const wordCount = document.getElementById("wordCount");
    const lineCount = document.getElementById("lineCount");
    const paragraphCount = document.getElementById("paragraphCount");
    const byteCount = document.getElementById("byteCount");
    const punctuationCount = document.getElementById("punctuationCount");
    const manuscriptCount = document.getElementById("manuscriptCount");

    const limitStatus = document.getElementById("limitStatus");
    const overBadge = document.getElementById("overBadge");

    const toast = document.getElementById("toast");

    const themeToggle = document.getElementById("themeToggle");

    const STORAGE_KEY = "jp_char_counter_text";
    const THEME_KEY = "jp_char_counter_theme";

    let activeLimit = null;

    /* ==================================================
       Theme Engine
    ================================================== */

    function applyTheme(theme) {

        if (theme === "dark") {
            document.documentElement.classList.add("dark");

            if (themeToggle) {
                themeToggle.textContent = "☀️";
                themeToggle.setAttribute("aria-label", "ライトモード");
            }
        } else {
            document.documentElement.classList.remove("dark");

            if (themeToggle) {
                themeToggle.textContent = "🌙";
                themeToggle.setAttribute("aria-label", "ダークモード");
            }
        }
    }

    function initializeTheme() {

        const savedTheme = localStorage.getItem(THEME_KEY);

        if (savedTheme) {
            applyTheme(savedTheme);
            return;
        }

        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

        applyTheme(prefersDark ? "dark" : "light");
    }

    function toggleTheme() {

        const isDark =
            document.documentElement.classList.contains("dark");

        const nextTheme = isDark ? "light" : "dark";

        localStorage.setItem(THEME_KEY, nextTheme);

        applyTheme(nextTheme);
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }

    initializeTheme();

    /* ==================================================
       Toast Notification
    ================================================== */

    let toastTimeout;

    function showToast(message) {

        if (!toast) return;

        clearTimeout(toastTimeout);

        toast.textContent = message;

        toast.classList.add("show");

        toastTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 2200);
    }

    /* ==================================================
       Auto Save Engine
    ================================================== */

    function saveText() {
        localStorage.setItem(
            STORAGE_KEY,
            textInput.value
        );
    }

    function restoreText() {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (saved !== null) {
            textInput.value = saved;
        }
    }

    restoreText();

    /* ==================================================
       Byte Counter
       ASCII = 1 byte
       Japanese chars = UTF-8 length
    ================================================== */

    function calculateBytes(text) {

        let totalBytes = 0;

        for (const char of text) {

            const code = char.codePointAt(0);

            if (code <= 0x7F) {
                totalBytes += 1;
            }
            else if (code <= 0x7FF) {
                totalBytes += 2;
            }
            else if (code <= 0xFFFF) {
                totalBytes += 3;
            }
            else {
                totalBytes += 4;
            }
        }

        return totalBytes;
    }

    /* ==================================================
       Analytics Engine
    ================================================== */

    function calculateStats() {

        const text = textInput.value;

        saveText();

        /* ----------------------------
           Character Count
        ---------------------------- */

        const charsWithSpaces = text.length;

        const charsWithoutSpaces =
            text.replace(/[\s　]/g, "").length;

        /* ----------------------------
           Word Count
        ---------------------------- */

        const words = text.trim()
            ? text.trim().split(/\s+/).length
            : 0;

        /* ----------------------------
           Line Count
        ---------------------------- */

        const lines = text.length
            ? text.split(/\r?\n/).length
            : 0;

        /* ----------------------------
           Paragraph Count
        ---------------------------- */

        const paragraphs = text.trim()
            ? text
                .split(/\n\s*\n/)
                .filter(item => item.trim() !== "")
                .length
            : 0;

        /* ----------------------------
           Byte Count
        ---------------------------- */

        const bytes =
            calculateBytes(text);

        /* ----------------------------
           Japanese Punctuation
        ---------------------------- */

        const punctuation =
            (text.match(/[、。！？]/g) || []).length;

        /* ----------------------------
           Manuscript Paper
           400 chars/page
        ---------------------------- */

        const manuscriptPages =
            (charsWithoutSpaces / 400).toFixed(2);

        /* ----------------------------
           Update UI
        ---------------------------- */

        charWithSpaces.textContent =
            charsWithSpaces.toLocaleString();

        charWithoutSpaces.textContent =
            charsWithoutSpaces.toLocaleString();

        wordCount.textContent =
            words.toLocaleString();

        lineCount.textContent =
            lines.toLocaleString();

        paragraphCount.textContent =
            paragraphs.toLocaleString();

        byteCount.textContent =
            bytes.toLocaleString();

        punctuationCount.textContent =
            punctuation.toLocaleString();

        manuscriptCount.textContent =
            manuscriptPages;

        updateLimitState(charsWithSpaces);
    }

    /* ==================================================
       Limit Presets
    ================================================== */

    function updateLimitState(currentChars) {

        if (!activeLimit) {

            limitStatus.classList.add("hidden");
            overBadge.classList.add("hidden");

            textInput.classList.remove(
                "limit-danger"
            );

            return;
        }

        limitStatus.classList.remove("hidden");

        limitStatus.textContent =
            `設定上限: ${activeLimit}文字`;

        if (currentChars > activeLimit) {

            textInput.classList.add(
                "limit-danger"
            );

            overBadge.classList.remove("hidden");

            overBadge.textContent =
                `上限超過: ${currentChars} / ${activeLimit}`;

        } else {

            textInput.classList.remove(
                "limit-danger"
            );

            overBadge.classList.add("hidden");
        }
    }

    document
        .querySelectorAll(".preset-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                activeLimit =
                    Number(button.dataset.limit);

                calculateStats();
            });

        });

    const clearLimitBtn =
        document.getElementById("clearLimitBtn");

    if (clearLimitBtn) {

        clearLimitBtn.addEventListener(
            "click",
            () => {

                activeLimit = null;

                calculateStats();

                showToast("上限設定を解除しました");
            }
        );
    }

    /* ==================================================
       Utility Actions
    ================================================== */

    const removeEmptyLines =
        document.getElementById(
            "removeEmptyLines"
        );

    const removeDuplicateLines =
        document.getElementById(
            "removeDuplicateLines"
        );

    const normalizeWidth =
        document.getElementById(
            "normalizeWidth"
        );

    const copyBtn =
        document.getElementById("copyBtn");

    const clearBtn =
        document.getElementById("clearBtn");

    /* ----------------------------
       Empty Lines
    ---------------------------- */

    if (removeEmptyLines) {

        removeEmptyLines.addEventListener(
            "click",
            () => {

                const cleaned =
                    textInput.value
                        .split("\n")
                        .filter(
                            line =>
                                line.trim() !== ""
                        )
                        .join("\n");

                textInput.value = cleaned;

                calculateStats();

                showToast("空行を削除しました");
            }
        );
    }

    /* ----------------------------
       Duplicate Lines
    ---------------------------- */

    if (removeDuplicateLines) {

        removeDuplicateLines.addEventListener(
            "click",
            () => {

                const lines =
                    textInput.value.split("\n");

                const uniqueLines =
                    [...new Set(lines)];

                textInput.value =
                    uniqueLines.join("\n");

                calculateStats();

                showToast("重複行を削除しました");
            }
        );
    }

    /* ----------------------------
       Width Normalization
    ---------------------------- */

    if (normalizeWidth) {

        normalizeWidth.addEventListener(
            "click",
            () => {

                let normalized =
                    textInput.value;

                normalized =
                    normalized.replace(
                        /[Ａ-Ｚａ-ｚ０-９]/g,
                        char =>
                            String.fromCharCode(
                                char.charCodeAt(0) - 65248
                            )
                    );

                normalized =
                    normalized.replace(
                        /　/g,
                        " "
                    );

                textInput.value =
                    normalized;

                calculateStats();

                showToast(
                    "全角・半角を正規化しました"
                );
            }
        );
    }

    /* ----------------------------
       Copy
    ---------------------------- */

    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard.writeText(
                        textInput.value
                    );

                    showToast(
                        "テキストをコピーしました"
                    );

                } catch (error) {

                    console.error(error);

                    showToast(
                        "コピーに失敗しました"
                    );
                }
            }
        );
    }

    /* ----------------------------
       Clear
    ---------------------------- */

    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            () => {

                const confirmed =
                    confirm(
                        "テキストを削除しますか？"
                    );

                if (!confirmed) return;

                textInput.value = "";

                localStorage.removeItem(
                    STORAGE_KEY
                );

                calculateStats();

                showToast(
                    "内容をクリアしました"
                );
            }
        );
    }

    /* ==================================================
       Live Update
    ================================================== */

    textInput.addEventListener(
        "input",
        calculateStats
    );

    /* ==================================================
       System Theme Changes
       (only if no manual selection)
    ================================================== */

    const mediaQuery =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

    mediaQuery.addEventListener(
        "change",
        (event) => {

            const manuallyChosen =
                localStorage.getItem(THEME_KEY);

            if (manuallyChosen) return;

            applyTheme(
                event.matches
                    ? "dark"
                    : "light"
            );
        }
    );

    /* ==================================================
       Initial Render
    ================================================== */

    calculateStats();

});
