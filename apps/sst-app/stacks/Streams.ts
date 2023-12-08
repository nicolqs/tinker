import { StackContext, KinesisStream } from 'sst/constructs'

export function Streams({ stack }: StackContext) {
  // Kinesis Data Steam
  const stream = new KinesisStream(stack, 'stream', {
    consumers: {
      consumer1: 'packages/functions/consumer1.handler'
    }
  })
  return {
    stream
  }
}
