import type {MongoDB} from '../mongodb'
import {Router} from 'express'
import path from 'path'

import {createUploader} from '../utils/upload_img'

export const restaurantRouter = (...args: any[]) => {
  const db: MongoDB = args[0]
  const restaurant = db.collection('restaurants')
  const router = Router()

  const upload = createUploader('restaurant')

  // 이미지 파일 전송 라우터 추가
  router.get('/images/restaurant/:filename', (req, res) => {
    const {filename} = req.params
    const filePath = path.join(
      __dirname,
      '..',
      'public',
      'images',
      'restaurant',
      filename
    )
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
          store_name,
          address,
          contact,
          operating_hours,
          main_menu,
          parking_status,
          imgName,
          short_info,
          store_info,
          adminId,
          author
        } = body

        const createdAt = new Date()
        const newRestaurant = {
          city_name,
          si_gu_name,
          store_name,
          address,
          contact,
          operating_hours,
          main_menu,
          parking_status,
          imgName,
          short_info,
          store_info,
          adminId,
          author,
          createdAt
        }

        const info = await restaurant.insertOne(newRestaurant)

        res.json({ok: true, body: info})
      } catch (e) {
        console.error('add restaurant error: ', e)
        if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
      }
    })
    .get('/list', async (req, res) => {
      try {
        const list = await restaurant.find({}).toArray()
        res.json({ok: true, body: list})
      } catch (e) {
        console.error('get restaurant list error: ', e)
        if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
      }
    })

  return router
}
