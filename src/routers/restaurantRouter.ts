import type {MongoDB} from '../mongodb'
import {Router} from 'express'

export const restaurantRouter = (...args: any[]) => {
  const db: MongoDB = args[0]
  const restaurant = db.collection('restaurants')
  const router = Router()

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
          imgURL,
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
          imgURL,
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
