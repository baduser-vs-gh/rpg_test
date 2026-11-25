// =====================================================================
// 怪物模型（10 種）— 需先載入 engine3d.js
//   每個 build(t) 回傳面清單；t = 秒，用來做動作
// =====================================================================
(function () {
    const { TAU, box, beam, sphere, frustum, face, xform, rotX, rotZ } = M3D;

    function buildSlime(t) {
        const M = [], s = Math.sin(t * 4), ry = 0.2 * (1 + 0.15 * s), rxz = 0.28 * (1 - 0.07 * s);
        sphere(M, [0, ry, 0], [rxz, ry, rxz], '#45c043', { seg: 12, rings: 8 });
        for (const sx of [-1, 1]) sphere(M, [sx * 0.085, ry * 1.3, -rxz * 0.93], [0.035, 0.05, 0.025], '#0d1a0d', { seg: 6, rings: 4 });
        sphere(M, [-0.11, ry * 1.65, -rxz * 0.47], [0.05, 0.025, 0.04], '#eaffea', { seg: 6, rings: 4, glow: true });
        return M;
    }

    function buildSkeleton(t) {
        const M = [], B = '#e6dfcc';
        beam(M, [-0.06, 0, 0], [-0.06, 0.32, 0], 0.045, B);
        beam(M, [0.06, 0, 0], [0.06, 0.32, 0], 0.045, B);
        box(M, [0, 0.3, 0], [0.2, 0.06, 0.09], B);
        beam(M, [0, 0.34, 0], [0, 0.62, 0], 0.04, B);
        for (let i = 0; i < 4; i++) box(M, [0, 0.4 + i * 0.05, -0.01], [0.22 - i * 0.025, 0.022, 0.13], B);
        box(M, [0, 0.6, 0], [0.28, 0.035, 0.06], B);
        beam(M, [-0.14, 0.6, 0], [-0.16, 0.4, -0.02], 0.035, B);
        const st = M.length, sw = 0.45 + 0.6 * Math.sin(t * 3);   // 揮劍
        beam(M, [0.14, 0.6, 0], [0.15, 0.4, 0], 0.035, B);
        box(M, [0.15, 0.36, 0], [0.025, 0.06, 0.025], '#6b4a1f');
        box(M, [0.15, 0.42, 0], [0.1, 0.02, 0.035], '#c9a227');
        box(M, [0.15, 0.44, 0], [0.03, 0.34, 0.012], '#c3ccd5');
        xform(M, st, rotX(sw, [0.14, 0.6, 0]));
        sphere(M, [0, 0.72, 0], [0.085, 0.085, 0.09], B, { seg: 10, rings: 7 });
        box(M, [0, 0.62, -0.02], [0.1, 0.045, 0.08], B);
        for (const sx of [-1, 1]) {
            sphere(M, [sx * 0.033, 0.73, -0.08], [0.022, 0.026, 0.012], '#111111', { seg: 6, rings: 4 });
            sphere(M, [sx * 0.033, 0.73, -0.09], [0.008, 0.008, 0.006], '#ff3b3b', { seg: 5, rings: 3, glow: true });
        }
        return M;
    }

    function buildBat(t) {
        const M = [], y = 0.42 + 0.03 * Math.sin(t * 3), C = '#4a2c58';
        sphere(M, [0, y, 0], [0.07, 0.09, 0.065], C, { seg: 8, rings: 6 });
        sphere(M, [0, y + 0.11, -0.01], [0.055, 0.05, 0.05], C, { seg: 8, rings: 6 });
        for (const s of [-1, 1]) {
            frustum(M, [s * 0.03, y + 0.14, -0.01], 0.02, 0, 0.06, C, { seg: 5 });
            sphere(M, [s * 0.022, y + 0.12, -0.054], [0.012, 0.012, 0.008], '#ff4040', { seg: 5, rings: 3, glow: true });
            const st = M.length;
            const w = [[0.05, 0.05], [0.3, 0.14], [0.42, 0.04], [0.34, 0], [0.28, -0.04], [0.2, 0], [0.13, -0.05], [0.06, -0.03]]
                .map(([x, yy]) => [s * x, y + yy, 0.01]);
            M.push(face(w, '#3b2346', [s * 0.2, y, 0.01], { two: true }));
            xform(M, st, rotZ(s * Math.sin(t * 12) * 0.8, [s * 0.05, y + 0.02, 0]));   // 拍翅膀
        }
        return M;
    }

    function buildGhost(t) {
        const M = [], y = 0.08 + 0.03 * Math.sin(t * 2), W = '#e8eeff', A = 0.82;
        frustum(M, [0, y, 0], 0.2, 0.16, 0.3, W, { seg: 12, alpha: A, noCap: true });
        sphere(M, [0, y + 0.3, 0], [0.16, 0.16, 0.16], W, { seg: 12, rings: 8, half: true, noCap: true, alpha: A });
        for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + t; frustum(M, [Math.cos(a) * 0.15, y + 0.005, Math.sin(a) * 0.15], 0.05, 0, -0.07, W, { seg: 5, alpha: A }); }
        for (const s of [-1, 1]) {
            sphere(M, [s * 0.06, y + 0.36, -0.14], [0.03, 0.045, 0.02], '#1b1f3a', { seg: 6, rings: 4 });
            sphere(M, [s * 0.22, y + 0.2 + 0.03 * Math.sin(t * 3 + s), 0], [0.05, 0.04, 0.04], W, { seg: 6, rings: 4, alpha: A });
        }
        sphere(M, [0, y + 0.25, -0.17], [0.03, 0.04, 0.015], '#1b1f3a', { seg: 6, rings: 4 });
        return M;
    }

    function buildEyeball(t) {
        const M = [], y = 0.4 + 0.03 * Math.sin(t * 2);
        for (let i = 0; i < 5; i++) {
            const a = i / 5 * TAU + 0.3; let p = [Math.cos(a) * 0.1, y - 0.14, Math.sin(a) * 0.1];
            for (let j = 1; j <= 4; j++) {
                const q = [Math.cos(a) * (0.1 + j * 0.02) + Math.sin(t * 3 + i + j) * 0.025, y - 0.14 - j * 0.06, Math.sin(a) * (0.1 + j * 0.02)];
                beam(M, p, q, 0.035 - j * 0.005, '#7a3d8f'); p = q;
            }
        }
        sphere(M, [0, y, 0], [0.2, 0.2, 0.2], '#f2ece6', { seg: 12, rings: 8 });
        const lx = Math.sin(t * 1.3) * 0.06, ly = Math.cos(t * 1.7) * 0.03;   // 眼珠轉動
        sphere(M, [lx, y + ly, -0.19], [0.08, 0.08, 0.03], '#2e86c1', { seg: 10, rings: 6 });
        sphere(M, [lx * 1.05, y + ly, -0.215], [0.04, 0.04, 0.012], '#050505', { seg: 8, rings: 4 });
        sphere(M, [lx - 0.02, y + ly + 0.02, -0.225], [0.012, 0.012, 0.006], '#ffffff', { seg: 5, rings: 3, glow: true });
        return M;
    }

    function buildMushroom(t) {
        const M = [], b = Math.abs(Math.sin(t * 4)) * 0.03;
        for (const s of [-1, 1]) sphere(M, [s * 0.07, 0.03, -0.02 + s * Math.sin(t * 8) * 0.02], [0.05, 0.03, 0.06], '#c8b28a', { seg: 6, rings: 4 });
        frustum(M, [0, 0.04 + b, 0], 0.12, 0.1, 0.28, '#efe2c4', { seg: 10 });
        for (const s of [-1, 1]) sphere(M, [s * 0.04, 0.2 + b, -0.112], [0.016, 0.024, 0.01], '#222222', { seg: 6, rings: 4 });
        sphere(M, [0, 0.3 + b, 0], [0.28, 0.2, 0.28], '#d8322a', { seg: 12, rings: 8, half: true, capCol: '#e9d7b0' });
        for (const [th, ph, r] of [[0.35, 1.9, 0.045], [0.8, 4.4, 0.04], [0.9, 1.0, 0.035], [0.65, 3.2, 0.03], [0.95, 5.6, 0.04], [0.2, 0.2, 0.03], [0.75, 2.4, 0.035]]) {
            sphere(M, [0.28 * Math.sin(th) * Math.cos(ph), 0.3 + b + 0.2 * Math.cos(th), 0.28 * Math.sin(th) * Math.sin(ph)], [r, r * 0.6, r], '#ffffff', { seg: 6, rings: 4 });
        }
        return M;
    }

    function buildGolem(t) {
        const M = [], S = '#7d7f86', D = '#6a6c73', step = Math.sin(t * 2.5);
        box(M, [-0.1, 0, 0], [0.12, 0.26, 0.13], D); box(M, [0.1, 0, 0], [0.12, 0.26, 0.13], D);
        box(M, [0, 0.25, 0], [0.42, 0.32, 0.25], S);
        box(M, [0, 0.57, -0.02], [0.18, 0.15, 0.16], '#878991');
        for (const s of [-1, 1]) {
            const st = M.length;
            box(M, [s * 0.28, 0.3, 0], [0.11, 0.28, 0.12], D);
            box(M, [s * 0.29, 0.2, 0], [0.15, 0.11, 0.15], '#5f6168');
            xform(M, st, rotX(s * step * 0.35 - 0.1, [s * 0.28, 0.55, 0]));
        }
        for (const s of [-1, 1]) box(M, [s * 0.045, 0.62, -0.105], [0.035, 0.022, 0.01], '#99ffff', { glow: true });
        const p = 0.5 + 0.5 * Math.sin(t * 4);
        box(M, [0, 0.4, -0.13], [0.07, 0.07, 0.01], [80 + 100 * p, 200 + 55 * p, 220 + 35 * p], { glow: true });
        return M;
    }

    function buildSpider(t) {
        const M = [];
        for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
            const up = Math.max(0, Math.sin(t * 8 + i * Math.PI / 2 + (s > 0 ? Math.PI : 0))) * 0.05;
            const hip = [s * 0.07, 0.17, -0.15 + i * 0.07], knee = [s * 0.22, 0.3 + up, -0.2 + i * 0.11], foot = [s * 0.34, up * 0.6, -0.3 + i * 0.18];
            beam(M, hip, knee, 0.028, '#262626'); beam(M, knee, foot, 0.022, '#262626');
        }
        sphere(M, [0, 0.2, 0.12], [0.17, 0.13, 0.2], '#2b2b2b', { seg: 10, rings: 7 });
        sphere(M, [0, 0.325, 0.12], [0.05, 0.012, 0.08], '#b91c1c', { seg: 8, rings: 4 });
        sphere(M, [0, 0.17, -0.12], [0.09, 0.08, 0.09], '#353535', { seg: 8, rings: 6 });
        for (const [x, y, r] of [[-0.03, 0.2, 0.018], [0.03, 0.2, 0.018], [-0.012, 0.225, 0.011], [0.012, 0.225, 0.011]])
            sphere(M, [x, y, -0.205], [r, r, r * 0.6], '#ff3030', { seg: 5, rings: 3, glow: true });
        beam(M, [-0.025, 0.13, -0.19], [-0.03, 0.08, -0.21], 0.014, '#dddddd');
        beam(M, [0.025, 0.13, -0.19], [0.03, 0.08, -0.21], 0.014, '#dddddd');
        return M;
    }

    // 火焰精靈：一團會跳動的火焰
    function buildFlame(t) {
        const M = [], y = 0.1 + 0.03 * Math.sin(t * 3);
        for (let i = 0; i < 7; i++) {
            const a = i / 7 * TAU + 0.4, h = 0.26 + 0.09 * Math.sin(t * 9 + i * 1.7);
            frustum(M, [Math.cos(a) * 0.09, y + 0.04, Math.sin(a) * 0.09], 0.07, 0, h, '#ff6a14', { seg: 5, glow: true });
        }
        for (let i = 0; i < 4; i++) {
            const a = i / 4 * TAU + t, h = 0.3 + 0.08 * Math.sin(t * 11 + i * 2.3);
            frustum(M, [Math.cos(a) * 0.04, y + 0.08, Math.sin(a) * 0.04], 0.05, 0, h, '#ffd23f', { seg: 5, glow: true });
        }
        sphere(M, [0, y + 0.12, 0], [0.12, 0.11, 0.12], '#ff8c1a', { seg: 10, rings: 6, glow: true });
        for (const s of [-1, 1]) sphere(M, [s * 0.045, y + 0.16, -0.11], [0.022, 0.03, 0.012], '#3a0a00', { seg: 6, rings: 4 });
        for (let i = 0; i < 5; i++) {   // 往上飄的火星
            const k = (t * 0.6 + i / 5) % 1, a = i * 2.1 + t * 0.5;
            box(M, [Math.cos(a) * 0.12, y + 0.25 + k * 0.35, Math.sin(a) * 0.12], [0.02, 0.02, 0.02], '#ffcf6b', { glow: true, alpha: Math.max(0.05, 1 - k) });
        }
        return M;
    }

    // 毒蛇：盤起身體，抬頭吐信
    function buildSnake(t) {
        const M = [], G1 = '#3f8f3a', G2 = '#2f6e2c';
        let last = null;
        for (let i = 0; i < 16; i++) {   // 盤繞的身體
            const a = i * 0.75, r = 0.18 - i * 0.006;
            const p = [Math.cos(a) * r, 0.05 + i * 0.012, Math.sin(a) * r + 0.04];
            sphere(M, p, [0.062 - i * 0.0012, 0.05, 0.062 - i * 0.0012], i % 2 ? G1 : G2, { seg: 7, rings: 5 });
            last = p;
        }
        const sway = Math.sin(t * 2) * 0.04;
        const head = [sway, 0.46, -0.1];
        for (let j = 1; j <= 5; j++) {   // 抬起的脖子
            const k = j / 6;
            const p = [last[0] + (head[0] - last[0]) * k, last[1] + (head[1] - last[1]) * Math.sin(k * Math.PI / 2), last[2] + (head[2] - last[2]) * k];
            sphere(M, p, [0.045, 0.045, 0.045], j % 2 ? G1 : G2, { seg: 7, rings: 5 });
        }
        sphere(M, head, [0.065, 0.045, 0.085], '#4aa043', { seg: 8, rings: 6 });
        for (const s of [-1, 1]) sphere(M, [head[0] + s * 0.038, head[1] + 0.02, head[2] - 0.045], [0.014, 0.014, 0.01], '#ffe14d', { seg: 5, rings: 3, glow: true });
        if (Math.sin(t * 5) > 0.2) {   // 吐信
            const tip = [head[0], head[1] - 0.01, head[2] - 0.17];
            beam(M, [head[0], head[1] - 0.01, head[2] - 0.08], tip, 0.01, '#e11d48', { glow: true });
            beam(M, tip, [tip[0] - 0.02, tip[1], tip[2] - 0.03], 0.008, '#e11d48', { glow: true });
            beam(M, tip, [tip[0] + 0.02, tip[1], tip[2] - 0.03], 0.008, '#e11d48', { glow: true });
        }
        return M;
    }

    Object.assign(M3D.MODELS, {
        slime:    { name: '史萊姆',   cat: 'monster', build: buildSlime,    face: 'player', sh: 0.28 },
        skeleton: { name: '骷髏兵',   cat: 'monster', build: buildSkeleton, face: 'player', sh: 0.2 },
        bat:      { name: '蝙蝠',     cat: 'monster', build: buildBat,      face: 'player', sh: 0.12 },
        ghost:    { name: '幽靈',     cat: 'monster', build: buildGhost,    face: 'player', sh: 0.18 },
        eyeball:  { name: '獨眼怪',   cat: 'monster', build: buildEyeball,  face: 'player', sh: 0.15 },
        mushroom: { name: '蘑菇怪',   cat: 'monster', build: buildMushroom, face: 'player', sh: 0.26 },
        golem:    { name: '石像魔像', cat: 'monster', build: buildGolem,    face: 'player', sh: 0.3 },
        spider:   { name: '巨型蜘蛛', cat: 'monster', build: buildSpider,   face: 'player', sh: 0.3 },
        flame:    { name: '火焰精靈', cat: 'monster', build: buildFlame,    face: 'player', sh: 0.15 },
        snake:    { name: '毒蛇',     cat: 'monster', build: buildSnake,    face: 'player', sh: 0.24 },
    });
})();
