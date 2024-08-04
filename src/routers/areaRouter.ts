import type {MongoDB} from '../mongodb'
import {ObjectId} from 'mongodb'
import {Router} from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

export const areaRouter = (...args: any[]) => {
  const db: MongoDB = args[0]
  const city = db.collection('citys')
  const district = db.collection('districts')
  const router = Router()

  const uploadDir = './public/images/city'

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

  // 이미지 파일 전송 라우터 추가
  router.get('/images/city/:filename', (req, res) => {
    const {filename} = req.params
    const filePath = path.join(__dirname, '..', 'public', 'images', 'city', filename)
    res.sendFile(filePath)
  })

  router.post('/city/upload', upload.single('image'), (req, res) => {
    const imageData = req.file
    console.log(imageData)
    if (!imageData) {
      return res.json({success: false, errorMessage: '파일 업로드 실패'})
    }

    const imageName = req.file?.filename
    console.log(imageName)
    return res.json({success: true, imageName: imageName})
  })

  router.post('/city/add', async (req, res) => {
    const {body} = req

    try {
      const {city_name, short_name, imgURL, adminId, author} = body

      const createdAt = new Date()
      const newCity = {city_name, short_name, imgURL, adminId, author, createdAt}

      const info = await city.insertOne(newCity)

      res.json({ok: true, body: info})
    } catch (e) {
      console.error('add city error: ', e)
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })

  router.get('/city/list', async (req, res) => {
    try {
      const list = await city.find({}).toArray()
      // imgURL 값을 서버의 이미지 파일 경로로 변환
      const modifiedList = list.map(item => ({
        ...item,
        imgURL: `${req.protocol}://${req.get('host')}/images/city/${item.imgURL}`
      }))
      res.json({ok: true, body: modifiedList})
    } catch (e) {
      console.error('get city list error: ', e)
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })

  router.get('/city/info/:id', async (req, res) => {
    const {id} = req.params
    try {
      const cityId = new ObjectId(id)
      const a = await city.findOne({_id: cityId})
      if (!a) {
        return res.status(404).json({ok: false, errorMessage: 'City not found'})
      }
      return res.json({
        ok: true,
        body: {
          city_name: a.city_name,
          short_name: a.short_name,
          imgURL: `${req.protocol}://${req.get('host')}/images/city/${a.imgURL}`
        }
      })
    } catch (error) {
      res.status(500).json({ok: false, errorMessage: 'Error retrieving city info'})
    }
  })

  router.post('/city/edit/:id', async (req, res) => {
    const {id} = req.params
    const {city_name, short_name, imgURL, adminId, author} = req.body

    try {
      const cityId = new ObjectId(id)

      // 업데이트할 필드를 설정합니다.
      const updateFields = {
        $set: {
          city_name,
          short_name,
          imgURL,
          adminId,
          author
        }
      }

      const result = await city.findOneAndUpdate(
        {_id: cityId},
        updateFields,
        {returnDocument: 'after'} // 수정된 문서를 반환하도록 설정
      )
      if (!result) {
        return res.status(404).json({ok: false, errorMessage: 'City data not found'})
      }

      return res.json({ok: true, body: result.value})
    } catch (error) {
      console.error('update city error: ', error)
      res.status(500).json({ok: false, errorMessage: 'Error updating city'})
    }
  })

  router.post('/district/add', async (req, res) => {
    const {body} = req

    try {
      const {city_name, si_gu_name, web_url, adminId, author} = body

      const createdAt = new Date()
      const newDistrict = {city_name, si_gu_name, web_url, adminId, author, createdAt}

      const info = await district.insertOne(newDistrict)

      res.json({ok: true, body: info})
    } catch (e) {
      console.error('add district error: ', e)
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })

  router.get('/district/list', async (req, res) => {
    try {
      const list = await district.find({}).toArray()
      res.json({ok: true, body: list})
    } catch (e) {
      console.error('get district list error: ', e)
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })
  // .get('/info', async (req, res) => {
  //   const {themaId} = req.query
  //   if (!themaId) return res.json({ok: false, errorMessage: 'check parameters'})
  //   try {
  //     const info = await themas.findOne({_id: new ObjectId(themaId as string)})
  //     console.log(info)
  //     res.json({ok: true, body: info})
  //   } catch (e) {
  //     console.error('get thema info error: ', e)
  //     if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
  //   }
  // })
  // .post('/upload', upload.single('thema'), (req, res) => {
  //   const imageData = req.file
  //   console.log('Image Data:', imageData)

  //   const imagePath = req.file?.path
  //   console.log(imagePath)
  //   return res.json({success: true, imagePath: imagePath})
  // })

  return router
}
