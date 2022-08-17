import { rmdir, readdir, unlink, stat } from 'fs/promises'
import path from 'path'

export async function removeDir(dir) {
  const fileList = await readdir(dir)
  for (const file of fileList) {
    const filePath = path.join(dir, file)
    const yes = await isFile(filePath)
    if (yes) {
      await unlink(filePath)
      continue
    }
    await removeDir(filePath)
  }
  await rmdir(dir)
}

export async function isFile(path) {
  const status = await stat(path)
  return status.isFile()
}

export async function isDirectory(path) {
  const status = await stat(path)
  return status.isDirectory()
}

export async function removeEmptyDir(dir) {
  const fileList = await readdir(dir)
  if (fileList.length === 0) {
    await rmdir(dir)
    return
  }
  for (const file of fileList) {
    const filePath = path.join(dir, file)
    const yes = await isDirectory(filePath)
    if (yes) {
      await removeEmptyDir(filePath)
    }
  }
  await removeEmptyDir(dir)
}
