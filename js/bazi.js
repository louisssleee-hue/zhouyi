/**
 * 八字排盘计算模块
 * bazi.js
 *
 * 精确节气八字计算实现：
 * 1. 24节气数据库与计算
 * 2. 基于节气的月柱计算
 * 3. 基于立春的年柱计算
 * 4. 精确大运起运计算
 */

// ===== 24节气定义 =====
const SOLAR_TERMS = [
  '小寒', '大寒', '立春', '雨水', '惊蛰', '春分',
  '清明', '谷雨', '立夏', '小满', '芒种', '夏至',
  '小暑', '大暑', '立秋', '处暑', '白露', '秋分',
  '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'
];

// 节气对应月令 index（0=正月，11=腊月）
const TERM_MONTH_INDEX = {
  '立春': 0, '雨水': 0, '惊蛰': 1, '春分': 1,
  '清明': 2, '谷雨': 2, '立夏': 3, '小满': 3,
  '芒种': 4, '夏至': 4, '小暑': 5, '大暑': 5,
  '立秋': 6, '处暑': 6, '白露': 7, '秋分': 7,
  '寒露': 8, '霜降': 8, '立冬': 9, '小雪': 9,
  '大雪': 10, '冬至': 10, '小寒': 11, '大寒': 11
};

// ===== 精确节气计算 =====
/**
 * 计算给定年份的精确节气时间
 * 使用蔡勒公式的改进算法计算二十四节气
 * @param {number} year 年份
 * @returns {Object} 节气日期对象
 */
function getSolarTerms(year) {
  // 使用天文公式计算节气（近似算法）
  // 节气对应太阳黄经 0°, 15°, 30°, ... 345°
  const result = {};

  // 计算元旦到目标节气的天数
  function getDaysFromNewYear(y, termIndex) {
    // 已知基准：2000年小寒 1月5日 15:00 (儒略日 2451550)
    // 使用线性拟合 + 修正
    const y2000 = y - 2000;
    const base = {
      0: { month: 1, day: 5, hour: 15, minute: 0 },   // 小寒
      1: { month: 1, day: 20, hour: 9, minute: 0 },   // 大寒
      2: { month: 2, day: 4, hour: 3, minute: 14 },   // 立春
      3: { month: 2, day: 19, hour: 0, minute: 29 },   // 雨水
      4: { month: 3, day: 5, hour: 23, minute: 29 },   // 惊蛰
      5: { month: 3, day: 20, hour: 23, minute: 34 }, // 春分
      6: { month: 4, day: 4, hour: 19, minute: 42 },  // 清明
      7: { month: 4, day: 20, hour: 2, minute: 20 },  // 谷雨
      8: { month: 5, day: 5, hour: 15, minute: 32 },  // 立夏
      9: { month: 5, day: 21, hour: 3, minute: 43 },  // 小满
      10: { month: 6, day: 5, hour: 12, minute: 32 }, // 芒种
      11: { month: 6, day: 21, hour: 7, minute: 0 },   // 夏至
      12: { month: 7, day: 7, hour: 5, minute: 5 },    // 小暑
      13: { month: 7, day: 22, hour: 22, minute: 30 }, // 大暑
      14: { month: 8, day: 7, hour: 15, minute: 39 },  // 立秋
      15: { month: 8, day: 23, hour: 4, minute: 34 },  // 处暑
      16: { month: 9, day: 7, hour: 12, minute: 8 },   // 白露
      17: { month: 9, day: 23, hour: 3, minute: 55 },  // 秋分
      18: { month: 10, day: 8, hour: 9, minute: 21 },  // 寒露
      19: { month: 10, day: 23, hour: 4, minute: 15 }, // 霜降
      20: { month: 11, day: 7, hour: 2, minute: 20 }, // 立冬
      21: { month: 11, day: 22, hour: 4, minute: 36 }, // 小雪
      22: { month: 12, day: 7, hour: 1, minute: 10 }, // 大雪
      23: { month: 12, day: 22, hour: 0, minute: 28 }, // 冬至
    };

    // 年份修正系数（每一年偏差约0.0002天）
    const yearCorrection = y2000 * 0.0002;
    const termData = base[termIndex];

    // 闰年调整（用于日期计算）
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);

    // 简化计算：基准日期 + 年份偏移
    let dayOffset = y2000 * 0.2422 + yearCorrection;

    // 各节气具体修正（经验值）
    const termOffsets = [
      5.59, 20.12, 3.87, 19.83, 5.63, 20.65,
      5.60, 20.88, 6.39, 21.37, 5.96, 21.95,
      7.93, 23.14, 7.50, 23.04, 8.69, 23.42,
      8.64, 23.96, 7.86, 22.60, 7.18, 21.94
    ];

    dayOffset += termOffsets[termIndex];

    // 计算精确日期时间
    const monthDays = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let day = Math.floor(termData.day + dayOffset);
    let month = termData.month;
    let hour = termData.hour;
    let minute = termData.minute;

    // 跨月调整
    while (day > monthDays[month - 1]) {
      day -= monthDays[month - 1];
      month++;
      if (month > 12) {
        month = 1;
        // 年份进位需要在外部处理
      }
    }

    return { month, day, hour, minute };
  }

  const termNames = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
                     '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑',
                     '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'];

  for (let i = 0; i < 24; i++) {
    let { month, day, hour, minute } = getDaysFromNewYear(year, i);

    // 处理跨年情况（如12月节气在下一年）
    if (month > 12) {
      month -= 12;
      result[termNames[i]] = { month, day, hour, minute, year: year + 1 };
    } else {
      result[termNames[i]] = { month, day, hour, minute, year };
    }
  }

  return result;
}

/**
 * 获取指定日期前后的节气
 * @param {number} year 年
 * @param {number} month 月
 * @param {number} day 日
 * @returns {Object} { prevTerm: 节气名, prevDate: 日期, nextTerm: 节气名, nextDate: 日期 }
 */
function getNearestSolarTerm(year, month, day) {
  const terms = getSolarTerms(year);
  const termNames = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
                     '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑',
                     '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'];

  // 转换日期为可比较数字
  const dateNum = year * 10000 + month * 100 + day;

  let prevTerm = null, prevDate = null;
  let nextTerm = null, nextDate = null;

  // 检查是否在去年节气表中
  const prevYearTerms = getSolarTerms(year - 1);
  const lastTerms = ['大雪', '冬至'];
  for (const t of lastTerms) {
    const td = prevYearTerms[t];
    if (td) {
      const tdNum = (td.year || year - 1) * 10000 + td.month * 100 + td.day;
      if (tdNum <= dateNum) {
        prevTerm = t;
        prevDate = td;
      }
    }
  }

  // 查找当年节气
  for (let i = 0; i < termNames.length; i++) {
    const t = termNames[i];
    const td = terms[t];
    if (!td) continue;

    const tdNum = td.year * 10000 + td.month * 100 + td.day;

    if (tdNum <= dateNum) {
      prevTerm = t;
      prevDate = td;
    } else if (!nextTerm) {
      nextTerm = t;
      nextDate = td;
      break;
    }
  }

  // 如果没找到明年的，需要查明年
  if (!nextTerm) {
    const nextYearTerms = getSolarTerms(year + 1);
    const firstTerms = ['小寒', '大寒'];
    for (const t of firstTerms) {
      const td = nextYearTerms[t];
      if (td) {
        nextTerm = t;
        nextDate = td;
        break;
      }
    }
  }

  return { prevTerm, prevDate, nextTerm, nextDate };
}

/**
 * 判断日期是否在节气后，计算月柱
 * @param {number} year 年
 * @param {number} month 月
 * @param {number} day 日
 * @param {number} hour 小时
 * @param {number} minute 分钟
 * @returns {Object} { monthStem, monthBranch, monthName }
 */
function getMonthFromSolarTerm(year, month, day, hour, minute) {
  const { prevTerm, nextTerm } = getNearestSolarTerm(year, month, day);

  // 确定当前节气（月令以节为界）
  // 节气顺序：立春、雨水、惊蛰、春分、清明、谷雨、立夏、小满、芒种、夏至、小暑、大暑、
  //          立秋、处暑、白露、秋分、寒露、霜降、立冬、小雪、大雪、冬至、小寒、大寒

  const jieTerms = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑',
                   '立秋', '白露', '寒露', '立冬', '大雪', '小寒'];

  // 确定月令 - 找最近的"节"来判断
  let monthIndex = 0;

  // 简化逻辑：直接根据prevTerm判断
  if (prevTerm === '立春') monthIndex = 0;      // 寅月
  else if (prevTerm === '惊蛰') monthIndex = 1; // 卯月
  else if (prevTerm === '清明') monthIndex = 2;  // 辰月
  else if (prevTerm === '立夏') monthIndex = 3;  // 巳月
  else if (prevTerm === '芒种') monthIndex = 4;  // 午月
  else if (prevTerm === '小暑') monthIndex = 5;  // 未月
  else if (prevTerm === '立秋') monthIndex = 6;  // 申月
  else if (prevTerm === '白露') monthIndex = 7;  // 酉月
  else if (prevTerm === '寒露') monthIndex = 8;  // 戌月
  else if (prevTerm === '立冬') monthIndex = 9;  // 亥月
  else if (prevTerm === '大雪') monthIndex = 10; // 子月
  else if (prevTerm === '小寒') monthIndex = 11; // 丑月
  else {
    // 如果 prevTerm 是中气（雨水、春分等），需要向前找最近的节
    // 雨水→立春后，雨水时仍是寅月
    if (prevTerm === '雨水' || prevTerm === '春分') monthIndex = 0;
    else if (prevTerm === '谷雨') monthIndex = 1;
    else if (prevTerm === '小满') monthIndex = 3;
    else if (prevTerm === '夏至') monthIndex = 4;
    else if (prevTerm === '大暑') monthIndex = 5;
    else if (prevTerm === '处暑') monthIndex = 6;
    else if (prevTerm === '秋分') monthIndex = 7;
    else if (prevTerm === '霜降') monthIndex = 8;
    else if (prevTerm === '小雪') monthIndex = 9;
    else if (prevTerm === '冬至') monthIndex = 10;
    else if (prevTerm === '大寒') monthIndex = 11;
    else monthIndex = Math.floor((month - 1) / 2); // 默认
  }

  // 五虎遁年起月法 - 使用输入的年份来计算月柱
  // 年柱以立春为界，但月柱的五虎遁使用输入的年份
  const yearStemIdx = ((year - 4) % 10 + 10) % 10;
  // 甲己年→丙寅(2)，乙庚年→戊寅(4)，丙辛年→庚寅(6)，丁壬年→壬寅(8)，戊癸年→甲寅(0)
  const monthStemBase = [2, 4, 6, 8, 0, 2, 4, 6, 8, 0][yearStemIdx];

  const monthStemIdx = (monthStemBase + monthIndex) % 10;
  const monthBranchIdx = monthIndex; // 寅月=0
  const monthBranch = ['寅','卯','辰','巳','午','未','申','酉','戌','亥','子','丑'][monthBranchIdx];

  return {
    monthStem: STEMS[monthStemIdx],
    monthBranch,
    monthStemIdx,
    monthBranchIdx,
    termName: prevTerm || '未知'
  };
}

/**
 * 计算十二长生状态
 * @param {string} dayStem 日主天干
 * @param {string} targetStem 目标天干
 * @returns {string} 长生状态
 */
