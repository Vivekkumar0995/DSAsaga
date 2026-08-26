import { LanguageRunner } from "./LanguageRunner";

export class JavaRunner extends LanguageRunner {
  fileExtension = "java";

  compileCommand(fileName: string): string {
    return `javac /workspace/${fileName}.java`;
  }

  runCommand(fileName: string): string {
    return `java -cp /workspace SolutionRunner`;
  }

  wrapCode(userCode: string, questionMeta: any): string {
    return `import java.util.*;
import java.io.*;
import java.lang.reflect.*;

${userCode}

class SolutionRunner {
    private static String trim(String s) {
        return s == null ? "" : s.trim();
    }

    private static String stripParamName(String input) {
        String s = trim(input);
        s = s.replaceAll("^[a-zA-Z0-9_$]+(\\\\[\\\\s*\\\\])?\\\\s*=\\\\s*", "");
        s = s.replaceAll(",\\\\s*[a-zA-Z0-9_$]+(\\\\[\\\\s*\\\\])?\\\\s*=\\\\s*", ",");
        return s;
    }

    private static List<String> splitTopLevel(String input) {
        List<String> parts = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        int depth = 0;
        for (char ch : input.toCharArray()) {
            if (ch == '[' || ch == '{' || ch == '(') depth++;
            else if (ch == ']' || ch == '}' || ch == ')') depth--;
            if (ch == ',' && depth == 0) {
                String t = trim(sb.toString());
                if (!t.isEmpty()) parts.add(t);
                sb.setLength(0);
                continue;
            }
            sb.append(ch);
        }
        String t = trim(sb.toString());
        if (!t.isEmpty()) parts.add(t);
        return parts;
    }

    private static int parseInt(String s) {
        s = stripParamName(s);
        return Integer.parseInt(trim(s));
    }

    private static int[] parseIntArray(String s) {
        s = stripParamName(s);
        if (s.startsWith("[") && s.endsWith("]")) s = s.substring(1, s.length() - 1);
        else if (s.startsWith("{") && s.endsWith("}")) s = s.substring(1, s.length() - 1);
        s = trim(s);
        if (s.isEmpty()) return new int[0];
        if (s.contains(",")) {
            List<String> tokens = splitTopLevel(s);
            int[] res = new int[tokens.size()];
            for (int i = 0; i < tokens.size(); i++) {
                res[i] = parseInt(tokens.get(i));
            }
            return res;
        } else {
            boolean hasNewline = s.contains("\\n") || s.contains("\\r");
            String[] parts = s.split("\\\\s+");
            List<Integer> list = new ArrayList<>();
            for (String p : parts) {
                String cleanP = trim(p);
                if (!cleanP.isEmpty()) {
                    try { list.add(Integer.parseInt(cleanP)); } catch (Exception e) {}
                }
            }
            if (list.isEmpty()) return new int[0];
            if (hasNewline && list.size() > 1 && list.get(0) == list.size() - 1) {
                int[] res = new int[list.size() - 1];
                for (int i = 1; i < list.size(); i++) res[i - 1] = list.get(i);
                return res;
            } else {
                int[] res = new int[list.size()];
                for (int i = 0; i < list.size(); i++) res[i] = list.get(i);
                return res;
            }
        }
    }

    private static int[][] parseIntArray2D(String s) {
        s = stripParamName(s);
        if (s.startsWith("[") && s.endsWith("]")) s = s.substring(1, s.length() - 1);
        else if (s.startsWith("{") && s.endsWith("}")) s = s.substring(1, s.length() - 1);
        List<String> parts = splitTopLevel(s);
        int[][] res = new int[parts.size()][];
        for (int i = 0; i < parts.size(); i++) res[i] = parseIntArray(parts.get(i));
        return res;
    }

    private static String stringify(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof int[]) return Arrays.toString((int[]) obj);
        if (obj instanceof long[]) return Arrays.toString((long[]) obj);
        if (obj instanceof double[]) return Arrays.toString((double[]) obj);
        if (obj instanceof boolean[]) return Arrays.toString((boolean[]) obj);
        if (obj instanceof String[]) return Arrays.toString((Object[]) obj);
        if (obj instanceof int[][]) {
            StringBuilder sb = new StringBuilder("[");
            int[][] arr = (int[][]) obj;
            for (int i = 0; i < arr.length; i++) {
                if (i > 0) sb.append(", ");
                sb.append(Arrays.toString(arr[i]));
            }
            sb.append("]");
            return sb.toString();
        }
        return String.valueOf(obj);
    }

    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder inputSb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) {
            inputSb.append(line).append("\\n");
        }
        String rawInput = stripParamName(inputSb.toString().trim());
        List<String> argStrings = splitTopLevel(rawInput);

        Object sol = new Solution();
        Method[] methods = Solution.class.getDeclaredMethods();
        Method target = null;
        for (Method m : methods) {
            if (!Modifier.isStatic(m.getModifiers()) && Modifier.isPublic(m.getModifiers())) {
                target = m;
                break;
            }
        }
        if (target == null && methods.length > 0) target = methods[0];
        if (target == null) throw new RuntimeException("No suitable method found in Solution class.");

        Class<?>[] paramTypes = target.getParameterTypes();
        Object[] invokeArgs = new Object[paramTypes.length];

        for (int i = 0; i < paramTypes.length; i++) {
            String argStr = i < argStrings.size() ? argStrings.get(i) : "";
            Class<?> p = paramTypes[i];
            if (p == int.class || p == Integer.class) invokeArgs[i] = parseInt(argStr);
            else if (p == int[].class) invokeArgs[i] = parseIntArray(argStr);
            else if (p == int[][].class) invokeArgs[i] = parseIntArray2D(argStr);
            else if (p == String.class) {
                String s = trim(argStr);
                if (s.startsWith("\\\"") && s.endsWith("\\\"")) s = s.substring(1, s.length() - 1);
                invokeArgs[i] = s;
            } else if (p == boolean.class || p == Boolean.class) invokeArgs[i] = Boolean.parseBoolean(trim(argStr));
            else invokeArgs[i] = argStr;
        }

        Object result = target.invoke(sol, invokeArgs);
        if (target.getReturnType() == void.class) {
            if (invokeArgs.length > 0 && invokeArgs[0] != null) {
                System.out.print(stringify(invokeArgs[0]));
            } else {
                System.out.print("void");
            }
        } else {
            System.out.print(stringify(result));
        }
    }
}
`;
  }
}
