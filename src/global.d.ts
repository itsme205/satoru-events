import HandlerClient from '@classes/default/HandlerClient'
import type DataManagerClass from './modules/data_manager/Manager'

interface CommandInterface {
  name: string
  isValid: boolean
  execute: Function
}

declare global{
  var client: HandlerClient
  var DataManager: DataManagerClass // Module "./modules/data_manager/Manager"
  var voiceTime: Map<string, number> // Module "./modules/intervals/init.ts"
  var interfaces: {
    Command: CommandInterface
  }
}