function getChangSheng(dayStem, targetStem) {
  const targetIdx = STEMS.indexOf(targetStem);
  // 天干对应的长生起算点：甲亥乙午丙戊寅...
  const startPoints = {
    '甲': 10, '乙': 6, '丙': 10, '丁': 6, '戊': 10,
    '己': 6, '庚': 10, '辛': 6, '壬': 4, '癸': 4
  };
  const start = startPoints[dayStem] || 0;
  const diff = (targetIdx - start + 12) % 12;
  return CHANG_SHENG[diff];
}

/**
 * 计算地支的十二长生（用于星运行）
 * @param {string} dayStem 日主天干
 * @param {string} branch 地支
 * @returns {string} 长生状态
 */
function getBranchChangSheng(dayStem, branch) {
  // 地支对应的天干：子宫癸水...
  const branchStems = {
    '子': '癸', '丑': '己', '寅': '甲', '卯': '乙', '辰': '戊', '巳': '丙',
    '午': '丁', '未': '己', '申': '庚', '酉': '辛', '戌': '戊', '亥': '壬'
  };
  const stem = branchStems[branch];
  return getChangSheng(dayStem, stem);
}

/**
 * 计算空亡
 * @param {string} stem 天干
 * @param {string} branch 地支
 * @returns {Array} 空亡地支数组
 */
function getKongWang(stem, branch) {
  const stemIdx = STEMS.indexOf(stem);
  const branchIdx = BRANCHES.indexOf(branch);
  // 计算旬首
  const xunshouIdx = (stemIdx * 12 + branchIdx) % 60;
  const xunshouStemIdx = Math.floor(xunshouIdx / 10);
  const xunshouBranchIdx = xunshouStemIdx * 10 % 12;
  const xunshou = STEMS[xunshouStemIdx] + BRANCHES[xunshouBranchIdx];
  return KONGWANG_MAP[xunshou] || ['—', '—'];
}

/**
 * 计算纳音五行
 * @param {string} stem 天干
 * @param {string} branch 地支
 * @returns {string} 纳音五行
 */
function getNayin(stem, branch) {
  return NAYIN_60[stem + branch] || '—';
}

/**
 * 计算天干对日主的十神关系
 * @param {string} dayStem 日主天干
 * @param {string} targetStem 目标天干
 * @returns {string} 十神名称
 */
function getTenGod(dayStem, targetStem) {
  return SHISHEN_MAP[dayStem]?.[targetStem] || '—';
}

/**
 * 计算藏干的十神（对日主）
 * @param {string} dayStem 日主天干
 * @param {Array} hiddenStems 藏干数组
 * @returns {Array} [{stem, shishen, element}]
 */
function getHiddenStemShishen(dayStem, hiddenStems) {
  return hiddenStems.map(stem => ({
    stem,
    shishen: getTenGod(dayStem, stem),
    element: STEM_ELEMENTS[STEMS.indexOf(stem)]
  }));
}

/**
 * 计算每柱包含的神煞
 * @param {Object} pillar 柱对象
 * @returns {Array} 神煞数组
 */
function getPillarShensha(pillar) {
  const result = [];
  const { stem, branch } = pillar;

  // 天乙贵人
  const guiRens = {
    '甲': ['丑', '未'], '乙': ['子', '申'], '丙': ['亥', '酉'],
    '丁': ['酉', '未'], '戊': ['丑', '未'], '己': ['子', '申'],
    '庚': ['丑', '未'], '辛': ['寅', '午'], '壬': ['卯', '巳'], '癸': ['卯', '巳']
  };
  if (guiRens[stem]?.includes(branch)) {
    result.push({ name: '天乙贵人', type: '吉' });
  }

  // 文昌星
  const wenChangs = {
    '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申',
    '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯'
  };
  if (wenChangs[stem] === branch) {
    result.push({ name: '文昌', type: '吉' });
  }

  // 驿马
  const yiMas = { '申': '寅', '巳': '亥', '寅': '申', '亥': '巳' };
  if (yiMas[branch]) {
    result.push({ name: '驿马', type: '动' });
  }

  // 桃花
  const taoHua = { '卯': '子', '午': '卯', '酉': '午', '子': '卯' };
  if (taoHua[branch] === branch) {
    result.push({ name: '桃花', type: '情' });
  }

  // 华盖
  if (['辰', '戌'].includes(branch) && ['辛', '戊', '壬'].includes(stem)) {
    result.push({ name: '华盖', type: '艺' });
  }

  // 羊刃（禄前一位）
  const yangRen = { '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳', '戊': '午',
    '己': '巳', '庚': '酉', '辛': '申', '壬': '子', '癸': '亥' };
  if (yangRen[stem] === branch) {
    result.push({ name: '羊刃', type: '凶' });
  }

  return result;
}

/**
 * 计算精确年柱（以立春为界）
 * @param {number} year 年
 * @param {number} month 月
 * @param {number} day 日
 * @returns {Object} { yearStem, yearBranch, zodiac }
 */
function getYearFromSolarTerm(year, month, day) {
  // 立春时间
  const terms = getSolarTerms(year);
  const lichun = terms['立春'];

  if (!lichun) {
    // 备用：2月4日左右
    return getYearSimplified(year);
  }

  // 如果出生日在立春之前，用上一年
  const birthDate = year * 10000 + month * 100 + day;
  const lichunDate = lichun.year * 10000 + lichun.month * 100 + lichun.day;

  const actualYear = birthDate < lichunDate ? year - 1 : year;
  const yearStemIdx = ((actualYear - 4) % 10 + 10) % 10;
  const yearBranchIdx = ((actualYear - 4) % 12 + 12) % 12;

  return {
    yearStem: STEMS[yearStemIdx],
    yearBranch: BRANCHES[yearBranchIdx],
    yearStemIdx,
    yearBranchIdx,
    zodiac: ZODIAC[yearBranchIdx],
    actualYear
  };
}

// 备用简化年柱计算
function getYearSimplified(year) {
  const yearStemIdx = ((year - 4) % 10 + 10) % 10;
  const yearBranchIdx = ((year - 4) % 12 + 12) % 12;
  return {
    yearStem: STEMS[yearStemIdx],
    yearBranch: BRANCHES[yearBranchIdx],
    yearStemIdx,
    yearBranchIdx,
    zodiac: ZODIAC[yearBranchIdx],
    actualYear: year
  };
}

/**
 * 计算大运起运年龄（精确）
 * @param {number} year 年
 * @param {number} month 月
 * @param {number} day 日
 * @param {number} hour 时
 * @param {number} minute 分
 * @param {string} gender 性别
 * @param {number} yearStemIdx 年干索引
 * @returns {Object} { startAge, direction, details }
 */
function calcDaYunPrecise(year, month, day, hour, minute, gender, yearStemIdx) {
  const { prevTerm, prevDate, nextTerm, nextDate } = getNearestSolarTerm(year, month, day);

  if (!prevDate || !nextDate) {
    return { startAge: 3, direction: '顺行', details: '节气计算异常' };
  }

  // 计算出生到下一节气的时间差（天数）
  const birthDate = new Date(year, month - 1, day, hour, minute);
  const nextDateTime = new Date(nextDate.year || year, nextDate.month - 1, nextDate.day, nextDate.hour, nextDate.minute);

  let daysToNext = (nextDateTime - birthDate) / (1000 * 60 * 60 * 24);
  if (daysToNext < 0) daysToNext += 365;

  // 计算出生到上一节气的时间差
  const prevDateTime = new Date(prevDate.year || year, prevDate.month - 1, prevDate.day, prevDate.hour, prevDate.minute);
  let daysFromPrev = (birthDate - prevDateTime) / (1000 * 60 * 60 * 24);
  if (daysFromPrev < 0) daysFromPrev += 365;

  // 阴阳年判断
  const isYangYear = yearStemIdx % 2 === 0;
  const isMale = gender === 'm';

  // 大运方向：阳男阴女顺行，阴男阳女逆行
  let forward = (isYangYear && isMale) || (!isYangYear && !isMale);
  let startAge, direction;

  if (forward) {
    // 顺行：往下一节气计算
    // 起运年龄 = 出生到下一节气天数 / 3（换算为岁）
    startAge = Math.round(daysToNext / 3 * 10) / 10;
    direction = '顺行';
  } else {
    // 逆行：往上一节气计算
    startAge = Math.round(daysFromPrev / 3 * 10) / 10;
    direction = '逆行';
  }

  // 确保最小起运年龄
  if (startAge < 1) startAge = 1;
  if (startAge > 20) startAge = 20;

  return {
    startAge: Math.floor(startAge),
    direction,
    daysToNext: Math.round(daysToNext),
    daysFromPrev: Math.round(daysFromPrev),
    prevTerm,
    nextTerm
  };
}

// ══════════════════════════════════════════════
// 节气精确计算（天文算法，支持1900-2100年）
// 基于 Jean Meeus《天文算法》第27章
// ══════════════════════════════════════════════

function calcSolarTerm(year, termIndex) {
  // termIndex: 0=小寒,1=大寒,2=立春,3=雨水...23=冬至
  // 我们需要的12个"节"对应index：
  // 立春=2, 惊蛰=4, 清明=6, 立夏=8, 芒种=10, 小暑=12
  // 立秋=14, 白露=16, 寒露=18, 立冬=20, 大雪=22, 小寒=0(次年)

  const k = year + termIndex / 24 - 2000;
  const JDE0 = 2451545.0 + 365.25 * k; // 粗略JDE

  // 太阳黄经对应节气（每15度一个节气）
  const ANGLES = [285,300,315,330,345,0,15,30,45,60,75,90,
                  105,120,135,150,165,180,195,210,225,240,255,270];
  const targetAngle = ANGLES[termIndex];

  // 简化太阳黄经计算（精度约10分钟，足够判断日柱）
  function sunLongitude(jde) {
    const T = (jde - 2451545.0) / 36525;
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M  = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const Mrad = M * Math.PI / 180;
    const C = (1.914602 - 0.004817*T - 0.000014*T*T) * Math.sin(Mrad)
            + (0.019993 - 0.000101*T) * Math.sin(2*Mrad)
            + 0.000289 * Math.sin(3*Mrad);
    const sunLon = L0 + C;
    const omega = 125.04 - 1934.136 * T;
    const apparent = sunLon - 0.00569 - 0.00478 * Math.sin(omega * Math.PI/180);
    return ((apparent % 360) + 360) % 360;
  }

  // 牛顿迭代法找精确时刻
  let jde = JDE0;
  for (let i = 0; i < 50; i++) {
    let lon = sunLongitude(jde);
    let diff = targetAngle - lon;
    // 处理跨0度
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    if (Math.abs(diff) < 0.0001) break;
    jde += diff / 360 * 365.25;
  }

  // JDE转北京时间（UTC+8）
  const jd = jde + 8/24; // 加8小时转北京时间
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let A;
  if (z < 2299161) {
    A = z;
  } else {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C2 = Math.floor((B - 122.1) / 365.25);
  const D2 = Math.floor(365.25 * C2);
  const E  = Math.floor((B - D2) / 30.6001);

  const day   = B - D2 - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const yr    = month > 2 ? C2 - 4716 : C2 - 4715;
  const hour  = f * 24;

  return { year: yr, month, day, hour: Math.floor(hour), minute: Math.floor((hour % 1) * 60) };
}

// 12个"节"的termIndex（非"气"）
const JIEQI_INDEXES = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 0];
// 对应：立春,惊蛰,清明,立夏,芒种,小暑,立秋,白露,寒露,立冬,大雪,小寒

