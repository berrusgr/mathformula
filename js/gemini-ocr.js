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

// Also bind a paste handler directly to mf (MathLive) to intercept image pastes when it is focused
if (mf) {
    mf.addEventListener('paste', (e) => {
        const items = e.clipboardData.items || [];
        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    handleOcrImage(file);
                    e.preventDefault();
                    e.stopPropagation();
                    break;
                }
            }
        }
    });
}

function handleOcrImage(file) {
    selectedOcrFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        ocrPreviewImage.src = e.target.result;
        ocrPrompt.classList.add('hidden');
        ocrPreviewContainer.classList.remove('hidden');
        
        // Yeni görsel eklendiğinde ek kurallar kutusunu temizle
        const extraPromptInput = document.getElementById('ocrExtraPrompt');
        if (extraPromptInput) {
            extraPromptInput.value = '';
        }
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

    const basePrompt = "CRITICAL INSTRUCTION: You are a pure OCR and transcription tool. ONLY transcribe what is visibly written in the image. DO NOT solve the question, DO NOT add extra explanations, DO NOT write steps to the solution. Your only job is to recreate the image's exact content in LaTeX format.\n\nIdentify all text, mathematical formulas, and visual elements (such as geometric shapes, coordinate graphs, line graphs, bar charts, number lines) in this image and convert them to clean LaTeX format with inline SVG drawings. Do not wrap in markdown or backticks (e.g. no ```latex or ```). Follow these strict formatting rules:\n\n1. Wrap ONLY standard human language words/phrases (Turkish or English) in \\text{...}. CRITICAL: NEVER put math variables (A, B, x), numbers, or operators (\\cup, \\times, \\setminus) inside \\text{...}. Math MUST be outside. Example: A \\cup B \\text{ kümesinin eleman sayısı } 5 \\text{ ise...}.\n\n2. Align multiple rows using double backslash \\\\ line-breaks. Keep the overall output layout compact and square-like by adding line breaks frequently at logical phrase/sentence boundaries, avoiding very wide single lines that span horizontally.\n\n3. Use standard mathematical operators. Specifically, always use: \\in for 'element of' (e.g. y \\in \\mathbb{R}), \\mathbb{R} for real numbers, \\mathbb{N} for natural numbers, \\mathbb{Z} for integers, \\varnothing or \\emptyset for empty set, \\le for less than or equal to, \\ge for greater than or equal to, and \\times for multiplication.\n- NEVER use LaTeX escape sequences for Turkish characters (like \\i, \\c{c}, \\u{g}). Write them natively as UTF-8 inside \\text{} (e.g. ı, İ, ş, Ş, ç, Ç, ğ, Ğ, ö, Ö, ü, Ü). Example: |x| \\le 2 \\iff -2 \\le x \\le 2 \\text{ olup bu aralıkta } 2 - (-2) + 1 = 5 \\text{ tane...}\n- CRITICAL VISUAL RULE: When you see ANY sign (a roof, a hat, OR a small closed triangle) placed directly OVER multiple letters (e.g., positioned over ABC or BAC), you MUST use \\widehat{ABC}. Do NOT place \\triangle or \\angle BEFORE the letters. ALWAYS use \\widehat{...} to place the symbol OVER the letters!\n- Use align environments for multi-line equations if needed.\n\n4. GRAPHICAL DRAWINGS, GEOMETRY, NUMBER LINES, TABLES & COORDINATE GRAPHS / CHARTS:\nIf you see any graphs, line charts, coordinate systems, number lines, OR TABLES in the image, you MUST recreate them as beautiful inline SVG elements wrapped inside a custom \\drawsvg{...} LaTeX command.\n\nCRITICAL TYPOGRAPHY & FONT RULES FOR ALL SVG (TABLES & GRAPHS):\n- ALL text inside SVG MUST use font-family=\"Poppins\".\n- Font sizes inside graphs MUST be between 18px and 24px:\n  * Tick labels, coordinate point labels (e.g. (0, 83), (12, 485)), and numbers on axes MUST use font-size=\"18\" and font-family=\"Poppins\".\n  * Axis titles and main chart headers MUST use font-size=\"24\", font-weight=\"bold\", and font-family=\"Poppins\".\n- Vertical Y-axis labels MUST be rotated -90 degrees using transform=\"rotate(-90 x y)\", e.g. <text transform=\"rotate(-90 35 160)\" x=\"35\" y=\"160\" font-family=\"Poppins\" font-size=\"24\" font-weight=\"bold\" text-anchor=\"middle\">Taksimetre Ücreti (TL)</text>.\n- Horizontal X-axis labels MUST be horizontal, e.g. <text x=\"300\" y=\"330\" font-family=\"Poppins\" font-size=\"24\" font-weight=\"bold\" text-anchor=\"middle\">Gidilen Yol (Km)</text>.\n- CRITICAL CALLOUT & LABEL POSITIONING RULE: All data label / callout boxes (such as (0, 83) or (12, 485)) MUST be placed IMMEDIATELY ADJACENT to the exact data point circle (cx, cy) that it describes. NEVER place a label box far away from its point! For example, if a data point is at cx=\"440\" cy=\"90\", place its callout box at x=\"320\" y=\"72.5\" (immediately to the left of the point at the exact same height).\n- Draw grid lines using <line stroke=\"#f1f5f9\" stroke-width=\"1.5\"/>, plot lines using <line stroke=\"#4b9cd3\" stroke-width=\"3\"/>, data points using <circle cx=\"...\" cy=\"...\" r=\"7\" fill=\"#4b9cd3\"/>, and callout boxes using <rect fill=\"white\" stroke=\"#a0aec0\" rx=\"3\"/>.\n\nFor example, a coordinate line graph MUST be drawn exactly like this: \\drawsvg{<svg viewBox=\"0 0 550 350\" width=\"550\" height=\"350\" xmlns=\"http://www.w3.org/2000/svg\"><rect width=\"550\" height=\"350\" fill=\"white\"/><line x1=\"100\" y1=\"50\" x2=\"100\" y2=\"270\" stroke=\"#cbd5e1\" stroke-width=\"1.5\"/><line x1=\"200\" y1=\"50\" x2=\"200\" y2=\"270\" stroke=\"#f1f5f9\" stroke-width=\"1.5\"/><line x1=\"300\" y1=\"50\" x2=\"300\" y2=\"270\" stroke=\"#f1f5f9\" stroke-width=\"1.5\"/><line x1=\"400\" y1=\"50\" x2=\"400\" y2=\"270\" stroke=\"#f1f5f9\" stroke-width=\"1.5\"/><line x1=\"500\" y1=\"50\" x2=\"500\" y2=\"270\" stroke=\"#f1f5f9\" stroke-width=\"1.5\"/><line x1=\"100\" y1=\"270\" x2=\"500\" y2=\"270\" stroke=\"#cbd5e1\" stroke-width=\"1.5\"/><line x1=\"100\" y1=\"225\" x2=\"500\" y2=\"225\" stroke=\"#f1f5f9\" stroke-width=\"1.5\"/><line x1=\"100\" y1=\"180\" x2=\"500\" y2=\"180\" stroke=\"#f1f5f9\" stroke-width=\"1.5\"/><line x1=\"100\" y1=\"135\" x2=\"500\" y2=\"135\" stroke=\"#f1f5f9\" stroke-width=\"1.5\"/><line x1=\"100\" y1=\"90\" x2=\"500\" y2=\"90\" stroke=\"#f1f5f9\" stroke-width=\"1.5\"/><line x1=\"100\" y1=\"230\" x2=\"440\" y2=\"90\" stroke=\"#4b9cd3\" stroke-width=\"3\"/><circle cx=\"100\" cy=\"230\" r=\"7\" fill=\"#4b9cd3\"/><circle cx=\"440\" cy=\"90\" r=\"7\" fill=\"#4b9cd3\"/><rect x=\"115\" y=\"212.5\" width=\"90\" height=\"35\" rx=\"3\" fill=\"white\" stroke=\"#a0aec0\" stroke-width=\"1.5\"/><text x=\"160\" y=\"236.5\" font-family=\"Poppins\" font-size=\"18\" text-anchor=\"middle\">(0, 83)</text><rect x=\"320\" y=\"72.5\" width=\"110\" height=\"35\" rx=\"3\" fill=\"white\" stroke=\"#a0aec0\" stroke-width=\"1.5\"/><text x=\"375\" y=\"96.5\" font-family=\"Poppins\" font-size=\"18\" text-anchor=\"middle\">(12, 485)</text><text x=\"90\" y=\"275\" font-family=\"Poppins\" font-size=\"18\" text-anchor=\"end\">0</text><text x=\"90\" y=\"230\" font-family=\"Poppins\" font-size=\"18\" text-anchor=\"end\">100</text><text x=\"90\" y=\"185\" font-family=\"Poppins\" font-size=\"18\" text-anchor=\"end\">200</text><text x=\"90\" y=\"140\" font-family=\"Poppins\" font-size=\"18\" text-anchor=\"end\">300</text><text x=\"90\" y=\"95\" font-family=\"Poppins\" font-size=\"18\" text-anchor=\"end\">400</text><text x=\"90\" y=\"55\" font-family=\"Poppins\" font-size=\"18\" text-anchor=\"end\">500</text><text x=\"100\" y=\"295\" font-family=\"Poppins\" font-size=\"18\" text-anchor=\"middle\">0</text><text x=\"200\" y=\"295\" font-family=\"Poppins\" font-size=\"18\" text-anchor=\"middle\">5</text><text x=\"300\" y=\"295\" font-family=\"Poppins\" font-size=\"18\" text-anchor=\"middle\">10</text><text x=\"400\" y=\"295\" font-family=\"Poppins\" font-size=\"18\" text-anchor=\"middle\">15</text><text x=\"300\" y=\"330\" font-family=\"Poppins\" font-size=\"24\" font-weight=\"bold\" text-anchor=\"middle\">Gidilen Yol (Km)</text><text transform=\"rotate(-90 35 160)\" x=\"35\" y=\"160\" font-family=\"Poppins\" font-size=\"24\" font-weight=\"bold\" text-anchor=\"middle\">Taksimetre Ücreti (TL)</text></svg>}\n\nCRITICAL TABLES RULE: Draw tables purely using SVG <rect>, <line>, and <text> elements with font-family=\"Poppins\".\nTable example: \\drawsvg{<svg viewBox=\"0 0 350 190\" width=\"350\" height=\"190\"><rect x=\"10\" y=\"10\" width=\"280\" height=\"165\" fill=\"white\" stroke=\"black\" stroke-width=\"2\"/><rect x=\"10\" y=\"10\" width=\"280\" height=\"65\" fill=\"#A5361D\"/><rect x=\"10\" y=\"105\" width=\"280\" height=\"35\" fill=\"#F59C73\"/><line x1=\"10\" y1=\"75\" x2=\"290\" y2=\"75\" stroke=\"black\" stroke-width=\"2\"/><line x1=\"10\" y1=\"105\" x2=\"290\" y2=\"105\" stroke=\"black\" stroke-width=\"1\"/><line x1=\"10\" y1=\"140\" x2=\"290\" y2=\"140\" stroke=\"black\" stroke-width=\"1\"/><line x1=\"135\" y1=\"10\" x2=\"135\" y2=\"175\" stroke=\"black\" stroke-width=\"2\"/><text x=\"72\" y=\"35\" fill=\"white\" font-family=\"Poppins\" font-size=\"14\" font-weight=\"bold\" text-anchor=\"middle\">Santigrat</text><text x=\"72\" y=\"58\" fill=\"white\" font-family=\"Poppins\" font-size=\"14\" font-weight=\"bold\" text-anchor=\"middle\">Derece (°C)</text><text x=\"212\" y=\"48\" fill=\"white\" font-family=\"Poppins\" font-size=\"14\" font-weight=\"bold\" text-anchor=\"middle\">Kelvin (K)</text><text x=\"72\" y=\"95\" font-family=\"Poppins\" font-size=\"15\" text-anchor=\"middle\">0°</text><text x=\"212\" y=\"95\" font-family=\"Poppins\" font-size=\"15\" text-anchor=\"middle\">273,15</text><text x=\"72\" y=\"128\" font-family=\"Poppins\" font-size=\"15\" text-anchor=\"middle\">12°</text><text x=\"212\" y=\"128\" font-family=\"Poppins\" font-size=\"15\" text-anchor=\"middle\">285,15</text><text x=\"72\" y=\"163\" font-family=\"Poppins\" font-size=\"15\" text-anchor=\"middle\">18°</text><text x=\"212\" y=\"163\" font-family=\"Poppins\" font-size=\"15\" text-anchor=\"middle\">291,15</text></svg>}\n\nCRITICAL LAYOUT RULE: If a drawing is next to a text/option (e.g. 'A) <drawing>'), DO NOT put a line break before or after it. Output them on the SAME line: \\text{A)} \\drawsvg{...}\n\nCRITICAL COLOR RULE: Match original image colors EXACTLY using stroke=\"#4b9cd3\", fill=\"#A5361D\", etc.\n\nCRITICAL: Use fixed pixel widths (e.g., width=\"550\"). Never use curly braces { or } anywhere inside the SVG content, as they interfere with LaTeX parsing.";

    let finalPrompt = basePrompt;
    const extraPromptInput = document.getElementById('ocrExtraPrompt');
    if (extraPromptInput && extraPromptInput.value.trim() !== '') {
        finalPrompt += "\n\nUSER'S EXTRA CRITICAL INSTRUCTIONS:\n" + extraPromptInput.value.trim();
    }

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
                    text: finalPrompt
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
                .replace(/<-/g, ' \\leftarrow ')
                // Yapay zeka harflerin başına \triangle koymuşsa otomatik olarak tepesine çatı \widehat{...} olarak geçir
                .replace(/\\triangle\s*\{?([A-Z]{3})\}?/g, '\\widehat{$1}')
                // Kullanıcının "hspace1cm" gibi hatalı özel direktiflerini standart \hspace{1cm} komutuna çevir
                .replace(/\\?hspace\s*\{?([0-9\.]+)\s*(cm|mm|px|em)\}?/g, '\\hspace{$1$2}')
                .replace(/hspace1cm/g, '\\hspace{1cm}');

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
