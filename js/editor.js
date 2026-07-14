// LaTeX Categories & Templates
const categories = {
    "TEMEL ŞABLONLAR": [
        "\\frac{\\square}{\\square}", "{\\square}^{2}", "{\\square}^{3}", "{\\square}^{\\square}",
        "\\sqrt{\\square}", "\\sqrt[\\square]{\\square}", "|\\square|",
        "\\left( \\square \\right)", "\\left[ \\square \\right]", "\\left\\{ \\square \\right\\}",
        "{\\square}_{\\square}", "\\int \\square dx", "\\sum \\square", "\\prod \\square",
        "\\lim_{\\square \\to \\square} \\square", "\\log_{\\square} \\square",
        "\\overrightarrow{\\square}", "\\overline{\\square}", "\\vec{\\square}", "\\text{\\square}"
    ],
    "ARİTMETİK & CEBİR": ["+", "-", "\\times", ".", "\\div", ":", "=", "\\neq", "<", ">", "\\leq", "\\geq", "\\approx", "\\cong", "\\equiv", "\\propto", "\\pm", "\\infty", "\\%", "!"],
    "TRİGONOMETRİ & FONKSİYONLAR": ["\\sin", "\\cos", "\\tan", "\\cot", "\\sec", "\\csc", "\\arcsin", "\\arccos", "\\arctan", "\\log", "\\ln", "\\exp"],
    "ANALİZ & CALCULUS": ["\\int", "\\iint", "\\iiint", "\\oint", "\\sum", "\\prod", "\\lim", "\\sup", "\\inf", "\\frac{d}{dx}", "\\partial", "\\nabla"],
    "KÜMELER & MANTIK": ["\\in", "\\notin", "\\subset", "\\subseteq", "\\supset", "\\supseteq", "\\cup", "\\cap", "\\setminus", "\\emptyset", "\\varnothing", "\\forall", "\\exists", "\\neg", "\\wedge", "\\vee", "\\Rightarrow", "\\Leftrightarrow"],
    "GEOMETRİ & VEKTÖRLER": ["^\\circ", "\\angle", "\\perp", "\\parallel", "\\triangle", "\\widehat{\\square}", "\\rightarrow", "\\vec{v}", "\\overrightarrow{AB}", "\\overline{AB}", "\\sim"],
    "YUNAN ALFABESİ": [
        { tex: "\\alpha", desc: "alpha" },
        { tex: "\\beta", desc: "beta" },
        { tex: "\\gamma", desc: "gamma" },
        { tex: "\\delta", desc: "delta" },
        { tex: "\\pi", desc: "pi" },
        { tex: "\\sigma", desc: "sigma" },
        { tex: "\\theta", desc: "theta" },
        { tex: "\\lambda", desc: "lambda" },
        { tex: "\\phi", desc: "phi" },
        { tex: "\\omega", desc: "omega" },
        { tex: "\\Delta", desc: "delta cap" },
        { tex: "\\Omega", desc: "omega cap" }
    ]
};

