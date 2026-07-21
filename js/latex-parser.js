// ====== RECURSIVE LaTeX TO CSS FLEXBOX PARSER & COMPILER ======

// Helper function for fast letter checks (avoiding regex)
function isLetter(char) {
    if (!char) return false;
    const code = char.charCodeAt(0);
    return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

// 1. Tokenizer
function tokenize(str) {
    let i = 0;
    const tokens = [];
    while (i < str.length) {
        const c = str[i];
        if (c === '{') {
            tokens.push({ type: 'OPEN', val: '{' });
            i++;
        } else if (c === '}') {
            tokens.push({ type: 'CLOSE', val: '}' });
            i++;
        } else if (c === '_') {
            tokens.push({ type: 'SUB', val: '_' });
            i++;
        } else if (c === '^') {
            tokens.push({ type: 'SUP', val: '^' });
            i++;
        } else if (c === '\\') {
            let j = i + 1;
            if (j < str.length && (str[j] === '(' || str[j] === ')' || str[j] === '[' || str[j] === ']' || str[j] === '{' || str[j] === '}' || str[j] === ',' || str[j] === ';' || str[j] === '!' || str[j] === '\\' || str[j] === '|' || str[j] === ' ')) {
                tokens.push({ type: 'COMMAND', val: '\\' + str[j] });
                i = j + 1;
            } else {
                while (j < str.length && isLetter(str[j])) {
                    j++;
                }
                const cmdName = str.substring(i, j);
                tokens.push({ type: 'COMMAND', val: cmdName });
                // Consume AT MOST ONE space after a command name to mimic LaTeX behavior
                if (j < str.length && str[j] === ' ') {
                    j++;
                }
                i = j;
            }
        } else if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
            tokens.push({ type: 'SPACE', val: ' ' });
            i++;
        } else {
            tokens.push({ type: 'CHAR', val: c });
            i++;
        }
    }
    return tokens;
}

