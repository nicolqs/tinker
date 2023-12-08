import { StackContext, NextjsSite, use } from 'sst/constructs'
import { Database } from './Database'

export function Web({ stack }: StackContext) {
  const { sentimentsTable } = use(Database)

  // Next JS Site
  const site = new NextjsSite(stack, 'site', {
    bind: [sentimentsTable]
  })

  site.attachPermissions([sentimentsTable])

  stack.addOutputs({
    SiteUrl: site.url
  })
}
