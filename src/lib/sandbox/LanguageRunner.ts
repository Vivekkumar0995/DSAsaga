export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeMs: number;
  errorType?: "Compilation Error" | "Time Limit Exceeded" | "Memory Limit Exceeded" | "Runtime Error";
}

export abstract class LanguageRunner {
  abstract fileExtension: string;
  abstract compileCommand(fileName: string): string | null;
  abstract runCommand(fileName: string): string;
  abstract wrapCode(userCode: string, questionMeta: any): string;
}
