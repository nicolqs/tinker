import { Cron, StackContext, use } from 'sst/constructs'
import { Database } from './Database'

export function Crons({ stack, app }: StackContext) {
  const { sentimentsTable } = use(Database)

  // Cron job to run News & Sentiment Analysis
  const cronSentiment = new Cron(stack, 'cronSentiment', {
    schedule: 'rate(5 minutes)',
    job: {
      function: {
        handler: 'packages/functions/sentiment.handler',
        runtime: 'python3.11'
      }
    },
    enabled: !app.local
  })
  cronSentiment.attachPermissions([sentimentsTable])

  // Cron job to fetch real-time data from various cryptocurrency exchanges
  const cronDataFetcher = new Cron(stack, 'cronDataFetcher', {
    schedule: 'rate(1 minute)',
    job: {
      function: {
        handler: 'packages/functions/data_fetcher.handler',
        runtime: 'python3.11',
        environment: {
          ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY || ''
        }
      }
    }
    // enabled: !app.local,
  })
  // cronDataFetcher.attachPermissions([table]);
  return {
    cronSentiment
  }
}
