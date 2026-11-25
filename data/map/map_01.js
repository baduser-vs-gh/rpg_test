// data/map/map_01.js
window.MAP_DATA = (function () {
  const WIDTH = 100;
  const HEIGHT = 100;

  // 圖塊編號定義 (對應 img/map/map_01.png 橫8 x 縱4 = 32格)
  // 地面層 (Ground): 0=草地, 1=花草地, 2=泥土路, 3=石板路, 4=淺水, 5=深水, 6=木橋, 7=農田
  // 物件層 (Object): -1=空, 8=松樹, 9=闊葉樹, 10=山壁, 11=村莊木屋牆, 12=村莊紅屋頂, 13=城鎮石牆, 14=城鎮藍屋頂, 15=木柵欄, 16=水井
  const PASSABLE_TILES = new Set([-1, 0, 1, 2, 3, 6, 7]);

  const ground1 = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0));
  const ground2 = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(-1)); // 預留第 2 地面層
  const object1 = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(-1));
  const object2 = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(-1)); // 預留第 2 物件層

  // 1. 外圍邊界山壁與北方山脈
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (x === 0 || x === WIDTH - 1 || y === 0 || y === HEIGHT - 1 || y < 12 + Math.sin(x * 0.2) * 3) {
        object1[y][x] = 10;
      } else if ((x * 7 + y * 13) % 19 === 0) {
        ground1[y][x] = 1;
      }
    }
  }

  // 2. 蜿蜒河流 (從東北流向西南)
  for (let y = 12; y < 99; y++) {
    const riverX = Math.floor(55 - (y - 12) * 0.25 + Math.sin(y * 0.15) * 4);
    for (let dx = -2; dx <= 2; dx++) {
      const rx = riverX + dx;
      if (rx > 1 && rx < WIDTH - 1) {
        object1[y][rx] = -1;
        ground1[y][rx] = Math.abs(dx) <= 1 ? 5 : 4;
      }
    }
  }

  // 3. 道路系統與跨河木橋
  for (let x = 15; x <= 85; x++) {
    if (ground1[45][x] === 4 || ground1[45][x] === 5) {
      ground1[45][x] = 6;
      ground1[46][x] = 6;
    } else {
      ground1[45][x] = 2;
    }
  }
  for (let y = 25; y <= 88; y++) {
    if (ground1[y][25] !== 4 && ground1[y][25] !== 5) ground1[y][25] = 2;
    if (ground1[y][72] !== 4 && ground1[y][72] !== 5) ground1[y][72] = 3;
  }

  // 4. 建造建築物輔助函式
  function buildHouse(startX, startY, w, h, roofTile, wallTile) {
    for (let y = startY; y < startY + h; y++) {
      for (let x = startX; x < startX + w; x++) {
        object1[y][x] = (y < startY + Math.ceil(h / 2)) ? roofTile : wallTile;
      }
    }
    const doorX = startX + Math.floor(w / 2);
    object1[startY + h - 1][doorX] = -1;
    ground1[startY + h - 1][doorX] = 3;
  }

  // 5. 西北方村莊 (x: 15~36, y: 24~42)
  buildHouse(17, 26, 5, 4, 12, 11);
  buildHouse(28, 26, 6, 4, 12, 11);
  buildHouse(17, 35, 5, 4, 12, 11);
  object1[37][26] = 16;
  for (let y = 35; y <= 40; y++) {
    for (let x = 29; x <= 35; x++) {
      ground1[y][x] = 7;
    }
  }

  // 6. 東南方城鎮 (x: 62~88, y: 48~78)
  for (let y = 48; y <= 78; y++) {
    for (let x = 62; x <= 88; x++) {
      ground1[y][x] = 3;
      if (y === 48 || y === 78 || x === 62 || x === 88) {
        object1[y][x] = 13;
      }
    }
  }
  object1[48][72] = -1; object1[48][73] = -1;
  object1[58][62] = -1; object1[59][62] = -1;
  for (let x = 50; x <= 62; x++) ground1[58][x] = 3;

  buildHouse(66, 52, 6, 5, 14, 13);
  buildHouse(78, 52, 7, 5, 14, 13);
  buildHouse(66, 65, 8, 5, 14, 13);
  buildHouse(78, 66, 6, 5, 14, 13);
  object1[61][73] = 16;

  // 7. 散落森林樹木
  for (let y = 14; y < 96; y++) {
    for (let x = 3; x < 97; x++) {
      if (ground1[y][x] === 0 && object1[y][x] === -1) {
        if (Math.abs(x - 25) <= 3 && Math.abs(y - 45) <= 3) continue;
        if ((x * 31 + y * 17) % 11 === 0) {
          object1[y][x] = (x + y) % 2 === 0 ? 8 : 9;
        }
      }
    }
  }

  return {
    id: 'map_01',
    name: '翠溪村與白石鎮',
    tileSize: 48,
    width: WIDTH,
    height: HEIGHT,
    bgm: 'bgm/map_01.mp3',
    spawn: { x: 25, y: 45 },
    passableTiles: PASSABLE_TILES,
    layers: {
      ground1: ground1,
      ground2: ground2,
      object1: object1,
      object2: object2
    }
  };
})();
