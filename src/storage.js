import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
const region = process.env.AWS_REGION || 'us-east-1'
const bucket = process.env.S3_BUCKET
const prefix = process.env.S3_PREFIX || 'events/'
const s3 = new S3Client({ region })

export async function putToS3(event) {
  if (!bucket) return
  const key = `${prefix}${new Date(event.ts || Date.now()).toISOString().slice(0,10)}/${event.id}.json`
  await s3.send(new PutObjectCommand({
    Bucket: bucket, Key: key, Body: Buffer.from(JSON.stringify(event)+'\n'), ContentType: 'application/json'
  }))
  return { bucket, key }
}
