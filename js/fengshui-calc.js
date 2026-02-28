/**
 * 风水计算模块
 * fengshui-calc.js
 *
 * 1. 命宅匹配计算器
 * 2. 九宫飞星流年计算
 */

// ===== 命卦计算 =====
/**
 * 计算命卦（八宅派）
 * 男命: (100 - 年尾数) % 9
 * 女命: (年尾数 + 5) % 9
 * @param {number} year 出生年份
 * @param {string} gender 性别 'm'|'f'
 * @returns {Object} 命卦信息
 */
function calcMingGua(year, gender) {
  const lastDigit = year % 10;
  let guaNum;

  if (gender === 'm') {
    guaNum = (100 - lastDigit) % 9;
    if (guaNum === 0) guaNum = 5; // 5男寄坤
  } else {
    guaNum = (lastDigit + 5) % 9;
    if (guaNum === 0) guaNum = 5; // 5女寄艮
  }

  const guaInfo = {
    1: { name: '坎卦', gua: '☵', type: '东四命', element: '水', dirs: ['北', '南', '东南', '东'] },
    2: { name: '坤卦', gua: '☷', type: '西四命', element: '土', dirs: ['西南', '东北', '西北', '西'] },
    3: { name: '震卦', gua: '☳', type: '东四命', element: '木', dirs: ['东', '东南', '北', '南'] },
    4: { name: '巽卦', gua: '☴', type: '东四命', element: '木', dirs: ['东南', '东', '南', '北'] },
    5: { name: '乾卦', gua: '☰', type: gender === 'm' ? '西四命' : '西四命', element: '金', dirs: ['西北', '西南', '西', '东北'] },
    6: { name: '乾卦', gua: '☰', type: '西四命', element: '金', dirs: ['西北', '西南', '西', '东北'] },
    7: { name: '兑卦', gua: '☱', type: '西四命', element: '金', dirs: ['西', '西北', '东北', '西南'] },
    8: { name: '艮卦', gua: '☶', type: '西四命', element: '土', dirs: ['东北', '西北', '西南', '西'] },
    9: { name: '离卦', gua: '☲', type: '东四命', element: '火', dirs: ['南', '北', '东', '东南'] }
  };

  const info = guaInfo[guaNum] || guaInfo[5];

  return {
    guaNum,
    gua: info.gua,
    name: info.name,
    type: info.type,
    element: info.element,
    luckyDirs: info.dirs.slice(0, 2),
    unluckyDirs: info.dirs.slice(2)
  };
}

// ===== 吉凶位计算 =====
/**
 * 计算四吉位和四凶位
 * @param {number} guaNum 命卦数
 * @returns {Object} 吉凶位
 */
