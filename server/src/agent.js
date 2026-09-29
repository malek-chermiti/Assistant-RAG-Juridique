import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain';
import { MemorySaver } from '@langchain/langgraph-checkpoint';
import { searchKnowledgeBase } from './tools.js';

const checkpointer = new MemorySaver();

export async function runAgent({ sessionId = 'default', message, requestId }) {
  try {
    const modelName = process.env.OPENAI_MODEL || 'gpt-4o';
    const model = new ChatOpenAI({
      model: modelName,
      temperature: 0,
    });

    const agent = createAgent({
      model,
      tools: [searchKnowledgeBase],
      checkpointer,
      systemPrompt:
        'You are a helpful AI assistant with access to a knowledge base. When users ask questions, search the knowledge base using the available tools to find relevant information. Be concise and accurate.',
    });

    console.info(`[${requestId}] Agent invocation started`, { model: modelName });

    const response = await agent.invoke(
      { messages: [{ role: 'user', content: message }] },
      { configurable: { thread_id: sessionId } },
    );

    const lastMessage = response.messages[response.messages.length - 1];
    const output = typeof lastMessage?.content === 'string'
      ? lastMessage.content
      : JSON.stringify(lastMessage?.content || '');

    console.info(`[${requestId}] Agent invocation completed`);
    return { output };
  } catch (error) {
    console.error(`[${requestId}] Agent invocation failed`, error);
    throw error;
  }
}