import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { PineconeStore, PineconeEmbeddings } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';

export const searchKnowledgeBase = tool(
  async ({ query }) => {
    console.info('[knowledge-base] Search started', { queryLength: query.length });
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pinecone.Index(process.env.PINECONE_INDEX);
    const embeddings = new PineconeEmbeddings({ model: 'llama-text-embed-v2' });
    const store = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
    });
    const documents = await store.similaritySearch(query, 4);
    const content = documents
      .map((document) => document.pageContent)
      .join('\n\n');

    console.info('[knowledge-base] Search completed', {
      documentCount: documents.length,
      resultLength: content.length,
    });
    return content || 'No relevant documents were found in the knowledge base.';
  },
  {
    name: 'search_knowledge_base',
    description: 'Search the legal document knowledge base for relevant information.',
    schema: z.object({
      query: z.string().min(1),
    }),
  },
);