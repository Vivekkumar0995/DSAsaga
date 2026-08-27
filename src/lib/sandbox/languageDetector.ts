export type DetectedLanguage = {
  key: "cpp" | "java" | "python" | "c" | "javascript";
  label: "C++" | "Java" | "Python" | "C" | "JavaScript";
};

export function detectLanguageFromCode(code: string): DetectedLanguage {
  const src = (code || "").trim();
  if (!src) return { key: "javascript", label: "JavaScript" };

  // 1. C++ signatures
  if (
    /#include|std::|vector<|string>|cout\s*<<|cin\s*>>|namespace std|class Solution/i.test(src) &&
    (/#include/i.test(src) || /vector<|std::/i.test(src))
  ) {
    return { key: "cpp", label: "C++" };
  }

  // 2. Java signatures
  if (
    (/public class/i.test(src) || /import java\./i.test(src) || /System\.out/i.test(src)) ||
    (/class Solution/i.test(src) && /public\s+[\w<>]+\s+\w+\s*\(/i.test(src))
  ) {
    return { key: "java", label: "Java" };
  }

  // 3. Python signatures
  if (
    (/def\s+\w+\s*\(/i.test(src) || /import sys|import math/i.test(src) || /:\s*$/m.test(src)) &&
    !/#include|public class|function\s+|const\s+|let\s+|var\s+/i.test(src)
  ) {
    return { key: "python", label: "Python" };
  }

  // 4. C signatures
  if (/#include <stdio\.h>|#include <stdlib\.h>|printf\(|scanf\(/i.test(src)) {
    return { key: "c", label: "C" };
  }

  // 5. Default to JavaScript
  return { key: "javascript", label: "JavaScript" };
}
