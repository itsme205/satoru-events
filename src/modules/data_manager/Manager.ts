import path from 'path'
import fs from 'fs'

class DataManager {
  private readonly data_path: string | undefined
  private saved_data: Map<string, any>
  constructor(data_path: string) {
    if (!fs.existsSync(data_path)) {
      console.log('Cannot find data file by way "' + data_path + '"! Trying to create...')

      try {
        fs.writeFileSync(data_path, '{}')
      } catch (err) {
        console.log(err)
      }
    }

    this.data_path = data_path
    this.saved_data = new Map()
  }

  /**
     * Check if data can be parsed through "JSON.parse"
     * @param data Data to check.
     * @returns
     */
  private isParseable(data: string) {
    try {
      JSON.parse(data)
    } catch {
      return false
    }
    return true
  }

  /**
     * Get data file prepared. You've to run this function first before using anothers.
     * @returns Nothing
     */
  public async init() {
    return await new Promise(async (resolve, reject) => {
      if (!this.data_path || !fs.existsSync(this.data_path)) { reject(new Error('Cannot find data file.')); return }

      let file_content: string = (await fs.promises.readFile(this.data_path)).toString()
      if (!this.isParseable(file_content)) {
        file_content = '[]'
        await fs.writeFileSync(this.data_path, '[]')
      }

      try {
        this.saved_data = new Map(JSON.parse(file_content || '[]'))
      } catch {
        await fs.promises.writeFile(this.data_path || '', '[]')
        this.saved_data = new Map()
      }

      console.log('Data Manager initialized!')
      resolve(this.saved_data)
    })
  }

  /**
     * Overwrites key
     * @param key Key name
     * @param data Key value
     * @returns Promise returns current data as "Map" class.
     */
  public async writeKey(key: string, data: any) {
    return await new Promise(async (resolve, reject) => {
      if (this.data_path === undefined) { reject(new Error('Use .init() first.')); return }

      this.saved_data.set(key, data)

      try {
        await fs.promises.writeFile(this.data_path, JSON.stringify(
          Array.from(this.saved_data.entries())
          , null, 1))
      } catch (err) {
        reject(err); return
      }

      resolve(this.saved_data)
    })
  }

  /**
     * Gets key.
     * @param key Key name
     * @returns Key value
     */
  public getKey(key: string): any {
    return this.saved_data.get(key)
  }
}

export default DataManager