// Erişilebilirlik (Accessibility) Tooltipleri
const tooltips = {
    "\\frac{\\square}{\\square}": "Kesirli bir ifade oluşturabilirsiniz.",
    "{\\square}^{2}": "Kare alma ifadesi ekleyebilirsiniz.",
    "{\\square}^{3}": "Küp alma ifadesi ekleyebilirsiniz.",
    "{\\square}^{\\square}": "Üslü bir ifade oluşturabilirsiniz.",
    "\\sqrt{\\square}": "Kareköklü bir ifade oluşturabilirsiniz.",
    "\\sqrt[\\square]{\\square}": "N. dereceden köklü bir ifade oluşturabilirsiniz.",
    "|\\square|": "Mutlak değer ifadesi oluşturabilirsiniz.",
    "\\left( \\square \\right)": "Parantez içi ifade ekleyebilirsiniz.",
    "\\left[ \\square \\right]": "Köşeli parantez ekleyebilirsiniz.",
    "\\left\\{ \\square \\right\\}": "Küme parantezi ekleyebilirsiniz.",
    "{\\square}_{\\square}": "Alt indis (index) oluşturabilirsiniz.",
    "\\int \\square dx": "Belirsiz integral şablonu ekleyebilirsiniz.",
    "\\sum \\square": "Toplam (Sigma) sembolü şablonu ekleyebilirsiniz.",
    "\\prod \\square": "Çarpım sembolü şablonu ekleyebilirsiniz.",
    "\\lim_{\\square \\to \\square} \\square": "Limit şablonu ekleyebilirsiniz.",
    "\\log_{\\square} \\square": "Logaritma şablonu ekleyebilirsiniz.",
    "\\overrightarrow{\\square}": "Üzeri oklu vektör şablonu ekleyebilirsiniz.",
    "\\overline{\\square}": "Üzeri çizgili ifade ekleyebilirsiniz.",
    "\\vec{\\square}": "Kısa vektör oku ekleyebilirsiniz.",
    "\\widehat{\\square}": "Üzeri geniş çatı (açı/üçgen) şablonu ekleyebilirsiniz.",
    "\\text{\\square}": "Düz metin kutusu ekleyebilirsiniz.",
    "+": "Artı", "-": "Eksi", "\\times": "Çarpı", ".": "Çarpı Noktası", "\\div": "Bölü", ":": "Bölü İşareti", 
    "=": "Eşittir", "\\neq": "Eşit Değildir", "<": "Küçüktür", ">": "Büyüktür", "\\leq": "Küçük Eşittir", "\\geq": "Büyük Eşittir", 
    "\\approx": "Yaklaşık Eşittir", "\\cong": "Denktir", "\\equiv": "Denktir (Üç Çizgi)", "\\propto": "Orantılıdır", "\\pm": "Artı Eksi", "\\infty": "Sonsuz", "\\%": "Yüzde", "!": "Faktöriyel",
    "\\sin": "Sinüs", "\\cos": "Kosinüs", "\\tan": "Tanjant", "\\cot": "Kotanjant", "\\sec": "Sekant", "\\csc": "Kosekant", 
    "\\arcsin": "Ters Sinüs", "\\arccos": "Ters Kosinüs", "\\arctan": "Ters Tanjant", "\\log": "Logaritma", "\\ln": "Doğal Logaritma", "\\exp": "Eksponansiyel",
    "\\int": "İntegral", "\\iint": "İki Katlı İntegral", "\\iiint": "Üç Katlı İntegral", "\\oint": "Kapalı Eğri İntegrali", "\\sum": "Toplam (Sigma)", "\\prod": "Çarpım (Pi)", 
    "\\lim": "Limit", "\\sup": "Supremum", "\\inf": "İnfimum", "\\frac{d}{dx}": "Türev", "\\partial": "Kısmi Türev", "\\nabla": "Nabla (Gradiyent)",
    "\\in": "Elemanıdır", "\\notin": "Elemanı Değildir", "\\subset": "Alt Kümesidir", "\\subseteq": "Alt Küme / Eşit", "\\supset": "Kapsar", "\\supseteq": "Kapsar / Eşit", 
    "\\cup": "Birleşim", "\\cap": "Kesişim", "\\setminus": "Fark", "\\emptyset": "Boş Küme", "\\varnothing": "Boş Küme", "\\forall": "Her", "\\exists": "En Az Bir", "\\neg": "Değili (Mantık)", "\\wedge": "Ve", "\\vee": "Veya", "\\Rightarrow": "İse", "\\Leftrightarrow": "Ancak ve Ancak",
    "^\\circ": "Derece", "\\angle": "Açı", "\\perp": "Diklik", "\\parallel": "Paralellik", "\\triangle": "Üçgen", "\\rightarrow": "Sağa Ok", "\\vec{v}": "v Vektörü", "\\overrightarrow{AB}": "AB Vektörü", "\\overline{AB}": "AB Doğru Parçası", "\\sim": "Benzerlik"
};

