import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ChatCompletionCreateParams } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const runtime = "edge";

const functions: ChatCompletionCreateParams.Function[] = [
  {
    name: "get_current_weather",
    description: "Get the current weather",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description:
            "The city and state, e.g. New Delhi, Mumbai, and convert all name in standard and full name, for e.g if type NYC or nyc convert to New York and Delhi or delhi to New Delhi",
        },
        format: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description:
            "The temperature unit to use. Infer this from the user location.",
        },
      },
      required: ["location", "format"],
    },
  },
];

async function fetchWeather(city: string, format: string): Promise<number|undefined> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY || ""; // Replace 'YOUR_API_KEY_HERE' with your actual API key
  const units = format === 'celsius' ? 'metric' : 'imperial';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(
      `Weather in ${city}: ${data.weather[0].description}. Temperature: ${data.main.temp}°C.`
    );
    return data?.main?.temp;
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
  }
  return undefined;
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
            if (name === 'get_current_weather') {

                const data = await fetchWeather(String(args.location), String(args.format));
                // calling a weather api here
                const weatherData = {
                    temperature: data ?? 'n/a',
                    unit: args.format === 'celsius' ? 'C' : 'F',
                };

                // if (args.location === 'New Delhi') {
                //     weatherData.temperature = 22;
                // }
                // if (args.location === 'New York') {
                //     weatherData.temperature = 18;
                // }
                // if (args.location === 'Mumbai') {
                //     weatherData.temperature = 16;
                // }

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