// 缓存，避免重复计算
const _jieqiCache = {};

function getJieqi(year) {
  if (_jieqiCache[year]) return _jieqiCache[year];
  const result = [];
  for (let i = 0; i < 11; i++) {
    // 前11个节在当年
    result.push(calcSolarTerm(year, JIEQI_INDEXES[i]));
  }
  // 小寒在次年1月，用 year+1 计算
  result.push(calcSolarTerm(year + 1, JIEQI_INDEXES[11]));
  _jieqiCache[year] = result;
  return result;
}

// 获取月支index（精确到时辰）
function getMonthBranchIdx(year, month, day, hour) {
  const terms = getJieqi(year);
  const JIEQI_BRANCH = [2,3,4,5,6,7,8,9,10,11,0,1];

  // 立春是寅月的开始
  const lichun = terms[0]; // 立春

  // 如果在立春之前，还是丑月
  if (month < lichun.month || (month === lichun.month && day < lichun.day)) {
    return JIEQI_BRANCH[11]; // 小寒对应丑月
  }

  // 找最近一个已过的节气（精确到分钟）
  let lastIdx = 0;
  for (let i = 0; i < 12; i++) {
    const t = terms[i];
    // 判断是否过了这个节气
    const isAfter =
      month > t.month ||
      (month === t.month && day > t.day) ||
      (month === t.month && day === t.day &&
       hour !== undefined && hour * 60 >= t.hour * 60 + t.minute);
    if (isAfter) {
      lastIdx = i;
    } else {
      break;
    }
  }
  return JIEQI_BRANCH[lastIdx];
}

// 时辰对应起始小时
const HOUR_START = [23,1,3,5,7,9,11,13,15,17,19,21];
// 子=23, 丑=1, 寅=3, 卯=5, 辰=7, 巳=9, 午=11, 未=13, 申=15, 酉=17, 戌=19, 亥=21

// 获取年柱（精确到时辰）
function getYearStemBranch(year, month, day, hourBranchIdx) {
  const terms = getJieqi(year);
  const lichun = terms[0]; // { year, month, day, hour, minute }

  // 计算出生时刻的分钟数
  let birthMinute = hourBranchIdx !== undefined ? HOUR_START[hourBranchIdx] * 60 : 0;

  let y = year;
  // 判断是否在立春之前出生
  const lichunMinute = lichun.hour * 60 + lichun.minute;

  const bornBefore =
    month < lichun.month ||
    (month === lichun.month && day < lichun.day) ||
    (month === lichun.month && day === lichun.day &&
     hourBranchIdx !== undefined && birthMinute < lichunMinute);

  if (bornBefore) y = year - 1;

  const stemIdx   = ((y - 4) % 10 + 10) % 10;
  const branchIdx = ((y - 4) % 12 + 12) % 12;
  return { stemIdx, branchIdx };
}

// 获取月柱
function getMonthStemBranch(yearStemIdx, year, month, day, hourBranchIdx) {
  const branchIdx = getMonthBranchIdx(year, month, day, hourBranchIdx);
  // 五虎遁：年干index % 5 → 寅月天干base
  const bases = [2, 4, 6, 8, 0]; // 甲己→丙, 乙庚→戊, 丙辛→庚, 丁壬→壬, 戊癸→甲
  const base = bases[yearStemIdx % 5];
  // 月支距寅(index=2)的偏移
  const offset = (branchIdx - 2 + 12) % 12;
  const stemIdx = (base + offset) % 10;
  return { stemIdx, branchIdx };
}

// 获取日柱
function getDayStemBranch(year, month, day) {
  let y = year, m = month;
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (y + 4716))
           + Math.floor(30.6001 * (m + 1))
           + day + B - 1524;
  // 偏移常数：以 2000-01-07 = 甲子日(0,0) 为基准
  const base = 2451551;
  const stemIdx   = ((JD - base) % 10 + 10) % 10;
  const branchIdx = ((JD - base) % 12 + 12) % 12;
  return { stemIdx, branchIdx };
}

// 获取时柱
function getHourStemBranch(dayStemIdx, hourBranchIdx) {
  const bases = [0, 2, 4, 6, 8]; // 甲己→甲, 乙庚→丙, 丙辛→戊, 丁壬→庚, 戊癸→壬
  const base = bases[dayStemIdx % 5];
  const stemIdx = (base + hourBranchIdx) % 10;
  return { stemIdx, branchIdx: hourBranchIdx };
}

// 主计算函数
function calcBaziPillars(year, month, day, hourBranchIdx, gender) {
  const yr = getYearStemBranch(year, month, day, hourBranchIdx);
  const mo = getMonthStemBranch(yr.stemIdx, year, month, day, hourBranchIdx);
  const da = getDayStemBranch(year, month, day);
  const hr = getHourStemBranch(da.stemIdx, hourBranchIdx);

  return [
    { label:'年柱', ...yr },
    { label:'月柱', ...mo },
    { label:'日柱', ...da },
    { label:'时柱', ...hr },
  ].map(p => ({
    ...p,
    stem:   STEMS[p.stemIdx],
    branch: BRANCHES[p.branchIdx],
    stemEle:   STEM_ELEMENTS[p.stemIdx],
    branchEle: BRANCH_ELEMENTS[p.branchIdx],
  }));
}

const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const STEM_ELEMENTS = ['木','木','火','火','土','土','金','金','水','水'];
const BRANCH_ELEMENTS = ['水','土','木','木','土','火','火','土','金','金','土','水'];
const ZODIAC = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const STEM_YIN_YANG = ['阳','阴','阳','阴','阳','阴','阳','阴','阳','阴'];
const BRANCH_YIN_YANG = ['阳','阴','阳','阴','阳','阴','阳','阴','阳','阴','阳','阴'];

// 五行颜色（按用户要求）
const ELEMENT_COLOR = {
  '木': '#52b788',  // 绿色
  '火': '#e74c3c',  // 红色
  '土': '#c9a84c',  // 金/土色
  '金': '#5b8dd9',  // 蓝色
  '水': '#8B6914'   // 棕色
};

// 地支藏干
const BRANCH_HIDDEN_STEMS = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲']
};

// 十二长生顺序
const CHANG_SHENG = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];

// 空亡表（旬首->空亡地支）
const KONGWANG_MAP = {
  '甲子': ['戌', '亥'], '甲寅': ['子', '丑'], '甲辰': ['寅', '卯'], '甲午': ['辰', '巳'], '甲申': ['午', '未'], '甲戌': ['申', '酉'],
  '乙丑': ['戌', '亥'], '乙卯': ['子', '丑'], '乙巳': ['寅', '卯'], '乙未': ['辰', '巳'], '乙酉': ['午', '未'], '乙亥': ['申', '酉'],
  '丙寅': ['戌', '亥'], '丙子': ['子', '丑'], '丙辰': ['寅', '卯'], '丙午': ['辰', '巳'], '丙申': ['午', '未'], '丙戌': ['申', '酉'],
  '丁卯': ['戌', '亥'], '丁丑': ['子', '丑'], '丁巳': ['寅', '卯'], '丁未': ['辰', '巳'], '丁酉': ['午', '未'], '丁亥': ['申', '酉'],
  '戊辰': ['戌', '亥'], '戊寅': ['子', '丑'], '戊子': ['寅', '卯'], '戊戌': ['辰', '巳'], '戊申': ['午', '未'], '戊午': ['申', '酉'],
  '己巳': ['戌', '亥'], '己卯': ['子', '丑'], '己丑': ['寅', '卯'], '己亥': ['辰', '巳'], '己酉': ['午', '未'], '己未': ['申', '酉'],
  '庚申': ['戌', '亥'], '庚午': ['子', '丑'], '庚辰': ['寅', '卯'], '庚子': ['辰', '巳'], '庚寅': ['午', '未'], '庚戌': ['申', '酉'],
  '辛酉': ['戌', '亥'], '辛未': ['子', '丑'], '辛巳': ['寅', '卯'], '辛亥': ['辰', '巳'], '辛卯': ['午', '未'], '辛丑': ['申', '酉'],
  '壬戌': ['戌', '亥'], '壬申': ['子', '丑'], '壬午': ['寅', '卯'], '壬辰': ['辰', '巳'], '壬寅': ['午', '未'], '壬子': ['申', '酉'],
  '癸亥': ['戌', '亥'], '癸酉': ['子', '丑'], '癸未': ['寅', '卯'], '癸巳': ['辰', '巳'], '癸卯': ['午', '未'], '癸丑': ['申', '酉']
};

// 完整60甲子纳音对照表
const NAYIN_60 = {
  '甲子乙丑': '海中金', '丙寅丁卯': '炉中火', '戊辰己巳': '大林木',
  '庚午辛未': '路旁土', '壬申癸酉': '剑锋金', '甲戌乙亥': '山头火',
  '丙子丁丑': '涧下水', '戊寅己卯': '城头土', '庚辰辛巳': '白蜡金',
  '壬午癸未': '杨柳木', '甲申乙酉': '泉中水', '丙戌丁亥': '屋上土',
  '戊子己丑': '霹雳火', '庚寅辛卯': '松柏木', '壬辰癸巳': '长流水',
  '甲午乙未': '沙中金', '丙申丁酉': '山下火', '戊戌己亥': '平地木',
  '庚子辛丑': '壁上土', '壬寅癸卯': '金箔金', '甲辰乙巳': '覆灯火',
  '丙午丁未': '天河水', '戊申己酉': '大驿土', '庚戌辛亥': '钗钏金',
  '壬子癸丑': '桑柏木', '甲寅乙卯': '大溪水', '丙辰丁巳': '沙中土',
  '戊午己未': '天上火', '庚申辛酉': '石榴木', '壬戌癸亥': '大海水'
};

// ===== 阴历阳历转换 =====

/**
 * 切换阴历选项显示
 */
function toggleLunarOptions() {
  const calType = document.getElementById('calendarType').value;
  const lunarGroup = document.getElementById('lunarMonthGroup');
  if (lunarGroup) {
    lunarGroup.style.display = calType === 'lunar' ? 'block' : 'none';
  }
}

/**
 * 阴历日期数据（简化版：1900-2050年）
 * 格式：年×10000 + 月×100 + 日
 * 每个阴历年用16进制表示：前4位闰月信息，后12位每月天数
 * 这里使用简化算法
 */
