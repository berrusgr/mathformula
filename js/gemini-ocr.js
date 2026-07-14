// ====== GEMINI AI IMAGE-TO-LATEX ENGINE ======
const ocrDropzone = document.getElementById('ocrDropzone');
const ocrFileInput = document.getElementById('ocrFileInput');
const ocrPrompt = document.getElementById('ocrPrompt');
const ocrPreviewContainer = document.getElementById('ocrPreviewContainer');
const ocrPreviewImage = document.getElementById('ocrPreviewImage');
const ocrSelectFileLink = document.getElementById('ocrSelectFileLink');
const ocrCancelBtn = document.getElementById('ocrCancelBtn');

if (ocrCancelBtn) {
    ocrCancelBtn.onclick = (e) => {
        e.stopPropagation();
        selectedOcrFile = null;
        ocrFileInput.value = "";
        ocrPreviewImage.src = "";
        ocrPreviewContainer.classList.add('hidden');
        ocrPrompt.classList.remove('hidden');
        ocrAnalyzeBtn.innerHTML = "Yapay Zeka ile Analiz Et";
        ocrAnalyzeBtn.disabled = false;
    };
}

// API Anahtarı lokal config.js'den, GitHub Actions ortamından veya tarayıcı hafızasından (localStorage) alınır
function getApiKey() {
    let key = window.GEMINI_API_KEY || "";
    
    // Eğer config.js'deki anahtar geçerli değilse yerel tarayıcı hafızasına bak
    if (!key || key === 'BURAYA_API_ANAHTARINIZI_YAZIN') {
        const localKey = localStorage.getItem('gemini_api_key');
        if (localKey && localKey !== 'BURAYA_API_ANAHTARINIZI_YAZIN') {
            return localKey;
        }
    }
    return key;
}

let selectedOcrFile = null;

// Open local file picker only when clicking the specific blue "dosya seçin" link
if (ocrSelectFileLink) {
    ocrSelectFileLink.onclick = (e) => {
        e.stopPropagation();
        ocrFileInput.click();
    };
}

// Clicking the dropzone container itself does nothing to prevent file selection window
ocrDropzone.onclick = (e) => {
    e.stopPropagation();
};

ocrFileInput.onchange = (e) => {
    if (e.target.files.length > 0) {
        handleOcrImage(e.target.files[0]);
    }
};

ocrDropzone.ondragover = (e) => {
    e.preventDefault();
    ocrDropzone.classList.add('border-blue-500', 'bg-blue-50/20');
};
ocrDropzone.ondragleave = () => {
    ocrDropzone.classList.remove('border-blue-500', 'bg-blue-50/20');
};
ocrDropzone.ondrop = (e) => {
    e.preventDefault();
    ocrDropzone.classList.remove('border-blue-500', 'bg-blue-50/20');
    if (e.dataTransfer.files.length > 0) {
        handleOcrImage(e.dataTransfer.files[0]);
    }
};

// Document-wide paste handler
document.addEventListener('paste', (e) => {
    if (document.activeElement === latexInput || document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
    }
    const items = e.clipboardData.items;
    for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            handleOcrImage(file);
            break;
        }
    }
});

