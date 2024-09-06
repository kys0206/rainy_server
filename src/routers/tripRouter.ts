import {ObjectId} from 'mongodb'
import type {MongoDB} from '../mongodb'
import {Router} from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

export const tripRouter = (...args: any[]) => {
  const db: MongoDB = args[0]
  const trip = db.collection('trips')
  const router = Router()

  const uploadDir = './public/images/trip'

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
  router.get('/images/trip/:filename', (req, res) => {
    const {filename} = req.params
    const filePath = path.join(__dirname, '..', 'public', 'images', 'trip', filename)
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
        city_name,
        si_gu_name,
        place_name,
        imgName,
        address,
        contact,
        operating_hours,
        entrace_fee,
        parking_status,
        web_url,
        short_info,
        place_info,
        tags,
        adminId,
        author
      } = body

      const createdAt = new Date()
      const newCity = {
        city_name,
        si_gu_name,
        place_name,
        imgName,
        address,
        contact,
        operating_hours,
        entrace_fee,
        parking_status,
        web_url,
        short_info,
        place_info,
        tags,
        adminId,
        author,
        createdAt
      }

      const info = await trip.insertOne(newCity)

      res.json({ok: true, body: info})
    } catch (e) {
      console.error('add trip error: ', e)
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })

  router.get('/list', async (req, res) => {
    try {
      const list = await trip.find({}).sort({createdAt: -1}).toArray()
      const a = list.map(item => ({
        ...item,
        imgName: `${req.protocol}://${req.get('host')}/images/trip/${item.imgName}`
      }))
      res.json({ok: true, body: a})
    } catch (e) {
      console.error('get trip list error: ', e)
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })

  router.get('/info/:id', async (req, res) => {
    const {id} = req.params
    try {
      const tripId = new ObjectId(id)
      const a = await trip.findOne({_id: tripId})
      if (!a) {
        return res.status(404).json({ok: false, errorMessage: 'trip not found'})
      }
      return res.json({
        ok: true,
        body: {
          city_name: a.city_name,
          si_gu_name: a.si_gu_name,
          place_name: a.place_name,
          imgName: `${req.protocol}://${req.get('host')}/images/trip/${a.imgName}`,
          address: a.address,
          contact: a.contact,
          operating_hours: a.operating_hours,
          entrace_fee: a.entrace_fee,
          parking_status: a.parking_status,
          web_url: a.web_url,
          short_info: a.short_info,
          place_info: a.place_info,
          tags: a.tags
        }
      })
    } catch (error) {
      res.status(500).json({ok: false, errorMessage: 'Error retrieving trip info'})
    }
  })

  router.post('/edit/:id', async (req, res) => {
    const {id} = req.params
    const {
      city_name,
      si_gu_name,
      place_name,
      imgName,
      address,
      contact,
      operating_hours,
      entrace_fee,
      parking_status,
      web_url,
      short_info,
      place_info,
      tags,
      adminId,
      author
    } = req.body

    try {
      const tripId = new ObjectId(id)

      // 기존 이미지 파일 제거
      const a = await trip.findOne({_id: tripId})
      if (a && a.imgName && a.imgName !== imgName) {
        const exist_img = path.join(
          __dirname,
          '..',
          '..',
          'public',
          'images',
          'trip',
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
          city_name,
          si_gu_name,
          place_name,
          imgName,
          address,
          contact,
          operating_hours,
          entrace_fee,
          parking_status,
          web_url,
          short_info,
          place_info,
          tags,
          adminId,
          author
        }
      }

      const result = await trip.findOneAndUpdate({_id: tripId}, updateFields, {
        returnDocument: 'after'
      })
      if (!result) {
        return res.status(404).json({ok: false, errorMessage: 'trip data not found'})
      }

      return res.json({ok: true, body: result.value})
    } catch (error) {
      console.error('update trip error: ', error)
      res.status(500).json({ok: false, errorMessage: 'Error updating trip'})
    }
  })

  router.delete('/delete/:id', async (req, res) => {
    const {id} = req.params

    try {
      const tripId = new ObjectId(id)
      const result = await trip.deleteOne({_id: tripId})

      return res.json({ok: true, body: result})
    } catch (error) {
      console.error('delete trip error: ', error)
      res.status(500).json({ok: false, errorMessage: 'Error deleting trip'})
    }
  })

  return router
}