const standardColors = [
    "#2563eb", "#3b82f6", "#10b981", "#14b8a6", "#f59e0b",
    "#ef4444", "#ec4899", "#8b5cf6", "#6366f1", "#0f172a",
    "#ffffff", "#f3f4f6", "#cbd5e1", "#64748b", "#334155",
    "#e11d48", "#d97706", "#059669", "#0891b2", "#4f46e5"
];

let currentColor = "#000000";
let currentBgColor = "#ffffff"; // Default background white
let currentAlignment = "left"; // Default alignment left

// Element references
const mf = document.getElementById('mathPreview');
const latexInput = document.getElementById('latexInput');
const templateContainer = document.getElementById('templateContainer');
const renderMode = document.getElementById('renderMode');
const fontFamily = document.getElementById('fontFamily');
const fontSamplePreview = document.getElementById('fontSamplePreview');
const fontSampleText = document.getElementById('fontSampleText');
const fontSelectWrapper = document.getElementById('fontSelectWrapper');
const fontSize = document.getElementById('fontSize');
const fontSizeLabel = document.getElementById('fontSizeLabel');
const colorDisplay = document.getElementById('colorDisplay');
const colorHexText = document.getElementById('colorHexText');
const colorPopup = document.getElementById('colorPopup');
const colorGrid = document.getElementById('colorGrid');
const hexInput = document.getElementById('hexInput');
const designPreviewContainer = document.getElementById('designPreviewContainer');
const bgOptionGrid = document.getElementById('bgOptionGrid');

// Initial setup for color display
colorDisplay.style.backgroundColor = currentColor;
colorHexText.innerText = currentColor.toUpperCase();

// Modal error handler
function showError(msg) {
    document.getElementById('errorModalMessage').innerText = msg;
    document.getElementById('errorModal').classList.remove('hidden');
}

// Fill templates & render them in sidebar using MathJax
Object.keys(categories).forEach(cat => {
    const div = document.createElement('div');
    div.innerHTML = `<h3 class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">${cat}</h3>`;
    const grid = document.createElement('div');
    grid.className = "grid grid-cols-5 gap-2 pb-3";

    categories[cat].forEach(item => {
        const btn = document.createElement('button');

        let tex = typeof item === 'object' ? item.tex : item;
        let desc = typeof item === 'object' ? item.desc : null;
        let tooltip = tooltips[tex] || (desc ? desc.charAt(0).toUpperCase() + desc.slice(1) : tex);

        let extraClass = "";
        if (tex.includes("\\lim") || tex.includes("\\log") || tex.includes("\\int") || tex.includes("\\overrightarrow") || tex.includes("\\text")) {
            extraClass = " col-span-2";
        }

        btn.className = "key-button p-2 text-slate-750 dark:text-slate-350 transition flex items-center justify-center min-h-[44px]" + extraClass;
        btn.title = tooltip;

        // Color placeholders (\square) dynamically in blue for high-contrast combinations
        let displayTex;
        if (tex.includes("text")) {
            displayTex = tex.replace(/\\square/g, 'metin');
        } else {
            displayTex = tex.replace(/\\square/g, '\\color{#2563eb}{\\blacksquare}');
        }

        if (desc) {
            btn.innerHTML = `
                <div class="flex flex-col items-center justify-center w-full">
                    <span class="text-xs font-semibold mb-0.5">\\(${displayTex}\\)</span>
                    <span class="text-[8px] opacity-45 dark:opacity-60 uppercase font-mono tracking-wider">${desc}</span>
                </div>
            `;
        } else {
            btn.innerHTML = `\\(${displayTex}\\)`;
        }

        btn.onclick = () => {
            if (tex === "\\text{\\square}") {
                openTextModal();
            } else {
                const interactiveTex = tex.replace(/\\square/g, '\\placeholder{}');
                mf.executeCommand(['insert', interactiveTex]);
                mf.focus();
            }
        };
        grid.appendChild(btn);
    });
    div.appendChild(grid);
    templateContainer.appendChild(div);
});

