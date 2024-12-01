import path from "path"
import fs from 'fs';
import { spawnSync } from "child_process"
import os from "os"
import chalk from "chalk"
import { QuartzEmitterPlugin } from "../types"
import { FilePath, joinSegments } from "../../util/path"

type AnkiOptions = {}

export const Anki: QuartzEmitterPlugin<Partial<AnkiOptions>> = () => {

  return {
    name: "Anki",
    getQuartzComponents() { return [] },
    async emit(ctx, content, resources): Promise<FilePath[]> {
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

          const out = spawnSync("mdankideck", ["--prefix", "thepopupschool::", directoryPath, tempDir], { stdio: "inherit" })
          if (out.stderr) {
            throw new Error(chalk.red(`Error create anki deck: ${out.stderr}`))
          } else if (out.status !== 0) {
            throw new Error(chalk.red("Error create anki deck", JSON.stringify(out, null, 2)))
          }


          const slug = contentData.slug
          const ext = ".apkg"

          const pathToAnkiDenk = joinSegments(ctx.argv.output, slug + ext) as FilePath
          const dir = path.dirname(pathToAnkiDenk)
          await fs.promises.mkdir(dir, { recursive: true })

          await fs.promises.cp(path.join(tempDir, "deck.apkg"), path.join(dir, "deck.apkg"))

          return pathToAnkiDenk

        })
      )

      return result
    }
  }
}
