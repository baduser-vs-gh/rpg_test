// =====================================================================
// 迷你 3D 引擎：用多邊形拼模型，以畫家演算法畫在 Canvas 2D 上
//   模型座標：1 = 一格；y = 0 為地板；模型正面朝 -z
//   以一般 <script src> 載入（不是 ES module），雙擊 HTML 用 file:// 開也能用
//   提供全域物件 M3D；模型檔把模型登記到 M3D.MODELS
// =====================================================================
(function () {
    const TAU = Math.PI * 2;
    const hex = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
    const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const len = a => Math.hypot(a[0], a[1], a[2]);
    const norm = a => mul(a, 1 / (len(a) || 1));

    // 繞軸旋轉（p 為支點），回傳變換函式
    const rotX = (a, p = [0, 0, 0]) => { const c = Math.cos(a), s = Math.sin(a); return q => { const y = q[1] - p[1], z = q[2] - p[2]; return [q[0], p[1] + y * c - z * s, p[2] + y * s + z * c]; }; };
    const rotY = (a, p = [0, 0, 0]) => { const c = Math.cos(a), s = Math.sin(a); return q => { const x = q[0] - p[0], z = q[2] - p[2]; return [p[0] + x * c + z * s, q[1], p[2] - x * s + z * c]; }; };
    const rotZ = (a, p = [0, 0, 0]) => { const c = Math.cos(a), s = Math.sin(a); return q => { const x = q[0] - p[0], y = q[1] - p[1]; return [p[0] + x * c - y * s, p[1] + x * s + y * c, q[2]]; }; };

    // 一個面：頂點、顏色、所屬零件中心（用來判斷法向量朝外）
    //   o.two 雙面、o.alpha 透明度、o.glow 自體發光（不受光影影響）
    function face(pts, col, center, o = {}) {
        return { pts, col: typeof col === 'string' ? hex(col) : col, center,
                 two: !!o.two, alpha: o.alpha || 1, glow: !!o.glow };
    }
    // 對 start 之後加入的面套用變換（用來做關節旋轉）
    function xform(M, start, fn) {
        for (let i = start; i < M.length; i++) { M[i].pts = M[i].pts.map(fn); M[i].center = fn(M[i].center); }
    }
    // 方塊：[x, 底部 y, z]、[寬, 高, 深]
    function box(M, [x, y, z], [w, h, d], col, o) {
        const x0 = x - w / 2, x1 = x + w / 2, y1 = y + h, z0 = z - d / 2, z1 = z + d / 2;
        const P = [[x0, y, z0], [x1, y, z0], [x1, y1, z0], [x0, y1, z0], [x0, y, z1], [x1, y, z1], [x1, y1, z1], [x0, y1, z1]];
        const ctr = [x, y + h / 2, z];
        for (const f of [[0, 1, 2, 3], [5, 4, 7, 6], [4, 0, 3, 7], [1, 5, 6, 2], [3, 2, 6, 7], [4, 5, 1, 0]])
            M.push(face(f.map(i => P[i]), col, ctr, o));
    }
    // 兩點之間的方柱（骨頭、腳、劍）
    function beam(M, a, b, t, col, o) {
        const d = norm(sub(b, a));
        const u = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        const e1 = mul(norm(cross(d, u)), t / 2), e2 = mul(norm(cross(d, e1)), t / 2);
        const ring = p => [add(add(p, e1), e2), sub(add(p, e1), e2), sub(sub(p, e1), e2), add(sub(p, e1), e2)];
        const A = ring(a), B = ring(b), ctr = mul(add(a, b), 0.5);
        for (let i = 0; i < 4; i++) M.push(face([A[i], A[(i + 1) % 4], B[(i + 1) % 4], B[i]], col, ctr, o));
        M.push(face(A, col, ctr, o)); M.push(face(B, col, ctr, o));
    }
    // 球體／橢球（o.half: 只要上半球；o.capCol: 半球底面顏色）
    function sphere(M, [cx, cy, cz], [rx, ry, rz], col, o = {}) {
        const seg = o.seg || 10, rings = o.rings || 6, top = o.half ? rings / 2 : rings;
        const pt = (i, j) => { const th = j / rings * Math.PI, ph = i / seg * TAU;
            return [cx + rx * Math.sin(th) * Math.cos(ph), cy + ry * Math.cos(th), cz + rz * Math.sin(th) * Math.sin(ph)]; };
        for (let j = 0; j < top; j++) for (let i = 0; i < seg; i++) {
            const q = [pt(i, j), pt(i + 1, j), pt(i + 1, j + 1), pt(i, j + 1)];
            M.push(face(j === 0 ? [q[0], q[2], q[3]] : q, col, [cx, cy, cz], o));
        }
        if (o.half && !o.noCap) {
            const ring = []; for (let i = 0; i < seg; i++) ring.push(pt(i, top));
            M.push(face(ring, o.capCol || col, [cx, cy + ry * 0.3, cz], o));
        }
    }
    // 圓柱／圓錐（r1 = 0 為圓錐；h 為負時尖端朝下）
    function frustum(M, [cx, cy, cz], r0, r1, h, col, o = {}) {
        const seg = o.seg || 8, ctr = [cx, cy + h / 2, cz];
        const b = i => { const a = i / seg * TAU; return [cx + Math.cos(a) * r0, cy, cz + Math.sin(a) * r0]; };
        const t = i => { const a = i / seg * TAU; return [cx + Math.cos(a) * r1, cy + h, cz + Math.sin(a) * r1]; };
        for (let i = 0; i < seg; i++)
            M.push(face(r1 > 1e-4 ? [b(i), b(i + 1), t(i + 1), t(i)] : [b(i), b(i + 1), t(i)], col, ctr, o));
        if (!o.noCap) {
            if (r0 > 1e-4) M.push(face([...Array(seg)].map((_, i) => b(i)), col, ctr, o));
            if (r1 > 1e-4) M.push(face([...Array(seg)].map((_, i) => t(i)), col, ctr, o));
        }
    }

    // 光源：從玩家後上方照過來（相機座標）
    const LIGHT = norm([-0.35, 0.75, -0.55]);

    // 畫出模型
    //   toCam(p)  模型座標 → 相機座標 [X 右, Y 上, Z 前]
    //   proj(p)   相機座標 → 螢幕座標 [sx, sy]
    //   fogFn(z)  距離 → 亮度 (0~1)
    function drawFaces(ctx, M, toCam, proj, fogFn) {
        const list = [];
        for (const f of M) {
            const P = f.pts.map(toCam);
            if (P.some(p => p[2] < 0.05)) continue;
            const cen = [0, 0, 0];
            for (const p of P) { cen[0] += p[0]; cen[1] += p[1]; cen[2] += p[2]; }
            cen[0] /= P.length; cen[1] /= P.length; cen[2] /= P.length;
            let n = [0, 0, 0]; // Newell 法向量
            for (let i = 0; i < P.length; i++) {
                const a = P[i], b = P[(i + 1) % P.length];
                n[0] += (a[1] - b[1]) * (a[2] + b[2]); n[1] += (a[2] - b[2]) * (a[0] + b[0]); n[2] += (a[0] - b[0]) * (a[1] + b[1]);
            }
            const nl = len(n); if (nl < 1e-12) continue;
            n = mul(n, 1 / nl);
            if (dot(n, sub(cen, toCam(f.center))) < 0) n = mul(n, -1);
            const facing = dot(n, cen);
            if (!f.two && facing >= 0) continue;   // 背面不畫
            if (f.two && facing > 0) n = mul(n, -1);
            const light = f.glow ? 1 : 0.32 + 0.68 * Math.max(0, dot(n, LIGHT));
            list.push({ P, z: len(cen), f, light });
        }
        list.sort((a, b) => b.z - a.z);
        for (const it of list) {
            const f = it.f, fog = fogFn(it.z);
            const k = f.glow ? Math.sqrt(fog) : it.light * fog;
            const r = Math.min(255, f.col[0] * k) | 0, g = Math.min(255, f.col[1] * k) | 0, b = Math.min(255, f.col[2] * k) | 0;
            ctx.fillStyle = f.alpha < 1 ? `rgba(${r},${g},${b},${f.alpha.toFixed(2)})` : `rgb(${r},${g},${b})`;
            ctx.beginPath();
            it.P.forEach((p, i) => { const [sx, sy] = proj(p); i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy); });
            ctx.closePath(); ctx.fill();
            if (f.alpha >= 1) { ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.6; ctx.stroke(); } // 蓋掉面與面之間的細縫
        }
    }
    // 地上的圓形影子
    function drawShadow(ctx, toCam, proj, r, alpha) {
        const pts = [];
        for (let i = 0; i < 16; i++) {
            const a = i / 16 * TAU, p = toCam([Math.cos(a) * r, 0.004, Math.sin(a) * r]);
            if (p[2] < 0.05) return;
            pts.push(proj(p));
        }
        ctx.fillStyle = `rgba(0,0,0,${alpha.toFixed(3)})`;
        ctx.beginPath();
        pts.forEach(([sx, sy], i) => i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy));
        ctx.closePath(); ctx.fill();
    }

    window.M3D = {
        TAU, hex, add, sub, mul, dot, cross, len, norm,
        rotX, rotY, rotZ, face, xform, box, beam, sphere, frustum,
        drawFaces, drawShadow,
        // 模型登記處：{ id: { name, cat, build(t, state), face, sh } }
        //   cat：monster 怪物 / altar 祭壇 / item 寶物 / trap 機關
        //   face：player 面向玩家 / world 固定朝向 / spin 原地旋轉
        //   sh：影子半徑（0 = 不畫）
        MODELS: {},
    };
})();
