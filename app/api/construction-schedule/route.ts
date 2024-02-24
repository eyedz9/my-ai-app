import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ChatCompletionCreateParams } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const runtime = "edge";

const functions: ChatCompletionCreateParams.Function[] = [
  {
    name: "get_construction_schedule",
    description: "Get the construction schedule for a project based on project number",
    parameters: {
      type: "object",
      properties: {
        projectNumber: {
          type: "number",
          description:
            "This is the project number for any project and this will be only natural number.",
        },
      },
      required: ["projectNumber"],
    },
  },
];

async function fetchSchedules(projectNumber: number): Promise<any[]> {
  const authToken = process.env.PRITHU_ADMIN_AUTH_TOKEN || ""; // Replace 'YOUR_API_KEY_HERE' with your actual API key
  const url = `https://api.openweathermap.org/data/2.5/weather?q=Delhi`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data?.main?.temp;
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
  }
  return [];
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    stream: true,
    messages,
    functions,
  });
  console.log({ response });

  const stream = OpenAIStream(
    response, {
        experimental_onFunctionCall: async (
            { name, arguments: args },
            createFunctionCallMessages,
        ) => {
            if (name === 'get_construction_schedule') {

                const data = await fetchSchedules(Number(args.projectNumber));
                // calling a weather api here
                const weatherData = {
                    temperature: data ?? 'n/a',
                    unit: args.format === 'celsius' ? 'C' : 'F',
                };
                // constructing the relevant 'assistant' and 'function' messages
                const newMessages = createFunctionCallMessages(weatherData);
                console.log({newMessages});
                console.log({messages});

                return openai.chat.completions.create({
                    messages: [...messages, ...newMessages],
                    stream: true,
                    model: 'gpt-3.5-turbo-0613',
                    // calling recursive function call
                    functions,
                });
            }
        },
    }
  );
  return new StreamingTextResponse(stream);
}
