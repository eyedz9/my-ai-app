'use client'

import { ChatRequest, FunctionCall, FunctionCallHandler, nanoid } from "ai";
import { useChat } from "ai/react";

export default function Home() {

  const functionCallHandler: FunctionCallHandler = async (
    chatMessages,
    functionCall,
  ) => {
    if (functionCall.name === 'get_current_weather') {
      if (functionCall.arguments) {
        const parsedFunctionCallArguments = JSON.parse(functionCall.arguments);
        console.log(parsedFunctionCallArguments);
      }

      // generating fake temperature
      const temperature = Math.floor(Math.random() * (100 - 30 + 1) + 30);
      // generating random weather condition
      const weather = ['sunny', 'cloudy', 'rainy', 'snowy'][
        Math.floor(Math.random() * 4)
      ];

      const functionResponse: ChatRequest = {
        messages: [
          ...chatMessages,
          {
            id: nanoid(),
            name: 'get_current_weather',
            role: 'function' as const,
            content: JSON.stringify({
              temperature,
              weather,
              info: 'This data is randomly generated and come from a fake weather API'
            })
          }
        ]
      }

      return functionResponse;
    }
  };

  const { messages, input, handleInputChange, handleSubmit } = useChat(/* {
    experimental_onFunctionCall: functionCallHandler,
  } */);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {messages.map(message => (
          <div key={message.id} className="whitespace-pre-wrap">
            {message.role.toLocaleUpperCase()}
            {': '}
            {message.content}
            {
              message.role === 'function' && message.function_call && (
                <div>
                  <p>Function name: {(message.function_call as FunctionCall).name}</p>
                  <p>Function arguments: {(message.function_call as FunctionCall).arguments}</p>
                </div>
              )
            }
          </div>
        ))}

        <form onSubmit={handleSubmit}>
          <input
            className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
            value={input}
            placeholder="Enter..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </main>
  );
}
