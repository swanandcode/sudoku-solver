// Test Case: 300580000000130895000007000004968120020000000000010004002300060708040000053006400 < 1s
// Difficult: 004010000000000006080900720000000030200009000070200580008004650000500003060000009 ~8.26s
// Unsolvable: 000041000060000020002000000320600000000050041700000002000000230048000000501002000 ~54s
// not solved: 000000000000000000000000000000000000000000000000000009000000000000000000123456780 ~inf
// Brute force complexity ~50 unfilled (last 2 squares = 9)

// TODO
// 1) Efficiency close to benchmark
// 2) Refactoring


const puzzle = document.getElementById("puzzle");
const container = document.getElementById("container");
const msgSpan = document.getElementById("message");
let solutions = [], autoCells = [], cells = [], currentSol = 0;
const navPrev = document.getElementById("nav_prev");
const navNext = document.getElementById("nav_next");
const navs = [navPrev, navNext];
const btnCalc = document.getElementById("btn_calc");
const btnReset = document.getElementById("btn_reset");
const btnCopy = document.getElementById("btn_copy");
const buttons = [btnCalc, btnReset, btnCopy];
const inp_paste = document.getElementById("inp_paste");
function copyToClipboard(text) {
    let dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}
navPrev.onclick = e => {
    unPopulate();
    populate(--currentSol);
    msgSpan.innerText = `Solution ${currentSol + 1} of ${solutions.length}`;
    navs.forEach(n => n.classList.add("visible"));
    if (currentSol <= 0) {
        navPrev.classList.remove("visible");
    }
}
navNext.onclick = e => {
    unPopulate();
    populate(++currentSol);
    msgSpan.innerText = `Solution ${currentSol + 1} of ${solutions.length}`;
    navs.forEach(n => n.classList.add("visible"));
    if (currentSol >= solutions.length - 1) {
        navNext.classList.remove("visible");
    }
}
container.style.gridTemplateColumns = container.style.gridTemplateRows = "41px 41px 42px ".repeat(3);
function onkeydownCell(e) {
    e.preventDefault();
    if (puzzle.classList.contains("solved")) return;
    let div = e.target;
    let kc = e.keyCode;
    if (!e.shiftKey && (kc > 47 && kc < 58) || (kc > 95 && kc < 106)) {
        if (kc === 48 || kc === 96)
            div.innerText = "";
        else
            div.innerText = e.key;
        div.nextElementSibling?.focus();
    }
    else if (kc === 8) {
        let p = div.previousElementSibling;
        if (!p) return;
        p.innerText = "";
        p.focus();
    }
    else if (kc === 46) {
        div.innerText = "";
    }
    else if (kc === 38 || (kc === 13 && e.shiftKey)) {
        let s = div;
        for (let i = 0; i < 9; i++) {
            s = s.previousElementSibling;
            if (!s) return;
        }
        s.focus();
    }
    else if (kc === 40 || kc === 13) {
        let s = div;
        for (let i = 0; i < 9; i++) {
            s = s.nextElementSibling;
            if (!s) return;
        }
        s.focus();
    }
    else if (kc === 37 || (kc === 9 && e.shiftKey)) {
        div.previousElementSibling?.focus();
    }
    else if (kc === 39 || kc === 9) {
        div.nextElementSibling?.focus();
    }
}
function onfocusCell(e) {
    if (puzzle.classList.contains("solved")) return;
    e.target.classList.add("focus");
};
function onblurCell(e) {
    if (puzzle.classList.contains("solved")) return;
    e.target.classList.remove("focus");
};
for (let index = 0; index < 81; index++) {
    const div = document.createElement("div");
    div.className = "cell";
    div.tabIndex = 0;
    div.onfocus = onfocusCell;
    div.onblur = onblurCell;
    div.onkeydown = onkeydownCell;
    container.appendChild(div);
    cells.push(div);
}
function reset(hard) {
    unPopulate(hard);
    btnCalc.innerText = "Solve";
    puzzle.classList.remove("solved");
    msgSpan.innerText = "Enter numbers";
    inp_paste.disabled = false;
    msgSpan.classList.remove("error");
}
btnReset.onclick = () => reset(true);
btnCopy.onclick = () => copyToClipboard(cells.map(c => c.innerText || 0).join(""));
function unPopulate(all = false) {
    (all ? cells : autoCells).forEach(c => {
        c.innerText = "";
        c.classList.remove("auto");
    });
    navs.forEach(n => n.classList.remove("visible"));
}
function populate(index) {
    let tokenArr = solutions[index];
    autoCells.forEach((c, i) => {
        c.classList.add("auto");
        c.innerText = tokenArr[i];
    });
}
function onSolve(grid, tokenArrs) {
    solutions = tokenArrs;
    if (solutions.length > 1) {
        msgSpan.innerText = `Solution 1 of ${solutions.length}`;
        navNext.classList.add("visible");
    }
    else {
        msgSpan.innerText = "Solution";
    }
    populate(0);
    btnCalc.innerText = "Unsolve";
    buttons.forEach(b => b.disabled = false);
}
function solveHandler(callback) {
    try {
        callback();
    } catch (ex) {
        msgSpan.classList.add("error");
        msgSpan.innerText = ex;
        buttons.forEach(b => b.disabled = false);
        puzzle.classList.remove("solved");
    }
}
btnCalc.onclick = (e) => {
    if (puzzle.classList.contains("solved")) {
        reset(false);
        return;
    }
    buttons.forEach(b => b.disabled = true);
    inp_paste.disabled = true;
    msgSpan.classList.remove("error");
    msgSpan.innerText = "Solving...";
    puzzle.classList.add("solved");
    autoCells = [];
    let grid = cells.map(c => {
        if (!c.innerText) autoCells.push(c);
        return parseInt(c.innerText) || 0;
    });
    setTimeout(() => solveHandler(() => solve(grid, onSolve, solveHandler)), 0);
}
inp_paste.onkeydown = e => { if (!e.ctrlKey || (e.keyCode !== 86)) e.preventDefault() };
inp_paste.onpaste = e => {
    e.preventDefault();
    let text = e.clipboardData.getData("text");
    let cleanText = Array.from(text.matchAll("[0-9]")).map(a => a[0]);
    for (let i = 0; i < Math.min(cells.length, cleanText.length); i++) {
        cells[i].innerText = parseInt(cleanText[i]) || "";
    }
};
function solve(grid, callback, handler) {
    const combGrid = [], zeroPos = [], tokenArrs = [],
        tokenArr = grid.filter((c, i) => {
            combGrid.push(c);
            if (c === 0) {
                zeroPos.push(i);
                return true;
            } else return false;
        }).map(c => 0), zeroes = tokenArr.length,
        sqFArr = grid.map((_, i) => Math.max(Math.floor((i % 3) / 2) * 7, 1)),
        posI = grid.map((_, i) => {
            const rowI = Math.floor(i / 9) * 9,
                colI = i % 9,
                sqI = Math.floor(rowI / 27) * 27 + Math.floor(colI / 3) * 3;
            return { rowI, colI, sqI };
        })
    let lastIn = undefined, tokenArrLength = 0;
    function forLoop(init, limit, prop) {
        let set = new Set();
        for (let j = init; j < limit; j += prop(j)) {
            let tj = combGrid[j];
            if (tj === 0) continue;
            if (set.has(tj)) return true;
            else set.add(tj);
        }
        return false;
    }
    function rowF() { return 1; }
    function colF() { return 9; }
    function sqF(j) { return sqFArr[j]; }
    function duplicates() {
        const p = posI[lastIn];
        if (forLoop(p.rowI, p.rowI + 9, rowF)) return "row";
        else if (forLoop(p.colI, 81, colF)) return "column";
        else if (forLoop(p.sqI, p.sqI + 21, sqF)) return "box";
        else return "";
    }
    let token = 1;
    for (let i = 0, j = 0; i < 9; j += (i % 3 === 2) ? 4 : 12, i++) {
        lastIn = j;
        const dup = duplicates();
        if (dup) throw new Error("Duplicate entries in " + dup);
    }
    let iterations = 0;
    function iterate() {
        while (true) {
            if (!(++iterations % 10000)) break;
            if (tokenArrLength === zeroes) {
                let taCount = tokenArrs.push(tokenArr.map(t => t));
                if (taCount === 10 || zeroes === 0) {
                    callback(grid, tokenArrs);
                    return;
                }
            } else {
                lastIn = zeroPos[tokenArrLength];
                tokenArr[tokenArrLength++] = combGrid[lastIn] = token;
                if (!duplicates()) {
                    token = 1;
                    continue;
                }
            }
            while (true) {
                token = tokenArr[--tokenArrLength] + 1;
                lastIn = zeroPos[tokenArrLength - 1];
                combGrid[zeroPos[tokenArrLength]] = 0;
                if (token === 10) {
                    if (tokenArrLength !== 0) continue;
                    if (tokenArrs.length !== 0) {
                        callback(grid, tokenArrs);
                        return;
                    }
                    else throw "Unsolvable";
                } else break;
            }
        }
        setTimeout(() => handler(iterate), 0);
    }
    iterate();
}