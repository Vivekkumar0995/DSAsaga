import { LanguageRunner } from "./LanguageRunner";

export class CRunner extends LanguageRunner {
  fileExtension = "c";

  compileCommand(fileName: string): string {
    return `gcc -O3 -w /workspace/${fileName}.c -o /workspace/${fileName} -lm`;
  }

  runCommand(fileName: string): string {
    return `/workspace/${fileName}`;
  }

  wrapCode(userCode: string, questionMeta: any): string {
    const hasMain = /int\s+main\s*\(/.test(userCode);
    if (hasMain) {
      return userCode;
    }

    const title = questionMeta?.title || "";
    const camelTitle = title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((word: string, index: number) =>
        index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");

    // Detect function name in C code
    let fnName = camelTitle || "solve";
    const fnMatch = userCode.match(/(?:[a-zA-Z0-9_*]+\s+)+([a-zA-Z0-9_$]+)\s*\(/);
    if (fnMatch && fnMatch[1] && !["malloc", "printf", "sizeof", "free", "scanf", "calloc"].includes(fnMatch[1])) {
      fnName = fnMatch[1];
    }

    // Detect return type and parameters
    const isVoidReturn = new RegExp(`void\\s+${fnName}\\b`).test(userCode);
    const isBoolReturn = new RegExp(`bool\\s+${fnName}\\b`).test(userCode);
    const isIntPointerReturn = new RegExp(`int\\s*\\*\\s*${fnName}\\b`).test(userCode);
    const isIntReturn = !isVoidReturn && !isBoolReturn && !isIntPointerReturn;

    // Detect param count & parameter names
    const paramMatch = userCode.match(new RegExp(`${fnName}\\s*\\(([^)]*)\\)`));
    const rawParams = paramMatch ? paramMatch[1].trim() : "";
    const paramTokens = rawParams ? rawParams.split(",").map(s => s.trim()) : [];
    const paramCount = paramTokens.length;
    const hasReturnSize = rawParams.includes("returnSize");
    const hasTarget = rawParams.includes("target") || rawParams.includes("k") || rawParams.includes("val");

    let invokeCallCode = "";
    if (isVoidReturn) {
      if (paramCount === 1) invokeCallCode = `    ${fnName}(nums);`;
      else if (paramCount === 3) invokeCallCode = `    ${fnName}(nums, numsSize, target);`;
      else invokeCallCode = `    ${fnName}(nums, numsSize);`;
      invokeCallCode += `\n    printf("[");\n    for (int i = 0; i < numsSize; i++) {\n        if (i > 0) printf(", ");\n        printf("%d", nums[i]);\n    }\n    printf("]");`;
    } else if (isBoolReturn) {
      if (paramCount === 1) invokeCallCode = `    bool res = ${fnName}(numsSize > 0 ? nums[0] : target);\n    printf(res ? "true" : "false");`;
      else if (paramCount === 3) invokeCallCode = `    bool res = ${fnName}(nums, numsSize, target);\n    printf(res ? "true" : "false");`;
      else invokeCallCode = `    bool res = ${fnName}(nums, numsSize);\n    printf(res ? "true" : "false");`;
    } else if (isIntReturn) {
      if (paramCount === 1) invokeCallCode = `    int res = ${fnName}(numsSize > 0 ? nums[0] : target);\n    printf("%d", res);`;
      else if (paramCount === 3) invokeCallCode = `    int res = ${fnName}(nums, numsSize, target);\n    printf("%d", res);`;
      else invokeCallCode = `    int res = ${fnName}(nums, numsSize);\n    printf("%d", res);`;
    } else {
      // Default: int* return
      if (paramCount === 4 || (hasTarget && hasReturnSize)) {
        invokeCallCode = `    int* res = ${fnName}(nums, numsSize, target, &returnSize);`;
      } else if (paramCount === 3 || hasReturnSize) {
        invokeCallCode = `    int* res = ${fnName}(nums, numsSize, &returnSize);`;
      } else {
        invokeCallCode = `    int* res = ${fnName}(nums, numsSize, &returnSize);`;
      }
      invokeCallCode += `\n    if (res && returnSize > 0) {\n        printf("[");\n        for (int i = 0; i < returnSize; i++) {\n            if (i > 0) printf(", ");\n            printf("%d", res[i]);\n        }\n        printf("]");\n        free(res);\n    } else {\n        printf("[]");\n    }`;
    }

    return `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <stdbool.h>
#include <math.h>

${userCode}

static char* trim_c(char* s) {
    while (*s && isspace((unsigned char)*s)) s++;
    if (*s == 0) return s;
    char* end = s + strlen(s) - 1;
    while (end > s && isspace((unsigned char)*end)) end--;
    end[1] = '\\0';
    return s;
}

int main() {
    char inputBuf[16384];
    size_t bytesRead = fread(inputBuf, 1, sizeof(inputBuf) - 1, stdin);
    inputBuf[bytesRead] = '\0';

    char* parsePtr = inputBuf;
    char* eqPos = strchr(parsePtr, '=');
    if (eqPos) {
        parsePtr = eqPos + 1;
    }

    int nums[4096];
    int numsSize = 0;
    int target = 0;

    char* start = strpbrk(parsePtr, "[{");
    if (start) {
        char* end = strpbrk(start + 1, "]}");
        if (end) {
            *end = '\0';
            char* token = strtok(start + 1, ",");
            while (token && numsSize < 4096) {
                char* cleanTok = trim_c(token);
                if (*cleanTok != '\0') {
                    nums[numsSize++] = atoi(cleanTok);
                }
                token = strtok(NULL, ",");
            }
            char* after = strchr(end + 1, ',');
            if (after) {
                char* targetStr = trim_c(after + 1);
                char* targetEq = strchr(targetStr, '=');
                if (targetEq) targetStr = trim_c(targetEq + 1);
                target = atoi(targetStr);
            }
        }
    } else {
        int hasNewline = (strchr(inputBuf, '\\n') != NULL);
        int allNums[4096];
        int allCount = 0;
        char* token = strtok(parsePtr, " \t\r\n,");
        while (token && allCount < 4096) {
            char* cleanTok = trim_c(token);
            if (*cleanTok != '\0') {
                allNums[allCount++] = atoi(cleanTok);
            }
            token = strtok(NULL, " \t\r\n,");
        }
        if (allCount > 0) {
            if (hasNewline && allCount > 1 && allNums[0] == allCount - 1) {
                for (int i = 1; i < allCount; i++) {
                    nums[numsSize++] = allNums[i];
                }
            } else {
                for (int i = 0; i < allCount; i++) {
                    nums[numsSize++] = allNums[i];
                }
            }
        }
    }

    int returnSize = 0;

${invokeCallCode}

    return 0;
}
`;
  }
}
