import { LanguageRunner } from "./LanguageRunner";

export class CppRunner extends LanguageRunner {
  fileExtension = "cpp";

  compileCommand(fileName: string): string {
    return `g++ -O3 -std=c++17 -w /workspace/${fileName}.cpp -o /workspace/${fileName}`;
  }

  runCommand(fileName: string): string {
    return `/workspace/${fileName}`;
  }

  private normalizeType(type: string): string {
    const value = (type || "int").trim();
    if (value === "vector") return "vector<int>";
    return value;
  }

  private toCppType(type: string): string {
    const value = this.normalizeType(type);
    if (value === "int" || value === "long long" || value === "long" || value === "double" || value === "float" || value === "bool" || value === "string" || value.includes("vector") || value.includes("std::vector")) {
      return value;
    }
    return value;
  }

  private extractClassName(userCode: string): string | null {
    const classMatch = userCode.match(/class\s+(\w+)\s*\{/);
    return classMatch ? classMatch[1] : null;
  }

  private extractMethodName(userCode: string): string | null {
    const methodMatch = userCode.match(/(?:public\s*:)?\s*(?:[A-Za-z_:<>\s*&]+\s+)?(\w+)\s*\([^)]*\)\s*(?:const)?\s*(?:\{)/);
    if (!methodMatch) return null;
    return methodMatch[1];
  }

  private extractMethodReturnType(userCode: string): string | null {
    const methodMatch = userCode.match(/(?:public\s*:)?\s*(?:static\s+)?([A-Za-z_:<>\s*&\[\]]+?)\s+(\w+)\s*\([^)]*\)\s*(?:const)?\s*(?:\{)/);
    if (!methodMatch) return null;
    return methodMatch[1].trim();
  }

  private extractMethodParams(userCode: string): any[] {
    const methodMatch = userCode.match(/(?:public\s*:)?\s*(?:static\s+)?[A-Za-z_:<>\s*&\[\]]+?\s+\w+\s*\(([^)]*)\)/);
    if (!methodMatch || !methodMatch[1]) return [];

    const rawParams = methodMatch[1].trim();
    if (!rawParams) return [];

    const paramTokens: string[] = [];
    let current = "";
    let depth = 0;
    for (let i = 0; i < rawParams.length; i++) {
      const ch = rawParams[i];
      if (ch === '<') depth++;
      else if (ch === '>') depth--;
      if (ch === ',' && depth === 0) {
        if (current.trim()) paramTokens.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }
    if (current.trim()) paramTokens.push(current.trim());

    return paramTokens.map((tok, idx) => {
      const cleanTok = tok.replace(/const\s+/g, "").replace(/&/g, "").replace(/\*/g, "").trim();
      const lastSpace = cleanTok.lastIndexOf(" ");
      if (lastSpace !== -1) {
        const type = cleanTok.substring(0, lastSpace).trim();
        const name = cleanTok.substring(lastSpace + 1).trim();
        return { name, type };
      }
      return { name: `arg${idx}`, type: cleanTok };
    });
  }

  wrapCode(userCode: string, questionMeta: any): string {
    let params = Array.isArray(questionMeta?.params) && questionMeta.params.length > 0
      ? questionMeta.params
      : this.extractMethodParams(userCode);

    const className = this.extractClassName(userCode) || "Solution";
    const methodName = this.extractMethodName(userCode) || "solve";
    const methodReturnType = this.extractMethodReturnType(userCode) || (questionMeta?.return_type_cpp || questionMeta?.return_type || "int");
    const isVoidMethod = /\bvoid\b/i.test(methodReturnType);

    const parseStatements = params
      .map((param: any, index: number) => {
        const type = this.toCppType(param?.type || param?.type_cpp || "int");
        const name = param?.name || `arg${index}`;

        if (type.includes("vector<vector")) {
          return `    auto parsed${index} = parseVectorVectorInt(args[${index}]);\n    ${type} ${name} = parsed${index};`;
        }

        if (type.includes("vector")) {
          return `    auto parsed${index} = parseVectorInt(args[${index}]);\n    ${type} ${name} = parsed${index};`;
        }

        if (type.includes("string")) {
          return `    ${type} ${name} = parseString(args[${index}]);`;
        }

        if (type.includes("bool")) {
          return `    ${type} ${name} = parseBool(args[${index}]);`;
        }

        return `    ${type} ${name} = parseIntValue(args[${index}]);`;
      })
      .join("\n");

    const invocationValues = params
      .map((param: any, index: number) => param?.name || `arg${index}`)
      .join(", ");

    const hasConstructorType = /class\s+\w+\s*\{/.test(userCode);
    const outputValue = isVoidMethod
      ? (params.length ? (params[0]?.name || "arg0") : "")
      : "result";

    let invokeCall: string;
    if (isVoidMethod) {
      const call = hasConstructorType
        ? `    ${className} solver;\n    solver.${methodName}(${invocationValues});`
        : `    ${methodName}(${invocationValues});`;
      invokeCall = call;
    } else {
      invokeCall = hasConstructorType
        ? `    ${className} solver;\n    auto result = solver.${methodName}(${invocationValues});`
        : `    auto result = ${methodName}(${invocationValues});`;
    }

    return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <cctype>
#include <stdexcept>
#include <unordered_map>
#include <utility>

using namespace std;

${userCode}

string trim(const string& s) {
    size_t start = 0;
    while (start < s.size() && isspace((unsigned char)s[start])) start++;
    size_t end = s.size();
    while (end > start && isspace((unsigned char)s[end - 1])) end--;
    return s.substr(start, end - start);
}

vector<string> splitTopLevel(const string& input) {
    vector<string> parts;
    string current;
    int depth = 0;
    for (char ch : input) {
        if (ch == '[' || ch == '{' || ch == '(') depth++;
        if (ch == ']' || ch == '}' || ch == ')') depth--;
        if (ch == ',' && depth == 0) {
            string token = trim(current);
            if (!token.empty()) parts.push_back(token);
            current.clear();
            continue;
        }
        current += ch;
    }
    string token = trim(current);
    if (!token.empty()) parts.push_back(token);
    return parts;
}

string extractArgumentValue(const string& rawInput) {
    string value = trim(rawInput);
    size_t eqPos = value.find('=');
    if (eqPos != string::npos) {
        value = trim(value.substr(eqPos + 1));
    }
    return value;
}

int parseIntValue(const string& text) {
    string value = extractArgumentValue(text);
    return stoi(trim(value));
}

bool parseBool(const string& text) {
    string value = extractArgumentValue(text);
    transform(value.begin(), value.end(), value.begin(), [](unsigned char c) { return static_cast<char>(tolower(c)); });
    return value == "true" || value == "1";
}

string parseString(const string& text) {
    string value = extractArgumentValue(text);
    if (value.size() >= 2 && static_cast<int>(value.front()) == 39 && static_cast<int>(value.back()) == 39) return value.substr(1, value.size() - 2);
    if (value.size() >= 2 && static_cast<int>(value.front()) == 34 && static_cast<int>(value.back()) == 34) return value.substr(1, value.size() - 2);
    return value;
}

vector<int> parseVectorInt(const string& text) {
    string value = extractArgumentValue(text);
    if (value == "[]" || value == "{}" || value.empty()) return {};
    if ((value.front() == '[' && value.back() == ']') || (value.front() == '{' && value.back() == '}')) {
        value = value.substr(1, value.size() - 2);
    }
    vector<int> result;
    if (value.find(',') != string::npos) {
        for (const string& token : splitTopLevel(value)) {
            if (!trim(token).empty()) {
                result.push_back(parseIntValue(token));
            }
        }
    } else {
        bool hasNewline = (text.find('\\n') != string::npos || text.find('\\r') != string::npos);
        stringstream ss(value);
        vector<int> allNums;
        int num;
        while (ss >> num) {
            allNums.push_back(num);
        }
        if (!allNums.empty()) {
            if (hasNewline && allNums.size() > 1 && allNums[0] == (int)allNums.size() - 1) {
                result.assign(allNums.begin() + 1, allNums.end());
            } else {
                result = allNums;
            }
        }
    }
    return result;
}

vector<vector<int>> parseVectorVectorInt(const string& text) {
    string value = extractArgumentValue(text);
    if (value == "[]" || value == "{}" || value.empty()) return {};
    if ((value.front() == '[' && value.back() == ']') || (value.front() == '{' && value.back() == '}')) {
        value = value.substr(1, value.size() - 2);
    }
    vector<vector<int>> result;
    for (const string& token : splitTopLevel(value)) {
        result.push_back(parseVectorInt(token));
    }
    return result;
}

string stringify(const string& value) {
    return value;
}

string stringify(const char* value) {
    return string(value);
}

string stringify(bool value) {
    return value ? "true" : "false";
}

string stringify(int value) {
    return to_string(value);
}

string stringify(long long value) {
    return to_string(value);
}

string stringify(double value) {
    ostringstream oss;
    oss << value;
    return oss.str();
}

string stringify(const vector<int>& value) {
    ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < value.size(); ++i) {
        if (i) oss << ", ";
        oss << value[i];
    }
    oss << "]";
    return oss.str();
}

string stringify(const vector<vector<int>>& value) {
    ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < value.size(); ++i) {
        if (i) oss << ", ";
        oss << stringify(value[i]);
    }
    oss << "]";
    return oss.str();
}

int main() {
    string rawInput;
    if (!getline(cin, rawInput)) return 0;
    rawInput = trim(rawInput);
    if (rawInput.empty()) return 0;

    vector<string> args = splitTopLevel(extractArgumentValue(rawInput));

    ${parseStatements}

    ${invokeCall}
${outputValue ? `    cout << stringify(${outputValue}) << endl;` : '    cout << "void" << endl;'}
    return 0;
}
`;
  }
}