// Initialize template MathJax styling
window.addEventListener('load', () => {
    // Varsayılan formül (Default Formula)
    if (!mf.getValue()) {
        mf.setValue('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
    }

    setTimeout(() => {
        if (window.MathJax) {
            MathJax.typesetPromise([templateContainer]);
        }
        // Render formula preview on load
        updatePreview();
    }, 500);
});

// Theme management
const themeToggle = document.getElementById('themeToggle');
themeToggle.onclick = () => {
    document.documentElement.classList.toggle('dark');
};

// Color Picker implementation
standardColors.forEach(color => {
    const btn = document.createElement('div');
    btn.className = "w-7 h-7 rounded-md border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-110 transition shadow-xs";
    btn.style.backgroundColor = color;
    btn.onclick = (e) => {
        e.stopPropagation();
        applyColor(color);
    };
    colorGrid.appendChild(btn);
});

function applyColor(hex) {
    currentColor = hex;
    colorDisplay.style.backgroundColor = hex;
    colorHexText.innerText = hex.toUpperCase();
    hexInput.value = hex.toUpperCase();
    colorPopup.classList.add('hidden');
    updatePreview();
}

colorDisplay.onclick = (e) => {
    e.stopPropagation();
    colorPopup.classList.toggle('hidden');
};

document.addEventListener('click', (e) => {
    if (!colorPopup.contains(e.target) && e.target !== colorDisplay) {
        colorPopup.classList.add('hidden');
    }
});

hexInput.onchange = (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-F]{6}$/i.test(val)) applyColor(val);
};

// Background PNG Selection
bgOptionGrid.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
        bgOptionGrid.querySelectorAll('button').forEach(b => {
            b.classList.remove('border-2', 'border-blue-500', 'shadow-sm');
            b.classList.add('border', 'border-slate-200', 'dark:border-slate-700');
        });
        btn.classList.add('border-2', 'border-blue-500', 'shadow-sm');
        btn.classList.remove('border', 'border-slate-200', 'dark:border-slate-700');

        currentBgColor = btn.getAttribute('data-bg');

        // Style the design preview container dynamically
        if (currentBgColor === 'transparent') {
            designPreviewContainer.style.backgroundColor = '';
            designPreviewContainer.style.backgroundImage = 'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)';
            designPreviewContainer.style.backgroundSize = '20px 20px';
            designPreviewContainer.style.backgroundPosition = '0 0, 0 10px, 10px -10px, -10px 0px';

            // Style the sidebar preview to match the chess transparent grid
            fontSamplePreview.style.backgroundColor = '';
            fontSamplePreview.style.backgroundImage = 'linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)';
            fontSamplePreview.style.backgroundSize = '12px 12px';
            fontSamplePreview.style.backgroundPosition = '0 0, 0 6px, 6px -6px, -6px 0px';
        } else {
            designPreviewContainer.style.backgroundImage = 'none';
            designPreviewContainer.style.backgroundColor = currentBgColor;

            // Style the sidebar preview to match the selected color background
            fontSamplePreview.style.backgroundImage = 'none';
            fontSamplePreview.style.backgroundColor = currentBgColor;
        }
        updatePreview();
    };
});

