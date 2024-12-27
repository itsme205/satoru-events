export default interface CommandInterface {
  name: string
  isValid: boolean
  execute: Function
}
