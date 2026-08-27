import { LanguageRunner } from "./LanguageRunner";

export class JsRunner extends LanguageRunner {
  fileExtension = "js";

  compileCommand(): string | null {
    return null;
  }

  runCommand(fileName: string): string {
    return `node /workspace/${fileName}.js`;
  }

  wrapCode(userCode: string, questionMeta: any): string {
    const title = questionMeta?.title || "";
    const camelTitle = title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((word: string, index: number) =>
        index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");

    // Statically detect target function name from user code to avoid module-scope eval lookup issues
    let targetFnName: string | null = null;

    if (/class\s+Solution\b/.test(userCode)) {
      targetFnName = "Solution";
    } else if (camelTitle && new RegExp(`(?:function|const|let|var)\\s+${camelTitle}\\b`).test(userCode)) {
      targetFnName = camelTitle;
    } else {
      const match = userCode.match(/(?:function|const|let|var)\s+([a-zA-Z0-9_$]+)/);
      if (match && match[1] && match[1] !== "Solution") {
        targetFnName = match[1];
      }
    }

    let fnResolutionCode = "";
    if (targetFnName === "Solution") {
      fnResolutionCode = `
  const inst = new Solution();
  const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(inst)).filter(m => m !== 'constructor');
  if (methods.length === 0) throw new Error("No runnable method found on Solution class.");
  const fn = (...args) => inst[methods[0]](...args);
`;
    } else if (targetFnName) {
      fnResolutionCode = `const fn = ${targetFnName};`;
    } else {
      fnResolutionCode = `
  let fn;
  if (typeof Solution !== "undefined") {
    const inst = new Solution();
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(inst)).filter(m => m !== 'constructor');
    if (methods.length > 0) fn = (...args) => inst[methods[0]](...args);
  }
  if (!fn) throw new Error("No runnable function found in JavaScript code.");
`;
    }

    return `
const fs = require('fs');

${userCode}

function stripAssignment(t) {
  let s = (t || "").trim();
  let eqPos = s.indexOf('=');
  if (eqPos !== -1) {
    s = s.substring(eqPos + 1).trim();
  }
  return s;
}

function parseTopLevel(inputStr) {
  let s = (inputStr || "").trim();
  if (!s) return [];

  let s_clean = s.replace(/\{/g, "[").replace(/\}/g, "]");

  if (!s_clean.includes(",") && !s_clean.startsWith("[")) {
    let hasNewline = s.includes("\\n") || s.includes("\\r");
    let parts = s_clean.split(/\s+/).filter(Boolean);
    let nums = parts.map(p => {
      let n = Number(p.replace(/[^0-9.-]/g, ""));
      return isNaN(n) ? p : n;
    });
    if (nums.length > 0 && typeof nums[0] === "number") {
      if (hasNewline && nums.length > 1 && nums[0] === nums.length - 1) {
        return [nums.slice(1)];
      }
      return [nums];
    }
  }

  let tokens = [];
  let current = "";
  let depth = 0;
  for (let i = 0; i < s_clean.length; i++) {
    let ch = s_clean[i];
    if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      tokens.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current.trim());

  let res = [];
  for (let tok of tokens) {
    if (!tok) continue;
    tok = stripAssignment(tok);
    let tok_clean = tok.replace(/\{/g, "[").replace(/\}/g, "]");
    try {
      res.push(JSON.parse(tok_clean));
    } catch (e) {
      if (tok_clean.toLowerCase() === "true") res.push(true);
      else if (tok_clean.toLowerCase() === "false") res.push(false);
      else if (!isNaN(tok_clean)) res.push(Number(tok_clean));
      else res.push(tok_clean.replace(/^["']|["']$/g, ""));
    }
  }

  return res;
}

function main() {
  let rawInput = "";
  try {
    rawInput = fs.readFileSync(0, "utf-8");
  } catch (e) {
    rawInput = "";
  }

  const args = parseTopLevel(rawInput);
  ${fnResolutionCode}
  const result = fn(...args);

  if (result === undefined || result === null) {
    if (args.length > 0 && typeof args[0] === "object" && args[0] !== null) {
      process.stdout.write(JSON.stringify(args[0]));
    } else {
      process.stdout.write("null");
    }
  } else if (typeof result === "object") {
    process.stdout.write(JSON.stringify(result));
  } else {
    process.stdout.write(String(result));
  }
}

main();
`;
  }
}
