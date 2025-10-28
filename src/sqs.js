import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs'
import { putToS3 } from './storage.js'
import { putToFirehose } from './streaming.js'

const region = process.env.AWS_REGION || 'us-east-1'
const queueUrl = process.env.SQS_QUEUE_URL
const sqs = new SQSClient({ region })

export async function enqueueChatMessage(message) {
  if (!queueUrl) return
  await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify(message) }))
}

export async function pollAndProcessOnce({ max = 10 } = {}) {
  if (!queueUrl) return { polled: 0 }
  const out = await sqs.send(new ReceiveMessageCommand({
    QueueUrl: queueUrl, MaxNumberOfMessages: Math.min(max, 10), WaitTimeSeconds: 5, VisibilityTimeout: 30
  }))
  const msgs = out.Messages || []
  for (const m of msgs) {
    try {
      const payload = JSON.parse(m.Body)
      await putToS3(payload)
      await putToFirehose(payload)
      await sqs.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: m.ReceiptHandle }))
    } catch (e) { console.error(e) }
  }
  return { polled: msgs.length }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => { while (true) await pollAndProcessOnce({ max: 10 }) })()
}
