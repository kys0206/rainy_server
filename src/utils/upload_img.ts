import multer from 'multer'
import path from 'path'
import fs from 'fs'

export const createUploader = (fileName: string) => {
  const uploadDir = `./public/images/${fileName}`

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
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname)
      if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
        return cb(new Error('PNG, JPG 파일만 업로드 가능합니다.'))
      }
      cb(null, true)
    },
    limits: {
      fileSize: 1024 * 1024
    }
  })

  return upload
}