const LUNAR_INFO = {
  // 1900-1950年闰月表 (月份, 0=无闰月)
  1900: [0], 1901: [6], 1902: [0], 1903: [0], 1904: [8], 1905: [0],
  1906: [0], 1907: [0], 1908: [5], 1909: [0], 1910: [0], 1911: [0],
  1912: [7], 1913: [0], 1914: [0], 1915: [0], 1916: [5], 1917: [0],
  1918: [0], 1919: [0], 1920: [8], 1921: [0], 1922: [0], 1923: [0],
  1924: [6], 1925: [0], 1926: [0], 1927: [0], 1928: [7], 1929: [0],
  1930: [0], 1931: [0], 1932: [8], 1933: [0], 1934: [0], 1935: [0],
  1936: [5], 1937: [0], 1938: [0], 1939: [0], 1940: [7], 1941: [0],
  1942: [0], 1943: [0], 1944: [8], 1945: [0], 1946: [0], 1947: [0],
  1948: [5], 1949: [0], 1950: [0],
  // 1950-2000年
  1950: [0], 1951: [7], 1952: [0], 1953: [0], 1954: [0], 1955: [8],
  1956: [0], 1957: [0], 1958: [0], 1959: [5], 1960: [0], 1961: [0],
  1962: [0], 1963: [7], 1964: [0], 1965: [0], 1966: [0], 1967: [8],
  1968: [0], 1969: [0], 1970: [0], 1971: [6], 1972: [0], 1973: [0],
  1974: [0], 1975: [5], 1976: [0], 1977: [0], 1978: [0], 1979: [7],
  1980: [0], 1981: [0], 1982: [0], 1983: [8], 1984: [0], 1985: [0],
  1986: [0], 1987: [6], 1988: [0], 1989: [0], 1990: [0], 1991: [5],
  1992: [0], 1993: [0], 1994: [0], 1995: [8], 1996: [0], 1997: [0],
  1998: [0], 1999: [7], 2000: [0],
  // 2000-2050年
  2000: [0], 2001: [0], 2002: [7], 2003: [0], 2004: [0], 2005: [0],
  2006: [8], 2007: [0], 2008: [0], 2009: [0], 2010: [5], 2011: [0],
  2012: [0], 2013: [0], 2014: [7], 2015: [0], 2016: [0], 2017: [0],
  2018: [8], 2019: [0], 2020: [0], 2021: [0], 2022: [6], 2023: [0],
  2024: [0], 2025: [0], 2026: [5], 2027: [0], 2028: [0], 2029: [0],
  2030: [8], 2031: [0], 2032: [0], 2033: [0], 2034: [7], 2035: [0],
  2036: [0], 2037: [0], 2038: [8], 2039: [0], 2040: [0], 2041: [0],
  2042: [6], 2043: [0], 2044: [0], 2045: [0], 2046: [5], 2047: [0],
  2048: [0], 2049: [0], 2050: [8]
};

// 阴历每月天数（平年）
const LUNAR_MONTH_DAYS = [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30];

/**
 * 阴历转阳历（自动处理闰月）
 * @param {number} year 阴历年
 * @param {number} month 阴历月
 * @param {number} day 阴历日
 * @returns {Object} 阳历年月日
 */
function lunarToSolar(lunarYear, lunarMonth, lunarDay) {
  // 阴历正月初一对应阳历日期（简化版）
  // 格式：阴历年 -> [阳历月, 阳历日]
  const lunarNewYear = {
    1900: [1,21], 1901: [2,19], 1902: [2,8], 1903: [1,29], 1904: [2,15],
    1905: [2,4], 1906: [1,25], 1907: [2,13], 1908: [2,2], 1909: [1,22],
    1910: [2,10], 1911: [1,30], 1912: [2,18], 1913: [2,6], 1914: [1,26],
    1915: [2,14], 1916: [2,3], 1917: [1,23], 1918: [2,11], 1919: [2,1],
    1920: [1,21], 1921: [2,8], 1922: [1,28], 1923: [2,16], 1924: [2,5],
    1925: [1,24], 1926: [2,13], 1927: [2,2], 1928: [1,23], 1929: [2,10],
    1930: [1,30], 1931: [2,17], 1932: [2,6], 1933: [1,26], 1934: [2,14],
    1935: [2,4], 1936: [1,24], 1937: [2,11], 1938: [2,1], 1939: [1,21],
    1940: [2,9], 1941: [1,29], 1942: [2,15], 1943: [2,5], 1944: [1,25],
    1945: [2,13], 1946: [2,2], 1947: [1,22], 1948: [2,10], 1949: [1,29],
    1950: [2,17], 1951: [2,6], 1952: [1,27], 1953: [2,14], 1954: [2,3],
    1955: [1,24], 1956: [2,12], 1957: [2,1], 1958: [1,21], 1959: [2,8],
    1960: [1,28], 1961: [2,15], 1962: [2,5], 1963: [1,25], 1964: [2,13],
    1965: [2,2], 1966: [1,21], 1967: [2,9], 1968: [1,30], 1969: [2,17],
    1970: [2,6], 1971: [1,27], 1972: [2,15], 1973: [2,3], 1974: [1,23],
    1975: [2,11], 1976: [1,31], 1977: [2,18], 1978: [2,7], 1979: [1,27],
    1980: [2,16], 1981: [2,5], 1982: [1,25], 1983: [2,13], 1984: [2,2],
    1985: [1,21], 1986: [2,9], 1987: [1,29], 1988: [2,17], 1989: [2,6],
    1990: [1,27], 1991: [2,15], 1992: [2,4], 1993: [1,23], 1994: [2,10],
    1995: [1,31], 1996: [2,19], 1997: [2,7], 1998: [1,28], 1999: [2,16],
    2000: [2,5], 2001: [1,24], 2002: [2,12], 2003: [2,1], 2004: [1,22],
    2005: [2,9], 2006: [1,29], 2007: [2,18], 2008: [2,7], 2009: [1,26],
    2010: [2,14], 2011: [2,3], 2012: [1,23], 2013: [2,10], 2014: [1,31],
    2015: [2,19], 2016: [2,8], 2017: [1,28], 2018: [2,16], 2019: [2,5],
    2020: [1,25], 2021: [2,12], 2022: [2,1], 2023: [1,22], 2024: [2,10],
    2025: [1,29], 2026: [2,17], 2027: [2,6], 2028: [1,26], 2029: [2,13],
    2030: [2,3], 2031: [1,23], 2032: [2,11], 2033: [1,31], 2034: [2,19],
    2035: [2,8], 2036: [1,28], 2037: [2,15], 2038: [2,4], 2039: [1,24],
    2040: [2,12], 2041: [2,1], 2042: [1,22], 2043: [2,10], 2044: [1,30],
    2045: [2,17], 2046: [2,6], 2047: [1,26], 2048: [2,13], 2049: [2,2],
    2050: [1,22]
  };

  // 每月天数（阴历）
  const monthDays = [29,30];

  // 阴历每月天数（粗略）
  function getMonthDays(y, m) {
    // 大月30天，小月29天
    // 这里用简化规则
    if (m === 1 || m === 3 || m === 5 || m === 7 || m === 8 || m === 10 || m === 12) return 30;
    return 29;
  }

  const ny = lunarNewYear[lunarYear] || [1, 21];
  let solarMonth = ny[0];
  let solarDay = ny[1];

  // 加上月份偏移
  for (let i = 1; i < lunarMonth; i++) {
    solarDay += getMonthDays(lunarYear, i);
  }

  // 加上日期偏移
  solarDay += lunarDay - 1;

  // 处理跨月
  while (solarDay > 28) {
    const daysInMonth = (solarMonth === 2) ? 28 : (solarMonth === 4 || solarMonth === 6 || solarMonth === 9 || solarMonth === 11) ? 30 : 31;
    if (solarDay > daysInMonth) {
      solarDay -= daysInMonth;
      solarMonth++;
      if (solarMonth > 12) {
        solarMonth = 1;
        lunarYear++;
      }
    } else {
      break;
    }
  }

  return { year: lunarYear, month: solarMonth, day: Math.floor(solarDay) };
}

/**
 * 处理阴历输入（自动处理闰月）
 * @param {number} year 输入年份
 * @param {number} month 输入月份
 * @param {number} day 输入日期
 * @returns {Object} {year, month, day}
 */
function handleLunarInput(year, month, day) {
  const solarDate = lunarToSolar(year, month, day);
  return {
    year: solarDate.getFullYear(),
    month: solarDate.getMonth() + 1,
    day: solarDate.getDate()
  };
}

/**
 * 获取纳音五行
 * @param {string} stem 天干
 * @param {string} branch 地支
 * @returns {string} 纳音名称
 */
function getNayin(stem, branch) {
  const pair = stem + branch;
  for (const [key, val] of Object.entries(NAYIN_60)) {
    if (key.slice(0, 2) === pair || key.slice(2, 4) === pair) return val;
  }
  return '—';
}

// ===== 神煞计算 =====

// 天乙贵人（以日干查）
const TIANYI = {
  '甲': ['丑', '未'], '戊': ['丑', '未'],
  '乙': ['子', '申'], '己': ['子', '申'],
  '丙': ['亥', '酉'], '庚': ['亥', '酉'],
  '丁': ['亥', '酉'], '辛': ['寅', '午'],
  '壬': ['卯', '巳'], '癸': ['卯', '巳'],
};

// 驿马星（以年支查）
const YIMA = {
  '申': '寅', '子': '寅', '辰': '寅',
  '寅': '申', '午': '申', '戌': '申',
  '亥': '巳', '卯': '巳', '未': '巳',
  '巳': '亥', '酉': '亥', '丑': '亥',
};

// 桃花（以年支查）
const TAOHUA = {
  '申': '酉', '子': '酉', '辰': '酉',
  '寅': '卯', '午': '卯', '戌': '卯',
  '亥': '子', '卯': '子', '未': '子',
  '巳': '午', '酉': '午', '丑': '午',
};

// 文昌星（以日干查）
const WENCHANG = {
  '甲': '巳', '乙': '午', '丙': '申', '丁': '酉',
  '戊': '申', '己': '酉', '庚': '亥', '辛': '子',
  '壬': '寅', '癸': '卯',
};

/**
 * 计算命中神煞
 * @param {Object} pillars 四柱对象
 * @returns {Array} 神煞列表
 */
function calcShensha(pillars) {
  const result = [];
  const branches = [pillars[0].branch, pillars[1].branch, pillars[2].branch, pillars[3].branch];
  const dayStem = pillars[2].stem;
  const yearBranch = pillars[0].branch;

  // 天乙贵人
  const tianyi = TIANYI[dayStem];
  if (tianyi) {
    tianyi.forEach(b => {
      if (branches.includes(b)) {
        result.push({ name: '天乙贵人', type: '吉', desc: '最吉之神煞，逢凶化吉，遇难呈祥' });
      }
    });
  }

  // 驿马星
  const yima = YIMA[yearBranch];
  if (yima && branches.includes(yima)) {
    result.push({ name: '驿马星', type: '动', desc: '主奔波迁移，驿马动则出行有利' });
  }

  // 桃花
  const taohua = TAOHUA[yearBranch];
  if (taohua && branches.includes(taohua)) {
    result.push({ name: '桃花星', type: '情', desc: '主桃花运，人缘佳，魅力足' });
  }

  // 文昌星
  const wenchang = WENCHANG[dayStem];
  if (wenchang && branches.includes(wenchang)) {
    result.push({ name: '文昌星', type: '吉', desc: '主聪明才智，文章学业' });
  }

  // 华盖星（以年支查）
  const HUAGAI = { '辰': '戌', '巳': '亥', '午': '子', '未': '丑', '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳', '子': '午', '丑': '未' };
  const huagai = HUAGAI[yearBranch];
  if (huagai && branches.includes(huagai)) {
    result.push({ name: '华盖星', type: '艺', desc: '主孤独与才艺，适合艺术宗教' });
  }

  // 羊刃（以日干查，日支为禄，羊刃在禄的对冲）
  const YANGROU = { '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳', '戊': '午', '己': '巳', '庚': '酉', '辛': '申', '壬': '子', '癸': '亥' };
  const yangrou = YANGROU[dayStem];
  if (yangrou && branches.includes(yangrou)) {
    result.push({ name: '羊刃', type: '凶', desc: '极旺之神，主刚烈冲动' });
  }

  return result;
}

