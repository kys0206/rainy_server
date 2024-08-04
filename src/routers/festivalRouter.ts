import type {MongoDB} from '../mongodb'
import {Router} from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

export const festivalRouter = (...args: any[]) => {
  const db: MongoDB = args[0]
  const festival = db.collection('festivals')
  const router = Router()

  const uploadDir = './public/images/festival'

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {recursive: true})
  }

  const storage = multer.diskStorage({
    destination: (req, res, cb) => {
      cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
      const fileName = file.fieldname + '-' + Date.now() + path.extname(file.originalname)
      cb(null, fileName)
    }
  })

  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      var ext = path.extname(file.originalname)
      if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        return cb(new Error('PNG, JPG 파일만 업로드 가능합니다.'))
      }
      cb(null, true)
    },
    limits: {
      fileSize: 1024 * 1024
    }
  })

  // 이미지 파일 전송 라우터 추가
  router.get('/images/festival/:filename', (req, res) => {
    const {filename} = req.params
    const filePath = path.join(__dirname, '..', 'public', 'images', 'festival', filename)
    res.sendFile(filePath)
  })

  router.post('/upload', upload.single('image'), (req, res) => {
    const imageData = req.file
    console.log(imageData)
    if (!imageData) {
      return res.json({success: false, errorMessage: '파일 업로드 실패'})
    }

    const imageName = req.file?.filename
    console.log(imageName)
    return res.json({success: true, imageName: imageName})
  })

  router
    .post('/add', async (req, res) => {
      const {body} = req

      try {
        const {
          city_name,
          si_gu_name,
          status,
          title,
          festival_period,
          content,
          address,
          entrace_fee,
          contact,
          imgName,
          web_url,
          adminId,
          author
        } = body

        const createdAt = new Date()
        const newCity = {
          city_name,
          si_gu_name,
          status,
          title,
          festival_period,
          content,
          address,
          entrace_fee,
          contact,
          imgName,
          web_url,
          adminId,
          author,
          createdAt
        }

        const info = await festival.insertOne(newCity)

        res.json({ok: true, body: info})
      } catch (e) {
        console.error('add festival error: ', e)
        if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
      }
    })
    .get('/list', async (req, res) => {
      try {
        const list = await festival.find({}).toArray()
        const a = list.map(item => ({
          ...item,
          imgName: `${req.protocol}://${req.get('host')}/images/festival/${item.imgName}`
        }))
        res.json({ok: true, body: a})
      } catch (e) {
        console.error('get festival list error: ', e)
        if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
      }
    })

  return router
}
