import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({
  region: "us-east-1",
});

// Define a function to retrieve the parameter value
export async function getSSMParameterValue(
  parameterName: string
): Promise<string> {
  try {
    // Retrieve the parameter value
    const params = {
      Name: parameterName,
      WithDecryption: true,
    };
    const command = new GetParameterCommand(params);
    const response = await ssmClient.send(command);

    return response.Parameter?.Value || "";
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error retrieving parameter:", error.message);
    }
  }
  return "";
}
