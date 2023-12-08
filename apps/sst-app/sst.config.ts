import { SSTConfig } from 'sst'
import { Api, Cron, KinesisStream, NextjsSite, Table } from 'sst/constructs'

import { Database } from './stacks/Database'
import { Crons } from './stacks/Crons'
import { Apis } from './stacks/Apis'
import { Web } from './stacks/Web'
import { Streams } from './stacks/Streams'

export default {
  config(_input) {
    return {
      name: 'tinker',
      region: 'us-east-1',
      profile: 'VINCENT'
    }
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      if (app.stage !== 'prod') {
        app.setDefaultRemovalPolicy('destroy')
      }

      app.stack(Streams).stack(Database).stack(Crons).stack(Apis).stack(Web)
    })
  }
} satisfies SSTConfig
