import { randomBytes } from 'crypto'

console.log('Generated JWT Secret:')
console.log(randomBytes(64).toString('hex'))
