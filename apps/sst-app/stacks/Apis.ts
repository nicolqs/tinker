import { Api, StackContext, use } from 'sst/constructs'
import { Streams } from './Streams'

export function Apis({ stack }: StackContext) {
  const { stream } = use(Streams)

  // Create a HTTP API (API Gateway)
  const api = new Api(stack, 'api', {
    defaults: {
      function: {
        bind: [stream]
      }
    },
    routes: {
      'POST /': 'packages/functions/apigateway.handler'
    }
  })

  api.attachPermissions([stream, 'ssm:*'])

  stack.addOutputs({
    ApiEndpoint: api.url
  })

  return {
    api
  }
}
