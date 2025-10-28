import { FirehoseClient, PutRecordCommand } from '@aws-sdk/client-firehose'
const region = process.env.AWS_REGION || 'us-east-1'
const streamName = process.env.FIREHOSE_STREAM_NAME
let firehose = streamName ? new FirehoseClient({ region }) : null

export async function putToFirehose(event) {
  if (!firehose) return
  await firehose.send(new PutRecordCommand({
    DeliveryStreamName: streamName, Record: { Data: Buffer.from(JSON.stringify(event)+'\n') }
  }))
}