// Alignment Option Selection
const alignOptionGrid = document.getElementById('alignOptionGrid');
alignOptionGrid.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
        alignOptionGrid.querySelectorAll('button').forEach(b => {
            b.classList.remove('border-2', 'border-blue-500', 'shadow-sm', 'text-slate-900', 'dark:text-white');
            b.classList.add('border', 'border-slate-200', 'dark:border-slate-700', 'text-slate-750', 'dark:text-slate-200');
        });
        btn.classList.add('border-2', 'border-blue-500', 'shadow-sm', 'text-slate-900', 'dark:text-white');
        btn.classList.remove('border', 'border-slate-200', 'dark:border-slate-700', 'text-slate-750', 'dark:text-slate-200');

        currentAlignment = btn.getAttribute('data-align');
        updatePreview();
    };
});

// Initialize design container preview back to white (both main and sidebar previews)
designPreviewContainer.style.backgroundColor = '#ffffff';
fontSamplePreview.style.backgroundColor = '#ffffff';

// Toggling render engine
renderMode.onchange = () => {
    if (renderMode.value === 'mathjax') {
        fontSelectWrapper.style.opacity = '0.5';
        fontFamily.disabled = true;
    } else {
        fontSelectWrapper.style.opacity = '1';
        fontFamily.disabled = false;
    }
    updatePreview();
};

fontFamily.onchange = () => updatePreview();
fontSize.oninput = (e) => {
    fontSizeLabel.innerText = `(${e.target.value}px)`;
    updatePreview();
};

// Injected CSS inside MathLive Shadow DOM to apply custom font overrides
function applyFontToMathField(fontFamilyName) {
    if (!mf || !mf.shadowRoot) {
        // If shadow DOM isn't ready yet, retry in 50ms
        setTimeout(() => applyFontToMathField(fontFamilyName), 50);
        return;
    }

    let styleEl = mf.shadowRoot.getElementById('custom-font-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'custom-font-style';
        mf.shadowRoot.appendChild(styleEl);
    }

    if (renderMode.value === 'mathjax') {
        styleEl.textContent = '';
        return;
    }

    styleEl.textContent = `
        /* Override standard math fonts ONLY for variables, text, and digits */
        .mi,
        .mathnormal,
        .mn,
        .text {
            font-family: '${fontFamilyName}', sans-serif !important;
            font-style: normal !important;
        }
        
        /* Force text blocks alignment */
        .text, .ML__mathlive, .ML__fieldcontainer {
            text-align: ${currentAlignment} !important;
        }
        
        /* Force multiline alignment inside MathLive */
        .ML__base, .vlist-t {
            align-items: ${currentAlignment === 'left' ? 'flex-start' : (currentAlignment === 'right' ? 'flex-end' : 'center')} !important;
            justify-content: ${currentAlignment === 'left' ? 'flex-start' : (currentAlignment === 'right' ? 'flex-end' : 'center')} !important;
        }
        
        /* Force multiline alignment inside MathLive */
        .ML__base, .vlist-t {
            align-items: ${currentAlignment === 'left' ? 'flex-start' : (currentAlignment === 'right' ? 'flex-end' : 'center')} !important;
            justify-content: ${currentAlignment === 'left' ? 'flex-start' : (currentAlignment === 'right' ? 'flex-end' : 'center')} !important;
        }
        
        /* Set caret (cursor) color to match chosen theme color */
        .ML__caret {
            background-color: ${currentColor} !important;
        }
    `;
}

// Utility to wrap latex in block for multiline support
function setMathfieldValue(latex) {
    let clean = latex.trim();
    
    // Strip existing environments
    if (clean.startsWith('\\begin{gather}')) {
        clean = clean.substring('\\begin{gather}'.length, clean.length - '\\end{gather}'.length).trim();
    } else if (clean.startsWith('\\begin{array}')) {
        clean = clean.replace(/^\\begin\{array\}\{[^}]+\}/, '').replace(/\\end\{array\}$/, '').trim();
    }
    
    // Determine alignment column character
    const alignChar = currentAlignment === 'left' ? 'l' : (currentAlignment === 'right' ? 'r' : 'c');
    clean = `\\begin{array}{${alignChar}} ${clean} \\end{array}`;
    
    mf.setValue(clean.replace(/\\square/g, '\\placeholder{}'));
}

