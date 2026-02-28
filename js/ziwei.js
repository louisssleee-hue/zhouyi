/**
 * ziwei.js - 紫微斗数排盘
 */

// 十四主星
const ZIWEI_STARS = [
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞',
  '天府', '太阴', '贪狼', '巨门', '天相', '天梁',
  '七杀', '破军'
];

// 十二宫位
const PALACES = [
  '命宫', '兄弟宫', '夫妻宫', '子女宫',
  '财帛宫', '疾厄宫', '迁移宫', '奴仆宫',
  '官禄宫', '田宅宫', '福德宫', '父母宫'
];

// 四化星
const SI_HUA = ['禄', '权', '忌', '科'];

/**
 * 紫微斗数排盘主函数
 */
function calcZiwei() {
  const year = parseInt(document.getElementById('birthYear').value);
  const month = parseInt(document.getElementById('birthMonth').value);
  const day = parseInt(document.getElementById('birthDay').value);
  const hour = parseInt(document.getElementById('birthHour').value);
  const gender = document.getElementById('gender').value;

  if (!year || year < 1900 || year > 2100) {
    alert('请输入有效年份（1900-2100）');
    return;
  }

  // 计算紫微斗数
  const result = calcZiweiChart(year, month, day, hour, gender);
  renderZiwei(result);
}

/**
 * 计算紫微斗数命盘
 */
function calcZiweiChart(year, month, day, hour, gender) {
  // 计算天干
  const stemIdx = ((year - 4) % 10 + 10) % 10;
  const branchIdx = ((year - 4) % 12 + 12) % 12;

  // 计算命宫位置（以生月和时辰定）
  const monthIdx = month - 1;
  const hourIdx = hour;

  // 命宫起例：月令起子时落宫
  // 简化：命宫 = (12 - (hourIdx + monthIdx) % 12) % 12
  const mingGongIdx = (12 - (hourIdx + monthIdx) % 12 + 12) % 12;

  // 计算身宫
  const shenGongIdx = (mingGongIdx + monthIdx) % 12;

  // 紫微星位置
  // 公式：紫微 = (year + month + day) % 14（简化）
  const ziweiIdx = (year + month + day + 14) % 14;

  // 构建十二宫
  const palaces = [];
  for (let i = 0; i < 12; i++) {
    palaces.push({
      name: PALACES[i],
      stars: [],
      gongIdx: i
    });
  }

  // 分配主星到各宫（简化版）
  const starPalaceMap = distributeStars(ziweiIdx, mingGongIdx, year, month, day);

  // 计算四化星
  const siHuaResult = calcSiHua(stemIdx, year);

  // 计算大限
  const daXian = calcDaXian(year, month, day, gender, mingGongIdx);

  return {
    year, month, day, hour, gender,
    stemIdx,
    mingGongIdx,
    shenGongIdx,
    ziweiIdx,
    starPalaceMap,
    siHuaResult,
    daXian,
    palaces
  };
}

/**
 * 分配十四主星到各宫
 */