function calcPositions(guaNum) {
  // 八宅吉凶位对应表
  const positions = {
    1: { // 坎
      lucky: ['伏位(北)', '天医(西南)', '生气(东)', '延年(东南)'],
      unlucky: ['五鬼(东北)', '六煞(西)', '祸害(西北)', '绝命(南)'],
      luckyDetail: {
        '伏位(北)': '主稳定、休息，适合卧室',
        '天医(西南)': '主健康、化解疾病',
        '生气(东)': '主生发、事业，适合大门',
        '延年(东南)': '主长寿、财运'
      },
      unluckyDetail: {
        '五鬼(东北)': '主阴滞、小人，需用铜化解',
        '六煞(西)': '主桃花劫、破财',
        '祸害(西北)': '主口舌、疾病',
        '绝命(南)': '主血光、意外，最凶'
      }
    },
    2: { // 坤
      lucky: ['伏位(西南)', '天医(北)', '生气(东北)', '延年(西)'],
      unlucky: ['五鬼(东)', '六煞(东南)', '祸害(南)', '绝命(西北)'],
      luckyDetail: {
        '伏位(西南)': '主稳定、坤位利女主人',
        '天医(北)': '主健康、化解疾病',
        '生气(东北)': '主生发、子孙运',
        '延年(西)': '主长寿、财运'
      },
      unluckyDetail: {
        '五鬼(东)': '主阴滞、小人',
        '六煞(东南)': '主桃花劫',
        '祸害(南)': '主口舌',
        '绝命(西北)': '主血光、意外'
      }
    },
    3: { // 震
      lucky: ['伏位(东)', '天医(西北)', '生气(东南)', '延年(北)'],
      unlucky: ['五鬼(西)', '六煞(西南)', '祸害(东北)', '绝命(南)'],
      luckyDetail: {
        '伏位(东)': '主稳定、长男位',
        '天医(西北)': '主健康',
        '生气(东南)': '主生发',
        '延年(北)': '主长寿'
      },
      unluckyDetail: {
        '五鬼(西)': '主阴滞',
        '六煞(西南)': '主桃花劫',
        '祸害(东北)': '主口舌',
        '绝命(南)': '主血光'
      }
    },
    4: { // 巽
      lucky: ['伏位(东南)', '天医(西)', '生气(北)', '延年(东)'],
      unlucky: ['五鬼(西北)', '六煞(南)', '祸害(西南)', '绝命(东北)'],
      luckyDetail: {
        '伏位(东南)': '主稳定、文昌位',
        '天医(西)': '主健康',
        '生气(北)': '主生发',
        '延年(东)': '主长寿'
      },
      unluckyDetail: {
        '五鬼(西北)': '主阴滞',
        '六煞(南)': '主桃花劫',
        '祸害(西南)': '主口舌',
        '绝命(东北)': '主血光'
      }
    },
    5: { // 乾/艮 (寄宫)
      lucky: ['伏位(西北)', '天医(东南)', '生气(北)', '延年(西南)'],
      unlucky: ['五鬼(南)', '六煞(东北)', '祸害(东)', '绝命(西)'],
      luckyDetail: {
        '伏位(西北)': '主稳定',
        '天医(东南)': '主健康',
        '生气(北)': '主生发',
        '延年(西南)': '主长寿'
      },
      unluckyDetail: {
        '五鬼(南)': '主阴滞',
        '六煞(东北)': '主桃花劫',
        '祸害(东)': '主口舌',
        '绝命(西)': '主血光'
      }
    },
    6: { // 乾
      lucky: ['伏位(西北)', '天医(东南)', '生气(北)', '延年(西南)'],
      unlucky: ['五鬼(南)', '六煞(东北)', '祸害(东)', '绝命(西)'],
      luckyDetail: {
        '伏位(西北)': '主稳定、父位',
        '天医(东南)': '主健康',
        '生气(北)': '主生发',
        '延年(西南)': '主长寿'
      },
      unluckyDetail: {
        '五鬼(南)': '主阴滞',
        '六煞(东北)': '主桃花劫',
        '祸害(东)': '主口舌',
        '绝命(西)': '主血光'
      }
    },
    7: { // 兑
      lucky: ['伏位(西)', '天医(东北)', '生气(西北)', '延年(西南)'],
      unlucky: ['五鬼(东南)', '六煞(东)', '祸害(北)', '绝命(南)'],
      luckyDetail: {
        '伏位(西)': '主稳定、少女位',
        '天医(东北)': '主健康',
        '生气(西北)': '主生发',
        '延年(西南)': '主长寿'
      },
      unluckyDetail: {
        '五鬼(东南)': '主阴滞',
        '六煞(东)': '主桃花劫',
        '祸害(北)': '主口舌',
        '绝命(南)': '主血光'
      }
    },
    8: { // 艮
      lucky: ['伏位(东北)', '天医(南)', '生气(西)', '延年(西北)'],
      unlucky: ['五鬼(西南)', '六煞(北)', '祸害(东南)', '绝命(东)'],
      luckyDetail: {
        '伏位(东北)': '主稳定、少男位',
        '天医(南)': '主健康',
        '生气(西)': '主生发',
        '延年(西北)': '主长寿'
      },
      unluckyDetail: {
        '五鬼(西南)': '主阴滞',
        '六煞(北)': '主桃花劫',
        '祸害(东南)': '主口舌',
        '绝命(东)': '主血光'
      }
    },
    9: { // 离
      lucky: ['伏位(南)', '天医(东北)', '生气(西)', '延年(西北)'],
      unlucky: ['五鬼(西北)', '六煞(东)', '祸害(东南)', '绝命(北)'],
      luckyDetail: {
        '伏位(南)': '主稳定、中女位',
        '天医(东北)': '主健康',
        '生气(西)': '主生发',
        '延年(西北)': '主长寿'
      },
      unluckyDetail: {
        '五鬼(西北)': '主阴滞',
        '六煞(东)': '主桃花劫',
        '祸害(东南)': '主口舌',
        '绝命(北)': '主血光'
      }
    }
  };

  return positions[guaNum] || positions[5];
}