// 十二长生对照（以日干为基础）
// 长生位置：甲-亥，乙-午，丙-寅，丁-酉，戊-寅，己-酉，庚-巳，辛-子，壬-申，癸-卯
const CHANGSHENG_ORDER = ['长生','沐浴','冠带','临官','帝旺','衰','病','死','墓','绝','胎','养'];
const CHANGSHENG_START = {
  '甲': 11, // 长生在亥
  '乙': 5,  // 长生在午
  '丙': 3,  // 长生在寅
  '丁': 9,  // 长生在酉
  '戊': 3,  // 长生在寅
  '己': 9,  // 长生在酉
  '庚': 9,  // 长生在巳
  '辛': 11, // 长生在子
  '壬': 9,  // 长生在申
  '癸': 3,  // 长生在卯
};

// ===== 十神计算 =====
/**
 * 十神对照表（以日干为基准）
 * 同性为偏，异性为正
 */
const SHISHEN_MAP = {
  // 日干 = 甲
  '甲': { '甲': '比肩', '乙': '劫财', '丙': '食神', '丁': '伤官', '戊': '偏财', '己': '正财', '庚': '七杀', '辛': '正官', '壬': '偏印', '癸': '正印' },
  // 日干 = 乙
  '乙': { '甲': '劫财', '乙': '比肩', '丙': '伤官', '丁': '食神', '戊': '正财', '己': '偏财', '庚': '正官', '辛': '七杀', '壬': '正印', '癸': '偏印' },
  // 日干 = 丙
  '丙': { '甲': '偏印', '乙': '正印', '丙': '比肩', '丁': '劫财', '戊': '食神', '己': '伤官', '庚': '偏财', '辛': '正财', '壬': '七杀', '癸': '正官' },
  // 日干 = 丁
  '丁': { '甲': '正印', '乙': '偏印', '丙': '劫财', '丁': '比肩', '戊': '伤官', '己': '食神', '庚': '正财', '辛': '偏财', '壬': '正官', '癸': '七杀' },
  // 日干 = 戊
  '戊': { '甲': '七杀', '乙': '正官', '丙': '偏印', '丁': '正印', '戊': '比肩', '己': '劫财', '庚': '食神', '辛': '伤官', '壬': '偏财', '癸': '正财' },
  // 日干 = 己
  '己': { '甲': '正官', '乙': '七杀', '丙': '正印', '丁': '偏印', '戊': '劫财', '己': '比肩', '庚': '伤官', '辛': '食神', '壬': '正财', '癸': '偏财' },
  // 日干 = 庚
  '庚': { '甲': '偏财', '乙': '正财', '丙': '七杀', '丁': '正官', '戊': '偏印', '己': '正印', '庚': '比肩', '辛': '劫财', '壬': '伤官', '癸': '食神' },
  // 日干 = 辛
  '辛': { '甲': '正财', '乙': '偏财', '丙': '正官', '丁': '七杀', '戊': '正印', '己': '偏印', '庚': '劫财', '辛': '比肩', '壬': '食神', '癸': '伤官' },
  // 日干 = 壬
  '壬': { '甲': '食神', '乙': '伤官', '丙': '偏财', '丁': '正财', '戊': '七杀', '己': '正官', '庚': '偏印', '辛': '正印', '壬': '比肩', '癸': '劫财' },
  // 日干 = 癸
  '癸': { '甲': '伤官', '乙': '食神', '丙': '正财', '丁': '偏财', '戊': '正官', '己': '七杀', '庚': '正印', '辛': '偏印', '壬': '劫财', '癸': '比肩' }
};

/**
 * 计算十神
 * @param {Object} pillars 四柱对象
 * @returns {Array} 十神列表
 */
function calcShishen(pillars) {
  const dayStem = pillars[2].stem;
  const result = [];

  // 位置标签：年柱、月柱、日柱、时柱
  const positionLabels = ['年柱', '月柱', '日柱', '时柱'];

  pillars.forEach((p, i) => {
    if (i === 2) return; // 跳过日柱本身（日主）
    const shishen = SHISHEN_MAP[dayStem][p.stem];
    result.push({
      position: positionLabels[i],
      stem: p.stem,
      branch: p.branch,
      shishen: shishen,
      element: p.stemEle
    });
  });

  return result;
}

/**
 * 获取十神吉凶解释
 */
function getShishenDesc(shishen) {
  const desc = {
    '正官': { type: '吉', desc: '主名誉、地位、官运，适合仕途' },
    '七杀': { type: '凶', desc: '主压力、权威、武职，有冲劲但需克制' },
    '正财': { type: '吉', desc: '主正当收入、稳定财源' },
    '偏财': { type: '吉', desc: '主意外之财、横财，投资获利' },
    '正印': { type: '吉', desc: '主学业、贵人、名誉，母亲缘' },
    '偏印': { type: '凶', desc: '主学术、宗教、孤独，易有偏执' },
    '食神': { type: '吉', desc: '主福禄、才艺、口福，衣食无忧' },
    '伤官': { type: '凶', desc: '主才华、创意，但易犯口舌' },
    '比肩': { type: '平', desc: '主兄弟姐妹、竞争、合作' },
    '劫财': { type: '凶', desc: '主破财、争夺、竞争' }
  };
  return desc[shishen] || { type: '平', desc: '' };
}

/**
 * 获取十二长生状态
 * @param {string} stem 日干
 * @param {string} branch 地支
 * @returns {string} 长生状态
 */
function getChangseng(stem, branch) {
  if (!CHANGSHENG_START[stem]) return '—';

  const startIdx = CHANGSHENG_START[stem];
  const branchIdx = BRANCHES.indexOf(branch);
  if (branchIdx === -1) return '—';

  // 计算在十二长生中的位置
  const offset = (branchIdx - startIdx + 12) % 12;
  return CHANGSHENG_ORDER[offset];
}

/**
 * 计算朱利安日数（用于日柱）- 返回整数
 */
function getJulianDay(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y2 = year + 4800 - a;
  const m2 = month + 12 * a - 3;
  return day + Math.floor((153 * m2 + 2) / 5) + 365 * y2 + Math.floor(y2 / 4) - Math.floor(y2 / 100) + Math.floor(y2 / 400) - 32045;
}

/**
 * 主计算函数（精确节气版）
 * @param {number} year  出生年
 * @param {number} month 出生月（1-12）
 * @param {number} day   出生日
 * @param {number} hour  时辰序号（0=子时, 1=丑时...）
 * @param {string} gender 'm' | 'f'
 * @returns {Object} 排盘结果
 */
function calcBaziPillars(year, month, day, hour, gender) {
  // ── 年柱（精确：立春为界）──
  const yearInfo = getYearFromSolarTerm(year, month, day);
  const yearStem = yearInfo.yearStem;
  const yearBranch = yearInfo.yearBranch;
  const yearStemIdx = yearInfo.yearStemIdx;
  const yearBranchIdx = yearInfo.yearBranchIdx;
  const zodiac = yearInfo.zodiac;
  const actualYear = yearInfo.actualYear;

  // ── 月柱（精确：节气为界，使用立春后的年份）──
  const monthInfo = getMonthFromSolarTerm(actualYear, month, day, 0, 0);
  const monthStem = monthInfo.monthStem;
  const monthBranch = monthInfo.monthBranch;
  const monthStemIdx = monthInfo.monthStemIdx;
  const monthBranchIdx = monthInfo.monthBranchIdx;

  // ── 日柱 ──
  const jd = getJulianDay(year, month, day);
  const dayStemIdx   = ((jd + 49) % 10 + 10) % 10;
  const dayBranchIdx = ((jd + 1)  % 12 + 12) % 12;
  const dayStem   = STEMS[dayStemIdx];
  const dayBranch = BRANCHES[dayBranchIdx];

  // ── 时柱 ──
  // 五鼠遁日起时法
  const hourStemBases = [0, 2, 4, 6, 8]; // 甲己日起甲子时
  const hourBase = hourStemBases[dayStemIdx % 5];
  const hourStemIdx   = (hourBase + hour) % 10;
  const hourStem   = STEMS[hourStemIdx];
  const hourBranch = BRANCHES[hour];

  // ── 组装四柱 ──
  const pillars = [
    {
      label: '年柱', stem: yearStem, branch: yearBranch,
      stemEle: STEM_ELEMENTS[yearStemIdx],
      branchEle: BRANCH_ELEMENTS[yearBranchIdx],
      stemYY: STEM_YIN_YANG[yearStemIdx],
    },
    {
      label: '月柱', stem: monthStem, branch: monthBranch,
      stemEle: STEM_ELEMENTS[monthStemIdx],
      branchEle: BRANCH_ELEMENTS[monthBranchIdx],
      stemYY: STEM_YIN_YANG[monthStemIdx],
    },
    {
      label: '日柱（日主）', stem: dayStem, branch: dayBranch,
      stemEle: STEM_ELEMENTS[dayStemIdx],
      branchEle: BRANCH_ELEMENTS[dayBranchIdx],
      stemYY: STEM_YIN_YANG[dayStemIdx],
    },
    {
      label: '时柱', stem: hourStem, branch: hourBranch,
      stemEle: STEM_ELEMENTS[hourStemIdx],
      branchEle: BRANCH_ELEMENTS[hour],  // hour 0-11 直接对应子-亥
      stemYY: STEM_YIN_YANG[hourStemIdx],
    },
  ];

  // ── 五行统计 ──
  const elemCount = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  pillars.forEach(p => {
    elemCount[p.stemEle]++;
    elemCount[p.branchEle]++;
  });

  // ── 大运（精确节气起运）──
  // 计算精确起运
  const daYunCalc = calcDaYunPrecise(year, month, day, 0, 0, gender, yearStemIdx);
  const startAge = daYunCalc.startAge;
  const daYunForward = daYunCalc.direction === '顺行';

  const daYun = [];
  for (let i = 0; i < 8; i++) {
    const offset = daYunForward ? i + 1 : -(i + 1);
    const dyIdx = (monthStemIdx + offset + 100) % 10;
    const dyBIdx = (monthBranchIdx + offset + 120) % 12;
    daYun.push({
      age: startAge + i * 10,
      ageEnd: startAge + i * 10 + 9,
      stem: STEMS[dyIdx],
      branch: BRANCHES[dyBIdx],
      stemEle: STEM_ELEMENTS[dyIdx],
      branchEle: BRANCH_ELEMENTS[dyBIdx],
    });
  }

  // ── 基本信息 ──
  // zodiac 已在年柱计算中得出
  const nayin = getNayin(yearStem, yearBranch);
  const dayNayin = getNayin(dayStem, dayBranch);
  const dayStemEle = pillars[2].stemEle;
  const maxEle = Object.entries(elemCount).sort((a, b) => b[1] - a[1])[0][0];
  const minEle = Object.entries(elemCount).sort((a, b) => a[1] - b[1])[0][0];

  // 计算神煞
  const shensha = calcShensha(pillars);

  return {
    pillars,
    elemCount,
    daYun,
    shensha,
    info: {
      zodiac,
      nayin,
      dayNayin,
      dayStemEle,
      dayStemYY: STEM_YIN_YANG[dayStemIdx],
      maxEle,
      minEle,
      startAge,
      daYunForward,
      daYunCalc
    }
  };
}

