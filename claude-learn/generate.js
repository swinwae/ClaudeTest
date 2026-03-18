#!/usr/bin/env node
/**
 * claude-learn 数据生成脚本
 * 将 content/ 目录下的 Markdown 课程文件编译为 data.js
 *
 * 用法：node generate.js
 * 输出：data.js（被 index.html 引用，window.LEARN_DATA）
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = path.join(__dirname, 'content');

// ─── Markdown 解析工具 ────────────────────────────────────────────────────────

/**
 * 解析 YAML frontmatter
 * 格式：--- key: value --- 正文
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { fm: {}, body: content.trim() };
  const fm = {};
  match[1].split('\n').forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx <= 0) return;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      try { val = JSON.parse(val); } catch { val = []; }
    } else {
      val = val.replace(/^["']|["']$/g, '');
    }
    fm[key] = val;
  });
  return { fm, body: match[2].trim() };
}

/**
 * 从课程 Markdown 正文中解析练习块
 * 格式：
 *   ---exercise---
 *   title: xxx
 *   difficulty: 入门
 *   ---
 *   题目描述
 *   ---hints---
 *   提示内容
 *   ---solution---
 *   解答内容
 */
function parseExercises(body) {
  const exercises = [];
  // 切割出练习块（---exercise--- 到下一个 ---exercise--- 或文末）
  const parts = body.split(/^---exercise---$/m);
  const mainContent = parts[0].trim();

  for (let i = 1; i < parts.length; i++) {
    const block = parts[i].trim();
    if (!block) continue;

    // 解析练习的 frontmatter（---\n...\n---）
    const fmMatch = block.match(/^([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) continue;

    const exFm = {};
    fmMatch[1].split('\n').forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx <= 0) return;
      exFm[line.slice(0, colonIdx).trim()] = line.slice(colonIdx + 1).trim();
    });

    const rest = fmMatch[2];

    // 切分 hints 和 solution
    const hintsSplit = rest.split(/^---hints---$/m);
    const description = hintsSplit[0].trim();

    let hints = '';
    let solution = '';

    if (hintsSplit.length > 1) {
      const solutionSplit = hintsSplit[1].split(/^---solution---$/m);
      hints = solutionSplit[0].trim();
      solution = solutionSplit.length > 1 ? solutionSplit[1].trim() : '';
    } else {
      // 没有 hints，直接找 solution
      const solutionSplit = description.split(/^---solution---$/m);
      if (solutionSplit.length > 1) {
        solution = solutionSplit[1].trim();
      }
    }

    exercises.push({
      id: `ex-${i}`,
      title: exFm.title || `练习 ${i}`,
      difficulty: exFm.difficulty || '入门',
      description,
      hints,
      solution,
    });
  }

  return { mainContent, exercises };
}

// ─── 读取课程目录 ───────────────────────────────────────────────────────────────