// ===== 九宫飞星计算 =====
/**
 * 九星定义
 */
const FLYING_STARS = {
  1: { name: '一白贪狼', element: '水', color: '#5dade2', nature: '文昌', luck: '吉', desc: '主智慧、桃花、文职' },
  2: { name: '二黑巨门', element: '土', color: '#8b4513', nature: '病符', luck: '凶', desc: '主疾病、阴滞，需化解' },
  3: { name: '三碧禄存', element: '木', color: '#52b788', nature: '是非', luck: '凶', desc: '主口舌、争斗' },
  4: { name: '四绿文昌', element: '木', color: '#27ae60', nature: '文昌', luck: '吉', desc: '主学业、功名' },
  5: { name: '五黄廉贞', element: '土', color: '#f39c12', nature: '大煞', luck: '最凶', desc: '最忌动土，宜静不宜动' },
  6: { name: '六白武曲', element: '金', color: '#ecf0f1', nature: '偏财', luck: '吉', desc: '主偏财、权威' },
  7: { name: '七赤破军', element: '金', color: '#e74c3c', nature: '盗贼', luck: '凶', desc: '主破耗、防盗' },
  8: { name: '八白左辅', element: '土', color: '#d4ac0d', nature: '财星', luck: '大吉', desc: '主正财、置业' },
  9: { name: '九紫右弼', element: '火', color: '#c0392b', nature: '喜庆', luck: '吉', desc: '主喜庆、爱情' }
};

/**
 * 计算九宫飞星位置（流年）
 * 下元七运：1984-2003年，七赤入中
 * 下元八运：2004-2023年，八白入中
 * 下元九运：2024-2043年，九紫入中
 * @param {number} year 年份
 * @returns {Array} 九宫飞星数组（3x3）
 */
function calcFlyingStars(year) {
  // 确定入中星
  let centerStar;
  if (year >= 2024) {
    centerStar = 9; // 九紫
  } else if (year >= 2004) {
    centerStar = 8; // 八白
  } else {
    centerStar = 7; // 七赤
  }

  // 计算飞星位置（中宫为入中星）
  // 飞星规则：顺飞（阳）或逆飞（阴）
  // 九运为下元，用顺飞
  const palace = [];

  // 中宫
  palace.push({
    position: '中宫',
    row: 1, col: 1,
    star: centerStar,
    ...FLYING_STARS[centerStar]
  });

  // 飞星顺飞公式：坎一→坤二→震三→巽四→中五→乾六→兑七→艮八→离九
  // 从入中星开始，按顺序填入各宫
  const positions = [
    { pos: '坎', row: 2, col: 1 },
    { pos: '坤', row: 3, col: 0 },
    { pos: '震', row: 3, col: 1 },
    { pos: '巽', row: 3, col: 2 },
    { pos: '乾', row: 0, col: 2 },
    { pos: '兑', row: 0, col: 1 },
    { pos: '艮', row: 0, col: 0 },
    { pos: '离', row: 1, col: 2 }
  ];

  // 计算各宫飞星（顺飞）
  // 顺序：入中星 → 上一宫 → ... → 九宫
  let currentStar = centerStar;
  for (let i = 0; i < 8; i++) {
    // 顺飞：下一个星 = 当前星 + 1，超过9则回到1
    currentStar = currentStar >= 9 ? 1 : currentStar + 1;
    const p = positions[i];
    palace.push({
      position: p.pos,
      row: p.row,
      col: p.col,
      star: currentStar,
      ...FLYING_STARS[currentStar]
    });
  }

  return palace;
}

/**
 * 生成飞星宫格HTML
 * @param {number} year 年份
 * @returns {string} HTML字符串
 */
