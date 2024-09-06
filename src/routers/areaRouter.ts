import type {MongoDB} from '../mongodb'
import {ObjectId} from 'mongodb'
import {Router} from 'express'
import path from 'path'
import fs from 'fs'
import {createUploader} from '../utils/upload_img'

export const areaRouter = (...args: any[]) => {
  const db: MongoDB = args[0]
  const city = db.collection('citys')
  const district = db.collection('districts')
  const router = Router()

  const cityUpload = createUploader('city')

  // 이미지 파일 전송 라우터 추가
  router.get('/images/city/:filename', (req, res) => {
    const {filename} = req.params
    const filePath = path.join(__dirname, '..', 'public', 'images', 'city', filename)
    res.sendFile(filePath)
  })

  router.post('/city/upload', cityUpload.single('image'), (req, res) => {
    const imageData = req.file
    console.log(imageData)
    if (!imageData) {
      return res.json({success: false, errorMessage: '파일 업로드 실패'})
    }

    const imageName = req.file?.filename
    return res.json({success: true, imageName: imageName})
  })

  router.post('/city/add', async (req, res) => {
    const {body} = req

    try {
      const {city_name, short_name, imgName, adminId, author} = body

      const createdAt = new Date()
      const newCity = {city_name, short_name, imgName, adminId, author, createdAt}

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
      // imgName 값을 서버의 이미지 파일 경로로 변환
      const modifiedList = list.map(item => ({
        ...item,
        imgName: `${req.protocol}://${req.get('host')}/images/city/${item.imgName}`
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
          imgName: `${req.protocol}://${req.get('host')}/images/city/${a.imgName}`
        }
      })
    } catch (error) {
      res.status(500).json({ok: false, errorMessage: 'Error retrieving city info'})
    }
  })

  router.post('/city/edit/:id', async (req, res) => {
    const {id} = req.params
    const {city_name, short_name, imgName, adminId, author} = req.body

    try {
      const cityId = new ObjectId(id)

      // 기존 이미지 파일 제거
      const a = await city.findOne({_id: cityId})
      if (a && a.imgName && a.imgName !== imgName) {
        const exist_img = path.join(
          __dirname,
          '..',
          '..',
          'public',
          'images',
          'city',
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

      // 업데이트할 필드를 설정합니다.
      const updateFields = {
        $set: {
          city_name,
          short_name,
          imgName,
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

  router.delete('/city/delete/:id', async (req, res) => {
    const {id} = req.params

    try {
      const cityId = new ObjectId(id)
      const result = await city.deleteOne({_id: cityId})

      return res.json({ok: true, body: result})
    } catch (error) {
      console.error('delete city error: ', error)
      res.status(500).json({ok: false, errorMessage: 'Error deleting city'})
    }
  })

  // 시/구

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

  router.get('/district/info/:id', async (req, res) => {
    const {id} = req.params
    try {
      const districtId = new ObjectId(id)
      const a = await district.findOne({_id: districtId})
      if (!a) {
        return res.status(404).json({ok: false, errorMessage: 'District not found'})
      }
      return res.json({
        ok: true,
        body: {
          city_name: a.city_name,
          si_gu_name: a.si_gu_name,
          web_url: a.web_url
        }
      })
    } catch (error) {
      res.status(500).json({ok: false, errorMessage: 'Error retrieving district info'})
    }
  })

  router.post('/district/edit/:id', async (req, res) => {
    const {id} = req.params
    const {city_name, si_gu_name, web_url, adminId, author} = req.body

    try {
      const districtId = new ObjectId(id)

      const updateInfo = {
        $set: {
          city_name,
          si_gu_name,
          web_url,
          adminId,
          author
        }
      }

      const result = await district.findOneAndUpdate({_id: districtId}, updateInfo, {
        returnDocument: 'after'
      })
      if (!result) {
        return res.status(404).json({ok: false, errorMessage: 'District data not found'})
      }

      return res.json({ok: true, body: result.value})
    } catch (error) {
      console.error('update district error: ', error)
      res.status(500).json({ok: false, errorMessage: 'Error updating district'})
    }
  })

  router.delete('/district/delete/:id', async (req, res) => {
    const {id} = req.params

    try {
      const districtId = new ObjectId(id)
      const result = await district.deleteOne({_id: districtId})

      return res.json({ok: true, body: result})
    } catch (error) {
      console.error('delete district error: ', error)
      res.status(500).json({ok: false, errorMessage: 'Error deleting district'})
    }
  })

  return router
}
