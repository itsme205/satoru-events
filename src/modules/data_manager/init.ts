import DataManagerClass from './Manager'
import path from 'path'

// globalDataManager: DataManagerClass
global.DataManager = new DataManagerClass(path.join(__dirname, '/data/data.json')) // You can set your own path

export default {
  id: 'data',
  init: async (log: (text: string) => {}) => {
    await DataManager.init()
    log('Successfully initialized!')
  }
}
