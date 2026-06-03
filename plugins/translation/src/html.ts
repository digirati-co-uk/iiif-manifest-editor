type HtmlToken =
  | {
      type: "tag";
      value: string;
    }
  | {
      type: "text";
      value: string;
    };

const voidTags = new Set(["br", "hr", "img", "input", "meta", "link", "area", "base", "col", "embed", "param", "source", "track", "wbr"]);

export async function translatePreservingSimpleHtml(
  value: string,
  translateText: (text: string) => Promise<string>,
): Promise<string | null> {
  const tokens = tokenizeSimpleHtml(value);
  if (!tokens || !isBalancedSimpleHtml(tokens)) {
    return null;
  }

  const translated: string[] = [];
  for (const token of tokens) {
    if (token.type === "tag") {
      translated.push(token.value);
      continue;
    }

    if (!token.value.trim()) {
      translated.push(token.value);
      continue;
    }

    const leading = token.value.match(/^\s*/)?.[0] || "";
    const trailing = token.value.match(/\s*$/)?.[0] || "";
    const text = token.value.trim();
    translated.push(`${leading}${await translateText(text)}${trailing}`);
  }

  return translated.join("");
}

function tokenizeSimpleHtml(value: string): HtmlToken[] | null {
  const tokens: HtmlToken[] = [];
  const tagPattern = /<\/?[^>]+>/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(value))) {
    if (match.index > cursor) {
      const text = value.slice(cursor, match.index);
      if (/[<>]/.test(text)) {
        return null;
      }
      tokens.push({ type: "text", value: text });
    }

    const tag = match[0];
    if (!/^<\/?[A-Za-z][A-Za-z0-9:-]*(\s+[^<>]*)?\/?>$/.test(tag)) {
      return null;
    }
    tokens.push({ type: "tag", value: tag });
    cursor = match.index + tag.length;
  }

  if (cursor < value.length) {
    const text = value.slice(cursor);
    if (/[<>]/.test(text)) {
      return null;
    }
    tokens.push({ type: "text", value: text });
  }

  return tokens.length ? tokens : null;
}

function isBalancedSimpleHtml(tokens: HtmlToken[]) {
  const stack: string[] = [];

  for (const token of tokens) {
    if (token.type !== "tag") {
      continue;
    }

    const close = token.value.match(/^<\/\s*([A-Za-z][A-Za-z0-9:-]*)\s*>$/);
    if (close) {
      const expected = stack.pop();
      if (expected !== close[1].toLowerCase()) {
        return false;
      }
      continue;
    }

    const open = token.value.match(/^<\s*([A-Za-z][A-Za-z0-9:-]*)/);
    if (!open) {
      return false;
    }

    const tagName = open[1].toLowerCase();
    if (token.value.endsWith("/>") || voidTags.has(tagName)) {
      continue;
    }

    stack.push(tagName);
  }

  return stack.length === 0;
}
