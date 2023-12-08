import { SSTConfig } from "sst";
import { Api, Cron, KinesisStream, NextjsSite, Table } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "tinker",
      region: "us-east-1",
      profile: "VINCENT",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      if (app.stage !== "prod") {
        app.setDefaultRemovalPolicy("destroy");
      }

      // Kinesis Data Steam
      const stream = new KinesisStream(stack, "stream", {
        consumers: {
          consumer1: "lib/functions/consumer1.handler",
        },
      });

      // Create a HTTP API (API Gateway)
      const api = new Api(stack, "api", {
        defaults: {
          function: {
            bind: [stream],
          },
        },
        routes: {
          "POST /": "lib/functions/apigateway.handler",
        },
      });
      api.attachPermissions([stream, "ssm:*"]);

      // Postgres table
      // new RDS(stack, "Database", {
      //   engine: "postgresql11.13",
      //   defaultDatabaseName: "acme",
      //   migrations: "path/to/migration/scripts",
      // });

      // DynamoDB Table
      const table = new Table(stack, "sentiments", {
        fields: {
          id: "string",
          source: "string",
          mainWords: "string",
          sentiment: "string",
          createdAt: "number",
        },
        primaryIndex: { partitionKey: "source" },
      });

      // Cron job to run News & Sentiment Analysis
      const cronSentiment = new Cron(stack, "cronSentiment", {
        schedule: "rate(5 minutes)",
        job: {
          function: {
            handler: "lib/functions/sentiment.handler",
            runtime: "python3.11",
          },
        },
        enabled: !app.local,
      });
      cronSentiment.attachPermissions([table]);

      // Cron job to fetch real-time data from various cryptocurrency exchanges
      const cronDataFetcher = new Cron(stack, "cronDataFetcher", {
        schedule: "rate(1 minute)",
        job: {
          function: {
            handler: "lib/functions/data_fetcher.handler",
            runtime: "python3.11",
            environment: {
              ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY || "",
            },
          },
        },
        // enabled: !app.local,
      });
      // cronDataFetcher.attachPermissions([table]);

      // Next JS Site
      const site = new NextjsSite(stack, "site", {
        bind: [table],
      });

      site.attachPermissions([table]);

      stack.addOutputs({
        ApiEndpoint: api.url,
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