// ====== LIVE PREVIEW & WORKSPACE CONTROLLER ======
function updatePreview() {
    let latexRaw = mf.getValue('latex');

    // Strip outer environments if present for the user input box
    let cleanLatex = latexRaw;
    if (cleanLatex.startsWith('\\begin{gather}')) {
        cleanLatex = cleanLatex.substring('\\begin{gather}'.length, cleanLatex.length - '\\end{gather}'.length).trim();
    } else if (cleanLatex.startsWith('\\begin{array}')) {
        cleanLatex = cleanLatex.replace(/^\\begin\{array\}\{[^}]+\}/, '').replace(/\\end\{array\}$/, '').trim();
    }

    latexInput.value = cleanLatex.replace(/\\placeholder\{.*?\}/g, '\\square');

    const mode = renderMode.value;
    const selectedFont = fontFamily.value;
    const sizeVal = fontSize.value;

    // Apply selected styles directly to the interactive workspace math-field
    mf.style.color = currentColor;
    mf.style.fontSize = sizeVal + "px";
    mf.style.textAlign = currentAlignment;

    // Update formulaWrapper flex alignment classes dynamically on preview updates
    const formulaWrapper = document.getElementById('formulaWrapper');
    if (formulaWrapper) {
        formulaWrapper.classList.remove('justify-center', 'justify-start', 'justify-end');
        if (currentAlignment === 'left') {
            formulaWrapper.classList.add('justify-start');
        } else if (currentAlignment === 'right') {
            formulaWrapper.classList.add('justify-end');
        } else {
            formulaWrapper.classList.add('justify-center');
        }
    }

    // Update the sidebar font preview with the compiled math HTML
    if (fontSampleText) {
        const previewFont = (mode === 'custom') ? selectedFont : 'Times New Roman';
        fontSampleText.innerHTML = compileLatexToHtml(latexRaw, previewFont, 15, currentColor);

        // Reset styles on container
        fontSampleText.style.transform = 'none';
        fontSampleText.style.width = '100%';
        fontSampleText.style.display = 'flex';
        fontSampleText.style.justifyContent = currentAlignment === 'left' ? 'flex-start' : (currentAlignment === 'right' ? 'flex-end' : 'center');

        // Target the compiled formula container inside to scale it down without expanding the outer box
        const renderRoot = fontSampleText.querySelector('.math-render-root');
        if (renderRoot) {
            renderRoot.style.transform = 'none';
            renderRoot.style.transformOrigin = currentAlignment === 'left' ? 'left top' : (currentAlignment === 'right' ? 'right top' : 'center top');
            
            const containerWidth = fontSamplePreview.clientWidth - 24; // 12px padding on each side
            const contentWidth = renderRoot.scrollWidth;
            
            if (contentWidth > containerWidth && containerWidth > 0) {
                const scale = containerWidth / contentWidth;
                renderRoot.style.transform = `scale(${scale})`;
            }
        }
    }

    if (mode === 'custom') {
        mf.style.fontFamily = `'${selectedFont}', sans-serif`;
        applyFontToMathField(selectedFont);
    } else {
        mf.style.fontFamily = 'initial';
        applyFontToMathField(''); // clear shadow overrides
    }
}

// Double-ended synchronization (MathLive <-> Textarea)
mf.addEventListener('input', () => {
    updatePreview();
});

latexInput.addEventListener('input', () => {
    let latex = latexInput.value;
    setMathfieldValue(latex);
    updatePreview();
});