function distributeStars(ziweiIdx, mingGongIdx, year, month, day) {
  const map = {};

  // 紫微星位置
  map[ziweiIdx] = ['紫微'];

  // 天机星：在紫微星前后两宫
  map[(ziweiIdx + 2) % 12] = map[(ziweiIdx + 2) % 12] || [];
  map[(ziweiIdx + 2) % 12].push('天机');

  // 太阳星
  map[(ziweiIdx + 4) % 12] = map[(ziweiIdx + 4) % 12] || [];
  map[(ziweiIdx + 4) % 12].push('太阳');

  // 武曲星
  map[(ziweiIdx + 6) % 12] = map[(ziweiIdx + 6) % 12] || [];
  map[(ziweiIdx + 6) % 12].push('武曲');

  // 天同星
  map[(ziweiIdx + 8) % 12] = map[(ziweiIdx + 8) % 12] || [];
  map[(ziweiIdx + 8) % 12].push('天同');

  // 廉贞星
  map[(ziweiIdx + 10) % 12] = map[(ziweiIdx + 10) % 12] || [];
  map[(ziweiIdx + 10) % 12].push('廉贞');

  // 天府星
  map[(ziweiIdx + 5) % 12] = map[(ziweiIdx + 5) % 12] || [];
  map[(ziweiIdx + 5) % 12].push('天府');

  // 太阴星
  map[(ziweiIdx + 3) % 12] = map[(ziweiIdx + 3) % 12] || [];
  map[(ziweiIdx + 3) % 12].push('太阴');

  // 贪狼星
  map[(ziweiIdx + 1) % 12] = map[(ziweiIdx + 1) % 12] || [];
  map[(ziweiIdx + 1) % 12].push('贪狼');

  // 巨门星
  map[(ziweiIdx + 7) % 12] = map[(ziweiIdx + 7) % 12] || [];
  map[(ziweiIdx + 7) % 12].push('巨门');

  // 天相星
  map[(ziweiIdx + 9) % 12] = map[(ziweiIdx + 9) % 12] || [];
  map[(ziweiIdx + 9) % 12].push('天相');

  // 天梁星
  map[(ziweiIdx + 11) % 12] = map[(ziweiIdx + 11) % 12] || [];
  map[(ziweiIdx + 11) % 12].push('天梁');

  // 七杀星
  map[(ziweiIdx + 4) % 12] = map[(ziweiIdx + 4) % 12] || [];
  map[(ziweiIdx + 4) % 12].push('七杀');

  // 破军星
  map[(ziweiIdx + 10) % 12] = map[(ziweiIdx + 10) % 12] || [];
  map[(ziweiIdx + 10) % 12].push('破军');

  return map;
}

/**
 * 计算四化星
 */
function calcSiHua(stemIdx, year) {
  // 四化星由年干决定
  // 甲廉破武阴，乙机梁紫同，丙阴同机巨，丁赤玉贪昌，戊日月左机，己武贪梁曲
  // 庚阳武阴同，辛巨阳曲昌，壬梁紫左武，癸破巨阴贪

  const siHuaMap = {
    0: { lu: '廉贞', quan: '破军', ji: '武曲', ke: '太阴' },  // 甲
    1: { lu: '天机', quan: '天梁', ji: '紫微', ke: '天同' },  // 乙
    2: { lu: '太阴', quan: '天同', ji: '天机', ke: '巨门' },  // 丙
    3: { lu: '天同', quan: '天机', ji: '巨门', ke: '太阳' },  // 丁
    4: { lu: '贪狼', quan: '太阳', ji: '左辅', ke: '天机' },  // 戊
    5: { lu: '武曲', quan: '贪狼', ji: '天梁', ke: '曲尺' },  // 己
    6: { lu: '太阳', quan: '武曲', ji: '太阴', ke: '天同' },  // 庚
    7: { lu: '巨门', quan: '太阳', ji: '曲尺', ke: '昌曲' },  // 辛
    8: { lu: '天梁', quan: '紫微', ji: '左辅', ke: '武曲' },  // 壬
    9: { lu: '破军', quan: '巨门', ji: '太阴', ke: '贪狼' }   // 癸
  };

  return siHuaMap[stemIdx] || { lu: '', quan: '', ji: '', ke: '' };
}

/**
 * 计算大限
 */
function calcDaXian(year, month, day, gender, mingGongIdx) {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  // 大限从命宫开始，每10年一宫
  const daxian = [];
  for (let i = 0; i < 8; i++) {
    const gongIdx = (mingGongIdx + i) % 12;
    const startAge = i * 10 + 1;
    const endAge = (i + 1) * 10;
    const yearStart = year + startAge - 1;
    const yearEnd = year + endAge - 1;

    daxian.push({
      index: i,
      gongIdx,
      gongName: PALACES[gongIdx],
      startAge,
      endAge,
      yearStart,
      yearEnd,
      isCurrent: age >= startAge && age <= endAge
    });
  }

  return daxian;
}

/**
 * 渲染紫微斗数命盘
 */
