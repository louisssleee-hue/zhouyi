# 周易玄学网站

探索中国传统文化智慧，八字、风水、面相、手相、奇门遁甲五大玄学模块。

## 项目简介

周易玄学是一个基于 Web 的中国传统玄学知识网站，提供以下功能：

- **八字命理**：四柱排盘，精确节气计算，大运流年分析，神煞纳音解读
- **风水堪舆**：八卦九宫方位，命宅匹配计算，九宫飞星流年分析
- **面相学**：面部十二宫，百岁流年图，气色详解
- **手相学**：三大主纹，七大丘位，掌型分类
- **奇门遁甲**：九星八门知识，时空决策参考

## 本地预览

```bash
# 方法一：Python（无需安装）
python3 -m http.server 8080
# 访问 http://localhost:8080

# 方法二：Node.js
npx live-server --port=8080

# 方法三：VS Code
# 安装 Live Server 插件，右键 index.html → Open with Live Server
```

## Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo-url)

或手动部署：

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 进入项目目录
cd zhouyi

# 3. 部署
vercel
```

## 目录结构

```
zhouyi/
├── index.html          # 首页
├── bazi.html           # 八字命理
├── fengshui.html       # 风水堪舆
├── mianxiang.html      # 面相学
├── shouxiang.html      # 手相学
├── qimen.html          # 奇门遁甲
├── vercel.json         # Vercel 配置
├── _redirects          # Netlify 重定向
├── css/
│   └── style.css       # 样式文件
└── js/
    ├── main.js         # 主脚本
    ├── bazi.js         # 八字计算
    └── fengshui-calc.js # 风水计算
```

## 技术栈

- 纯 HTML/CSS/JavaScript，无框架依赖
- Google Fonts (Noto Serif SC, Shan Zheng)
- Ma Unsplash 图片

## 免责声明

本网站内容仅供传统文化学习参考，不构成任何命理预测或决策建议。
请理性对待玄学内容，切勿迷信。

---
© 2024 周易玄学 · 仅供参考 · 理性对待