function renderFlyingStars(year) {
  const stars = calcFlyingStars(year);
  const currentYear = new Date().getFullYear();

  let html = '<div class="feixing-grid">';

  // 生成3x3宫格
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cell = stars.find(s => s.row === row && s.col === col);
      if (cell) {
        const isJixiong = cell.luck === '吉' || cell.luck === '大吉';
        const borderClass = isJixiong ? 'feixing-jixiong' : 'feixing-xiong';
        const isCurrentYear = cell.position === getStarPositionForYear(currentYear);

        html += `
          <div class="feixing-cell ${borderClass} ${isCurrentYear ? 'feixing-current' : ''}"
               onclick="showFeixingDetail('${cell.position}', ${cell.star})"
               style="cursor:pointer">
            <div class="feixing-pos">${cell.position}</div>
            <div class="feixing-num" style="color:${cell.color}">${cell.star}</div>
            <div class="feixing-name">${cell.name}</div>
            <div class="feixing-ele element-${cell.element}">${cell.element}</div>
          </div>
        `;
      }
    }
  }

  html += '</div>';
  return html;
}

/**
 * 获取当前年份飞星所在位置
 */
function getStarPositionForYear(year) {
  const stars = calcFlyingStars(year);
  // 找五黄位置或当年旺星
  return stars.find(s => s.star === 5)?.position || '中宫';
}

/**
 * 显示飞星详情
 */
function showFeixingDetail(position, starNum) {
  const star = FLYING_STARS[starNum];
  const detail = document.getElementById('feixingDetail');
  if (detail) {
    detail.innerHTML = `
      <div class="feixing-info">
        <h4>${position} · ${star.name}</h4>
        <p><strong>五行：</strong>${star.element}</p>
        <p><strong>性质：</strong>${star.nature}</p>
        <p><strong>吉凶：</strong><span style="color:${star.luck === '凶' || star.luck === '最凶' ? '#e74c3c' : '#52b788'}">${star.luck}</span></p>
        <p><strong>解读：</strong>${star.desc}</p>
        ${star.luck === '凶' || star.luck === '最凶' ? '<p><strong>化解：</strong>可摆放铜器或山海镇化解</p>' : ''}
      </div>
    `;
  }
}

// ===== 命宅匹配计算器主函数 =====
function calcMingZhai() {
  const year = parseInt(document.getElementById('fs-birth-year').value);
  const gender = document.getElementById('fs-gender').value;

  if (!year || year < 1900 || year > 2100) {
    alert('请输入有效出生年份');
    return;
  }

  // 计算命卦
  const mingGua = calcMingGua(year, gender);

  // 计算吉凶位
  const positions = calcPositions(mingGua.guaNum);

  // 渲染结果
  const result = document.getElementById('mingzhai-result');
  if (result) {
    result.innerHTML = `
      <div class="fs-result-section">
        <h4>命卦：${mingGua.gua} ${mingGua.name}</h4>
        <p class="fs-minggua-type">${mingGua.type} · ${mingGua.element}性</p>
      </div>

      <div class="fs-positions">
        <div class="fs-lucky">
          <h5>四吉位</h5>
          <ul>
            ${positions.lucky.map((pos, i) => `
              <li>
                <strong>${pos.split('(')[0]}</strong>
                <span>${positions.luckyDetail[pos] || ''}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="fs-unlucky">
          <h5>四凶位</h5>
          <ul>
            ${positions.unlucky.map((pos, i) => `
              <li>
                <strong>${pos.split('(')[0]}</strong>
                <span>${positions.unluckyDetail[pos] || ''}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>

      <div class="fs-match">
        <p>${mingGua.type === '东四命' ?
          '您属东四命，宜选择震宅、巽宅、坎宅、离宅（坐东/东南/北/南朝）。' :
          '您属西四命，宜选择乾宅、坤宅、兑宅、艮宅（坐西北/西南/西/东北朝）。'}</p>
      </div>
    `;
    result.style.display = 'block';
  }
}

// ===== 飞星流年计算器主函数 =====
function calcLiunian() {
  const year = parseInt(document.getElementById('fs-year').value) || new Date().getFullYear();

  const grid = document.getElementById('feixingGrid');
  if (grid) {
    grid.innerHTML = renderFlyingStars(year);
  }

  const yearLabel = document.getElementById('feixingYear');
  if (yearLabel) {
    yearLabel.textContent = year + '年';
  }
}

// 初始化
function initFengshui() {
  // 设置默认年份
  const yearInput = document.getElementById('fs-year');
  if (yearInput) {
    yearInput.value = new Date().getFullYear();
  }

  // 自动计算当前年飞星
  calcLiunian();
}