function renderZiwei(result) {
  const palaceGrid = document.getElementById('palaceGrid');
  if (!palaceGrid) return;

  // 渲染十二宫
  let html = '<div class="ziwei-palace-table"><table><thead><tr>';
  html += '<th>宫位</th><th>主星</th><th>四化</th><th>大限</th>';
  html += '</tr></thead><tbody>';

  for (let i = 0; i < 12; i++) {
    const stars = result.starPalaceMap[i] || [];
    const isMingGong = i === result.mingGongIdx;
    const isShenGong = i === result.shenGongIdx;

    html += `<tr class="${isMingGong ? 'highlight' : ''}">
      <td>${PALACES[i]}${isMingGong ? '(命)' : ''}${isShenGong ? '(身)' : ''}</td>
      <td>${stars.join(' ')}</td>
      <td>${getSihuaInPalace(result.siHuaResult, stars)}</td>
      <td>${getDaXianForPalace(result.daXian, i)}</td>
    </tr>`;
  }

  html += '</tbody></table></div>';
  palaceGrid.innerHTML = html;

  // 渲染十四主星
  const starGrid = document.getElementById('starGrid');
  if (starGrid) {
    const starDescriptions = {
      '紫微': { desc: '北斗星主，帝座，主贵气领导', level: '甲级' },
      '天机': { desc: '南斗星主，智慧，主机谋变化', level: '甲级' },
      '太阳': { desc: '中天星主，光明，主功名贵气', level: '甲级' },
      '武曲': { desc: '北斗星主，财星，主刚毅财富', level: '甲级' },
      '天同': { desc: '南斗星主，福星，主福禄享受', level: '甲级' },
      '廉贞': { desc: '北斗星主，囚星，主刚硬桃花', level: '甲级' },
      '天府': { desc: '南斗星主，府库，主财库稳重', level: '甲级' },
      '太阴': { desc: '中天星主，月亮，主温柔感情', level: '甲级' },
      '贪狼': { desc: '北斗星主，桃花，主欲望交际', level: '甲级' },
      '巨门': { desc: '北斗星主，暗星，主口舌钻研', level: '甲级' },
      '天相': { desc: '南斗星主，印星，主文书权贵', level: '甲级' },
      '天梁': { desc: '南斗星主，荫星，主庇护慈善', level: '甲级' },
      '七杀': { desc: '北斗星主，权星，主刚烈权威', level: '甲级' },
      '破军': { desc: '北斗星主，耗星，主破耗开创', level: '甲级' }
    };

    let starsHtml = '<div class="stars-container">';
    ZIWEI_STARS.forEach(star => {
      const info = starDescriptions[star];
      starsHtml += `<div class="star-item">
        <div class="star-name">${star}</div>
        <div class="star-level">${info.level}</div>
        <div class="star-desc">${info.desc}</div>
      </div>`;
    });
    starsHtml += '</div>';
    starGrid.innerHTML = starsHtml;
  }

  // 渲染四化星
  const sihuaGrid = document.getElementById('sihuaGrid');
  if (sihuaGrid) {
    const { lu, quan, ji, ke } = result.siHuaResult;
    sihuaGrid.innerHTML = `
      <div class="sihua-item"><span class="sihua-label">化禄</span><span class="sihua-star">${lu}</span></div>
      <div class="sihua-item"><span class="sihua-label">化权</span><span class="sihua-star">${quan}</span></div>
      <div class="sihua-item"><span class="sihua-label">化忌</span><span class="sihua-star">${ji}</span></div>
      <div class="sihua-item"><span class="sihua-label">化科</span><span class="sihua-star">${ke}</span></div>
    `;
  }

  // 渲染大限
  const daxianGrid = document.getElementById('daxianGrid');
  if (daxianGrid) {
    let dxHtml = '<div class="daxian-row">';
    result.daXian.forEach(dx => {
      dxHtml += `<div class="daxian-item ${dx.isCurrent ? 'current' : ''}">
        <div class="dx-age">${dx.startAge}-${dx.endAge}岁</div>
        <div class="dx-gong">${dx.gongName}</div>
      </div>`;
    });
    dxHtml += '</div>';
    daxianGrid.innerHTML = dxHtml;
  }

  document.getElementById('ziweiResult').style.display = 'block';
}

/**
 * 获取某宫的的四化星
 */
function getSihuaInPalace(sihua, stars) {
  const result = [];
  if (stars.includes(sihua.lu)) result.push('禄');
  if (stars.includes(sihua.quan)) result.push('权');
  if (stars.includes(sihua.ji)) result.push('忌');
  if (stars.includes(sihua.ke)) result.push('科');
  return result.join(' ');
}

/**
 * 获取某宫所在的大限
 */
function getDaXianForPalace(daXian, gongIdx) {
  const dx = daXian.find(d => d.gongIdx === gongIdx);
  return dx ? `${dx.startAge}-${dx.endAge}岁` : '—';
}
