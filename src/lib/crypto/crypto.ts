import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

export const encrypt = (value: string): string => {
  const secretKey = process.env.COMMON_SECRET_KEY as string
  const iv = Buffer.alloc(16, 0)
  const passCipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv)
  let cipher = passCipher.update(value, 'utf8', 'hex')
  cipher += passCipher.final('hex')
  return cipher
}

export const decrypt = (value: string): string => {
  const secretKey = process.env.COMMON_SECRET_KEY as string
  const iv = Buffer.alloc(16, 0)
  const passDecipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), iv)
  let plain = passDecipher.update(value, 'hex', 'utf8')
  plain += passDecipher.final('utf8')
  return plain
}
