import { APIGatewayProxyEvent } from "aws-lambda";
import { KinesisClient, PutRecordCommand } from "@aws-sdk/client-kinesis";
import { KinesisStream } from "sst/node/kinesis-stream";
import { getSSMParameterValue } from "../core/ssm";

const kinesisClient = new KinesisClient({
  region: "us-east-1",
});

const API_KEY: string = "DATA_SOURCE_API_KEY";

export async function handler(event: APIGatewayProxyEvent) {
  const expectedApiKey: string = await getSSMParameterValue(API_KEY);

  try {
    const apiKey = event.headers?.["x-api-key"];
    if (!apiKey || apiKey !== expectedApiKey) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unauthorized: API key" }),
      };
    }
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "No body in the request" }),
      };
    }

    // Extract data from the API Gateway event
    const decodedBody = Buffer.from(event.body, "base64").toString("utf-8");
    const dataToWrite = JSON.parse(decodedBody);

    // Configure the Kinesis stream and partition key
    const kinesisParams = {
      StreamName: KinesisStream.stream.streamName,
      PartitionKey: "key",
      Data: dataToWrite.data,
    };

    // Write data to Kinesis stream
    const command = new PutRecordCommand(kinesisParams);
    const response = await kinesisClient.send(command);

    console.log(
      "Message processed from API Gateway and queued in Kinesis Stream!"
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Data successfully written to Kinesis stream",
      }),
    };
  } catch (error) {
    console.error("Error writing to Kinesis stream:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error writing to Kinesis stream" }),
    };
  }
}