/**
 * 渲染四柱到页面（专业细盘格式）
 */
function renderBazi(result) {
  const { pillars, elemCount, daYun, shensha, info } = result;
  const dayStem = pillars[2].stem;
  const dayBranch = pillars[2].branch;

  // 构建每柱的详细数据
  const pillarDetails = pillars.map((p, i) => {
    const hiddenStems = BRANCH_HIDDEN_STEMS[p.branch] || [];
    const hiddenShishen = hiddenStems.map(hs => ({
      stem: hs,
      shishen: getTenGod(dayStem, hs),
      element: STEM_ELEMENTS[STEMS.indexOf(hs)]
    }));

    return {
      ...p,
      hiddenStems: hiddenShishen,
      stemShishen: getTenGod(dayStem, p.stem),
      branchChangSheng: getBranchChangSheng(dayStem, p.branch),
      selfChangSheng: getChangSheng(dayStem, p.stem),
      kongWang: getKongWang(p.stem, p.branch),
      nayin: getNayin(p.stem, p.branch),
      shensha: getPillarShensha(p)
    };
  });

  // ==================== 专业细盘表格 ====================
  const grid = document.getElementById('pillarsGrid');
  if (grid) {
    // 表头
    let html = `<table class="bazi-pro-table">
      <thead>
        <tr>
          <th></th>
          <th>年柱</th>
          <th>月柱</th>
          <th>日柱</th>
          <th>时柱</th>
        </tr>
      </thead>
      <tbody>`;

    // 主星行
    html += `<tr><td class="row-label">主星</td>`;
    pillarDetails.forEach(p => {
      html += `<td class="text-center">${p.stemShishen}</td>`;
    });
    html += `</tr>`;

    // 天干行（大字 + 五行颜色）
    html += `<tr><td class="row-label">天干</td>`;
    pillarDetails.forEach(p => {
      const color = ELEMENT_COLOR[p.stemEle];
      html += `<td class="text-center">
        <span class="stem-big" style="color:${color}">${p.stem}</span>
        <span class="shishen-small">${p.stemShishen}</span>
      </td>`;
    });
    html += `</tr>`;

    // 地支行（大字 + 五行颜色）
    html += `<tr><td class="row-label">地支</td>`;
    pillarDetails.forEach(p => {
      const color = ELEMENT_COLOR[p.branchEle];
      html += `<td class="text-center">
        <span class="branch-big" style="color:${color}">${p.branch}</span>
      </td>`;
    });
    html += `</tr>`;

    // 藏干行（每个藏干单独显示）
    html += `<tr><td class="row-label">藏干</td>`;
    pillarDetails.forEach(p => {
      html += `<td class="text-center">`;
      p.hiddenStems.forEach(hs => {
        const color = ELEMENT_COLOR[hs.element];
        html += `<div class="hidden-stem">
          <span style="color:${color}">${hs.stem}</span>
          <span class="shishen-small">${hs.shishen}</span>
        </div>`;
      });
      html += `</td>`;
    });
    html += `</tr>`;

    // 星运行（地支对日主的长生）
    html += `<tr><td class="row-label">星运</td>`;
    pillarDetails.forEach(p => {
      const csColor = p.branchChangSheng === '帝旺' ? '#e74c3c' :
                      p.branchChangSheng === '长生' || p.branchChangSheng === '冠带' ? '#52b788' :
                      p.branchChangSheng === '沐浴' ? '#5dade2' : 'var(--text-dim)';
      html += `<td class="text-center" style="color:${csColor}">${p.branchChangSheng}</td>`;
    });
    html += `</tr>`;

    // 自坐行（天干对地支的长生）
    html += `<tr><td class="row-label">自坐</td>`;
    pillarDetails.forEach(p => {
      const csColor = p.selfChangSheng === '帝旺' ? '#e74c3c' :
                      p.selfChangSheng === '长生' || p.selfChangSheng === '冠带' ? '#52b788' :
                      p.selfChangSheng === '沐浴' ? '#5dade2' : 'var(--text-dim)';
      html += `<td class="text-center" style="color:${csColor}">${p.selfChangSheng}</td>`;
    });
    html += `</tr>`;

    // 空亡行
    html += `<tr><td class="row-label">空亡</td>`;
    pillarDetails.forEach(p => {
      html += `<td class="text-center">${p.kongWang[0]}${p.kongWang[1]}</td>`;
    });
    html += `</tr>`;

    // 纳音行
    html += `<tr><td class="row-label">纳音</td>`;
    pillarDetails.forEach(p => {
      html += `<td class="text-center">${p.nayin}</td>`;
    });
    html += `</tr>`;

    // 神煞行
    html += `<tr><td class="row-label">神煞</td>`;
    pillarDetails.forEach(p => {
      if (p.shensha.length > 0) {
        html += `<td class="text-center">`;
        p.shensha.forEach(s => {
          const badgeClass = s.type === '吉' ? 'badge-ji2' : s.type === '凶' ? 'badge-ji' : '';
          const sColor = s.type === '吉' || s.type === '艺' ? '#c9a84c' : s.type === '凶' ? '#e74c3c' : '#5dade2';
          html += `<span style="color:${sColor};font-size:0.75rem">${s.name}</span>`;
        });
        html += `</td>`;
      } else {
        html += `<td class="text-center">—</td>`;
      }
    });
    html += `</tr>`;

    html += `</tbody></table>`;
    grid.innerHTML = html;
  }

  // ==================== 基本信息 ====================
  const infoGrid = document.getElementById('infoGrid');
  const daYunDetail = info.daYunCalc || {};
  if (infoGrid) {
    infoGrid.innerHTML = `
      <div class="info-item"><div class="info-key">生肖</div><div class="info-val">${info.zodiac}</div></div>
      <div class="info-item"><div class="info-key">日主</div><div class="info-val" style="color:${ELEMENT_COLOR[info.dayStemEle]}">${pillars[2].stem}（${info.dayStemYY}${info.dayStemEle}）</div></div>
      <div class="info-item"><div class="info-key">日纳音</div><div class="info-val">${info.dayNayin}</div></div>
      <div class="info-item"><div class="info-key">起运</div><div class="info-val">${info.startAge}岁 ${daYunDetail.direction || '顺行'}</div></div>
      <div class="info-item"><div class="info-key">五行最旺</div><div class="info-val" style="color:${ELEMENT_COLOR[info.maxEle]}">${info.maxEle}（${elemCount[info.maxEle]}个）</div></div>
      <div class="info-item"><div class="info-key">五行最弱</div><div class="info-val" style="color:${ELEMENT_COLOR[info.minEle]}">${info.minEle}（${elemCount[info.minEle]}个）</div></div>
    `;
  }

  // ==================== 五行分布 ====================
  const wuxingBar = document.getElementById('wuxingBar');
  if (wuxingBar) {
    wuxingBar.innerHTML = Object.entries(elemCount).map(([ele, cnt]) => `
      <div style="flex:1;min-width:80px;background:rgba(255,255,255,0.03);border:1px solid ${ELEMENT_COLOR[ele]}40;border-radius:4px;padding:0.8rem;text-align:center">
        <div style="font-size:1.1rem;color:${ELEMENT_COLOR[ele]};font-weight:700">${ele}</div>
        <div style="margin:0.4rem 0;height:4px;background:rgba(255,255,255,0.05);border-radius:2px">
          <div style="height:100%;width:${cnt * 16.7}%;background:${ELEMENT_COLOR[ele]};border-radius:2px;transition:width 0.5s"></div>
        </div>
        <div style="font-size:1.5rem;color:${ELEMENT_COLOR[ele]}">${cnt}</div>
      </div>
    `).join('');
  }

  // ==================== 大运流年可视化 ====================
  const daYunGrid = document.getElementById('daYunGrid');
  if (daYunGrid) {
    const currentYear = new Date().getFullYear();
    const birthYear = parseInt(document.getElementById('birthYear')?.value || 2000);
    const currentAge = currentYear - birthYear;

    // 计算小运
    const xiaoyun = calcXiaoyun(birthYear, month, day, hour);

    // 小运 HTML
    let xiaoyunHtml = `
      <div class="xiaoyun-wrap">
        <div class="xiaoyun-title">☯ 小运（1-8岁）</div>
        <div class="xiaoyun-row">
    `;
    xiaoyun.forEach(xy => {
      const stemColor = ELEMENT_COLOR[xy.stemEle];
      const branchColor = ELEMENT_COLOR[xy.branchEle];
      xiaoyunHtml += `
        <div class="xiaoyun-item">
          <div class="xy-age">${xy.age}岁</div>
          <div class="xy-stem" style="color:${stemColor}">${xy.stem}</div>
          <div class="xy-branch" style="color:${branchColor}">${xy.branch}</div>
        </div>
      `;
    });
    xiaoyunHtml += `</div></div>`;

    // 起运信息
    let yunInfo = `<div class="yun-info">起运：${info.startAge}岁 · ${daYunDetail.direction || '顺行'} · 大运十年换运</div>`;

    // 大运时间轴
    let dyHtml = `<div class="daYun-timeline"><div class="daYun-row">`;
    daYun.forEach((dy, i) => {
      const isCurrent = currentAge >= dy.age && currentAge <= dy.ageEnd;
      const stemColor = ELEMENT_COLOR[dy.stemEle];
      const branchColor = ELEMENT_COLOR[dy.branchEle];
      const stemShishen = getTenGod(dayStem, dy.stem);
      const branchShishen = getTenGod(dayStem, dy.branch);
      const nayin = getNayin(dy.stem, dy.branch);
      const impact = getDayunImpact(dayStem, dy.stem, dy.branch, pillars[2].stemEle);

      dyHtml += `
        <div class="daYun-item ${isCurrent ? 'current' : ''}">
          <div class="daYun-year">${dy.year}-${dy.year + 9}</div>
          <div class="daYun-stem" style="color:${stemColor}">${dy.stem}</div>
          <div class="daYun-branch" style="color:${branchColor}">${dy.branch}</div>
          <div class="daYun-shishen">${stemShishen}</div>
          <div class="daYun-shishen">${branchShishen}</div>
          <div class="daYun-nayin">${nayin}</div>
          <div class="daYun-impact ${impact.type === '生扶' ? 'sheng' : impact.type === '克泄' ? 'ke' : 'zhong'}">${impact.type}</div>
        </div>
      `;
    });
    dyHtml += `</div></div>`;

    // 流年（当前大运的流年）
    const currentDaYunIndex = daYun.findIndex(dy => currentAge >= dy.age && currentAge <= dy.ageEnd);
    let liunianHtml = '';
    if (currentDaYunIndex >= 0) {
      const startYear = daYun[currentDaYunIndex].year;
      liunianHtml = `
        <div class="liunian-detail">
          <div class="liunian-title">⚡ 流年 · ${daYun[currentDaYunIndex].year}-${daYun[currentDaYunIndex].year + 9}年</div>
          <div class="liunian-grid">
      `;

      for (let i = 0; i < 10; i++) {
        const year = startYear + i;
        const age = info.startAge + (daYunDetail.direction === '顺行' ? i : -i);
        const lnStemIdx = (STEMS.indexOf(dayStem) + (daYun[currentDaYunIndex].stemIdx || 0) + i) % 10;
        const lnStem = STEMS[lnStemIdx];
        const lnBranchIdx = (BRANCHES.indexOf(daYun[currentDaYunIndex].branch) + i) % 12;
        const lnBranch = BRANCHES[lnBranchIdx];
        const isCurrentYear = year === currentYear;

        const stemColor = ELEMENT_COLOR[STEM_ELEMENTS[lnStemIdx]];
        const taishai = getTaishai(year);

        // 检查与日支的关系
        const dayBranch = pillars[2].branch;
        const relation = checkRelationship(dayBranch, lnBranch);

        liunianHtml += `
          <div class="liunian-cell ${isCurrentYear ? 'current' : ''}">
            <div class="ln-stem-branch" style="color:${stemColor}">${lnStem}${lnBranch}</div>
            <div class="ln-year-age">${year}年</div>
            ${relation ? `<div class="ln-relation ${relation}">${relation}</div>` : ''}
            <div class="ln-taishai">太岁${taishai}</div>
          </div>
        `;
      }
      liunianHtml += `</div></div>`;
    }

    daYunGrid.innerHTML = xiaoyunHtml + yunInfo + dyHtml + liunianHtml;
  }

  // ==================== 神煞（保留原格式）====================
  const shenshaGrid = document.getElementById('shenshaGrid');
  if (shenshaGrid && shensha.length > 0) {
    shenshaGrid.innerHTML = shensha.map(s => `
      <div class="shensha-item">
        <div class="shensha-name">${s.name} <span class="badge ${s.type === '吉' || s.type === '艺' ? 'badge-ji2' : s.type === '凶' ? 'badge-ji' : ''}">${s.type}</span></div>
        <div class="shensha-desc">${s.desc}</div>
      </div>
    `).join('');
  }

  // ==================== 十神（简化显示）====================
  const shishenGrid = document.getElementById('shishenGrid');
  if (shishenGrid) {
    const shishen = calcShishen(pillars);
    shishenGrid.innerHTML = shishen.map(s => {
      const ssInfo = getShishenDesc(s.shishen);
      return `
        <div class="shishen-card">
          <div class="shishen-position">${s.position}</div>
          <div class="shishen-stem">${s.stem}</div>
          <div class="shishen-name" style="color:${ssInfo.type === '吉' ? '#52b788' : ssInfo.type === '凶' ? '#e74c3c' : '#c9a84c'}">${s.shishen}</div>
          <div class="shishen-desc">${ssInfo.desc}</div>
        </div>
      `;
    }).join('');
  }

  // ==================== 运势详解 ====================
  const fortuneGrid = document.getElementById('fortuneGrid');
  if (fortuneGrid) {
    const fortune = analyzeFortune(pillars, elemCount, info, shensha);
    fortuneGrid.innerHTML = fortune;
  }

  // ==================== 命局分析 ====================
  const mingJu = document.getElementById('mingJu');
  if (mingJu) {
    const analysis = analyzeMingJu(pillars, elemCount, info);
    mingJu.innerHTML = analysis;
  }

  document.getElementById('baziResult').style.display = 'block';
}