function handleOcrImage(file) {
    selectedOcrFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        ocrPreviewImage.src = e.target.result;
        ocrPrompt.classList.add('hidden');
        ocrPreviewContainer.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

    ocrAnalyzeBtn.onclick = (e) => {
    e.stopPropagation();
    if (!selectedOcrFile) return;

    const originalBtnText = ocrAnalyzeBtn.innerHTML;
    let apiKey = getApiKey();

    if (!apiKey || apiKey === 'BURAYA_API_ANAHTARINIZI_YAZIN') {
        const userKey = prompt("Lütfen geçerli bir Gemini API Anahtarı girin (Bu anahtar tarayıcınızın yerel hafızasına güvenle kaydedilecek ve asla GitHub'a gitmeyecektir):");
        if (userKey && userKey.trim() && userKey.trim() !== 'BURAYA_API_ANAHTARINIZI_YAZIN') {
            localStorage.setItem('gemini_api_key', userKey.trim());
            apiKey = userKey.trim();
        } else {
            showError("Geçerli bir API anahtarı girilmedi. İşlem iptal edildi.");
            return;
        }
    }

    ocrAnalyzeBtn.disabled = true;
    ocrAnalyzeBtn.innerHTML = `<span class="animate-pulse flex items-center justify-center gap-1">🤖 Yapay Zeka Çözümlüyor...</span>`;

    // Extract base64 and mime type from image source
    const match = ocrPreviewImage.src.match(/^data:(image\/[a-zA-Z\+]+);base64,(.+)$/);
    if (!match) {
        showError("Görsel formatı desteklenmiyor.");
        ocrAnalyzeBtn.disabled = false;
        ocrAnalyzeBtn.innerHTML = originalBtnText;
        return;
    }
    const mimeType = match[1];
    const base64Data = match[2];

    const payload = {
        contents: [{
            parts: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                },
                {
                    text: "Identify all text and mathematical formulas in this image and convert them to clean LaTeX format. Do not wrap in markdown or backticks (e.g. no ```latex or ```). Follow these strict formatting rules: 1. Wrap ONLY standard human language words/phrases (Turkish or English) in \\text{...}. CRITICAL: NEVER put math variables (A, B, x), numbers, or operators (\\cup, \\times, \\setminus) inside \\text{...}. Math MUST be outside. Example: A \\cup B \\text{ kümesinin eleman sayısı } 5 \\text{ ise...}. 2. Align multiple rows using double backslash \\\\ line-breaks. Keep the overall output layout compact and square-like by adding line breaks frequently at logical phrase/sentence boundaries, avoiding very wide single lines that span horizontally. 3. Use standard mathematical operators. Specifically, always use: \\in for 'element of' (e.g. y \\in \\mathbb{R}), \\mathbb{R} for real numbers, \\mathbb{N} for natural numbers, \\mathbb{Z} for integers, \\varnothing or \\emptyset for empty set, \\le for less than or equal to, \\ge for greater than or equal to, and \\times for multiplication. 4. NEVER use LaTeX escape sequences for Turkish characters (like \\i, \\c{c}, \\u{g}). Write them natively as UTF-8 inside \\text{} (e.g. ı, İ, ş, Ş, ç, Ç, ğ, Ğ, ö, Ö, ü, Ü). Example: |x| \\le 2 \\iff -2 \\le x \\le 2 \\text{ olup bu aralıkta } 2 - (-2) + 1 = 5 \\text{ tane...}."
                }
            ]
        }]
    };

    fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`API Hatası (Kod: ${res.status}). Anahtarınızın doğru olduğundan emin olun.`);
            }
            return res.json();
        })
        .then(data => {
            if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content || !data.candidates[0].content.parts || data.candidates[0].content.parts.length === 0) {
                throw new Error("Yapay zeka görseli çözümleyemedi.");
            }

            let latex = data.candidates[0].content.parts[0].text.trim();
            // Clean markdown wraps
            latex = latex
                .replace(/```latex/g, '')
                .replace(/```/g, '')
                .replace(/^\\\[/g, '')
                .replace(/\\\]$/g, '')
                .trim();

            // Normalize all line breaks (LaTeX double backslash or physical newlines) to clean LaTeX breaks
            let lines = latex
                .split(/\\\\|\n/)
                .map(l => l.trim())
                .filter(l => l.length > 0);
            latex = lines.join(' \\\\ ');

            // Post-process to map textual/character approximations to proper LaTeX commands
            latex = latex
                .replace(/elemanıdır/gi, ' \\in ')
                .replace(/elemanı değildir/gi, ' \\notin ')
                .replace(/boş küme/gi, ' \\varnothing ')
                .replace(/ancak ve ancak/gi, ' \\Leftrightarrow ')
                .replace(/implies/gi, ' \\Rightarrow ')
                .replace(/iff/gi, ' \\Leftrightarrow ')
                .replace(/backslash/gi, ' \\setminus ')
                // Character-level cleanup for common AI mistakes with flexible spacing (e.g. yeR, y e R, y  e R -> y \in \mathbb{R})
                .replace(/([a-zA-Z0-9])\s*e\s*(\\mathbb\{R\}|R\b)/g, '$1 \\in \\mathbb{R}')
                .replace(/([a-zA-Z0-9])\s*e\s*(\\mathbb\{N\}|N\b)/g, '$1 \\in \\mathbb{N}')
                .replace(/([a-zA-Z0-9])\s*e\s*(\\mathbb\{Z\}|Z\b)/g, '$1 \\in \\mathbb{Z}')
                // UTF-8 symbols mapping fallback with padding spaces
                .replace(/∈/g, ' \\in ')
                .replace(/∉/g, ' \\notin ')
                .replace(/⊂/g, ' \\subset ')
                .replace(/⊆/g, ' \\subseteq ')
                .replace(/⊃/g, ' \\supset ')
                .replace(/⊇/g, ' \\supseteq ')
                .replace(/∪/g, ' \\cup ')
                .replace(/cap/g, ' \\cap ')
                .replace(/cup/g, ' \\cup ')
                .replace(/∩/g, ' \\cap ')
                .replace(/∅/g, ' \\varnothing ')
                .replace(/Ø/g, ' \\varnothing ')
                .replace(/ø/g, ' \\varnothing ')
                .replace(/∀/g, ' \\forall ')
                .replace(/∃/g, ' \\exists ')
                .replace(/¬/g, ' \\neg ')
                .replace(/∧/g, ' \\wedge ')
                .replace(/∨/g, ' \\vee ')
                .replace(/⇒/g, ' \\Rightarrow ')
                .replace(/⇔/g, ' \\Leftrightarrow ')
                .replace(/<=>/g, ' \\Leftrightarrow ')
                .replace(/==>/g, ' \\Rightarrow ')
                .replace(/=>/g, ' \\Rightarrow ')
                .replace(/->/g, ' \\rightarrow ')
                .replace(/<-/g, ' \\leftarrow ');

            setMathfieldValue(latex);
            updatePreview();

            ocrAnalyzeBtn.innerHTML = '✅ Başarıyla Çevrildi!';
            setTimeout(() => {
                ocrAnalyzeBtn.disabled = false;
                ocrAnalyzeBtn.innerHTML = originalBtnText;
            }, 2000);
        })
        .catch(err => {
            console.error("Gemini OCR error:", err);
            showError("Çeviri Hatası: " + err.message);
            ocrAnalyzeBtn.disabled = false;
            ocrAnalyzeBtn.innerHTML = originalBtnText;
        });
};
