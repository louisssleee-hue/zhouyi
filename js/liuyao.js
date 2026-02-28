/**
 * liuyao.js - 六爻占卜
 */

// 六十四卦
const GUA_64 = [
  { name: '乾为天', gua: '111111', yao: '用九', feng: '乾宫' },
  { name: '坤为地', gua: '000000', yao: '用六', feng: '坤宫' },
  { name: '水雷屯', gua: '010011', yao: '屯', feng: '坎宫' },
  { name: '山水蒙', gua: '100011', yao: '蒙', feng: '坎宫' },
  { name: '水天需', gua: '010111', yao: '需', feng: '坎宫' },
  { name: '天水讼', gua: '111010', yao: '讼', feng: '坎宫' },
  { name: '地水师', gua: '000010', yao: '师', feng: '坎宫' },
  { name: '水地比', gua: '010000', yao: '比', feng: '坎宫' },
  { name: '风天小畜', gua: '110111', yao: '小畜', feng: '巽宫' },
  { name: '天泽履', gua: '111110', yao: '履', feng: '艮宫' },
  { name: '地天泰', gua: '000111', yao: '泰', feng: '坤宫' },
  { name: '天地否', gua: '111000', yao: '否', feng: '乾宫' },
  { name: '天火同人', gua: '111101', yao: '同人', feng: '乾宫' },
  { name: '火天大有', gua: '101111', yao: '大有', feng: '乾宫' },
  { name: '地山谦', gua: '001001', yao: '谦', feng: '艮宫' },
  { name: '雷地豫', gua: '011000', yao: '豫', feng: '震宫' }
];

// 八卦
const BAGUA = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

// 六亲
const LIUQIN = ['父母', '兄弟', '子孙', '妻财', '官鬼', '父母'];

// 六神
const LIUSHEN = ['青龙', '朱雀', '勾陈', '腾蛇', '白虎', '玄武'];

/**
 * 六爻起卦主函数
 */
function calcLiuyao() {
  const questionType = document.getElementById('questionType').value;
  const gender = document.getElementById('gender').value;
  const guaMethod = document.getElementById('guaMethod').value;

  // 自动起卦
  const gua = autoGua(guaMethod);

  // 计算结果
  const result = analyzeGua(gua, questionType, gender);
  renderLiuyao(result);
}

/**
 * 自动起卦
 */
function autoGua(method) {
  // 随机生成6个爻
  const yaos = [];
  for (let i = 0; i < 6; i++) {
    // 3枚铜钱：2正1反=少阳，1正2反=少阴，3正=老阳，3反=老阴
    const rand = Math.random();
    if (rand < 0.125) yaos.push({ value: 3, type: '老阳', yang: true }); // 3正
    else if (rand < 0.25) yaos.push({ value: 3, type: '老阴', yang: false }); // 3反
    else if (rand < 0.625) yaos.push({ value: 2, type: '少阳', yang: true }); // 2正1反
    else yaos.push({ value: 1, type: '少阴', yang: false }); // 1正2反
  }

  // 转换为卦象
  const guaStr = yaos.map(y => y.yang ? '1' : '0').join('');
  const guaInfo = findGua(guaStr);

  // 找出动爻
  const dongYao = yaos.findIndex(y => y.type === '老阳' || y.type === '老阴');
  const dongYao2 = yaos.findIndex(y => (y.type === '老阳' || y.type === '老阴') && yaos.indexOf(y) !== dongYao);

  return {
    yaos,
    guaStr,
    guaInfo,
    dongYao: dongYao >= 0 ? dongYao : null,
    dongYao2: dongYao2 >= 0 ? dongYao2 : null,
    hasDong: dongYao >= 0
  };
}

/**
 * 查找卦象
 */
function findGua(str) {
  // 简化：随机返回一个卦
  const idx = Math.floor(Math.random() * GUA_64.length);
  return GUA_64[idx];
}

/**
 * 分析卦象
 */
function analyzeGua(gua, questionType, gender) {
  // 用神选取
  const yongShen = getYongShen(questionType);

  // 分析动爻
  const dongAnalysis = analyzeDongYao(gua, yongShen);

  // 六亲分析
  const liuqinAnalysis = analyzeLiuQin(gua, yongShen);

  // 吉凶判断
  const jieguo = judgeJiguang(gua, dongAnalysis, liuqinAnalysis);

  return {
    gua,
    questionType,
    yongShen,
    dongAnalysis,
    liuqinAnalysis,
    jieguo
  };
}

/**
 * 获取用神
 */
function getYongShen(questionType) {
  const map = {
    '事业': '官鬼',
    '财运': '妻财',
    '婚姻': '妻财',
    '学业': '父母',
    '健康': '官鬼',
    '出行': '父母',
    '求职': '官鬼',
    '诉讼': '官鬼',
    '其他': '妻财'
  };
  return map[questionType] || '妻财';
}

/**
 * 分析动爻
 */
