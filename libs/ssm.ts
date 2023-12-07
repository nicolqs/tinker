import { SSM } from "aws-sdk";

const ssm = new SSM({ region: "us-east-1" });

// Define a function to retrieve the parameter value
export async function getSSMParameterValue(
  parameterName: string
): Promise<string> {
  try {
    // Retrieve the parameter value
    const response = await ssm
      .getParameter({ Name: parameterName, WithDecryption: true })
      .promise();
    return response.Parameter?.Value || "";
  } catch (error) {
    console.error("Error retrieving parameter:", error.message);
  }
  return "";
}
