import 'dotenv/config'
import { pollAndProcessOnce } from './sqs.js'
console.log('Worker started')
;(async () => { while (true) await pollAndProcessOnce({ max: 10 }) })()
