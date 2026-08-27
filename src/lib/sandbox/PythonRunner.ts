import { LanguageRunner } from "./LanguageRunner";

export class PythonRunner extends LanguageRunner {
  fileExtension = "py";

  compileCommand(): string | null {
    return null;
  }

  runCommand(fileName: string): string {
    return `python3 /workspace/${fileName}.py`;
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

    return `import sys
import json
import re
import math
import collections
import heapq
import functools
import itertools
from typing import *

${userCode}

def strip_assignment(t):
    s = (t or "").strip()
    eq_pos = s.find('=')
    if eq_pos != -1:
        s = s[eq_pos + 1:].strip()
    return s

def parse_top_level(raw_input):
    s = (raw_input or "").strip()
    if not s:
        return []

    s_clean = s.replace('{', '[').replace('}', ']')

    if ',' not in s_clean and not s_clean.startswith('['):
        has_newline = '\\n' in s or '\\r' in s
        parts = re.split(r'\s+', s_clean)
        nums = []
        for p in parts:
            p_clean = re.sub(r'[^0-9.-]', '', p)
            if p_clean:
                try: nums.append(int(p_clean))
                except ValueError:
                    try: nums.append(float(p_clean))
                    except ValueError: nums.append(p)
        if nums and all(isinstance(x, (int, float)) for x in nums):
            if has_newline and len(nums) > 1 and nums[0] == len(nums) - 1:
                return [nums[1:]]
            return [nums]

    tokens = []
    current = []
    depth = 0
    for ch in s_clean:
        if ch in '[(': depth += 1
        elif ch in '])': depth -= 1
        if ch == ',' and depth == 0:
            tokens.append("".join(current).strip())
            current = []
            continue
        current.append(ch)
    if current:
        tokens.append("".join(current).strip())

    res = []
    for tok in tokens:
        if not tok: continue
        tok = strip_assignment(tok)
        tok_clean = tok.replace('{', '[').replace('}', ']')

        try:
            res.append(json.loads(tok_clean))
        except Exception:
            if tok_clean.lower() == 'true': res.append(True)
            elif tok_clean.lower() == 'false': res.append(False)
            else:
                try: res.append(int(tok_clean))
                except ValueError:
                    try: res.append(float(tok_clean))
                    except ValueError: res.append(tok_clean.strip('"\\''))

    return res

def get_target_function():
    if "Solution" in globals() and isinstance(globals()["Solution"], type):
        inst = globals()["Solution"]()
        methods = [m for m in dir(inst) if not m.startswith("__") and callable(getattr(inst, m))]
        if methods:
            return getattr(inst, methods[0])
    
    target_name = ${JSON.stringify(camelTitle)}
    if target_name in globals() and callable(globals()[target_name]):
        return globals()[target_name]
        
    for k, v in list(globals().items()):
        if not k.startswith("__") and k not in ("sys", "json", "re", "math", "collections", "heapq", "functools", "itertools", "strip_assignment", "parse_top_level", "get_target_function", "main", "Solution") and callable(v):
            return v
            
    raise RuntimeError("No runnable function found in Python code.")

def main():
    raw_input = sys.stdin.read()
    args = parse_top_level(raw_input)
    fn = get_target_function()
    result = fn(*args)
    if result is None:
        if args and isinstance(args[0], (list, dict)):
            sys.stdout.write(json.dumps(args[0], separators=(',', ':')))
        else:
            sys.stdout.write("null")
    elif isinstance(result, (dict, list, bool, int, float, str)):
        sys.stdout.write(json.dumps(result, separators=(',', ':')))
    else:
        sys.stdout.write(str(result))

if __name__ == "__main__":
    main()
`;
  }
}