function readLessons(stageDir, stageId) {
  if (!fs.existsSync(stageDir)) return [];
  return fs.readdirSync(stageDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(file => {
      const content = fs.readFileSync(path.join(stageDir, file), 'utf8');
      const { fm, body } = parseFrontmatter(content);
      const { mainContent, exercises } = parseExercises(body);
      const lessonId = path.basename(file, '.md');
      return {
        id: `${stageId}/${lessonId}`,
        title: fm.title || lessonId,
        difficulty: fm.difficulty || '入门',
        readTime: parseInt(fm.readTime) || 5,
        order: parseInt(fm.order) || 0,
        tags: Array.isArray(fm.tags) ? fm.tags : (fm.tags ? [fm.tags] : []),
        content: mainContent,
        exercises,
      };
    });
}

// ─── 读取学习路径 ──────────────────────────────────────────────────────────────

const STAGE_META = {
  '01-getting-started': { title: '入门篇', icon: '🚀', description: '从零开始：安装、配置、基本操作' },
  '02-core':            { title: '核心篇', icon: '⚡', description: '掌握核心技能：文件操作、代码生成、Git 工作流' },
  '03-advanced':        { title: '进阶篇', icon: '🔧', description: 'Agent 系统、自定义命令、Hooks 与自动化' },
  '04-mastery':         { title: '精通篇', icon: '🏆', description: '多 Agent 编排、性能优化、团队协作' },
};

function readPath() {
  const pathDir = path.join(CONTENT_DIR, 'path');
  if (!fs.existsSync(pathDir)) return [];

  return fs.readdirSync(pathDir)
    .filter(d => {
      const stat = fs.statSync(path.join(pathDir, d));
      return stat.isDirectory();
    })
    .sort()
    .map(dir => {
      const meta = STAGE_META[dir] || { title: dir, icon: '📚', description: '' };
      const lessons = readLessons(path.join(pathDir, dir), dir);
      return {
        id: dir,
        title: meta.title,
        icon: meta.icon,
        description: meta.description,
        lessons,
      };
    });
}

// ─── 读取最佳实践 ──────────────────────────────────────────────────────────────

function readPractices() {
  const practicesDir = path.join(CONTENT_DIR, 'practices');
  if (!fs.existsSync(practicesDir)) return [];

  return fs.readdirSync(practicesDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .map(file => {
      const content = fs.readFileSync(path.join(practicesDir, file), 'utf8');
      const { fm, body } = parseFrontmatter(content);
      return {
        id: path.basename(file, '.md'),
        title: fm.title || path.basename(file, '.md'),
        tags: Array.isArray(fm.tags) ? fm.tags : (fm.tags ? [fm.tags] : []),
        description: fm.description || '',
        content: body,
      };
    });
}

// ─── 读取速查卡片 ──────────────────────────────────────────────────────────────

function readCheatsheet() {
  const cheatsheetDir = path.join(CONTENT_DIR, 'cheatsheet');
  if (!fs.existsSync(cheatsheetDir)) return {};

  const result = {};
  fs.readdirSync(cheatsheetDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .forEach(file => {
      const content = fs.readFileSync(path.join(cheatsheetDir, file), 'utf8');
      const { fm, body } = parseFrontmatter(content);
      const key = path.basename(file, '.md');
      result[key] = { title: fm.title || key, order: parseInt(fm.order) || 99, content: body };
    });
  return result;
}

// ─── 统计 ────────────────────────────────────────────────────────────────────

function countStats(pathData, practices) {
  let lessons = 0;
  let exercises = 0;
  pathData.forEach(stage => {
    lessons += stage.lessons.length;
    stage.lessons.forEach(l => { exercises += l.exercises.length; });
  });
  return { lessons, exercises, practices: practices.length };
}

// ─── 主程序 ───────────────────────────────────────────────────────────────────

function main() {
  console.log('🚀 生成 claude-learn 数据...\n');

  const pathData = readPath();
  const practices = readPractices();
  const cheatsheet = readCheatsheet();
  const stats = countStats(pathData, practices);

  const data = {
    meta: {
      version: '1.0.0',
      generatedAt: new Date().toISOString().slice(0, 10),
      stats,
    },
    path: pathData,
    practices,
    cheatsheet,
  };

  const outputPath = path.join(__dirname, 'data.js');
  const js = `// 由 generate.js 自动生成 — ${data.meta.generatedAt}\nwindow.LEARN_DATA = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(outputPath, js, 'utf8');

  console.log(`✅ 生成完成：${outputPath}`);
  console.log(`   课程阶段：${pathData.length} 个`);
  console.log(`   课程总数：${stats.lessons} 课`);
  console.log(`   练习总数：${stats.exercises} 个`);
  console.log(`   最佳实践：${stats.practices} 篇`);
  console.log(`   速查卡片：${Object.keys(cheatsheet).length} 组`);
  console.log('\n💡 用浏览器打开 index.html 即可学习');
}

main();
