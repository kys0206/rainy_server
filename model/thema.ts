import {Schema, model, Model} from 'mongoose'

interface DBThema {
  title: string
  content: string
}

// 1. 모델 타입 정의
type DBThemaModel = Model<DBThema>

// 2. 스키마에 추가
const themaSchema = new Schema<DBThema, DBThemaModel>({
  title: {type: String, required: true},
  content: {type: String, required: true}
})

const Thema = model<DBThema, DBThemaModel>('Thema', themaSchema)

export {Thema}
