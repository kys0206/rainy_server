import {ObjectId} from 'mongodb'
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

  router.post('/add', async (req, res) => {
    const {body} = req

    try {
      const {
        isPublic,
        city_name,
        si_gu_name,
        status,
        title,
        festival_period,
        festival_info,
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
      const newFestival = {
        isPublic,
        city_name,
        si_gu_name,
        status,
        title,
        festival_period,
        festival_info,
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

      const info = await festival.insertOne(newFestival)

      res.json({ok: true, body: info})
    } catch (e) {
      console.error('add festival error: ', e)
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })

  router.get('/list', async (req, res) => {
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

  router.get('/info/:id', async (req, res) => {
    const {id} = req.params
    try {
      const festivalId = new ObjectId(id)
      const a = await festival.findOne({_id: festivalId})
      if (!a) {
        return res.status(404).json({ok: false, errorMessage: 'festival not found'})
      }
      return res.json({
        ok: true,
        body: {
          isPublic: a.isPublic,
          city_name: a.city_name,
          si_gu_name: a.si_gu_name,
          status: a.status,
          title: a.title,
          festival_period: a.festival_period,
          festival_info: a.festival_info,
          content: a.content,
          address: a.address,
          entrace_fee: a.entrace_fee,
          contact: a.contact,
          imgName: `${req.protocol}://${req.get('host')}/images/festival/${a.imgName}`,
          web_url: a.web_url
        }
      })
    } catch (error) {
      res.status(500).json({ok: false, errorMessage: 'Error retrieving festival info'})
    }
  })

  router.post('/edit/:id', async (req, res) => {
    const {id} = req.params
    const {
      isPublic,
      city_name,
      si_gu_name,
      status,
      title,
      festival_period,
      festival_info,
      content,
      address,
      entrace_fee,
      contact,
      imgName,
      web_url,
      adminId,
      author
    } = req.body

    try {
      const festivalId = new ObjectId(id)

      // 기존 이미지 파일 제거
      const a = await festival.findOne({_id: festivalId})
      if (a && a.imgName && a.imgName !== imgName) {
        const exist_img = path.join(
          __dirname,
          '..',
          '..',
          'public',
          'images',
          'festival',
          a.imgName
        )

        // 기존 이미지 파일이 존재할 경우 삭제
        if (fs.existsSync(exist_img)) {
          fs.unlink(exist_img, err => {
            if (err) {
              console.error('Failed to delete existing image: ', err)
            } else {
              console.log('existing image deleted: ', exist_img)
            }
          })
        }
      }

      const updateFields = {
        $set: {
          isPublic,
          city_name,
          si_gu_name,
          status,
          title,
          festival_period,
          festival_info,
          content,
          address,
          entrace_fee,
          contact,
          imgName,
          web_url,
          adminId,
          author
        }
      }

      const result = await festival.findOneAndUpdate({_id: festivalId}, updateFields, {
        returnDocument: 'after'
      })
      if (!result) {
        return res.status(404).json({ok: false, errorMessage: 'festival data not found'})
      }

      return res.json({ok: true, body: result.value})
    } catch (error) {
      console.error('update festival error: ', error)
      res.status(500).json({ok: false, errorMessage: 'Error updating festival'})
    }
  })

  router.delete('/delete/:id', async (req, res) => {
    const {id} = req.params

    try {
      const festivalId = new ObjectId(id)
      const result = await festival.deleteOne({_id: festivalId})

      return res.json({ok: true, body: result})
    } catch (error) {
      console.error('delete festival error: ', error)
      res.status(500).json({ok: false, errorMessage: 'Error deleting festival'})
    }
  })

  return router
}
