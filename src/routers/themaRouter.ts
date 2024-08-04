import type {MongoDB} from '../mongodb'
import {Router} from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import {ObjectId} from 'mongodb'

export const themaRouter = (...args: any[]) => {
  const db: MongoDB = args[0]
  const themas = db.collection('themas')
  const router = Router()

  const uploadDir = './public/images/thema'

  // 폴더가 없을 경우 생성
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {recursive: true})
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir) // 이미지 파일 저장 경로 설정
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

  router.post('/add', async (req, res) => {
    const {body} = req
    try {
      const {title, content, imgURL, adminId, author} = body

      const createdAt = new Date()
      const newThema = {title, content, imgURL, adminId, author, createdAt}

      const info = await themas.insertOne(newThema)

      res.json({ok: true, body: info})
    } catch (e) {
      console.error('add thema error: ', e)
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })

  // 이미지 파일 전송 라우터 추가
  router.get('/images/thema/:filename', (req, res) => {
    const {filename} = req.params
    const filePath = path.join(__dirname, '..', 'public', 'images', 'thema', filename)
    res.sendFile(filePath)
  })

  router.get('/list', async (req, res) => {
    try {
      const list = await themas.find({}).toArray()
      // imgURL 값을 서버의 이미지 파일 경로로 변환
      const modifiedList = list.map(item => ({
        ...item,
        imgURL: `${req.protocol}://${req.get('host')}/images/thema/${item.imgURL}`
      }))
      console.log(modifiedList)
      res.json({ok: true, body: modifiedList})
    } catch (e) {
      console.error('get thema list error: ', e)
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })

  router.get('/info', async (req, res) => {
    const {themaId} = req.query
    if (!themaId) return res.json({ok: false, errorMessage: 'check parameters'})
    try {
      const info = await themas.findOne({_id: new ObjectId(themaId as string)})
      res.json({ok: true, body: info})
    } catch (e) {
      console.error('get thema info error: ', e)
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })

  return router
}
