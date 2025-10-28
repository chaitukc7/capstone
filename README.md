# Chat Capstone Starter (EC2 + SQS + Socket.IO + S3 + Firehose)

Minimal scaffold for your distributed chat application.

## 1) Configure
```
cp .env.example .env
```
Edit `.env` with your AWS resources.

## 2) Run locally
```
npm install
npm run dev
# in another terminal (optional worker)
npm run worker
```

## 3) Data paths
- Fast path: Socket.IO broadcasts
- Reliable path: SQS -> Worker -> S3 (+ optional Firehose)
