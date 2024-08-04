import type {MongoDB} from '../mongodb'
import {Router} from 'express'
import * as U from '../utils'

export const adminRouter = (...args: any[]) => {
  const db: MongoDB = args[0]
  const admins = db.collection('admins')
  const router = Router()

  return router
    .post('/signUp', async (req, res) => {
      const {body} = req

      try {
        const exists = await admins.findOne({email: body.email})

        if (exists) {
          res.json({ok: false, errorMessage: '이미 가입한 회원입니다.'})
        } else {
          const {email, password, name, phone, department} = body
          const hashed = await U.hashPasswordP(password)
          const newBody = {email, password: hashed, name, phone, department}
          const {insertedId} = await admins.insertOne(newBody)
          const jwt = await U.jwtSignP({userId: insertedId})
          res.json({ok: true, body: jwt, id: insertedId})
        }
      } catch (e) {
        if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
      }
    })
    .post('/login', async (req, res) => {
      const {email, password} = req.body
      try {
        const result = await admins.findOne({email})
        console.log(result)

        if (!result) {
          res.json({ok: false, errorMessage: '등록되지 않은 관리자 입니다.'})
          return
        }

        const same = await U.comparePasswordP(password, result.password)
        if (!same) {
          res.json({ok: false, errorMessage: '비밀번호가 틀립니다.'})
          return
        }

        const jwt = await U.jwtSignP({userId: result._id})
        res.json({ok: true, body: jwt, id: result._id, name: result.name})
      } catch (e) {
        if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
      }
    })
}
