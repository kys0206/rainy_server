import {Express} from 'express'
import * as R from '../routers'

export const setupRouters = (app: Express, ...args: any[]): Express => {
  // prettier-ignore
  return app
    .use('/auth', R.authRouter(...args))
    .use('/admin', R.adminRouter(...args))
    .use('/thema', R.themaRouter(...args))
    .use('/area', R.areaRouter(...args))
    .use('/trip', R.tripRouter(...args))
    .use('/restaurant', R.restaurantRouter(...args))
    .use('/festival', R.festivalRouter(...args))
    .use('/slide', R.slideRouter(...args))
}

// import {Express} from 'express'
// import * as R from '../routers'

// export const setupRouters = (app: Express, ...args: any[]): Express => {
//   const db = args[0] // MongoDB 인스턴스를 추출합니다.

//   return app
//     .use('/test', R.testRouter(...args))
//     .use('/auth', R.authRouter(...args))
//     .use('/admin', R.adminRouter(...args))
//     .use('/thema', R.themaRouter(db)) // db를 인수로 전달합니다.
// }
