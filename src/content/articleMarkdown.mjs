/**
 * Minimal Markdown for the two approved French guides.
 * Renders the constructs those files use and escapes text so the page cannot
 * pick up markup that was not in the article.
 */

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isExternal(href) {
  return !/^https:\/\/borderday\.com\//.test(href);
}

function inline(escaped) {
  let out = '';
  let i = 0;
  while (i < escaped.length) {
    if (escaped.startsWith('**', i)) {
      const end = escaped.indexOf('**', i + 2);
      if (end !== -1) {
        out += `<strong>${inline(escaped.slice(i + 2, end))}</strong>`;
        i = end + 2;
        continue;
      }
    }
    if (escaped[i] === '[') {
      const close = escaped.indexOf('](', i);
      const endParen = close === -1 ? -1 : escaped.indexOf(')', close + 2);
      if (close !== -1 && endParen !== -1) {
        const label = escaped.slice(i + 1, close);
        const href = escaped.slice(close + 2, endParen);
        const extra = isExternal(href) ? ' rel="noopener noreferrer" target="_blank"' : '';
        out += `<a href="${href}"${extra}>${inline(label)}</a>`;
        i = endParen + 1;
        continue;
      }
    }
    out += escaped[i];
    i += 1;
  }
  return out;
}

function isBlockStart(line) {
  return /^#{1,3} /.test(line) || line.startsWith('|') || /^\s*- /.test(line) || /^\d+\. /.test(line);
}

function readList(lines, start, indent) {
  const items = [];
  let i = start;
  while (i < lines.length) {
    const match = lines[i].match(/^(\s*)- (.*)$/);
    if (!match || match[1].length !== indent) break;
    const text = match[2].trim();
    i += 1;
    let nested = '';
    const child = lines[i] && lines[i].match(/^(\s*)- /);
    if (child && child[1].length > indent) {
      const sub = readList(lines, i, child[1].length);
      nested = sub.html;
      i = sub.i;
    }
    items.push(`<li>${inline(esc(text))}${nested ? ` ${nested}` : ''}</li>`);
  }
  return { html: `<ul>${items.join('')}</ul>`, i };
}

function splitRow(line) {
  const parts = line.split('|');
  if (parts.length && parts[0].trim() === '') parts.shift();
  if (parts.length && parts[parts.length - 1].trim() === '') parts.pop();
  return parts.map((cell) => cell.trim());
}

function isSeparatorRow(line) {
  const cells = splitRow(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function tableHtml(rows) {
  const header = splitRow(rows[0]);
  const body = [];
  for (let r = 1; r < rows.length; r += 1) {
    if (isSeparatorRow(rows[r])) continue;
    body.push(splitRow(rows[r]));
  }
  const th = header.map((cell) => `<th scope="col">${inline(esc(cell))}</th>`).join('');
  const trs = body
    .map((cells) => {
      const tds = cells
        .map((cell, index) =>
          index === 0
            ? `<th scope="row">${inline(esc(cell))}</th>`
            : `<td>${inline(esc(cell))}</td>`,
        )
        .join('');
      return `<tr>${tds}</tr>`;
    })
    .join('');
  return `<div class="article-table-wrap"><table class="article-table"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`;
}

export function markdownToArticle(markdown) {
  const text = String(markdown).replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
  if (
    text.startsWith('---') ||
    text.includes('\nstatus:') ||
    text.includes('NOTE INTERNE') ||
    text.includes('url_article_public')
  ) {
    throw new Error('Article markdown still contains front matter or internal notes');
  }
  const lines = text.split('\n');
  let i = 0;
  while (i < lines.length && lines[i].trim() === '') i += 1;
  if (!lines[i] || !lines[i].startsWith('# ')) throw new Error('Article is missing its title');
  const h1 = lines[i].slice(2).trim();
  i += 1;
  const blocks = [];
  let firstPara = true;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') {
      i += 1;
      continue;
    }
    if (line.startsWith('# ')) throw new Error('Article has a second title');
    if (line.startsWith('### ')) {
      blocks.push(`<h3>${inline(esc(line.slice(4).trim()))}</h3>`);
      i += 1;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(`<h2>${inline(esc(line.slice(3).trim()))}</h2>`);
      i += 1;
      continue;
    }
    if (line.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i]);
        i += 1;
      }
      blocks.push(tableHtml(rows));
      continue;
    }
    if (/^- /.test(line)) {
      const list = readList(lines, i, 0);
      blocks.push(list.html);
      i = list.i;
      continue;
    }
    if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, '').trim());
        i += 1;
      }
      blocks.push(`<ol>${items.map((item) => `<li>${inline(esc(item))}</li>`).join('')}</ol>`);
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() !== '' && !isBlockStart(lines[i])) {
      para.push(lines[i].trim());
      i += 1;
    }
    const cls = firstPara ? ' class="lede"' : '';
    firstPara = false;
    blocks.push(`<p${cls}>${inline(esc(para.join(' ')))}</p>`);
  }
  return { h1, bodyHtml: blocks.join('\n') };
}

export function markdownPlain(markdown) {
  const s = String(markdown).replace(/\r\n/g, '\n').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const lines = s.split('\n').flatMap((line) => {
    if (/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)) return [];
    if (/^#{1,6}\s+/.test(line)) return [line.replace(/^#{1,6}\s+/, '')];
    let t = line.replace(/^\s*-\s+/, '');
    t = t.replace(/^\s*\d+\.\s+/, '');
    t = t.replace(/^\s*\|/, '').replace(/\|\s*$/, '').replace(/\|/g, ' ');
    return [t];
  });
  return lines.join(' ').replace(/\s+/g, ' ').trim();
}

export function htmlPlain(html) {
  return String(html)
    .replace(/<\/(p|h1|h2|h3|li|tr|th|td|div|table|ul|ol)>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}
