import mongoose from 'mongoose'

export default {
  id: 'mongodb',
  init: (log: (text: string) => {}) => {
    log('Connecting...')
    mongoose.set('strictQuery', false)
    mongoose.connect(process.env.MONGO_URL ?? 'no connection url').then(() => {
      log('Connected to the database!')
    }).catch((err) => {
      log("Can't connect to the database.")
      console.log(err)
    })
  }
}
