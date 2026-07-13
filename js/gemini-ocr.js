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

// API Anahtarı lokal config.js'den alınır (GitHub'a pushlanmaz)
const apiKey = window.GEMINI_API_KEY || "";
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

    if (!apiKey || apiKey === 'BURAYA_API_ANAHTARINIZI_YAZIN') {
        showError("API Anahtarı bulunamadı! Lütfen js/config.js dosyasını oluşturup geçerli bir Gemini API anahtarı ekleyin.");
        return;
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
                    text: "Identify all text and mathematical formulas in this image and convert them to clean LaTeX format. Do not wrap in markdown or backticks (e.g. no ```latex or ```). Follow these strict formatting rules: 1. Wrap any standard text words/phrases (Turkish or English) in \\text{...} to keep normal styling. 2. Align multiple rows using double backslash \\\\ line-breaks. 3. Use standard mathematical operators. 4. NEVER use LaTeX escape sequences for Turkish characters (like \\i, \\c{c}, \\u{g}). Write them natively as UTF-8 inside \\text{} (e.g. ı, İ, ş, Ş, ç, Ç, ğ, Ğ, ö, Ö, ü, Ü). Example: |x| \\le 2 \\iff -2 \\le x \\le 2 \\text{ olup bu aralıkta } 2 - (-2) + 1 = 5 \\text{ tane...}."
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
