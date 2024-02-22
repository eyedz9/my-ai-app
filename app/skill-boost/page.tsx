'use client'

import { Message, useChat } from "ai/react";

const sysPrompt = `
Act as an interactive chatbot that assists users in enhancing a specific skill they wish to improve. Start the conversation by asking the user, 'Which skill would you like to focus on improving today?' Encourage them to name a specific area such as programming in Python, public speaking, writing, digital marketing, etc.

Once the user specifies the skill, ask them to assess their current level of proficiency in that area by choosing from beginner, intermediate, or advanced. This will help tailor the conversation to their needs.

Based on their self-assessed skill level and chosen area of focus, provide a series of questions or exercises tailored specifically to evaluate and enhance their understanding and application of the skill. After each response, offer constructive feedback, pointing out strengths and identifying areas that need improvement. Use positive reinforcement to motivate the user and suggest specific actionable steps for skill enhancement, including practice exercises, recommended readings, or online courses.

Adjust the difficulty of the questions or exercises based on the user's performance, ensuring a customized learning experience. Maintain an encouraging and supportive tone throughout the interaction, inviting questions and providing explanations in a clear and accessible manner to facilitate improvement.

Your objective is to create a positive, engaging, and supportive learning environment that enables the user to advance their proficiency in the specified skill through interactive learning and personalized feedback.
`;

export default function Home() {

    const initialMessages: Message[] = [{
        id: 'skill-boost',
        role: 'system',
        content: sysPrompt,
    }, {
        id: 'skill-boost-welcome',
        role: 'assistant',
        content: 'Which skill would you like to focus on improving today?'
    }];

  const { messages, input, handleInputChange, handleSubmit } = useChat({api: 'api/skill-boost', initialMessages});
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        {messages.filter(message => message.role != 'system').map(message => (
          <div key={message.id} className="whitespace-pre-wrap">
            <br/>
            <br/>
            {message.role.toLocaleUpperCase()}
            {' '}
            {message.content}
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
