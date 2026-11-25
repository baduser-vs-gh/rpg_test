// =====================================================================
// 祭壇、寶物、機關模型 — 需先載入 engine3d.js
//   祭壇 build(t, lit)：lit = true 為發光狀態
//   寶物與機關目前遊戲還沒用到，先放著備用（預覽頁看得到）
// =====================================================================
(function () {
    const { TAU, box, beam, sphere, frustum, xform, rotX, rotY } = M3D;

    // ---------- 祭壇 ----------
    function buildAltar(t, lit) {
        const M = [], S = '#b3a68a', D = '#8f8269';   // 砂岩色，和灰色石牆區隔
        box(M, [0, 0, 0], [0.5, 0.06, 0.5], D);
        box(M, [0, 0.06, 0], [0.4, 0.05, 0.4], S);
        frustum(M, [0, 0.11, 0], 0.11, 0.09, 0.24, S, { seg: 8 });
        box(M, [0, 0.35, 0], [0.3, 0.05, 0.3], D);
        // 台座四面的符文：點亮時發光
        const rune = lit ? '#ffd35a' : '#4a4234';
        for (let i = 0; i < 4; i++) {
            const st = M.length;
            box(M, [0, 0.07, -0.203], [0.14, 0.025, 0.006], rune, { glow: lit });
            box(M, [0, 0.365, -0.153], [0.12, 0.02, 0.006], rune, { glow: lit });
            xform(M, st, rotY(i * Math.PI / 2));
        }
        // 頂端水晶（上下兩個角錐）
        const cy = 0.5 + (lit ? 0.03 * Math.sin(t * 2) : 0);
        const st = M.length, col = lit ? '#8ff6ff' : '#5a5a78';
        frustum(M, [0, cy, 0], 0.075, 0, 0.13, col, { seg: 4 });
        frustum(M, [0, cy, 0], 0.075, 0, -0.1, col, { seg: 4 });
        xform(M, st, rotY(lit ? t * 1.2 : 0.4));
        if (lit) {
            frustum(M, [0, 0.4, 0], 0.17, 0.05, 0.65, '#7df9ff', { seg: 10, alpha: 0.14, glow: true, two: true, noCap: true });
            for (let i = 0; i < 6; i++) {
                const k = (t * 0.4 + i / 6) % 1, a = i * 2.3 + t * 1.5;
                box(M, [Math.cos(a) * 0.14, 0.42 + k * 0.45, Math.sin(a) * 0.14], [0.02, 0.02, 0.02], '#e0fdff', { glow: true, alpha: Math.max(0.05, 1 - k) });
            }
        }
        return M;
    }

    // ---------- 寶物 ----------
    function buildChest(open) {
        const M = [], G = '#d4a017';
        box(M, [0, 0, 0], [0.5, 0.24, 0.32], '#8b5a2b');
        for (const s of [-1, 1]) box(M, [s * 0.17, 0, 0], [0.05, 0.245, 0.33], G);
        if (open) {
            sphere(M, [0, 0.2, 0], [0.22, 0.08, 0.13], '#f5c542', { seg: 10, rings: 6, half: true, glow: true });
            sphere(M, [0.08, 0.27, -0.03], [0.03, 0.04, 0.03], '#e74c3c', { seg: 6, rings: 4, glow: true });
        }
        const st = M.length;
        box(M, [0, 0.24, 0], [0.5, 0.1, 0.32], '#9c6631');
        for (const s of [-1, 1]) box(M, [s * 0.17, 0.24, 0], [0.05, 0.105, 0.33], G);
        box(M, [0, 0.2, -0.165], [0.07, 0.09, 0.02], '#f1c40f');
        if (open) xform(M, st, rotX(1.9, [0, 0.24, 0.16]));
        return M;
    }
    function buildPotion(t) {
        const M = [], y = 0.02 + 0.02 * Math.sin(t * 2);
        sphere(M, [0, y + 0.1, 0], [0.085, 0.075, 0.085], '#e0294a', { seg: 10, rings: 6 });
        sphere(M, [0, y + 0.11, 0], [0.11, 0.11, 0.11], '#cfe8ff', { seg: 10, rings: 7, alpha: 0.35 });
        frustum(M, [0, y + 0.2, 0], 0.04, 0.035, 0.07, '#cfe8ff', { seg: 8, alpha: 0.45 });
        box(M, [0, y + 0.265, 0], [0.06, 0.045, 0.06], '#a0703a');
        sphere(M, [-0.04, y + 0.15, -0.09], [0.015, 0.03, 0.01], '#ffffff', { seg: 5, rings: 3, glow: true, alpha: 0.8 });
        return M;
    }
    function buildKey(t) {
        const M = [], y = 0.14 + 0.02 * Math.sin(t * 2.5), G = '#f1c40f', n = 10, cx = -0.1, r = 0.055;
        for (let i = 0; i < n; i++) {
            const a0 = i / n * TAU, a1 = (i + 1) / n * TAU;
            beam(M, [cx + Math.cos(a0) * r, y + Math.sin(a0) * r, 0], [cx + Math.cos(a1) * r, y + Math.sin(a1) * r, 0], 0.025, G);
        }
        beam(M, [cx + r, y, 0], [0.17, y, 0], 0.028, G);
        beam(M, [0.11, y, 0], [0.11, y - 0.055, 0], 0.024, G);
        beam(M, [0.155, y, 0], [0.155, y - 0.045, 0], 0.024, G);
        return M;
    }

    // ---------- 機關 ----------
    function buildSpikes(t) {
        const M = [];
        box(M, [0, 0, 0], [0.62, 0.035, 0.62], '#3d4048');
        const e = Math.pow(Math.max(0, Math.sin(t * 2.2)), 0.4), h = 0.02 + 0.24 * e;
        for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
            box(M, [i * 0.18, 0.035, j * 0.18], [0.07, 0.004, 0.07], '#121316');
            frustum(M, [i * 0.18, 0.035, j * 0.18], 0.032, 0, h, '#cfd6dd', { seg: 6 });
        }
        return M;
    }
    function buildTeleport(t) {
        const M = [], P = '#a855f7';
        for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + t * 0.8; box(M, [Math.cos(a) * 0.33, 0, Math.sin(a) * 0.33], [0.05, 0.02, 0.05], P, { glow: true }); }
        for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - t * 1.2; box(M, [Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2], [0.035, 0.015, 0.035], '#e9d5ff', { glow: true }); }
        frustum(M, [0, 0, 0], 0.32, 0.26, 0.85, P, { seg: 14, alpha: 0.16, glow: true, two: true, noCap: true });
        for (let i = 0; i < 8; i++) {
            const k = (t * 0.35 + i / 8) % 1, a = i * 2.4 + t;
            box(M, [Math.cos(a) * 0.18, k * 0.8, Math.sin(a) * 0.18], [0.025, 0.025, 0.025], '#f5e8ff', { glow: true, alpha: Math.max(0.05, 1 - k) });
        }
        return M;
    }

    Object.assign(M3D.MODELS, {
        altar:     { name: '祭壇',       cat: 'altar', build: buildAltar,              face: 'world', sh: 0 },
        chest:     { name: '寶箱（關）', cat: 'item',  build: () => buildChest(false), face: 'world', sh: 0.3, zoom: 1.4 },
        chestOpen: { name: '寶箱（開）', cat: 'item',  build: () => buildChest(true),  face: 'world', sh: 0.3, zoom: 1.4 },
        potion:    { name: '補血藥水',   cat: 'item',  build: buildPotion,             face: 'spin',  sh: 0.1, zoom: 2.3 },
        key:       { name: '鑰匙',       cat: 'item',  build: buildKey,                face: 'spin',  sh: 0.12, zoom: 2.3 },
        spikes:    { name: '地刺陷阱',   cat: 'trap',  build: buildSpikes,             face: 'world', sh: 0, zoom: 1.3 },
        teleport:  { name: '傳送陣',     cat: 'trap',  build: buildTeleport,           face: 'world', sh: 0 },
    });
})();
