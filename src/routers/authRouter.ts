import {Router} from 'express'
import {ObjectId} from 'mongodb'

import type {MongoDB} from '../mongodb'
import * as U from '../utils'
import {sendEmail, sendTempPwd} from '../utils/mail'

export const authRouter = (...args: any[]) => {
  const db: MongoDB = args[0]
  const users = db.collection('users')
  const codes = db.collection('emailCodes')
  const temppwds = db.collection('temppwds')
  const router = Router()

  router.post('/createAuthCode', async (req, res) => {
    const {email} = req.body
    if (!email) return res.status(200).send({status: 'failed', data: 'check parameters'})

    try {
      const authCode = Math.random().toString(36).slice(2, 8)
      const form = {email, code: authCode, createdAt: new Date()}

      await codes.insertOne(form)
      sendEmail(email, authCode)
      console.log('Email Auth Code: ', authCode)
      return res.status(200).send({message: 'success', data: 'success'})
    } catch (error) {
      console.log('createAuthCode error', error)
      return res.status(500).send('error')
    }
  })

  router.get('/validate/code/:email/:code', async (req, res) => {
    const {email, code} = req.params

    if (!email || !code) {
      return res.json({success: false, errorMessage: 'check parameters'})
    }

    try {
      const authCode = await codes.findOne({email, code})
      console.log(authCode)

      if (!authCode) {
        return res.json({success: false, errorMessage: 'wrong validate'})
      }

      return res.json({success: true})
    } catch (e) {
      if (e instanceof Error) {
        return res.json({success: false, errorMessage: e.message})
      }
    }
  })

  router.post('/create/temp/password', async (req, res) => {
    const {email, name, birth, phone} = req.body
    if (!email) return res.status(200).send({status: 'failed', data: 'check parameters'})

    try {
      const user = await users.findOne({email, name, birth, phone})
      if (!user) {
        return res
          .status(404)
          .json({status: 'failed', data: '사용자를 찾을 수 없습니다.'})
      }

      // 임시 비밀번호 생성 및 해시화
      const tempPwd = Math.random().toString(36).slice(2, 10)
      const hashedTempPwd = await U.hashPasswordP(tempPwd)

      await users.updateOne({_id: user._id}, {$set: {password: hashedTempPwd}})

      sendTempPwd(email, tempPwd)

      return res
        .status(200)
        .send({message: 'success', data: '임시 비밀번호가 이메일로 전송되었습니다.'})
    } catch (error) {
      console.log('create temp pwd error', error)
      return res.status(500).send('error')
    }
  })

  router.post('/signUp', async (req, res) => {
    const {body} = req

    try {
      const exists = await users.findOne({email: body.email})

      if (exists) {
        res.json({ok: false, errorMessage: '이미 가입한 회원입니다.'})
      } else {
        const {email, password, name, birth, phone} = body
        const hashed = await U.hashPasswordP(password)

        const registeredAt = new Date()

        const newBody = {email, password: hashed, name, birth, phone, registeredAt}
        const {insertedId} = await users.insertOne(newBody)
        const jwt = await U.jwtSignP({userId: insertedId})
        res.json({ok: true, body: jwt})
      }
    } catch (e) {
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })

  router.post('/login', async (req, res) => {
    const {email, password} = req.body
    try {
      const result = await users.findOne({email})
      console.log(result)

      if (!result) {
        res.json({ok: false, errorMessage: '등록되지 않은 사용자 입니다.'})
        return
      }

      const same = await U.comparePasswordP(password, result.password)
      if (!same) {
        res.json({ok: false, errorMessage: '비밀번호가 틀립니다.'})
        return
      }

      const jwt = await U.jwtSignP({userId: result._id})
      res.json({ok: true, body: jwt, id: result._id, userName: result.name})
    } catch (e) {
      if (e instanceof Error) res.json({ok: false, errorMessage: e.message})
    }
  })

  router.get('/info/:id', async (req, res) => {
    const {id} = req.params

    try {
      const userId = new ObjectId(id)
      const user = await users.findOne({_id: userId})
      if (!user) {
        return res
          .status(404)
          .json({ok: false, errorMessage: '사용자를 찾을 수 없습니다.'})
      }

      return res.json({
        ok: true,
        body: {
          _id: user._id,
          email: user.email,
          name: user.name,
          birth: user.birth,
          phone: user.phone
        }
      })
    } catch (error) {
      res.status(500).json({
        ok: false,
        errorMessage: '사용자 정보를 가져오는 중 오류가 발생했습니다.'
      })
    }
  })

  router.get('/find/email', async (req, res) => {
    const {name, birth, phone} = req.query

    if (!name || !birth || !phone) {
      return res.status(400).json({ok: false, errorMessage: '모든 필드를 입력해주세요.'})
    }

    try {
      const user = await users.findOne({name, birth, phone})

      if (!user) {
        return res
          .status(404)
          .json({ok: false, errorMessage: '일치하는 사용자를 찾을 수 없습니다.'})
      }

      return res.json({ok: true, email: user.email})
    } catch (error) {
      console.error('이메일 찾기 오류:', error)
      return res
        .status(500)
        .json({ok: false, errorMessage: '이메일을 찾는 중 오류가 발생했습니다.'})
    }
  })

  router.post('/modify/user/info', async (req, res) => {
    const {id, name, birth, phone} = req.body

    try {
      // 사용자가 존재하는지 확인
      const userId = new ObjectId(id)
      const isUser = await users.findOne({_id: userId})
      if (!isUser) {
        return res
          .status(404)
          .json({ok: false, errorMessage: '사용자를 찾을 수 없습니다.'})
      }

      // 업데이트할 필드 설정
      const updateFields = {
        $set: {
          name,
          birth,
          phone
        }
      }

      const result = await users.findOneAndUpdate({_id: userId}, updateFields, {
        returnDocument: 'after'
      })
      if (!result) {
        return res
          .status(404)
          .json({ok: false, errorMessage: '사용자 정보 수정에 실패하였습니다.'})
      }

      res.json({
        ok: true,
        body: result.value,
        message: '사용자 정보가 성공적으로 변경되었습니다.'
      })
    } catch (e) {
      if (e instanceof Error) {
        res.json({ok: false, errorMessage: e.message})
      }
    }
  })

  router.post('/modify/password', async (req, res) => {
    const {id, password, newPassword} = req.body

    try {
      // 사용자가 존재하는지 확인
      const isUser = await users.findOne({_id: new ObjectId(id)})
      if (!isUser) {
        return res
          .status(404)
          .json({ok: false, errorMessage: '사용자를 찾을 수 없습니다.'})
      }

      // 현재 비밀번호가 일치하는지 확인
      const isMatch = await U.comparePasswordP(password, isUser.password)
      if (!isMatch) {
        return res
          .status(400)
          .json({ok: false, errorMessage: '현재 비밀번호가 일치하지 않습니다.'})
      }

      // 새로운 비밀번호 해시
      const hashedPassword = await U.hashPasswordP(newPassword)

      // 비밀번호 업데이트
      await users.findOneAndUpdate(
        {_id: new ObjectId(id)},
        {$set: {password: hashedPassword}}
      )

      res.json({ok: true, message: '비밀번호가 성공적으로 변경되었습니다.'})
    } catch (e) {
      if (e instanceof Error) {
        res.json({ok: false, errorMessage: e.message})
      }
    }
  })

  return router
}
