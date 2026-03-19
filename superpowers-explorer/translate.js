#!/usr/bin/env node
/**
 * Superpowers 中文翻译脚本 — 使用 DeepSeek API 批量生成中文说明
 *
 * 用法：DEEPSEEK_API_KEY=sk-xxx node superpowers-explorer/translate.js
 * 输出：superpowers-explorer/zh-cache.json，然后自动重新生成 data.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const API_KEY = process.env.DEEPSEEK_API_KEY;
if (!API_KEY) {
  console.error('❌ 请设置环境变量 DEEPSEEK_API_KEY');
  process.exit(1);
}

const CACHE_FILE = path.join(__dirname, 'zh-cache.json');
const DELAY_MS = 300;

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

function findSPBase() {
  const pluginCache = path.join(
    os.homedir(),
    '.claude/plugins/cache/superpowers-marketplace/superpowers'
  );
  const versions = fs.readdirSync(pluginCache)
    .filter(v => /^\d+\.\d+\.\d+$/.test(v))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return { base: path.join(pluginCache, versions[versions.length - 1]) };
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { body: content.trim() };
  return { body: match[2].trim() };
}

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

function buildPrompt(type, id, content) {
  const truncated = content.length > 3000 ? content.slice(0, 3000) + '\n...(截断)' : content;
  return `你是 Claude Code AI 工作流工具（Superpowers）的中文文档专家。请将以下《${type}》组件（ID: ${id}）的英文文档总结为中文。

要求：
1. summary：3-5句完整中文说明，覆盖核心功能、用途和工作方式
2. keyPoints：3-5个要点（数组），每条20字以内
3. whenToUse：何时使用（1-2句，具体场景）
4. tips：实用技巧或注意事项（1-2句）

必须返回严格 JSON，不要其他文字：
{"summary":"...","keyPoints":["..."],"whenToUse":"...","tips":"..."}

原文：
${truncated}`;
}

async function main() {
  console.log('🔤 Superpowers 中文翻译脚本\n');
  const { base } = findSPBase();
  const items = [];

  // Skills
  const skillsDir = path.join(base, 'skills');
  if (fs.existsSync(skillsDir)) {
    fs.readdirSync(skillsDir)
      .filter(d => fs.statSync(path.join(skillsDir, d)).isDirectory())
      .forEach(dir => {
        const f = path.join(skillsDir, dir, 'SKILL.md');
        if (fs.existsSync(f)) {
          const { body } = parseFrontmatter(fs.readFileSync(f, 'utf8'));
          items.push({ type: 'skill', id: dir, content: body });
        }
      });
  }

  // Commands
  const commandsDir = path.join(base, 'commands');
  if (fs.existsSync(commandsDir)) {
    fs.readdirSync(commandsDir)
      .filter(f => f.endsWith('.md') && !f.startsWith('_'))
      .forEach(file => {
        const id = path.basename(file, '.md');
        const { body } = parseFrontmatter(fs.readFileSync(path.join(commandsDir, file), 'utf8'));
        items.push({ type: 'command', id, content: body });
      });
  }

  // Agents
  const agentsDir = path.join(base, 'agents');
  if (fs.existsSync(agentsDir)) {
    fs.readdirSync(agentsDir).filter(f => f.endsWith('.md')).forEach(file => {
      const id = path.basename(file, '.md');
      const { body } = parseFrontmatter(fs.readFileSync(path.join(agentsDir, file), 'utf8'));
      items.push({ type: 'agent', id, content: body });
    });
  }

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

  console.log('\n🔄 重新生成 data.js...');
  execSync('node ' + path.join(__dirname, 'generate.js'), { stdio: 'inherit' });
  console.log('\n🎉 完成！刷新 index.html 即可查看中文说明');
}

main().catch(e => { console.error('\n❌', e.message); process.exit(1); });
