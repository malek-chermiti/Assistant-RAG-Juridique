import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PineconeStore, PineconeEmbeddings } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';

export const ingestData = async (filePath) => {
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();
  console.info('[ingest] PDF loaded', { documentCount: docs.length });

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const chunks = await splitter.splitDocuments(docs);
  console.info('[ingest] PDF split into chunks', { chunkCount: chunks.length });

  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = pinecone.Index(process.env.PINECONE_INDEX);
  const embeddings = new PineconeEmbeddings({ model: 'llama-text-embed-v2' });
  const store = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: index,
  });

  const batchSize = 96;
  for (let i = 0; i < chunks.length; i += batchSize) {
    await store.addDocuments(chunks.slice(i, i + batchSize));
  }

  console.info('[ingest] Ingestion complete', { chunkCount: chunks.length });
};
