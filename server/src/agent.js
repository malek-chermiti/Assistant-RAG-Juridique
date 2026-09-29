import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain';
import { MemorySaver } from '@langchain/langgraph-checkpoint';
import { searchKnowledgeBase } from './tools.js';

const checkpointer = new MemorySaver();

export async function runAgent({ sessionId = 'default', message, requestId }) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
    const model = new ChatOpenAI({
      model: modelName,
      apiKey,
      configuration: { baseURL: 'https://api.groq.com/openai/v1' },
      temperature: 0.7,
    });

    const agent = createAgent({
      model,
      tools: [searchKnowledgeBase],
      checkpointer,
      systemPrompt:
        'You are a helpful AI assistant with access to a legal document knowledge base. For each user question, call search_knowledge_base at most once. After receiving its result, answer the user without calling any tools again. If no relevant passages are found, say so clearly instead of searching repeatedly. Be concise and accurate.',
    });

    console.info(`[${requestId}] Agent invocation started`, { model: modelName });

    const response = await agent.invoke(
      { messages: [{ role: 'user', content: message }] },
      { configurable: { thread_id: sessionId }, recursionLimit: 8 },
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