/**
 * 命局分析文字
 */
function analyzeMingJu(pillars, elemCount, info) {
  const { dayStemEle, dayStemYY, maxEle, minEle } = info;
  const total = Object.values(elemCount).reduce((a, b) => a + b, 0);

  // 身强身弱简判（月令+生扶克泄耗）
  // TODO: 精确计算需要月令旺相休囚
  const monthBranchEle = pillars[1].branchEle;
  const isMonthSupport = monthBranchEle === dayStemEle ||
    (dayStemEle === '木' && monthBranchEle === '水') ||
    (dayStemEle === '火' && monthBranchEle === '木') ||
    (dayStemEle === '土' && monthBranchEle === '火') ||
    (dayStemEle === '金' && monthBranchEle === '土') ||
    (dayStemEle === '水' && monthBranchEle === '金');

  const strength = isMonthSupport ? '偏强' : '偏弱';

  // 喜用神推断
  const keMap = { '木':'土', '火':'金', '土':'水', '金':'木', '水':'火' };
  const shengMap = { '木':'火', '火':'土', '土':'金', '金':'水', '水':'木' };
  const beKeMap = { '土':'木', '金':'火', '水':'土', '木':'金', '火':'水' };

  let xiYong = '建议结合专业命理师分析';
  if (elemCount[maxEle] >= 4) {
    xiYong = `命局${maxEle}气偏旺，喜${keMap[maxEle]}（克制）或${shengMap[maxEle]}（泄秀），忌再见${maxEle}气`;
  }

  return `
    <p>🔶 <strong style="color:var(--gold)">日主：</strong>${pillars[2].stem}（${dayStemYY}${dayStemEle}），五行属<span style="color:${ELEMENT_COLOR[dayStemEle]}">${dayStemEle}</span>。</p>
    <p>🔷 <strong style="color:var(--gold)">身强身弱：</strong>月令${pillars[1].branch}（${monthBranchEle}）${isMonthSupport ? '生扶' : '无力生扶'}日主，初步判断命局<strong>${strength}</strong>。</p>
    <p>🔶 <strong style="color:var(--gold)">五行分布：</strong>${maxEle}气最旺（${elemCount[maxEle]}个），${minEle}气最弱（${elemCount[minEle]}个）。</p>
    <p>🔷 <strong style="color:var(--gold)">喜用神参考：</strong>${xiYong}。</p>
    <p style="color:var(--text-dim);font-size:0.8rem;margin-top:0.8rem">⚠️ 注：以上为简化算法，精确命局需以节气精确月柱为准，建议参考专业命理师分析。</p>
  `;
}

/**
 * 运势详解分析（适合新手入门）
 * @param {Object} pillars 四柱对象
 * @param {Object} elemCount 五行统计
 * @param {Object} info 基本信息
 * @param {Array} shensha 神煞列表
 * @returns {string} HTML
 */
function analyzeFortune(pillars, elemCount, info, shensha) {
  const dayStem = pillars[2].stem;
  const dayBranch = pillars[2].branch;
  const yearBranch = pillars[0].branch;
  const dayStemEle = info.dayStemEle;
  const dayStemYY = info.dayStemYY;

  const results = [];

  // 1. 财运分析
  let caiYun = { score: 50, desc: '', advice: '' };

  // 看财星
  const caiXing = {'甲':'戊','乙':'己','丙':'庚','丁':'辛','戊':'壬','己':'癸','庚':'甲','辛':'乙','壬':'丙','癸':'丁'};
  const caiStem = caiXing[dayStem];
  const hasCai = pillars.some(p => p.stem === caiStem);
  const hasCaiBranch = pillars.some(p => p.branch.includes('财') || p.branch === '寅' || p.branch === '卯');

  // 看财库
  const caiKu = {'甲':'未','乙':'未','丙':'丑','丁':'丑','戊':'辰','己':'辰','庚':'戌','辛':'戌','壬':'辰','癸':'丑'};
  const hasCaiKu = pillars.some(p => p.branch === caiKu[dayStem]);

  if (hasCai || hasCaiBranch) {
    caiYun.score += 20;
    caiYun.desc = '命中带财星或财库，财运较好';
    if (hasCaiKu) {
      caiYun.score += 15;
      caiYun.desc += '，且有财库存储';
    }
  } else {
    caiYun.score -= 10;
    caiYun.desc = '命中暂无明显财星，需靠后天努力';
  }

  // 身强身弱
  const monthBranchEle = pillars[1].branchEle;
  const isStrong = monthBranchEle === dayStemEle ||
    (dayStemEle === '木' && monthBranchEle === '水') ||
    (dayStemEle === '火' && monthBranchEle === '木') ||
    (dayStemEle === '土' && monthBranchEle === '火') ||
    (dayStemEle === '金' && monthBranchEle === '土') ||
    (dayStemEle === '水' && monthBranchEle === '金');

  if (isStrong && hasCai) {
    caiYun.score += 10;
    caiYun.desc += '，身强能担财';
  } else if (!isStrong) {
    caiYun.score -= 10;
    caiYun.desc += '，身弱需靠印星生扶';
  }

  caiYun.advice = isStrong ? '适合投资理财、创业发展' : '建议稳健理财、积累为主';

  results.push({
    name: '💰 财运',
    score: Math.min(100, Math.max(0, caiYun.score)),
    desc: caiYun.desc,
    advice: caiYun.advice
  });

  // 2. 桃花运分析
  let taoHua = { score: 50, desc: '', advice: '' };

  // 桃花位
  const taoHuaPos = {'子':'酉','丑':'午','寅':'卯','卯':'子','辰':'酉','巳':'申','午':'未','未':'午','申':'卯','酉':'子','戌':'酉','亥':'寅'};
  const taoPos = taoHuaPos[yearBranch];

  if (pillars.some(p => p.branch === taoPos)) {
    taoHua.score += 25;
    taoHua.desc = '命中带桃花星，异性缘佳';
  } else {
    taoHua.desc = '桃花运一般，缘分需靠主动';
  }

  // 桃花神煞
  if (shensha.some(s => s.name === '桃花星')) {
    taoHua.score += 15;
    taoHua.desc += '，桃花运旺盛';
  }

  // 咸池
  const xianChi = {'申':'子','子':'酉','酉':'午','午':'卯','卯':'子'};
  if (xianChi[dayBranch]) {
    taoHua.score += 10;
  }

  taoHua.advice = taoHua.score > 60 ? '注意把握感情，勿花心' : '建议扩大社交圈';

  results.push({
    name: '🌸 桃花运',
    score: Math.min(100, Math.max(0, taoHua.score)),
    desc: taoHua.desc,
    advice: taoHua.advice
  });

  // 3. 事业运分析
  let shiYe = { score: 50, desc: '', advice: '' };

  // 看官星
  const guanXing = {'甲':'辛','乙':'庚','丙':'壬','丁':'癸','戊':'乙','己':'甲','庚':'丁','辛':'丙','壬':'戊','癸':'己'};
  const guanStem = guanXing[dayStem];
  const hasGuan = pillars.some(p => p.stem === guanStem);

  if (hasGuan) {
    shiYe.score += 20;
    shiYe.desc = '命中带官星，有事业心';
  }

  // 印星生身
  const yinXing = {'甲':'壬','乙':'癸','丙':'甲','丁':'乙','戊':'丙','己':'丁','庚':'戊','辛':'己','壬':'庚','癸':'辛'};
  const yinStem = yinXing[dayStem];
  if (pillars.some(p => p.stem === yinStem)) {
    shiYe.score += 15;
    shiYe.desc += '，有印星生扶';
  }

  if (!hasGuan) {
    shiYe.desc = '更适合技术、艺术路线';
  }

  shiYe.advice = hasGuan ? '适合管理、行政方向发展' : '适合专业技能发展';

  results.push({
    name: '💼 事业运',
    score: Math.min(100, Math.max(0, shiYe.score)),
    desc: shiYe.desc,
    advice: shiYe.advice
  });

  // 4. 健康提示
  const healthTips = [];
  if (elemCount['木'] >= 4) healthTips.push('注意肝胆系统');
  if (elemCount['火'] >= 4) healthTips.push('注意心血管、眼睛');
  if (elemCount['土'] >= 4) healthTips.push('注意脾胃、消化系统');
  if (elemCount['金'] >= 4) healthTips.push('注意呼吸系统、肺部');
  if (elemCount['水'] >= 4) healthTips.push('注意肾脏、泌尿系统');

  results.push({
    name: '🏥 健康',
    score: 80 - healthTips.length * 10,
    desc: healthTips.length > 0 ? healthTips.join('、') : '五行平衡，身体健康',
    advice: '注意作息规律，定期体检'
  });

  // 5. 性格特点
  const personality = [];
  if (dayStemYY === '阳') personality.push('性格外向、积极进取');
  else personality.push('性格内敛、细腻敏感');

  const stemEleDesc = {
    '木': '仁慈、有活力',
    '火': '热情、有创造力',
    '土': '稳重、务实',
    '金': '刚毅、有决断',
    '水': '智慧、灵活'
  };
  personality.push(stemEleDesc[dayStemEle] || '');

  results.push({
    name: '👤 性格',
    score: 75,
    desc: personality.join('，'),
    advice: '注意发挥优势，克服短板'
  });

  // 生成HTML
  let html = '<div class="fortune-container">';
  results.forEach(r => {
    const color = r.score >= 70 ? '#52b788' : (r.score >= 40 ? '#c9a84c' : '#e74c3c');
    html += `
      <div class="fortune-card">
        <div class="fortune-name">${r.name}</div>
        <div class="fortune-score">
          <div class="score-bar">
            <div class="score-fill" style="width:${r.score}%;background:${color}"></div>
          </div>
          <span style="color:${color}">${r.score}分</span>
        </div>
        <div class="fortune-desc">${r.desc}</div>
        <div class="fortune-advice">建议：${r.advice}</div>
      </div>
    `;
  });
  html += '</div>';

  return html;
}


