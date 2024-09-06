import {ObjectId} from 'mongodb'
import type {MongoDB} from '../mongodb'
import {Router} from 'express'
import path from 'path'
import fs from 'fs'

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
        const a = list.map(item => ({
          ...item,
          imgName: `${req.protocol}://${req.get('host')}/images/restaurant/${
            item.imgName
          }`
        }))
        res.json({ok: true, body: a})
      } catch (e) {
        console.error('get restaurant list error: ', e)
        if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
      }
    })

  router.get('/info/:id', async (req, res) => {
    const {id} = req.params
    try {
      const restaurantId = new ObjectId(id)
      const a = await restaurant.findOne({_id: restaurantId})
      if (!a) {
        return res.status(404).json({ok: false, errorMessage: 'restaurant not found'})
      }
      return res.json({
        ok: true,
        body: {
          city_name: a.city_name,
          si_gu_name: a.si_gu_name,
          store_name: a.store_name,
          address: a.address,
          contact: a.contact,
          operating_hours: a.operating_hours,
          main_menu: a.main_menu,
          parking_status: a.parking_status,
          imgName: `${req.protocol}://${req.get('host')}/images/restaurant/${a.imgName}`,
          short_info: a.short_info,
          store_info: a.store_info
        }
      })
    } catch (error) {
      res.status(500).json({ok: false, errorMessage: 'Error retrieving restaurant info'})
    }
  })

  router.post('/edit/:id', async (req, res) => {
    const {id} = req.params
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
    } = req.body

    try {
      const restaurantId = new ObjectId(id)

      // 기존 이미지 파일 제거
      const a = await restaurant.findOne({_id: restaurantId})
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
        }
      }

      const result = await restaurant.findOneAndUpdate(
        {_id: restaurantId},
        updateFields,
        {
          returnDocument: 'after'
        }
      )
      if (!result) {
        return res
          .status(404)
          .json({ok: false, errorMessage: 'restaurant data not found'})
      }

      return res.json({ok: true, body: result.value})
    } catch (error) {
      console.error('update restaurant error: ', error)
      res.status(500).json({ok: false, errorMessage: 'Error updating restaurant'})
    }
  })

  router.delete('/delete/:id', async (req, res) => {
    const {id} = req.params

    try {
      const restaurantId = new ObjectId(id)
      const result = await restaurant.deleteOne({_id: restaurantId})

      return res.json({ok: true, body: result})
    } catch (error) {
      console.error('delete restaurant error: ', error)
      res.status(500).json({ok: false, errorMessage: 'Error deleting restaurant'})
    }
  })

  return router
}