function analyzeDongYao(gua, yongShen) {
  if (!gua.hasDong) {
    return { hasDong: false, text: '本卦无动爻，静卦。事宜守成，不可妄动。' };
  }

  const dongIdx = gua.dongYao;
  const dongType = gua.yaos[dongIdx].type;

  let text = `第${dongIdx + 1}爻动`;
  if (dongType === '老阳') text += '，变阳（化进神）';
  if (dongType === '老阴') text += '，变阴（化退神）';

  return {
    hasDong: true,
    dongIdx,
    dongType,
    text,
    changed: dongType === '老阳' || dongType === '老阴'
  };
}

/**
 * 分析六亲
 */
function analyzeLiuQin(gua, yongShen) {
  // 简化：返回六亲关系
  const liuqins = gua.yaos.map((_, i) => LIUQIN[i]);
  return {
    liuqins,
    yongShen,
    yongShenPos: liuqins.indexOf(yongShen)
  };
}

/**
 * 判断吉凶
 */
function judgeJiguang(gua, dongAnalysis, liuqinAnalysis) {
  let jiguang = '平';
  let fuyuan = '';

  if (!gua.hasDong) {
    jiguang = '平';
    fuyuan = '静卦无动，看世应关系及用神旺衰。';
  } else if (dongAnalysis.dongType === '老阳') {
    jiguang = '吉';
    fuyuan = '动爻化进神，事态向好发展，吉利。';
  } else if (dongAnalysis.dongType === '老阴') {
    jiguang = '凶';
    fuyuan = '动爻化退神，事态向坏发展，需防。';
  }

  return { jiguang, fuyuan };
}

/**
 * 渲染六爻结果
 */
function renderLiuyao(result) {
  // 卦象显示
  const guaDisplay = document.getElementById('guaDisplay');
  if (guaDisplay) {
    let html = '<div class="gua-box">';
    html += `<div class="gua-name">${result.gua.guaInfo.name}</div>`;
    html += `<div class="gua-feng">${result.gua.guaInfo.feng}</div>`;
    html += '<div class="gua-yaos">';

    // 从上到下显示爻
    for (let i = 5; i >= 0; i--) {
      const yao = result.gua.yaos[i];
      const isDong = result.gua.dongYao === i || result.gua.dongYao2 === i;
      html += `<div class="yao-line ${isDong ? 'dong' : ''}">`;
      html += yao.yang ? '━━━' : '━ ━';
      if (yao.type === '老阳') html += ' ○';
      if (yao.type === '老阴') html += ' ×';
      html += '</div>';
    }

    html += '</div></div>';
    guaDisplay.innerHTML = html;
  }

  // 卦象解读
  const guaAnalysis = document.getElementById('guaAnalysis');
  if (guaAnalysis) {
    const descriptions = {
      '乾为天': '诸事大吉，吉利如意。适宜创业、求财、婚嫁。',
      '坤为地': '柔顺厚德，平稳发展。适宜修养、固守。',
      '水雷屯': '艰难险阻，创业初期。需耐心等待时机。',
      '山水蒙': '启蒙求知，学习阶段。适宜求学、培训。',
      '水天需': '等待时机，耐心等待。不可冒进，平安是福。',
      '天水讼': '争讼是非，防有诉讼。谨慎言行，避免争端。',
      '地水师': '领兵作战，领导有方。适宜管理、整合资源。',
      '水地比': '亲和依附，人缘佳。适宜合作、交友。'
    };
    guaAnalysis.innerHTML = `<p>${descriptions[result.gua.guaInfo.name] || '此卦各有其解，需细研六亲动变。'}</p>`;
  }

  // 动爻分析
  const dongyaoAnalysis = document.getElementById('dongyaoAnalysis');
  if (dongyaoAnalysis) {
    dongyaoAnalysis.innerHTML = `<p>${result.dongAnalysis.text}</p><p>用神为${result.yongShen}，宜关注${result.yongShen}爻之变化。</p>`;
  }

  // 六亲分析
  const liuqinGrid = document.getElementById('liuqinGrid');
  if (liuqinGrid) {
    let html = '<div class="liuqin-items">';
    result.liuqinAnalysis.liuqins.forEach((lq, i) => {
      const isYongShen = lq === result.yongShen;
      html += `<div class="liuqin-item ${isYongShen ? 'yongshen' : ''}">
        <div class="lq-yao">${['六爻','五爻','四爻','三爻','二爻','一爻'][i]}</div>
        <div class="lq-name">${lq}</div>
        <div class="lq-star">${LIUSHEN[i]}</div>
      </div>`;
    });
    html += '</div>';
    liuqinGrid.innerHTML = html;
  }

  // 吉凶判断
  const jieguoBox = document.getElementById('jieguoBox');
  if (jieguoBox) {
    const color = result.jieguo.jiguang === '吉' ? '#52b788' :
                  result.jieguo.jiguang === '凶' ? '#e74c3c' : '#c9a84c';
    jieguoBox.innerHTML = `
      <div class="jieguo-title" style="color:${color}">${result.jieguo.jiguang}</div>
      <div class="jieguo-desc">${result.jieguo.fuyuan}</div>
      <div class="jieguo-yongshen">用神：${result.yongShen}</div>
    `;
  }

  document.getElementById('liuyaoResult').style.display = 'block';
}
