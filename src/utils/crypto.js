import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import { gzipSync, unzipSync } from 'zlib'
import { createCipheriv, createDecipheriv } from 'crypto'

export async function encryptSingle(plainFilePath, cipherFilePath) {
  if (!cipherFilePath) {
    cipherFilePath = plainFilePath
  }
  const content = readFileSync(plainFilePath)
  if (decode(content)) {
    return
  }
  const zipped = gzipSync(Buffer.from(content))
  writeFileSync(cipherFilePath, encode(zipped))
}

export async function decryptSingle(cipherFilePath, plainFilePath) {
  if (!plainFilePath) {
    plainFilePath = cipherFilePath
  }
  const content = readFileSync(cipherFilePath)
  const res = decode(Buffer.from(content))
  if (!res) {
    return
  }
  const unZippedContent = unzipSync(res)
  writeFileSync(plainFilePath, unZippedContent)
}

export function encrypt(plainFolder, cipherFolder) {
  if (!cipherFolder) {
    cipherFolder = plainFolder
    if (isFile(plainFolder)) {
      encryptSingle(plainFolder)
      return
    }
  }
  return getFileList(plainFolder).map((file) =>
    encryptSingle(file, `${cipherFolder}/${file.split(plainFolder)[1]}`)
  )
}

export function decrypt(cipherFolder, plainFolder) {
  if (!plainFolder) {
    plainFolder = cipherFolder
    if (isFile(cipherFolder)) {
      decryptSingle(cipherFolder)
      return
    }
  }
  return getFileList(cipherFolder).map((file) =>
    decryptSingle(file, `${plainFolder}/${file.split(cipherFolder)[1]}`)
  )
}

function getFileList(path) {
  const fileList = []
  readFile(path, fileList)
  return fileList
}

function readFile(path, fileList) {
  if (isFile(path)) {
    fileList.push(path)
    return
  }
  const files = readdirSync(path)
  files.forEach((file) => readFile(`${path}/${file}`, fileList))
}

function isFile(path) {
  return statSync(path).isFile()
}

const consts = {
  cryptkey: '0123456789abcdef',
  iv: 'abcdef0123456789',
}

function encode(content) {
  const cipher = createCipheriv('aes-128-cbc', consts.cryptkey, consts.iv)
  cipher.setAutoPadding(true)
  const bf = []
  bf.push(cipher.update(content))
  bf.push(cipher.final())
  return Buffer.concat(bf)
}

function decode(content) {
  const decipher = createDecipheriv('aes-128-cbc', consts.cryptkey, consts.iv)
  decipher.setAutoPadding(true)
  try {
    const a = []
    a.push(decipher.update(content))
    a.push(decipher.final())
    return Buffer.concat(a)
  } catch (e) {
    return false
  }
}
