import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const sourceDir = path.resolve(dirname, '../apps/cms/public/media')
const targetDir = path.resolve(dirname, '../apps/site/public/media')

const copyDir = async (src, dest) => {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })

  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = path.join(src, entry.name)
      const destPath = path.join(dest, entry.name)

      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath)
        return
      }

      if (entry.isFile()) {
        await fs.copyFile(srcPath, destPath)
      }
    }),
  )
}

const run = async () => {
  try {
    await fs.access(sourceDir)
  } catch {
    return
  }

  await copyDir(sourceDir, targetDir)
}

await run()