// ==================== 大运流年辅助函数 ====================

/**
 * 计算小运（1-8岁）
 * @param {number} year 出生年
 * @param {number} month 出生月
 * @param {number} day 出生日
 * @param {number} hourBranchIdx 时辰索引
 * @returns {Array} 小运数组
 */
function calcXiaoyun(year, month, day, hourBranchIdx) {
  const dayPillar = getDayStemBranch(year, month, day);
  const dayStem = STEMS[dayPillar.stemIdx];
  const xiaoyun = [];

  // 小运从时柱逆行
  let stemIdx = dayPillar.stemIdx;
  let branchIdx = hourBranchIdx;

  for (let i = 0; i < 8; i++) {
    // 逆行：干支都递减
    stemIdx = (stemIdx - 1 + 10) % 10;
    branchIdx = (branchIdx - 1 + 12) % 12;

    xiaoyun.push({
      age: i + 1,
      stem: STEMS[stemIdx],
      branch: BRANCHES[branchIdx],
      stemIdx,
      branchIdx,
      stemEle: STEM_ELEMENTS[stemIdx],
      branchEle: BRANCH_ELEMENTS[branchIdx]
    });
  }

  return xiaoyun;
}

/**
 * 判断大运对日主的生克关系
 * @param {string} dayStem 日主天干
 * @param {string} yunStem 大运天干
 * @param {string} yunBranch 大运地支
 * @param {string} dayStemEle 日主五行
 * @returns {Object} {type: '生扶'|'克泄'|'中性', desc: 描述}
 */
function getDayunImpact(dayStem, yunStem, yunBranch, dayStemEle) {
  const stemEle = STEM_ELEMENTS[STEMS.indexOf(yunStem)];
  const branchEle = BRANCH_ELEMENTS[BRANCHES.indexOf(yunBranch)];

  // 五行生克关系
  const sheng = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const ke = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

  const stemShengDay = sheng[stemEle] === dayStemEle;
  const stemKeDay = ke[stemEle] === dayStemEle;
  const branchShengDay = sheng[branchEle] === dayStemEle;
  const branchKeDay = ke[branchEle] === dayStemEle;

  let type, desc;

  if (stemShengDay || branchShengDay) {
    type = '生扶';
    desc = '泄秀';
  } else if (stemKeDay || branchKeDay) {
    type = '克泄';
    desc = '耗力';
  } else {
    type = '中性';
    desc = '无直接生克';
  }

  // 检查地支与日支的关系
  return { type, desc };
}

/**
 * 获取太岁方位（年支所在方位）
 * @param {number} year 年份
 * @returns {string} 太岁方位
 */
function getTaishai(year) {
  const branchIdx = ((year - 4) % 12 + 12) % 12;
  const branch = BRANCHES[branchIdx];
  const dirs = {
    '子': '北', '丑': '东北', '寅': '东北', '卯': '东',
    '辰': '东南', '巳': '东南', '午': '南', '未': '西南',
    '申': '西南', '酉': '西', '戌': '西北', '亥': '西北'
  };
  return dirs[branch] || '';
}

/**
 * 检查地支之间的刑冲合害关系
 * @param {string} branch1 第一个地支
 * @param {string} branch2 第二个地支
 * @returns {string} 关系名称（空字符串表示无关系）
 */
function checkRelationship(branch1, branch2) {
  if (!branch1 || !branch2) return '';

  const idx1 = BRANCHES.indexOf(branch1);
  const idx2 = BRANCHES.indexOf(branch2);
  if (idx1 === -1 || idx2 === -1) return '';

  const diff = Math.abs(idx1 - idx2);

  // 合（六合）
  const he = {
    '子': '丑', '丑': '子', '寅': '亥', '亥': '寅',
    '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰',
    '巳': '申', '申': '巳', '午': '未', '未': '午'
  };
  if (he[branch1] === branch2) return '合';

  // 冲（相冲 - 6位）
  if (diff === 6) return '冲';

  // 刑（三刑）
  const xing = {
    '寅': ['寅', '巳', '申'], '巳': ['寅', '巳', '申'], '申': ['寅', '巳', '申'],
    '丑': ['丑', '戌', '未'], '戌': ['丑', '戌', '未'], '未': ['丑', '戌', '未'],
    '子': ['子', '卯'], '卯': ['子', '卯'],
    '辰': ['辰'], '午': ['午'], '酉': ['酉'], '亥': ['亥']
  };
  if (xing[branch1] && xing[branch1].includes(branch2) && branch1 !== branch2) return '刑';

  // 害（六害）
  const hai = {
    '子': '未', '未': '子', '丑': '午', '午': '丑',
    '寅': '巳', '巳': '寅', '卯': '辰', '辰': '卯',
    '申': '亥', '亥': '申', '酉': '戌', '戌': '酉'
  };
  if (hai[branch1] === branch2) return '害';

  // 破（三合局破坏）
  const po = {
    '子': '酉', '酉': '子', '寅': '巳', '巳': '寅',
    '辰': '丑', '丑': '辰', '午': '未', '未': '午',
    '申': '卯', '卯': '申', '亥': '戌', '戌': '亥'
  };
  if (po[branch1] === branch2) return '破';

  return '';
}

// 主入口
function calcBazi() {
  const calendarType = document.getElementById('calendarType').value;
  const year   = parseInt(document.getElementById('birthYear').value);
  const month  = parseInt(document.getElementById('birthMonth').value);
  const day    = parseInt(document.getElementById('birthDay').value);
  const hour   = parseInt(document.getElementById('birthHour').value);
  const gender = document.getElementById('gender').value;

  if (!year || year < 1900 || year > 2100) {
    alert('请输入有效年份（1900-2100）');
    return;
  }

  // 阴历转换（自动处理闰月）
  let solarYear = year, solarMonth = month, solarDay = day;
  if (calendarType === 'lunar') {
    const converted = lunarToSolar(year, month, day);
    solarYear = converted.year;
    solarMonth = converted.month;
    solarDay = converted.day;
  }

  const result = calcBaziPillars(solarYear, solarMonth, solarDay, hour, gender);
  result.calendarType = calendarType;
  renderBazi(result);
}

// ==================== 导出功能 ====================

/**
 * 生成八字排盘图片
 */
function exportBaziImage() {
  const resultDiv = document.getElementById('baziResult');
  if (!resultDiv) {
    alert('请先生成排盘结果');
    return;
  }

  // 隐藏导出按钮避免被截图
  const exportBtns = document.querySelector('.export-buttons');
  if (exportBtns) exportBtns.style.display = 'none';

  html2canvas(resultDiv, {
    backgroundColor: '#1a1a2e',
    scale: 2,
    useCORS: true,
    logging: false
  }).then(canvas => {
    // 恢复导出按钮
    if (exportBtns) exportBtns.style.display = 'flex';

    // 下载图片
    const link = document.createElement('a');
    const year = document.getElementById('birthYear')?.value || '';
    const month = document.getElementById('birthMonth')?.value || '';
    const day = document.getElementById('birthDay')?.value || '';
    link.download = `八字排盘_${year}${month}${day}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(err => {
    if (exportBtns) exportBtns.style.display = 'flex';
    alert('生成图片失败: ' + err.message);
  });
}

/**
 * 复制八字排盘文字到剪贴板
 * @param {HTMLElement} [btn] 按钮元素
 */
function copyBaziText(btn) {
  if (!btn) btn = event.target;
  const year = document.getElementById('birthYear')?.value;
  const month = document.getElementById('birthMonth')?.value;
  const day = document.getElementById('birthDay')?.value;
  const hourSelect = document.getElementById('birthHour');
  const hour = hourSelect ? hourSelect.value : 0;

  if (!year || !month || !day) {
    alert('请先生成排盘结果');
    return;
  }

  // 获取时柱
  const hourNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const hourName = hourNames[hour] || '子';

  // 构建文本
  let text = `【八字排盘】${year}年${month}月${day}日 ${hourName}时\n`;

  // 获取四柱数据
  const pillarsGrid = document.getElementById('pillarsGrid');
  if (pillarsGrid) {
    const pillars = pillarsGrid.querySelectorAll('.pillar');
    if (pillars.length >= 4) {
      const yearPillar = pillars[0]?.querySelector('.pillar-stem')?.textContent || '';
      const monthPillar = pillars[1]?.querySelector('.pillar-stem')?.textContent || '';
      const dayPillar = pillars[2]?.querySelector('.pillar-stem')?.textContent || '';
      const hourPillar = pillars[3]?.querySelector('.pillar-stem')?.textContent || '';

      text += `年柱：${yearPillar}  月柱：${monthPillar}  日柱：${dayPillar}  时柱：${hourPillar}\n`;
    }
  }

  // 获取五行分布
  const wuxingBar = document.getElementById('wuxingBar');
  if (wuxingBar) {
    text += `五行：${wuxingBar.textContent.trim()}\n`;
  }

  // 获取大运信息
  const daYunGrid = document.getElementById('daYunGrid');
  if (daYunGrid) {
    const yunInfo = daYunGrid.querySelector('.yun-info');
    if (yunInfo) {
      text += `\n${yunInfo.textContent}\n`;
    }

    // 当前大运
    const currentItem = daYunGrid.querySelector('.daYun-item.current');
    if (currentItem) {
      const yearRange = currentItem.querySelector('.daYun-year')?.textContent || '';
      const stem = currentItem.querySelector('.daYun-stem')?.textContent || '';
      const branch = currentItem.querySelector('.daYun-branch')?.textContent || '';
      text += `当前运程：${stem}${branch}（${yearRange}）\n`;
    }
  }

  // 复制到剪贴板
  navigator.clipboard.writeText(text).then(() => {
    // 显示成功状态
    const originalText = btn.textContent;
    btn.textContent = '✓ 已复制';
    btn.style.background = 'rgba(82,183,136,0.3)';

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 2000);
  }).catch(err => {
    alert('复制失败: ' + err.message);
  });
}
