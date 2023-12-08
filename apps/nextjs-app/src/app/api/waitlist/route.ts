import { NextResponse } from "next/server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Table } from "sst/node/table";

export async function POST(req: Request) {
  const body = await req.json();

  if (!body?.email || body?.email === "") {
    return NextResponse.json("Waitlist subscriber email is missing!", {
      status: 400,
    });
  }

  try {
    const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

    // Find existing subscribed email
    const getCommand = new GetCommand({
      TableName: Table.waitlist.tableName,
      Key: {
        email: body?.email,
      },
    });

    const { Item } = await db.send(getCommand);

    if (Item) {
      return NextResponse.json(`${body.email} is already subscribed`, {
        status: 409,
      });
    }

    // Add new email to waitlist
    const putCommand = new PutCommand({
      TableName: Table.waitlist.tableName,
      Item: {
        id: uuidv4(),
        email: body?.email,
        createdAt: new Date().toLocaleDateString(),
      },
    });

    await db.send(putCommand);

    return NextResponse.json(`${body.email} has been subscribed!`, {
      status: 201,
    });
  } catch (e) {
    console.log("CREATE ERROR:", e);
  }
  return NextResponse.json("unknown err", {
    status: 400,
  });
}
