import path from "path"
import fs from 'fs';
import { spawnSync } from "child_process"
import os from "os"
import chalk from "chalk"
import { QuartzEmitterPlugin } from "../types"
import { FilePath, joinSegments } from "../../util/path"

type AnkiOptions = {}

function resolveMdankideck(): string {
  const fromEnv = process.env.QUARTZ_ANKI_COMPILER
  if (fromEnv) {
    return fromEnv
  }

  const venvBinary = path.join(process.cwd(), "venv", "bin", "mdankideck")
  if (fs.existsSync(venvBinary)) {
    return venvBinary
  }

  throw new Error(
    chalk.red(
      "mdankideck not found. Run `npm ci` to create the Python venv, or set QUARTZ_ANKI_COMPILER to the binary path.",
    ),
  )
}

export const Anki: QuartzEmitterPlugin<Partial<AnkiOptions>> = () => {

  return {
    name: "Anki",
    getQuartzComponents() { return [] },
    async emit(ctx, content): Promise<FilePath[]> {

      // ignore in serve mode
      if (ctx.argv.serve) {
        return []
      }

      const decks = content.flatMap(element => {

        const contentData = (element[1].data ?? {})

        if (contentData.filePath) {
          const fileName = path.basename(contentData.filePath)

          if (fileName === "deck.md") {
            return [contentData]
          }
        }

        return []



      });

      const result = await Promise.all(
        decks.map(async (contentData) => {

          const absoluteFilePath = path.resolve(contentData.filePath!);
          const directoryPath = path.dirname(absoluteFilePath);

          const tempDirPrefix = path.join(os.tmpdir(), 'anki-deck');

          const tempDir = fs.mkdtempSync(tempDirPrefix);
          const mdankideck = resolveMdankideck()

          const out = spawnSync(
            mdankideck,
            ["--prefix", "thepopupschool::", directoryPath, tempDir],
            { stdio: "inherit" },
          )
          if (out.status !== 0) {
            throw new Error(chalk.red("Error create anki deck", JSON.stringify(out, null, 2)))
          }

          const generatedApkg = path.join(tempDir, "deck.apkg")
          if (!fs.existsSync(generatedApkg)) {
            throw new Error(
              chalk.red(
                `mdankideck did not produce deck.apkg in ${tempDir}. Check Python dependencies (requirements.txt).`,
              ),
            )
          }

          const slug = contentData.slug
          const ext = ".apkg"

          const pathToAnkiDenk = joinSegments(ctx.argv.output, slug + ext) as FilePath
          const dir = path.dirname(pathToAnkiDenk)
          await fs.promises.mkdir(dir, { recursive: true })

          await fs.promises.cp(
            generatedApkg,
            path.join(dir, `${path.basename(directoryPath)}-deck.apkg`),
          )

          return pathToAnkiDenk

        })
      )

      return result
    }
  }
}
