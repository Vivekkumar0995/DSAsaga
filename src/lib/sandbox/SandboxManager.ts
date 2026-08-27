import { execFile, execFileSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";
import { LanguageRunner, RunResult } from "./LanguageRunner";
import { CppRunner } from "./CppRunner";
import { JsRunner } from "./JsRunner";
import { PythonRunner } from "./PythonRunner";
import { JavaRunner } from "./JavaRunner";
import { CRunner } from "./CRunner";

const execFilePromise = promisify(execFile);

const jsRunner = new JsRunner();
const pyRunner = new PythonRunner();

const RUNNERS: Record<string, LanguageRunner> = {
  cpp: new CppRunner(),
  javascript: jsRunner,
  js: jsRunner,
  python: pyRunner,
  py: pyRunner,
  java: new JavaRunner(),
  c: new CRunner(),
};

export async function executeCode(
  lang: string,
  userCode: string,
  input: string,
  questionMeta: any,
  options?: { timeLimitMs?: number; memoryLimitMb?: number }
): Promise<RunResult> {
  const runner = RUNNERS[lang];
  if (!runner) {
    throw new Error(`Unsupported sandbox language: ${lang}`);
  }

  const memoryLimitMb = options?.memoryLimitMb || questionMeta?.memory_limit_mb || 256;
  const timeLimitMs = options?.timeLimitMs || questionMeta?.time_limit_ms || 10000;

  const runId = Math.random().toString(36).substring(2, 9);
  // Using user temp directory (Cross-platform compatible for Windows)
  const hostTempDir = path.join(process.env.TEMP || "/tmp", `dsasaga_${runId}`);
  fs.mkdirSync(hostTempDir, { recursive: true });

  const fileName = "Solution";
  const sourceFile = `${fileName}.${runner.fileExtension}`;

  fs.writeFileSync(path.join(hostTempDir, sourceFile), runner.wrapCode(userCode, questionMeta));
  fs.writeFileSync(path.join(hostTempDir, "input.txt"), input);

  const startTime = performance.now();

  const compileCmd = runner.compileCommand(fileName);
  const runCmd = runner.runCommand(fileName);
  const containerCmd = compileCmd ? `${compileCmd} && ${runCmd} < /workspace/input.txt` : `${runCmd} < /workspace/input.txt`;

  const mountPath = hostTempDir.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_, drive) => `/${drive.toLowerCase()}`);

  const dockerArgs = [
    "run",
    "--rm",
    "--net",
    "none",
    "--memory",
    `${memoryLimitMb}m`,
    "--memory-swap",
    `${memoryLimitMb}m`,
    "--cpus",
    "0.5",
    "--pids-limit",
    "64",
    "--security-opt",
    "no-new-privileges:true",
    "-v",
    `${mountPath}:/workspace`,
    "dsasaga-sandbox",
    "sh",
    "-lc",
    containerCmd,
  ];

  try {
    const { stdout, stderr } = await execFilePromise("docker", dockerArgs, { timeout: timeLimitMs + 3000 });
    return {
      stdout: stdout || "",
      stderr: stderr || "",
      exitCode: 0,
      timeMs: Math.round(performance.now() - startTime),
    };
  } catch (error: any) {
    const isTimeout = error.killed || error.signal === "SIGTERM" || error.signal === "SIGKILL" || error.code === 124;
    const stderrText = error.stderr || error.stdout || error.message || "Unknown sandbox error";

    if (
      /docker.*daemon|open \/\/\.\/pipe\/docker|Cannot connect to the Docker daemon|spawn docker|docker.*not found|docker.*ENOENT/i.test(
        stderrText
      )
    ) {
      return {
        stdout: "",
        stderr: "Docker container engine is not running or not installed. Please start Docker Desktop on host system.",
        exitCode: 1,
        timeMs: Math.round(performance.now() - startTime),
        errorType: "Runtime Error",
      };
    }

    if ((lang === "javascript" || lang === "js") && /node: not found|node: command not found/i.test(stderrText)) {
      try {
        const solutionFile = path.join(hostTempDir, `${fileName}.js`);
        const inputFile = path.join(hostTempDir, "input.txt");
        const inputData = fs.existsSync(inputFile) ? fs.readFileSync(inputFile, "utf-8") : "";
        const nodeBin = process.execPath || "node";

        const stdout = execFileSync(nodeBin, [solutionFile], {
          timeout: timeLimitMs,
          input: inputData,
          encoding: "utf-8",
        });

        return {
          stdout: String(stdout || ""),
          stderr: "",
          exitCode: 0,
          timeMs: Math.round(performance.now() - startTime),
        };
      } catch (fallbackErr: any) {
        const isTimeout = fallbackErr.killed || fallbackErr.signal === "SIGTERM";
        return {
          stdout: fallbackErr.stdout ? String(fallbackErr.stdout) : "",
          stderr: String(fallbackErr.stderr || fallbackErr.message || "Execution error"),
          exitCode: fallbackErr.status || 1,
          timeMs: Math.round(performance.now() - startTime),
          errorType: isTimeout ? "Time Limit Exceeded" : "Runtime Error",
        };
      }
    }

    const cleanStderr = (stderrText || "")
      .replace(/\/workspace\//g, "")
      .trim();

    const isOom =
      error.code === 137 ||
      /OOMKilled|OutOfMemoryError|std::bad_alloc|MemoryError|heap out of memory|java\.lang\.OutOfMemoryError/i.test(
        cleanStderr
      );

    let errorType: "Time Limit Exceeded" | "Memory Limit Exceeded" | "Compilation Error" | "Runtime Error";
    if (isOom) {
      errorType = "Memory Limit Exceeded";
    } else if (isTimeout || Math.round(performance.now() - startTime) >= timeLimitMs) {
      errorType = "Time Limit Exceeded";
    } else if (
      /error:|fatal error:|cannot find symbol|SyntaxError|IndentationError|TabError|ParseError|invalid syntax|undefined reference/i.test(
        cleanStderr
      ) &&
      !/Segmentation fault|SIGSEGV|SIGFPE|NullPointerException|ArrayIndexOutOfBoundsException|ZeroDivisionError|TypeError|ReferenceError|RangeError|IndexError/i.test(
        cleanStderr
      )
    ) {
      errorType = "Compilation Error";
    } else {
      errorType = "Runtime Error";
    }

    return {
      stdout: error.stdout ? String(error.stdout).trim() : "",
      stderr: cleanStderr,
      exitCode: error.code || 1,
      timeMs: Math.round(performance.now() - startTime),
      errorType,
    };
  } finally {
    fs.rmSync(hostTempDir, { recursive: true, force: true });
  }
}
