import { SSTConfig } from "sst";
import { Api, KinesisStream, NextjsSite, Table } from "sst/constructs";

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
      // Kinesis Data Steam
      const stream = new KinesisStream(stack, "stream", {
        consumers: {
          consumer1: "libs/ingest/functions/src/consumer1.handler",
          consumer2: "libs/ingest/functions/src/consumer2.handler",
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
          "POST /": "libs/ingest/functions/src/apigateway.handler",
        },
      });
      api.attachPermissions("*");

      // Postgres table
      // new RDS(stack, "Database", {
      //   engine: "postgresql11.13",
      //   defaultDatabaseName: "acme",
      //   migrations: "path/to/migration/scripts",
      // });

      // DynamoDB Table
      const table = new Table(stack, "waitlist", {
        fields: {
          id: "string",
          email: "string",
          createdAt: "number",
        },
        primaryIndex: { partitionKey: "email" },
      });

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
