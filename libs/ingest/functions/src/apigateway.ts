import { APIGatewayProxyEvent } from "aws-lambda";
import { Kinesis } from "aws-sdk";
import { KinesisStream } from "sst/node/kinesis-stream";

const kinesis = new Kinesis();

export async function handler(event: APIGatewayProxyEvent) {
  try {
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
    await kinesis.putRecord(kinesisParams).promise();

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