// ====== HIGH QUALITY PNG EXPORT ======
document.getElementById('downloadBtn').onclick = () => {
    const btn = document.getElementById('downloadBtn');
    const originalText = btn.innerHTML;

    // Syntax/grouping error checks before downloading
    let latexCodeRaw = mf.getValue('latex');
    const leftCount = (latexCodeRaw.match(/\\left/g) || []).length;
    const rightCount = (latexCodeRaw.match(/\\right/g) || []).length;

    if (leftCount !== rightCount) {
        showError("Eksik veya kapatılmamış parantez (\\left ve \\right sayıları eşleşmiyor). Lütfen formülü kontrol edin.");
        return;
    }

    let strippedLatex = latexCodeRaw.replace(/\\{/g, "").replace(/\\}/g, "");
    const openBraceCount = (strippedLatex.match(/\{/g) || []).length;
    const closeBraceCount = (strippedLatex.match(/\}/g) || []).length;

    if (openBraceCount !== closeBraceCount) {
        showError("Kapatılmamış gruplama parantezi ({ ve } sembolleri eşleşmiyor). Lütfen formülü kontrol edin.");
        return;
    }

    btn.innerHTML = `<span class="animate-pulse">PNG Hazırlanıyor...</span>`;

    const fontSizeVal = fontSize.value;
    const fontFam = fontFamily.value;
    const mode = renderMode.value;

    // Create target export container
    const exportWrapper = document.createElement('div');
    exportWrapper.style.position = 'absolute';
    exportWrapper.style.left = '0px';
    exportWrapper.style.top = '0px';
    exportWrapper.style.zIndex = '-9999';
    exportWrapper.style.display = 'inline-block';
    exportWrapper.style.padding = '40px';

    // Apply chosen PNG background
    if (currentBgColor === 'transparent') {
        exportWrapper.style.backgroundColor = 'transparent';
    } else {
        exportWrapper.style.backgroundColor = currentBgColor;
    }

    if (mode === 'custom') {
        exportWrapper.innerHTML = compileLatexToHtml(latexCodeRaw, fontFam, fontSizeVal, currentColor);
        document.body.appendChild(exportWrapper);

        // Small delay to ensure browser paints custom web fonts inside the DOM
        setTimeout(() => {
            htmlToImage.toPng(exportWrapper, {
                backgroundColor: currentBgColor === 'transparent' ? null : currentBgColor,
                pixelRatio: 4, // 4x high resolution
                style: {
                    position: 'relative',
                    left: 'auto',
                    top: 'auto',
                    zIndex: '1'
                }
            })
                .then(dataUrl => {
                    const link = document.createElement('a');
                    link.download = 'matematik-formulu.png';
                    link.href = dataUrl;
                    link.click();

                    document.body.removeChild(exportWrapper);
                    btn.innerHTML = originalText;
                })
                .catch(error => {
                    console.error('PNG export failed:', error);
                    document.body.removeChild(exportWrapper);
                    btn.innerHTML = originalText;
                    showError("Görsel oluşturulurken bir hata oluştu.");
                });
        }, 350);
    } else {
        // MathJax Classic mode export
        let latexCode = latexCodeRaw.replace(/\\placeholder\{.*?\}/g, '\\square');

        const mathjaxTarget = document.createElement('div');
        mathjaxTarget.id = 'mjx-export-target';
        mathjaxTarget.style.color = currentColor;
        mathjaxTarget.style.fontSize = fontSizeVal + 'px';
        mathjaxTarget.style.display = 'inline-block';
        mathjaxTarget.innerHTML = `$$${latexCode}$$`;

        exportWrapper.appendChild(mathjaxTarget);
        document.body.appendChild(exportWrapper);

        MathJax.typesetPromise([mathjaxTarget]).then(() => {
            // Check MathJax render errors
            if (mathjaxTarget.querySelector('[data-mjx-error]')) {
                showError("Formül dizilişinde (syntax) anlaşılamayan bir hata var.");
                document.body.removeChild(exportWrapper);
                btn.innerHTML = originalText;
                return;
            }

            setTimeout(() => {
                htmlToImage.toPng(exportWrapper, {
                    backgroundColor: currentBgColor === 'transparent' ? null : currentBgColor,
                    pixelRatio: 4,
                    style: {
                        position: 'relative',
                        left: 'auto',
                        top: 'auto',
                        zIndex: '1'
                    }
                })
                    .then(dataUrl => {
                        const link = document.createElement('a');
                        link.download = 'matematik-formulu.png';
                        link.href = dataUrl;
                        link.click();

                        document.body.removeChild(exportWrapper);
                        btn.innerHTML = originalText;
                    })
                    .catch(error => {
                        console.error('PNG MathJax export failed:', error);
                        document.body.removeChild(exportWrapper);
                        btn.innerHTML = originalText;
                        showError("Grafik render hatası.");
                    });
            }, 350);
        }).catch(error => {
            console.error('MathJax render error:', error);
            document.body.removeChild(exportWrapper);
            btn.innerHTML = originalText;
            showError("MathJax formülü oluşturamadı.");
        });
    }
};

