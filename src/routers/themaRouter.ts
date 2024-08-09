import {ObjectId} from 'mongodb'
import type {MongoDB} from '../mongodb'
import {Router} from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import {createUploader} from '../utils/upload_img'

export const themaRouter = (...args: any[]) => {
  const db: MongoDB = args[0]
  const thema = db.collection('themas')
  const router = Router()

  const uploadDir = createUploader('thema')

  // 이미지 파일 전송 라우터 추가
  router.get('/images/thema/:filename', (req, res) => {
    const {filename} = req.params
    const filePath = path.join(__dirname, '..', 'public', 'images', 'thema', filename)
    res.sendFile(filePath)
  })

  router.post('/upload', uploadDir.single('image'), (req, res) => {
    const imageData = req.file
    if (!imageData) {
      return res.json({success: false, errorMessage: '파일 업로드 실패'})
    }

    const imageName = req.file?.filename
    return res.json({success: true, imageName: imageName})
  })

  router.post('/add', async (req, res) => {
    const {body} = req
    try {
      const {isPublic, title, content, imgName, adminId, author} = body
      const createdAt = new Date()
      const newThema = {isPublic, title, content, imgName, adminId, author, createdAt}
      const info = await thema.insertOne(newThema)
      res.json({ok: true, body: info})
    } catch (e) {
      console.error('add thema error: ', e)
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })

  router.get('/list', async (req, res) => {
    try {
      const list = await thema.find({}).toArray()
      const modifiedList = list.map(item => ({
        ...item,
        imgName: `${req.protocol}://${req.get('host')}/images/thema/${item.imgName}`
      }))
      res.json({ok: true, body: modifiedList})
    } catch (e) {
      console.error('get thema list error: ', e)
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })

  router.get('/info/:id', async (req, res) => {
    const {id} = req.params
    try {
      const themaId = new ObjectId(id)
      const a = await thema.findOne({_id: themaId})
      if (!a) {
        return res.status(404).json({ok: false, errorMessage: 'Thema not found'})
      }
      return res.json({
        ok: true,
        body: {
          isPublic: a.isPublic,
          title: a.title,
          content: a.content,
          imgName: `${req.protocol}://${req.get('host')}/images/thema/${a.imgName}`
        }
      })
    } catch (error) {
      res.status(500).json({ok: false, errorMessage: 'Error retrieving thema info'})
    }
  })

  router.post('/edit/:id', async (req, res) => {
    const {id} = req.params
    const {isPublic, title, content, imgName, adminId, author} = req.body

    try {
      const themaId = new ObjectId(id)

      // 기존 이미지 파일 제거
      const a = await thema.findOne({_id: themaId})

      if (a && a.imgName && a.imgName !== imgName) {
        const exist_img = path.join(
          __dirname,
          '..',
          '..',
          'public',
          'images',
          'thema',
          a.imgName
        )

        if (fs.existsSync(exist_img)) {
          fs.unlink(exist_img, err => {
            if (err) {
              console.error('Failed to delete existing image: ', err)
            } else {
              console.log('Image deleted: ', exist_img)
            }
          })
        }
      }

      const updateFields = {
        $set: {isPublic, title, content, imgName, adminId, author}
      }

      const result = await thema.findOneAndUpdate({_id: themaId}, updateFields, {
        returnDocument: 'after'
      })
      if (!result) {
        return res.status(404).json({ok: false, errorMessage: 'thema data not found'})
      }

      return res.json({ok: true, body: result.value})
    } catch (error) {
      console.error('update thema error: ', error)
      res.status(500).json({ok: false, errorMessage: 'Error updating thema'})
    }
  })

  router.delete('/delete/:id', async (req, res) => {
    const {id} = req.params

    try {
      const themaId = new ObjectId(id)
      const result = await thema.deleteOne({_id: themaId})

      return res.json({ok: true, body: result})
    } catch (error) {
      console.error('delete thema error: ', error)
      res.status(500).json({ok: false, errorMessage: 'Error deleting thema'})
    }
  })

  return router
}
