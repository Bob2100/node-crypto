import Koa from 'koa'
import Router from 'koa-router'
import path from 'path'
import fs from 'fs'
import mime from 'mime'
import parseRange from 'range-parser'

const app = new Koa()
const router = Router()

router.get('/audios/:fileName', (ctx) => {
  const fileName = ctx.params.fileName
  const filePath = path.join('static', ctx.params.fileName)
  sendAudioChunk(ctx, filePath, fileName)
})

app.use(router.routes())
app.listen(3001, () => {
  console.log('server listening at port 3000')
})

function sendAudioChunk(ctx, filePath, fileName) {
  ctx.res.setHeader('Content-Type', mime.getType(fileName))
  let content = fs.readFileSync(filePath)
  if (!ctx.req.headers.range) {
    // ctx.status = 206
    ctx.body = content
    return
  }
  const ranges = parseRange(content.length, ctx.req.headers.range)

  ctx.res.setHeader('Content-Range', 'bytes ' + ranges[0].start + '-' + ranges[0].end + '/' + content.length)
  ctx.res.setHeader('Accept-Ranges', 'bytes')

  content = content.subarray(ranges[0].start, ranges[0].end + 1)
  ctx.res.setHeader('Content-Length', content.length)

  // ctx.status = 206
  ctx.body = content
}