// 2. Parser (Recursive descent)
function parse(tokens) {
    let index = 0;

    function peek() {
        return tokens[index];
    }

    function next() {
        return tokens[index++];
    }

    function parseExpression() {
        const nodes = [];
        while (index < tokens.length) {
            const tok = peek();
            if (!tok) break;
            if (tok.type === 'CLOSE') {
                break;
            }
            nodes.push(parseNode());
        }
        return nodes;
    }

    function parseGroup() {
        next(); // consume OPEN {
        const content = parseExpression();
        if (peek() && peek().type === 'CLOSE') {
            next(); // consume CLOSE }
        }
        return content;
    }

    function parseArgument() {
        const tok = peek();
        if (!tok) return [];
        if (tok.type === 'OPEN') {
            return parseGroup();
        }
        return [parseNode()];
    }

    function parseNode() {
        const tok = next();
        if (!tok) return { type: 'text', val: '' };

        if (tok.type === 'OPEN') {
            const content = parseExpression();
            if (peek() && peek().type === 'CLOSE') {
                next();
            }
            return checkSubSup({ type: 'group', content });
        }

        if (tok.type === 'COMMAND') {
            if (tok.val === '\\frac') {
                const num = parseArgument();
                const den = parseArgument();
                return checkSubSup({ type: 'frac', num, den });
            } else if (tok.val === '\\sqrt') {
                let rootIndex = null;
                if (peek() && peek().type === 'CHAR' && peek().val === '[') {
                    next(); // consume '['
                    rootIndex = [];
                    while (index < tokens.length && !(peek().type === 'CHAR' && peek().val === ']')) {
                        rootIndex.push(parseNode());
                    }
                    if (peek() && peek().val === ']') {
                        next(); // consume ']'
                    }
                }
                const content = parseArgument();
                return checkSubSup({ type: 'root', index: rootIndex, content });
            } else if (tok.val === '\\left') {
                const leftBracket = next();
                const content = [];
                while (index < tokens.length) {
                    const t = peek();
                    if (t && t.type === 'COMMAND' && t.val === '\\right') {
                        next(); // consume \right
                        break;
                    }
                    content.push(parseNode());
                }
                const rightBracket = next();
                return checkSubSup({ type: 'bracket', left: leftBracket, right: rightBracket, content });
            } else if (tok.val === '\\begin') {
                const envTok = parseArgument();
                const envName = envTok.map(n => n.val || '').join('').trim();

                // If environment is array, it has a second argument for alignment, e.g. \begin{array}{l}
                // We must consume it so it doesn't render as content in the first cell!
                if (envName === 'array' && peek() && peek().type === 'OPEN') {
                    parseArgument();
                }

                const contentTokens = [];
                let depth = 1;
                while (index < tokens.length) {
                    const t = peek();
                    if (t && t.type === 'COMMAND' && t.val === '\\begin') {
                        contentTokens.push(next());
                        depth++;
                    } else if (t && t.type === 'COMMAND' && t.val === '\\end') {
                        const lookaheadIndex = index;
                        index++; // consume \end
                        const endEnv = parseArgument();
                        const endEnvName = endEnv.map(n => n.val || '').join('').trim();
                        if (endEnvName === envName) {
                            depth--;
                            if (depth === 0) {
                                break;
                            }
                        }
                        contentTokens.push(t);
                        contentTokens.push(...tokens.slice(lookaheadIndex + 1, index));
                    } else {
                        contentTokens.push(next());
                    }
                }

                // Split content by rows (\\\\) and columns (&)
                const rows = [];
                let currentRow = [];
                let currentCellTokens = [];

                for (let t of contentTokens) {
                    if (t.type === 'COMMAND' && t.val === '\\\\') {
                        currentRow.push(parse(currentCellTokens));
                        rows.push(currentRow);
                        currentRow = [];
                        currentCellTokens = [];
                    } else if (t.type === 'CHAR' && t.val === '&') {
                        currentRow.push(parse(currentCellTokens));
                        currentCellTokens = [];
                    } else {
                        currentCellTokens.push(t);
                    }
                }
                if (currentCellTokens.length > 0 || currentRow.length > 0) {
                    currentRow.push(parse(currentCellTokens));
                    rows.push(currentRow);
                }

                return checkSubSup({ type: 'matrix', env: envName, rows });
            } else if (tok.val === '\\vec') {
                const content = parseArgument();
                return checkSubSup({ type: 'decorator', dec: 'vec', content });
            } else if (tok.val === '\\overline') {
                const content = parseArgument();
                return checkSubSup({ type: 'decorator', dec: 'overline', content });
            } else if (tok.val === '\\overrightarrow') {
                const content = parseArgument();
                return checkSubSup({ type: 'decorator', dec: 'vector-arrow', content });
            } else if (tok.val === '\\hat') {
                const content = parseArgument();
                return checkSubSup({ type: 'decorator', dec: 'hat', content });
            } else if (tok.val === '\\widehat') {
                const content = parseArgument();
                return checkSubSup({ type: 'decorator', dec: 'widehat', content });
            } else if (tok.val === '\\text') {
                const content = parseArgument();
                return checkSubSup({ type: 'text-group', content });
            } else if (tok.val === '\\mathbb') {
                const content = parseArgument();
                return checkSubSup({ type: 'mathbb', content });
            } else if (tok.val === '\\underbrace') {
                const content = parseArgument();
                return checkSubSup({ type: 'underbrace', content });
            } else if (tok.val === '\\drawsvg') {
                const content = parseArgument();
                let rawSvg = getRawStringFromNodes(content);
                // MathLive LaTeX çıktısı (getValue) üretirken XML etiketlerindeki <, >, = gibi karakterlerin arasına
                // matematiksel ifade sanıp boşluklar koyar. (Örn: < rect x = "50" / >). SVG'yi bozmaması için bunları temizliyoruz.
                rawSvg = rawSvg.replace(/<\s+/g, '<');       // "< rect" -> "<rect"
                rawSvg = rawSvg.replace(/\s+>/g, '>');       // "rect >" -> "rect>"
                rawSvg = rawSvg.replace(/<\/\s+/g, '</');    // "</ text>" -> "</text>"
                rawSvg = rawSvg.replace(/\/\s+>/g, '/>');    // "/ >" -> "/>"
                rawSvg = rawSvg.replace(/\s*=\s*"/g, '="');  // "width = \"50\"" -> "width=\"50\""
                return checkSubSup({ type: 'custom-html', html: rawSvg });
            } else {
                return checkSubSup({ type: 'command', val: tok.val });
            }
        }

        if (tok.type === 'SUB' || tok.type === 'SUP') {
            const arg = parseArgument();
            return { type: tok.type === 'SUB' ? 'sub' : 'sup', base: [{ type: 'text', val: '' }], val: arg };
        }

        return checkSubSup({ type: 'text', val: tok.val });
    }

    function checkSubSup(node) {
        let sub = null;
        let sup = null;

        while (index < tokens.length) {
            const nextTok = peek();
            if (nextTok && nextTok.type === 'SUB') {
                next();
                sub = parseArgument();
            } else if (nextTok && nextTok.type === 'SUP') {
                next();
                sup = parseArgument();
            } else {
                break;
            }
        }

        if (sub && sup) {
            return { type: 'subsup', base: [node], sub, sup };
        } else if (sub) {
            return { type: 'sub', base: [node], sub };
        } else if (sup) {
            return { type: 'sup', base: [node], sup };
        }
        return node;
    }

    return parseExpression();
}

// 3. Render Nodes to HTML
const COMMAND_MAPPING = {
    '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\pi': 'π', '\\sigma': 'σ',
    '\\theta': 'θ', '\\lambda': 'λ', '\\phi': 'φ', '\\omega': 'ω', '\\Delta': 'Δ', '\\Omega': 'Ω',
    '\\epsilon': 'ε', '\\eta': 'η', '\\iota': 'ι', '\\kappa': 'κ', '\\mu': 'μ', '\\nu': 'ν',
    '\\xi': 'ξ', '\\rho': 'ρ', '\\tau': 'τ', '\\upsilon': 'υ', '\\chi': 'χ', '\\psi': 'ψ',
    '\\Gamma': 'Γ', '\\Theta': 'Θ', '\\Lambda': 'Λ', '\\Xi': 'Ξ', '\\Pi': 'Π', '\\Sigma': 'Σ',
    '\\Upsilon': 'Υ', '\\Phi': 'Φ', '\\Psi': 'Ψ',

    '\\times': '×', '\\div': '÷', '\\pm': '±', '\\infty': '∞', '\\approx': '≈', '\\neq': '≠',
    '\\leq': '≤', '\\geq': '≥', '\\cong': '≅', '\\equiv': '≡', '\\propto': '∝',
    '\\cdot': '·', '\\cdotp': '·', '\\ldots': '…', '\\cdots': '⋯', '\\ddots': '⋱', '\\vdots': '⋮',

    '\\in': '∈', '\\notin': '∉', '\\subset': '⊂', '\\subseteq': '⊆', '\\supset': '⊃', '\\supseteq': '⊇',
    '\\cup': '∪', '\\cap': '∩', '\\setminus': '∖', '\\emptyset': '∅', '\\varnothing': '∅',
    '\\forall': '∀', '\\exists': '∃', '\\neg': '¬', '\\wedge': '∧', '\\vee': '∨',
    '\\Rightarrow': '⇒', '\\Leftrightarrow': '⇔', '\\to': '→', '\\gets': '←', '\\rightarrow': '→', '\\leftarrow': '←',
    '\\Longrightarrow': '⇒', '\\Longleftrightarrow': '⇔', '\\longrightarrow': '→', '\\longleftrightarrow': '↔',
    '\\Longrightarrows': '⇒',
    '\\textbf': '', '\\textit': '', '\\texttt': '', '\\textsf': '',
    '\\le': '≤', '\\ge': '≥',

    '\\partial': '∂', '\\nabla': '∇', '\\angle': '∠', '\\perp': '⊥', '\\parallel': '∥',
    '\\triangle': '△', '\\sim': '∼',

    '\\quad': '<span style="margin-right: 0.8em; display: inline-block;"></span>',
    '\\qquad': '<span style="margin-right: 1.6em; display: inline-block;"></span>',
    '\\,': '<span style="margin-right: 0.15em; display: inline-block;"></span>',
    '\\:': '<span style="margin-right: 0.22em; display: inline-block;"></span>',
    '\\;': '<span style="margin-right: 0.27em; display: inline-block;"></span>',
    '\\ ': '<span style="margin-right: 0.25em; display: inline-block;"></span>',
    '\\\\': '<br/>',

    '\\sin': 'sin', '\\cos': 'cos', '\\tan': 'tan', '\\cot': 'cot', '\\sec': 'sec', '\\csc': 'csc',
    '\\arcsin': 'arcsin', '\\arccos': 'arccos', '\\arctan': 'arctan', '\\log': 'log', '\\ln': 'ln', '\\exp': 'exp',
    '\\i': 'ı', '\\imath': 'ı'
};

function isLimitOperator(baseNodes) {
    if (baseNodes.length === 1 && baseNodes[0].type === 'command') {
        const val = baseNodes[0].val;
        return val === '\\sum' || val === '\\prod' || val === '\\lim';
    }
    return false;
}

function renderNodesToHtml(nodes, isNormalText = false, fontFace = '') {
    return nodes.map(node => {
        switch (node.type) {
            case 'text':
                let val = node.val;
                if (val === ' ') return '&nbsp;';
                if (!isNormalText && ['+', '-', '=', '<', '>', ':', '≈', '≠', '≤', '≥'].includes(val)) {
                    return `<span class="math-symbol">${val}</span>`;
                }
                if (!isNormalText && val === ',') {
                    return `<span style="margin-left: 0.25em; margin-right: 0.25em; display: inline-block;">,</span>`;
                }
                if (!isNormalText && isLetter(val)) {
                    const fontStyle = fontFace ? ` style="font-family: '${fontFace}', sans-serif;"` : '';
                    return `<span class="math-var"${fontStyle}>${val}</span>`;
                }
                return `<span>${val}</span>`;

            case 'command':
                if (node.val === '\\imath' || node.val === '\\i') {
                    const fontStyle = fontFace ? ` style="font-family: '${fontFace}', sans-serif;"` : '';
                    return `<span class="math-var"${fontStyle}>ı</span>`;
                }
                if (node.val === '\\placeholder') {
                    return `<span class="math-placeholder-box"></span>`;
                }
                const cmdVal = COMMAND_MAPPING[node.val] || node.val.replace(/^\\/, '');
                if (node.val === '\\int') {
                    return `<span class="math-operator-large math-integral">∫</span>`;
                }
                if (node.val === '\\sum') {
                    return `<span class="math-operator-large math-sum">∑</span>`;
                }
                if (node.val === '\\prod') {
                    return `<span class="math-operator-large math-prod">∏</span>`;
                }
                if (node.val === '\\lim') {
                    return `<span class="math-operator-large math-lim">lim</span>`;
                }
                if (node.val === '\\hline') {
                    return `<div style="border-bottom: 1.5px solid currentColor; width: 100%; margin: 2px 0;"></div>`;
                }
                if (node.val === '\\vspace') {
                    return `<div style="height: 1em; width: 100%;"></div>`;
                }

                if (COMMAND_MAPPING[node.val]) {
                    if (node.val.startsWith('\\quad') || node.val.startsWith('\\\\') || node.val.startsWith('\\ ')) {
                        return cmdVal; // raw HTML spacer output
                    }
                    if (!/^[a-zA-Z]{3,}/.test(COMMAND_MAPPING[node.val])) {
                        return `<span class="math-symbol">${cmdVal}</span>`;
                    }
                }
                const fontStyleCmd = fontFace ? ` style="font-family: '${fontFace}', sans-serif;"` : '';
                return `<span class="math-text-cmd"${fontStyleCmd}>${cmdVal}</span>`;

            case 'group':
                return `<span class="math-group">${renderNodesToHtml(node.content, isNormalText, fontFace)}</span>`;

            case 'text-group':
                const fontStyleText = fontFace ? ` style="font-family: '${fontFace}', sans-serif;"` : '';
                return `<span class="math-text-normal"${fontStyleText}>${renderNodesToHtml(node.content, true, fontFace)}</span>`;

            case 'frac':
                return `<div class="math-frac">
                    <div class="math-num">${renderNodesToHtml(node.num, isNormalText, fontFace)}</div>
                    <div class="math-den">${renderNodesToHtml(node.den, isNormalText, fontFace)}</div>
                </div>`;

            case 'sub':
                if (node.base && node.base.length === 1 && node.base[0].type === 'underbrace') {
                    const underbraceNode = node.base[0];
                    const contentHtml = renderNodesToHtml(underbraceNode.content, isNormalText, fontFace);
                    const subHtml = renderNodesToHtml(node.sub, isNormalText, fontFace);
                    const svgHtml = `<svg class="math-underbrace-svg" viewBox="0 0 100 12" preserveAspectRatio="none"><path d="M 0,1 C 5,1 5,6 10,6 L 43,6 C 47,6 47,11 50,11 C 53,11 53,6 57,6 L 90,6 C 95,6 95,1 100,1" fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke"></path></svg>`;
                    return `<div class="math-underbrace-wrap">
                        <div class="math-underbrace-content">${contentHtml}</div>
                        <div class="math-underbrace-symbol">${svgHtml}</div>
                        <div class="math-underbrace-sub">${subHtml}</div>
                    </div>`;
                }
                if (isLimitOperator(node.base)) {
                    return `<div class="math-limits-op-wrap">
                        <span class="math-limit-base">${renderNodesToHtml(node.base, isNormalText, fontFace)}</span>
                        <sub class="math-limit-bottom">${renderNodesToHtml(node.sub, isNormalText, fontFace)}</sub>
                    </div>`;
                }
                return `<span class="math-sub-wrap">
                    <span class="math-base">${renderNodesToHtml(node.base, isNormalText, fontFace)}</span>
                    <sub class="math-sub">${renderNodesToHtml(node.sub, isNormalText, fontFace)}</sub>
                </span>`;

            case 'sup':
                if (isLimitOperator(node.base)) {
                    return `<div class="math-limits-op-wrap">
                        <sup class="math-limit-top">${renderNodesToHtml(node.sup, isNormalText, fontFace)}</sup>
                        <span class="math-limit-base">${renderNodesToHtml(node.base, isNormalText, fontFace)}</span>
                    </div>`;
                }
                return `<span class="math-sup-wrap">
                    <span class="math-base">${renderNodesToHtml(node.base, isNormalText, fontFace)}</span>
                    <sup class="math-sup">${renderNodesToHtml(node.sup, isNormalText, fontFace)}</sup>
                </span>`;

            case 'subsup':
                if (node.base && node.base.length === 1 && node.base[0].type === 'underbrace') {
                    const underbraceNode = node.base[0];
                    const contentHtml = renderNodesToHtml(underbraceNode.content, isNormalText, fontFace);
                    const subHtml = renderNodesToHtml(node.sub, isNormalText, fontFace);
                    const supHtml = renderNodesToHtml(node.sup, isNormalText, fontFace);
                    const svgHtml = `<svg class="math-underbrace-svg" viewBox="0 0 100 12" preserveAspectRatio="none"><path d="M 0,1 C 5,1 5,6 10,6 L 43,6 C 47,6 47,11 50,11 C 53,11 53,6 57,6 L 90,6 C 95,6 95,1 100,1" fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke"></path></svg>`;
                    return `<div class="math-underbrace-wrap">
                        <sup class="math-limit-top">${supHtml}</sup>
                        <div class="math-underbrace-content">${contentHtml}</div>
                        <div class="math-underbrace-symbol">${svgHtml}</div>
                        <div class="math-underbrace-sub">${subHtml}</div>
                    </div>`;
                }
                if (isLimitOperator(node.base)) {
                    return `<div class="math-limits-op-wrap">
                        <sup class="math-limit-top">${renderNodesToHtml(node.sup, isNormalText, fontFace)}</sup>
                        <span class="math-limit-base">${renderNodesToHtml(node.base, isNormalText, fontFace)}</span>
                        <sub class="math-limit-bottom">${renderNodesToHtml(node.sub, isNormalText, fontFace)}</sub>
                    </div>`;
                }
                return `<span class="math-subsup-wrap">
                    <span class="math-base">${renderNodesToHtml(node.base, isNormalText, fontFace)}</span>
                    <span class="math-scripts">
                        <sup class="math-sup">${renderNodesToHtml(node.sup, isNormalText, fontFace)}</sup>
                        <sub class="math-sub">${renderNodesToHtml(node.sub, isNormalText, fontFace)}</sub>
                    </span>
                </span>`;

            case 'underbrace':
                {
                    const contentHtml = renderNodesToHtml(node.content, isNormalText, fontFace);
                    const svgHtml = `<svg class="math-underbrace-svg" viewBox="0 0 100 12" preserveAspectRatio="none"><path d="M 0,1 C 5,1 5,6 10,6 L 43,6 C 47,6 47,11 50,11 C 53,11 53,6 57,6 L 90,6 C 95,6 95,1 100,1" fill="none" stroke="currentColor" stroke-width="1.5" vector-effect="non-scaling-stroke"></path></svg>`;
                    return `<div class="math-underbrace-wrap">
                        <div class="math-underbrace-content">${contentHtml}</div>
                        <div class="math-underbrace-symbol">${svgHtml}</div>
                    </div>`;
                }

            case 'root':
                const rootContentHtml = renderNodesToHtml(node.content, isNormalText, fontFace);
                if (node.index && node.index.length > 0) {
                    const indexHtml = renderNodesToHtml(node.index, isNormalText, fontFace);
                    return `<div class="math-root">
                        <span class="math-root-index">${indexHtml}</span>
                        <div class="math-root-symbol-wrap">
                            <svg class="math-root-svg" viewBox="0 0 10 20" preserveAspectRatio="none">
                                <path d="M 1,12 L 3,12 L 6,18 L 10,0" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"></path>
                            </svg>
                        </div>
                        <div class="math-root-content">${rootContentHtml}</div>
                    </div>`;
                }
                return `<div class="math-root">
                    <div class="math-root-symbol-wrap">
                        <svg class="math-root-svg" viewBox="0 0 10 20" preserveAspectRatio="none">
                            <path d="M 1,12 L 3,12 L 6,18 L 10,0" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"></path>
                        </svg>
                    </div>
                    <div class="math-root-content">${rootContentHtml}</div>
                </div>`;

            case 'bracket':
                const leftBracketSym = node.left ? (node.left.val || node.left) : '(';
                const rightBracketSym = node.right ? (node.right.val || node.right) : ')';

                let leftSvg = '';
                let rightSvg = '';

                if (leftBracketSym === '(') {
                    leftSvg = `<path d="M 8,2 A 8,8 0 0,0 2,10 A 8,8 0 0,0 8,18" fill="none" stroke="currentColor" stroke-width="1.8" vector-effect="non-scaling-stroke" />`;
                } else if (leftBracketSym === '[') {
                    leftSvg = `<path d="M 8,2 L 3,2 L 3,18 L 8,18" fill="none" stroke="currentColor" stroke-width="1.8" vector-effect="non-scaling-stroke" />`;
                } else if (leftBracketSym === '\\{' || leftBracketSym === '{') {
                    leftSvg = `<path d="M 8,2 C 6,2 5,4 5,6 L 5,8 C 5,9.5 4,10 2,10 C 4,10 5,10.5 5,12 L 5,14 C 5,16 6,18 8,18" fill="none" stroke="currentColor" stroke-width="1.8" vector-effect="non-scaling-stroke" />`;
                } else if (leftBracketSym === '|') {
                    leftSvg = `<path d="M 5,2 L 5,18" fill="none" stroke="currentColor" stroke-width="1.8" vector-effect="non-scaling-stroke" />`;
                } else {
                    leftSvg = `<path d="M 8,2 A 8,8 0 0,0 2,10 A 8,8 0 0,0 8,18" fill="none" stroke="currentColor" stroke-width="1.8" vector-effect="non-scaling-stroke" />`;
                }

                if (rightBracketSym === ')') {
                    rightSvg = `<path d="M 2,2 A 8,8 0 0,1 8,10 A 8,8 0 0,1 2,18" fill="none" stroke="currentColor" stroke-width="1.8" vector-effect="non-scaling-stroke" />`;
                } else if (rightBracketSym === ']') {
                    rightSvg = `<path d="M 2,2 L 7,2 L 7,18 L 2,18" fill="none" stroke="currentColor" stroke-width="1.8" vector-effect="non-scaling-stroke" />`;
                } else if (rightBracketSym === '\\}' || rightBracketSym === '}') {
                    rightSvg = `<path d="M 2,2 C 4,2 5,4 5,6 L 5,8 C 5,9.5 6,10 8,10 C 6,10 5,10.5 5,12 L 5,14 C 5,16 4,18 2,18" fill="none" stroke="currentColor" stroke-width="1.8" vector-effect="non-scaling-stroke" />`;
                } else if (rightBracketSym === '|') {
                    rightSvg = `<path d="M 5,2 L 5,18" fill="none" stroke="currentColor" stroke-width="1.8" vector-effect="non-scaling-stroke" />`;
                } else {
                    rightSvg = `<path d="M 2,2 A 8,8 0 0,1 8,10 A 8,8 0 0,1 2,18" fill="none" stroke="currentColor" stroke-width="1.8" vector-effect="non-scaling-stroke" />`;
                }

                return `<div class="math-bracket-wrap">
                    <div class="math-bracket-symbol math-bracket-left">
                        <svg viewBox="0 0 10 20" preserveAspectRatio="none" style="height: 100%; width: 100%;">${leftSvg}</svg>
                    </div>
                    <div class="math-bracket-content">${renderNodesToHtml(node.content, isNormalText, fontFace)}</div>
                    <div class="math-bracket-symbol math-bracket-right">
                        <svg viewBox="0 0 10 20" preserveAspectRatio="none" style="height: 100%; width: 100%;">${rightSvg}</svg>
                    </div>
                </div>`;

            case 'matrix':
                let leftParen = '';
                let rightParen = '';
                if (node.env === 'pmatrix') {
                    leftParen = '(';
                    rightParen = ')';
                } else if (node.env === 'bmatrix') {
                    leftParen = '[';
                    rightParen = ']';
                } else if (node.env === 'vmatrix') {
                    leftParen = '|';
                    rightParen = '|';
                }

                let alignStyle = '';
                if (node.env === 'gather' || node.env === 'array') {
                    const alignFlex = currentAlignment === 'left' ? 'flex-start' : (currentAlignment === 'right' ? 'flex-end' : 'center');
                    alignStyle = ` style="align-items: ${alignFlex} !important;"`;
                }

                const gridHtml = node.rows.map(row => {
                    let hasHlineTop = false;
                    if (row.length > 0 && row[0].length > 0 && row[0][0].type === 'command' && row[0][0].val === '\\hline') {
                        hasHlineTop = true;
                        row[0].shift(); // remove \hline from the cell
                    }

                    // Check if it was a standalone hline row
                    if (row.length === 1 && row[0].length === 0) {
                        return hasHlineTop ? `<div style="border-bottom: 1.5px solid currentColor; width: 100%; margin: 2px 0;"></div>` : '';
                    }

                    let rowAlign = '';
                    if (node.env === 'gather' || node.env === 'array') {
                        const justifyFlex = currentAlignment === 'left' ? 'flex-start' : (currentAlignment === 'right' ? 'flex-end' : 'center');
                        rowAlign = ` style="justify-content: ${justifyFlex} !important;"`;
                    }
                    const rowHtml = `<div class="math-matrix-row"${rowAlign}>
                        ${row.map(cell => {
                            let cellAlign = '';
                            if (node.env === 'gather' || node.env === 'array') {
                                cellAlign = ` style="text-align: ${currentAlignment} !important;"`;
                            }
                            return `<div class="math-matrix-cell"${cellAlign}>${renderNodesToHtml(cell, isNormalText, fontFace)}</div>`;
                        }).join('')}
                    </div>`;

                    let html = '';
                    if (hasHlineTop) html += `<div style="border-bottom: 1.5px solid currentColor; width: 100%; margin: 2px 0;"></div>`;
                    html += rowHtml;
                    return html;
                }).join('');

                const matrixContent = `<div class="math-matrix"${alignStyle}>${gridHtml}</div>`;

                if (leftParen || rightParen) {
                    return renderNodesToHtml([{
                        type: 'bracket',
                        left: leftParen,
                        right: rightParen,
                        content: [{ type: 'custom-html', html: matrixContent }]
                    }], isNormalText, fontFace);
                }

                return matrixContent;

            case 'decorator':
                const innerHtml = renderNodesToHtml(node.content, isNormalText, fontFace);
                if (node.dec === 'vec' || node.dec === 'vector-arrow') {
                    return `<span class="math-decorator-vec"><span class="math-dec-arrow">→</span><span class="math-dec-content">${innerHtml}</span></span>`;
                }
                if (node.dec === 'overline') {
                    return `<span class="math-decorator-overline">${innerHtml}</span>`;
                }
                if (node.dec === 'hat') {
                    return `<span class="math-decorator-hat"><span class="math-dec-hat">^</span><span class="math-dec-content">${innerHtml}</span></span>`;
                }
                if (node.dec === 'widehat') {
                    // İçeriğin tek bir harften oluşup oluşmadığını kontrol et
                    let isSingle = false;
                    if (node.content && node.content.length === 1) {
                        const innerNode = node.content[0];
                        if (innerNode.type === 'text' && innerNode.val.trim().length === 1) {
                            isSingle = true;
                        } else if (innerNode.type === 'command' && COMMAND_MAPPING[innerNode.val] && COMMAND_MAPPING[innerNode.val].length === 1) {
                            isSingle = true;
                        }
                    }
                    const singleClass = isSingle ? ' single-char' : '';
                    
                    // viewBox'ı büyüterek (24) ve stroke-linejoin="round" kullanarak tepe noktasının düz kırpılmasını engelliyoruz
                    const svgHtml = `<svg class="math-dec-widehat-svg" viewBox="0 0 100 24" preserveAspectRatio="none"><path d="M 0,22 L 50,2 L 100,22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"></path></svg>`;
                    
                    return `<span class="math-decorator-widehat${singleClass}"><span class="math-dec-widehat-symbol">${svgHtml}</span><span class="math-dec-content">${innerHtml}</span></span>`;
                }
                return innerHtml;

            case 'mathbb':
                const innerChar = renderNodesToHtml(node.content, isNormalText, fontFace).trim();
                const doubleStruck = {
                    'R': 'ℝ', 'N': 'ℕ', 'Z': 'ℤ', 'Q': 'ℚ', 'C': 'ℂ', 'P': 'ℙ'
                };
                const mappedChar = doubleStruck[innerChar] || innerChar;
                return `<span class="math-symbol" style="font-family: inherit;">${mappedChar}</span>`;

            case 'custom-html':
                return node.html;

            default:
                return '';
        }
    }).join('');
}

function getRawStringFromNodes(nodes) {
    if (!nodes) return '';
    return nodes.map(node => {
        if (!node) return '';
        if (node.type === 'text') {
            return node.val;
        } else if (node.type === 'command') {
            if (node.val === '\\ ') return ' ';
            if (node.val === '\\\\') return '\n';
            return node.val;
        } else if (node.type === 'group') {
            return '{' + getRawStringFromNodes(node.content) + '}';
        } else if (node.type === 'text-group') {
            return '\\text{' + getRawStringFromNodes(node.content) + '}';
        } else if (node.type === 'frac') {
            return '\\frac{' + getRawStringFromNodes(node.num) + '}{' + getRawStringFromNodes(node.den) + '}';
        } else if (node.type === 'custom-html') {
            return node.html;
        }
        return '';
    }).join('');
}

const compileCache = new Map();

function compileLatexToHtml(latex, fontFace, size, color) {
    // Normal metinlerde LaTeX kuralları işlesin (Tokenizer kendi boşluk yutma kuralını uygulayacak)
    let cleanLatex = latex;

    // Split by lines, trim each line to prevent leading/trailing space alignment shifts, then rejoin
    cleanLatex = cleanLatex.split('\\\\').map(line => line.trim()).join(' \\\\ ');
    const cacheKey = `${cleanLatex}_${fontFace}_${size}_${color}_${currentAlignment}`;
    if (compileCache.has(cacheKey)) {
        return compileCache.get(cacheKey);
    }
    try {
        const tokens = tokenize(cleanLatex);
        const ast = parse(tokens);
        const mathHtml = renderNodesToHtml(ast, false, fontFace);
        const result = `<div class="math-render-root" style="font-family: '${fontFace}', sans-serif; font-size: ${size}px; color: ${color}; display: block; text-align: ${currentAlignment}; width: max-content; white-space: nowrap;">
            ${mathHtml}
        </div>`;
        if (compileCache.size > 100) {
            const firstKey = compileCache.keys().next().value;
            compileCache.delete(firstKey);
        }
        compileCache.set(cacheKey, result);
        return result;
    } catch (err) {
        console.error("Custom parser error:", err);
        return `<div class="text-red-500 text-xs italic">Formül parse edilemedi: ${err.message}</div>`;
    }
}
