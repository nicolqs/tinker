import { StackContext, Table } from 'sst/constructs'

export function Database({ stack }: StackContext) {
  // DynamoDB Table
  const sentimentsTable = new Table(stack, 'sentiments', {
    fields: {
      id: 'string',
      source: 'string',
      mainWords: 'string',
      sentiment: 'string',
      createdAt: 'number'
    },
    primaryIndex: { partitionKey: 'source' }
  })
  // Postgres table
  // new RDS(stack, "Database", {
  //   engine: "postgresql11.13",
  //   defaultDatabaseName: "acme",
  //   migrations: "path/to/migration/scripts",
  // });
  return {
    sentimentsTable
  }
}
