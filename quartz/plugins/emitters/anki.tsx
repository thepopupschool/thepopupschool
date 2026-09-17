import path from "path"
import fs from "fs"
import os from "os"
import { QuartzEmitterPlugin } from "../types"
import { FilePath, joinSegments } from "../../util/path"
import {
  AnkiDeckCompiler,
  MarkdownAnkiDecksCompiler,
} from "./anki/compiler"

interface AnkiOptions {
  prefix?: string
  compiler?: AnkiDeckCompiler
}

const defaultOptions = {
  prefix: "thepopupschool::",
} satisfies AnkiOptions

export const Anki: QuartzEmitterPlugin<Partial<AnkiOptions>> = (userOpts) => {
  const opts = { ...defaultOptions, ...userOpts }
  const compiler = opts.compiler ?? new MarkdownAnkiDecksCompiler()

  return {
    name: "Anki",
    getQuartzComponents() {
      return []
    },
    async emit(ctx, content): Promise<FilePath[]> {
      if (ctx.argv.serve) {
        return []
      }

      const decks = content.flatMap((element) => {
        const contentData = element[1].data ?? {}

        if (contentData.filePath) {
          const fileName = path.basename(contentData.filePath)

          if (fileName === "deck.md") {
            return [contentData]
          }
        }

        return []
      })

      const result = await Promise.all(
        decks.map(async (contentData) => {
          const absoluteFilePath = path.resolve(contentData.filePath!)
          const directoryPath = path.dirname(absoluteFilePath)

          const tempDirPrefix = path.join(os.tmpdir(), "anki-deck")
          const tempDir = fs.mkdtempSync(tempDirPrefix)

          const compiled = await compiler.compile(directoryPath, {
            prefix: opts.prefix!,
            workDir: tempDir,
          })

          const slug = contentData.slug
          const ext = ".apkg"

          const pathToAnkiDenk = joinSegments(ctx.argv.output, slug + ext) as FilePath
          const dir = path.dirname(pathToAnkiDenk)
          await fs.promises.mkdir(dir, { recursive: true })

          await fs.promises.cp(
            compiled.apkgPath,
            path.join(dir, `${path.basename(directoryPath)}-deck.apkg`),
          )

          return pathToAnkiDenk
        }),
      )

      return result
    },
  }
}
