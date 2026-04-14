#!/usr/bin/env node
/**
 * GSD Explorer 中文翻译脚本 — 使用 DeepSeek API 批量生成中文说明
 *
 * 用法：DEEPSEEK_API_KEY=sk-xxx node gsd-explorer/translate.js
 * 输出：gsd-explorer/zh-cache.json，然后自动重新生成 data.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── 环境检查 ─────────────────────────────────────────────────────────────────

const API_KEY = process.env.DEEPSEEK_API_KEY;
if (!API_KEY) {
  console.error('❌ 请设置环境变量 DEEPSEEK_API_KEY');
  process.exit(1);
}

// ─── 常量 ─────────────────────────────────────────────────────────────────────

const CACHE_DIR = path.join(__dirname, '.cache', 'gsd');
const CACHE_FILE = path.join(__dirname, 'zh-cache.json');
const DELAY_MS = 300;

// ─── 确保仓库存在 ─────────────────────────────────────────────────────────────

if (!fs.existsSync(path.join(CACHE_DIR, '.git'))) {
  console.log('⚠️ GSD 仓库不存在，先运行 generate.js 克隆...');
  execSync('node ' + path.join(__dirname, 'generate.js'), { stdio: 'inherit' });
}

// ─── 缓存管理 ─────────────────────────────────────────────────────────────────

let cache = {};
if (fs.existsSync(CACHE_FILE)) {
  try {
    cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    console.log(`✓ 已加载缓存：${Object.keys(cache).length} 条`);
  } catch (e) {
    console.warn(`⚠️ zh-cache.json 解析失败，从空缓存开始：${e.message}`);
  }
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

// ─── 解析工具 ─────────────────────────────────────────────────────────────────

/**
 * 解析 YAML frontmatter，返回 { fm, body }
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { body: content.trim() };
  return { body: match[2].trim() };
}

// ─── DeepSeek API 调用 ────────────────────────────────────────────────────────

function callDeepSeek(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 800,
    });
    const options = {
      hostname: 'api.deepseek.com',
      path: '/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) { reject(new Error(parsed.error.message)); return; }
          const text = parsed.choices?.[0]?.message?.content || '';
          // 提取 JSON 对象
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          resolve(jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text.trim(), keyPoints: [], whenToUse: '', tips: '' });
        } catch (e) {
          reject(new Error(`解析失败: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(); reject(new Error('请求超时')); });
    req.write(body);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Prompt 模板 ──────────────────────────────────────────────────────────────

function buildPrompt(type, id, content) {
  const truncated = content.length > 3000 ? content.slice(0, 3000) + '\n...(截断)' : content;
  return `你是 GET SHIT DONE (GSD) AI 开发工作流工具的中文文档专家。请将以下《${type}》组件（ID: ${id}）的英文文档总结为中文。

要求：
1. summary：3-5句完整中文说明
2. keyPoints：3-5个要点（数组），每条20字以内
3. whenToUse：何时使用（1-2句）
4. tips：实用技巧或注意事项（1-2句）

必须返回严格 JSON，不要其他文字：
{"summary":"...","keyPoints":["..."],"whenToUse":"...","tips":"..."}

原文：
${truncated}`;
}

// ─── 收集组件 ─────────────────────────────────────────────────────────────────

function collectItems() {
  const items = [];

  // Agents: agents/*.md
  const agentsDir = path.join(CACHE_DIR, 'agents');
  if (fs.existsSync(agentsDir)) {
    fs.readdirSync(agentsDir)
      .filter(f => f.endsWith('.md'))
      .forEach(file => {
        const id = path.basename(file, '.md');
        const content = fs.readFileSync(path.join(agentsDir, file), 'utf8');
        const { body } = parseFrontmatter(content);
        items.push({ type: 'agent', id, content: body });
      });
  }

  // Commands: commands/gsd/*.md
  const commandsDir = path.join(CACHE_DIR, 'commands', 'gsd');
  if (fs.existsSync(commandsDir)) {
    fs.readdirSync(commandsDir)
      .filter(f => f.endsWith('.md'))
      .forEach(file => {
        const id = path.basename(file, '.md');
        const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
        const { body } = parseFrontmatter(content);
        items.push({ type: 'command', id, content: body });
      });
  }

  // Hooks: hooks/*.js|*.sh
  const hooksDir = path.join(CACHE_DIR, 'hooks');
  if (fs.existsSync(hooksDir)) {
    fs.readdirSync(hooksDir)
      .filter(f => f.endsWith('.js') || f.endsWith('.sh'))
      .forEach(file => {
        const id = path.basename(file, path.extname(file));
        const content = fs.readFileSync(path.join(hooksDir, file), 'utf8');
        items.push({ type: 'hook', id, content });
      });
  }

  return items;
}

// ─── 主程序 ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔤 GSD Explorer 中文翻译脚本\n');

  const items = collectItems();
  const pending = items.filter(({ type, id }) => !cache[`${type}:${id}`]);

  console.log(`📦 共 ${items.length} 个组件，已缓存 ${items.length - pending.length} 个，需翻译 ${pending.length} 个`);

  if (!pending.length) {
    console.log('✅ 全部已缓存，重新生成 data.js...');
  } else {
    console.log('🌐 开始调用 DeepSeek API...\n');
    let done = 0;
    for (const { type, id, content } of pending) {
      process.stdout.write(`  [${done + 1}/${pending.length}] ${type}:${id} ... `);
      try {
        const result = await callDeepSeek(buildPrompt(type, id, content));
        cache[`${type}:${id}`] = result;
        saveCache();
        process.stdout.write('✓\n');
      } catch (e) {
        process.stdout.write(`✗ ${e.message}\n`);
      }
      done++;
      if (done < pending.length) await sleep(DELAY_MS);
    }
    console.log('\n✅ 翻译完成！');
  }

  // 重新生成 data.js
  console.log('\n🔄 重新生成 data.js...');
  execSync('node ' + path.join(__dirname, 'generate.js'), { stdio: 'inherit' });
  console.log('\n🎉 完成！刷新 index.html 即可查看中文说明');
}

main().catch(e => { console.error('\n❌', e.message); process.exit(1); });
