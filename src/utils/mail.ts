import dotenv from 'dotenv'
import mailer, {Transporter} from 'nodemailer'
import {AuthCodeForm} from './authCode_template'
import {TempPwdForm} from './tempPwd_template'

dotenv.config()

interface EmailData {
  from: string
  to: string
  subject: string
  html: string
}

const getEmailData = (Email: string, authCode: string): EmailData => {
  const data: EmailData = {
    from: `Rainy <${process.env.GMAIL}>`,
    to: Email,
    subject: 'Rainy 회원가입 이메일 인증번호입니다.',
    html: AuthCodeForm(authCode)
  }
  return data
}

const sendEmail = (Email: string, authCode: string): void => {
  const smtpTransport: Transporter = mailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_APPPW
    }
  })

  const mail: EmailData = getEmailData(Email, authCode)

  smtpTransport.sendMail(mail, function (error, response) {
    if (error) {
      console.log(error)
    } else {
      console.log('이메일 인증번호가 성공적으로 전송되었습니다.')
    }
    smtpTransport.close()
  })
}

const getTempPwdData = (Email: string, authCode: string): EmailData => {
  const data: EmailData = {
    from: `Rainy <${process.env.GMAIL}>`,
    to: Email,
    subject: 'Rainy 임시 비밀번호입니다.',
    html: TempPwdForm(authCode)
  }
  return data
}

const sendTempPwd = (Email: string, authCode: string): void => {
  const smtpTransport: Transporter = mailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
      user: process.env.GMAIL,
      pass: process.env.GMAIL_APPPW
    }
  })

  const mail: EmailData = getTempPwdData(Email, authCode)

  smtpTransport.sendMail(mail, function (error, response) {
    if (error) {
      console.log(error)
    } else {
      console.log('임시 비밀번호가 성공적으로 전송되었습니다.')
    }
    smtpTransport.close()
  })
}

export {sendEmail, sendTempPwd}
