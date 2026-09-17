import fs from "fs"
import path from "path"
import { spawnSync } from "child_process"
import chalk from "chalk"

export type CompiledDeck = {
  apkgPath: string
}

export type CompileOptions = {
  prefix: string
  workDir: string
}

export interface AnkiDeckCompiler {
  compile(sourceDir: string, options: CompileOptions): Promise<CompiledDeck>
}

export class CompilerNotFoundError extends Error {
  constructor(message: string) {
    super(chalk.red(message))
    this.name = "CompilerNotFoundError"
  }
}

export class CompilationFailedError extends Error {
  constructor(message: string) {
    super(chalk.red(message))
    this.name = "CompilationFailedError"
  }
}

export class OutputMissingError extends Error {
  constructor(message: string) {
    super(chalk.red(message))
    this.name = "OutputMissingError"
  }
}

export function resolveMdankideckExecutable(projectRoot: string): string {
  const fromEnv = process.env.QUARTZ_ANKI_COMPILER
  if (fromEnv) {
    return fromEnv
  }

  const venvBinary = path.join(projectRoot, "venv", "bin", "mdankideck")
  if (fs.existsSync(venvBinary)) {
    return venvBinary
  }

  throw new CompilerNotFoundError(
    "mdankideck not found. Run `npm ci` to create the Python venv, or set QUARTZ_ANKI_COMPILER to the binary path.",
  )
}

export class MarkdownAnkiDecksCompiler implements AnkiDeckCompiler {
  constructor(private readonly projectRoot: string = process.cwd()) {}

  async compile(sourceDir: string, options: CompileOptions): Promise<CompiledDeck> {
    const executable = resolveMdankideckExecutable(this.projectRoot)

    const out = spawnSync(
      executable,
      ["--prefix", options.prefix, sourceDir, options.workDir],
      { stdio: "inherit" },
    )

    if (out.status !== 0) {
      throw new CompilationFailedError(
        `Error creating anki deck: ${JSON.stringify(out, null, 2)}`,
      )
    }

    const apkgPath = path.join(options.workDir, "deck.apkg")
    if (!fs.existsSync(apkgPath)) {
      throw new OutputMissingError(
        `mdankideck did not produce deck.apkg in ${options.workDir}. Check Python dependencies (requirements.txt).`,
      )
    }

    return { apkgPath }
  }
}