// Newline and Space utility buttons listeners
document.getElementById('addNewlineBtn').onclick = () => {
    if (mf) {
        mf.focus();
        mf.executeCommand(['insert', '\\\\ ']); // Inserts double backslash newline
    }
};

document.getElementById('addSpaceBtn').onclick = () => {
    if (mf) {
        mf.focus();
        mf.executeCommand(['insert', '\\ ']); // Inserts LaTeX space
    }
};

// Initialize default formula value in editor
setMathfieldValue("\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}");

// Metin Giriş Modalı İşlemleri (Text Input Modal Controls)
const textInputModal = document.getElementById('textInputModal');
const modalTextInput = document.getElementById('modalTextInput');
const closeTextModalBtn = document.getElementById('closeTextModalBtn');
const submitTextModalBtn = document.getElementById('submitTextModalBtn');

function openTextModal() {
    if (textInputModal && modalTextInput) {
        modalTextInput.value = "";
        // Seçilen yazı tipini modal alanına da uygula
        const selectedFont = fontFamily ? fontFamily.value : 'Poppins';
        modalTextInput.style.fontFamily = `'${selectedFont}', sans-serif`;
        textInputModal.classList.remove('hidden');
        modalTextInput.focus();
    }
}

function closeTextModal() {
    if (textInputModal) {
        textInputModal.classList.add('hidden');
    }
}

if (closeTextModalBtn) {
    closeTextModalBtn.onclick = closeTextModal;
}

if (submitTextModalBtn) {
    submitTextModalBtn.onclick = () => {
        const textVal = modalTextInput.value.trim();
        if (textVal && mf) {
            // Kullanıcı "ı" harfinden sonra boşluk bırakmışsa, LaTeX'in bu boşluğu yutmasını engellemek için
            // korumalı LaTeX boşluğuna (\ ) çeviriyoruz.
            const safeTextVal = textVal.replace(/ı /g, 'ı\\ ');
            
            // Metin ifadesini latex \text{...} formatında ekle
            mf.executeCommand(['insert', `\\text{${safeTextVal}}`]);
            updatePreview();
        }
        closeTextModal();
    };
}

// Görsel Tasarım Alanı Yakınlaştırma / Uzaklaştırma (Zoom In / Out Controls)
let currentZoom = 1.0;
const formulaWrapper = document.getElementById('formulaWrapper');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');

if (zoomInBtn && zoomOutBtn && zoomResetBtn && formulaWrapper) {
    function applyZoom() {
        formulaWrapper.style.zoom = currentZoom;
        zoomResetBtn.innerText = `%${Math.round(currentZoom * 100)}`;
    }

    zoomInBtn.onclick = () => {
        currentZoom = Math.min(currentZoom + 0.1, 2.0);
        applyZoom();
    };

    zoomOutBtn.onclick = () => {
        currentZoom = Math.max(currentZoom - 0.1, 0.5);
        applyZoom();
    };

    zoomResetBtn.onclick = () => {
        currentZoom = 1.0;
        applyZoom();
    };
}
