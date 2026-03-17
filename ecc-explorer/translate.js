#!/usr/bin/env node
/**
 * ECC 中文翻译脚本 — 使用 DeepSeek API 批量生成中文说明
 *
 * 用法：node translate.js
 * 输出：zh-cache.json（缓存翻译结果），然后自动重新生成 data.js
 *
 * API Key 通过环境变量 DEEPSEEK_API_KEY 读取，或使用内置默认值
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-9128e9e9cf87463fa7657a5548ef21e9';
const CACHE_FILE = path.join(__dirname, 'zh-cache.json');
const DELAY_MS = 300; // 请求间隔，避免频率限制

// ─── 缓存管理 ───────────────────────────────────────────────────────────────

let cache = {};
if (fs.existsSync(CACHE_FILE)) {
  cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  console.log(`✓ 已加载缓存：${Object.keys(cache).length} 条`);
}

function saveCache() {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
}

// ─── ECC 文件读取（与 generate.js 共用逻辑）───────────────────────────────

function findECCBase() {
  const pluginCache = path.join(
    os.homedir(),
    '.claude/plugins/cache/everything-claude-code/everything-claude-code'
  );
  const versions = fs.readdirSync(pluginCache)
    .filter(v => /^\d+\.\d+\.\d+$/.test(v))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return { base: path.join(pluginCache, versions[versions.length - 1]), version: versions[versions.length - 1] };
}

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

function readMdDir(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const content = fs.readFileSync(path.join(dir, file), 'utf8');
      const { fm, body } = parseFrontmatter(content);
      return { id: path.basename(file, '.md'), fm, body };
    });
}

// ─── DeepSeek API ──────────────────────────────────────────────────────────

function callDeepSeek(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
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
          if (parsed.error) {
            reject(new Error(parsed.error.message));
            return;
          }
          const text = parsed.choices?.[0]?.message?.content || '';
          // 提取 JSON
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            resolve(JSON.parse(jsonMatch[0]));
          } else {
            resolve({ summary: text.trim(), keyPoints: [], whenToUse: '', tips: '' });
          }
        } catch (e) {
          reject(new Error(`解析失败: ${e.message}\n原始响应: ${data.slice(0, 200)}`));
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

// ─── 翻译提示词 ────────────────────────────────────────────────────────────

function buildPrompt(type, id, content) {
  const maxLen = 4000;
  const truncated = content.length > maxLen ? content.slice(0, maxLen) + '\n...(内容截断)' : content;

  return `你是 Claude Code（AI编程CLI工具）的中文技术文档专家。请将以下《${type}》组件（ID: ${id}）的英文文档总结为中文。

要求：
1. summary：3-5句完整中文说明，覆盖核心功能、用途和工作方式
2. keyPoints：3-6个要点（数组），每条20字以内，突出最重要的特性
3. whenToUse：何时使用（1-2句，具体场景）
4. tips：实用技巧或注意事项（1-2句）

必须返回严格的 JSON，不要有其他文字：
{
  "summary": "...",
  "keyPoints": ["...", "...", "..."],
  "whenToUse": "...",
  "tips": "..."
}

原文内容：
${truncated}`;
}

// ─── 批量翻译 ──────────────────────────────────────────────────────────────

async function translateItem(type, id, content) {
  const cacheKey = `${type}:${id}`;
  if (cache[cacheKey]) return cache[cacheKey]; // 命中缓存

  try {
    const result = await callDeepSeek(buildPrompt(type, id, content));
    cache[cacheKey] = result;
    saveCache();
    return result;
  } catch (e) {
    console.error(`\n  ✗ ${cacheKey} 失败: ${e.message}`);
    return null;
  }
}

async function translateAll() {
  const { base } = findECCBase();
  const items = [];

  // Agents
  readMdDir(path.join(base, 'agents')).forEach(({ id, body }) => {
    items.push({ type: 'agent', id, content: body });
  });

  // Commands
  readMdDir(path.join(base, 'commands')).forEach(({ id, body }) => {
    items.push({ type: 'command', id, content: body });
  });

  // Skills
  const skillsDir = path.join(base, 'skills');
  if (fs.existsSync(skillsDir)) {
    fs.readdirSync(skillsDir)
      .filter(d => fs.statSync(path.join(skillsDir, d)).isDirectory())
      .forEach(dir => {
        const skillFile = path.join(skillsDir, dir, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          const { body } = parseFrontmatter(fs.readFileSync(skillFile, 'utf8'));
          items.push({ type: 'skill', id: dir, content: body });
        }
      });
  }

  // Hooks（JS文件，提取注释和主体逻辑说明）
  const hooksDir = path.join(base, '.cursor', 'hooks');
  if (fs.existsSync(hooksDir)) {
    fs.readdirSync(hooksDir)
      .filter(f => f.endsWith('.js'))
      .forEach(file => {
        const id = path.basename(file, '.js');
        const content = fs.readFileSync(path.join(hooksDir, file), 'utf8');
        items.push({ type: 'hook', id, content: content.slice(0, 3000) });
      });
  }

  // Rules
  readMdDir(path.join(base, '.cursor', 'rules')).forEach(({ id, body }) => {
    items.push({ type: 'rule', id, content: body });
  });

  // 过滤已缓存的
  const pending = items.filter(({ type, id }) => !cache[`${type}:${id}`]);
  const total = items.length;
  const cached = total - pending.length;

  console.log(`\n📦 共 ${total} 个组件，已缓存 ${cached} 个，需翻译 ${pending.length} 个`);
  if (!pending.length) {
    console.log('✅ 全部已缓存，直接重新生成 data.js...');
    return;
  }

  console.log('🌐 开始调用 DeepSeek API...\n');
  let done = 0;
  for (const { type, id, content } of pending) {
    process.stdout.write(`  [${done + 1}/${pending.length}] ${type}:${id} ... `);
    await translateItem(type, id, content);
    process.stdout.write('✓\n');
    done++;
    if (done < pending.length) await sleep(DELAY_MS);
  }

  console.log(`\n✅ 翻译完成！缓存已保存到 zh-cache.json`);
}

// ─── 主程序 ───────────────────────────────────────────────────────────────

async function main() {
  console.log('🔤 ECC 中文翻译脚本（DeepSeek API）\n');
  await translateAll();
  console.log('\n🔄 重新生成 data.js...');
  execSync('node ' + path.join(__dirname, 'generate.js'), { stdio: 'inherit' });
  console.log('\n🎉 完成！刷新 index.html 即可查看中文说明');
}

main().catch(e => {
  console.error('\n❌ 出错：', e.message);
  process.exit(1);
});
