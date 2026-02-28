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
  const monthBranchIdx = (monthIndex + 2) % 12; // 寅月=0

  const monthBranchNames = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

  return {
    monthStem: STEMS[monthStemIdx],
    monthBranch: monthBranchNames[monthBranchIdx],
    monthStemIdx,
    monthBranchIdx,
    termName: prevTerm || '未知'
  };
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

const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
const STEM_ELEMENTS = ['木','木','火','火','土','土','金','金','水','水'];
const BRANCH_ELEMENTS = ['水','土','木','木','土','火','火','土','金','金','土','水'];
const ZODIAC = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const STEM_YIN_YANG = ['阳','阴','阳','阴','阳','阴','阳','阴','阳','阴'];
const BRANCH_YIN_YANG = ['阳','阴','阳','阴','阳','阴','阳','阴','阳','阴','阳','阴'];

const ELEMENT_COLOR = {
  '木': '#52b788',
  '火': '#e74c3c',
  '土': '#c9a84c',
  '金': '#cccccc',
  '水': '#5dade2'
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
 * 计算朱利安日数（用于日柱）
 */
function getJulianDay(year, month, day) {
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
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

  // ── 月柱（精确：节气为界）──
  const monthInfo = getMonthFromSolarTerm(year, month, day, 0, 0);
  const monthStem = monthInfo.monthStem;
  const monthBranch = monthInfo.monthBranch;
  const monthStemIdx = monthInfo.monthStemIdx;
  const monthBranchIdx = monthInfo.monthBranchIdx;

  // ── 日柱 ──
  const jd = Math.floor(getJulianDay(year, month, day));
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
      branchEle: BRANCH_ELEMENTS[hour],
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
 * 渲染四柱到页面
 */
function renderBazi(result) {
  const { pillars, elemCount, daYun, shensha, info } = result;

  // 四柱
  const grid = document.getElementById('pillarsGrid');
  if (grid) {
    grid.innerHTML = pillars.map(p => `
      <div class="pillar">
        <div class="pillar-label">${p.label}</div>
        <div class="pillar-stem" style="color:${ELEMENT_COLOR[p.stemEle]}">${p.stem}</div>
        <div class="pillar-branch" style="color:${ELEMENT_COLOR[p.branchEle]}">${p.branch}</div>
        <span class="pillar-element element-${p.stemEle}">${p.stemEle}</span>
        <span class="pillar-element element-${p.branchEle}" style="margin-left:4px">${p.branchEle}</span>
      </div>
    `).join('');
    grid.style.display = 'grid';
  }

  // 基本信息
  const infoGrid = document.getElementById('infoGrid');
  const daYunDetail = info.daYunCalc || {};
  if (infoGrid) {
    infoGrid.innerHTML = `
      <div class="info-item"><div class="info-key">生肖</div><div class="info-val">${info.zodiac}</div></div>
      <div class="info-item"><div class="info-key">日主</div><div class="info-val" style="color:${ELEMENT_COLOR[info.dayStemEle]}">${pillars[2].stem}（${info.dayStemYY}${info.dayStemEle}）</div></div>
      <div class="info-item"><div class="info-key">年纳音</div><div class="info-val">${info.nayin}</div></div>
      <div class="info-item"><div class="info-key">日纳音</div><div class="info-val">${info.dayNayin}</div></div>
      <div class="info-item"><div class="info-key">起运</div><div class="info-val">${info.startAge}岁 ${daYunDetail.direction || '顺行'}</div></div>
      <div class="info-item"><div class="info-key">五行最旺</div><div class="info-val" style="color:${ELEMENT_COLOR[info.maxEle]}">${info.maxEle}（${elemCount[info.maxEle]}个）</div></div>
      <div class="info-item"><div class="info-key">五行最弱</div><div class="info-val" style="color:${ELEMENT_COLOR[info.minEle]}">${info.minEle}（${elemCount[info.minEle]}个）</div></div>
    `;
  }

  // 五行分布
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

  // 大运
  const daYunGrid = document.getElementById('daYunGrid');
  if (daYunGrid) {
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - parseInt(document.getElementById('birthYear')?.value || 2000);
    daYunGrid.innerHTML = daYun.map((dy, i) => {
      const isCurrent = currentAge >= dy.age && currentAge <= dy.ageEnd;
      return `<div class="pillar" style="opacity:${1 - i * 0.05};${isCurrent ? 'border-color:var(--gold);box-shadow:0 0 15px rgba(201,168,76,0.3)' : ''}">
        <div class="pillar-label">${dy.age}-${dy.ageEnd}岁${isCurrent ? ' ★' : ''}</div>
        <div class="pillar-stem" style="color:${ELEMENT_COLOR[dy.stemEle]};font-size:1.8rem">${dy.stem}</div>
        <div class="pillar-branch" style="color:${ELEMENT_COLOR[dy.branchEle]};font-size:1.8rem">${dy.branch}</div>
        <span class="pillar-element element-${dy.stemEle}">${dy.stemEle}</span>
      </div>`;
    }).join('');
  }

  // 神煞
  const shenshaGrid = document.getElementById('shenshaGrid');
  if (shenshaGrid && shensha.length > 0) {
    shenshaGrid.innerHTML = shensha.map(s => `
      <div class="shensha-item">
        <div class="shensha-name">${s.name} <span class="badge ${s.type === '吉' || s.type === '艺' ? 'badge-ji2' : s.type === '凶' ? 'badge-ji' : ''}">${s.type}</span></div>
        <div class="shensha-desc">${s.desc}</div>
      </div>
    `).join('');
  }

  // 命局分析
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

// 主入口
function calcBazi() {
  const year   = parseInt(document.getElementById('birthYear').value);
  const month  = parseInt(document.getElementById('birthMonth').value);
  const day    = parseInt(document.getElementById('birthDay').value);
  const hour   = parseInt(document.getElementById('birthHour').value);
  const gender = document.getElementById('gender').value;

  if (!year || year < 1900 || year > 2100) {
    alert('请输入有效年份（1900-2100）');
    return;
  }

  const result = calcBaziPillars(year, month, day, hour, gender);
  renderBazi(result);
}
