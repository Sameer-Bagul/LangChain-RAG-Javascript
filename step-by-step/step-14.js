import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { BM25Retriever } from "@langchain/community/retrievers/bm25"; // Corrected import
import { EnsembleRetriever } from "langchain/retrievers/ensemble";   // Corrected import

/**
 * Enhanced PdfQA Class
 * Features:
 * 1. Hybrid Search (Semantic + Keyword)
 * 2. Streaming Response support
 * 3. Multi-file Directory Loading
 * 4. Advanced recursive chunking
 */
class AdvancedPdfQA {
    constructor({
        model = "llama3.1:latest",
        embeddingModel = "nomic-embed-text:latest",
        path = "../materials/papers/",
        chunkSize = 1000,
        chunkOverlap = 200,
        k = 4
    }) {
        this.model = model;
        this.embeddingModel = embeddingModel;
        this.path = path;
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;
        this.k = k;
    }

    async init() {
        console.log("🚀 Initializing Advanced RAG Application...");

        // 1. Initialize Models
        this.llm = new Ollama({ model: this.model });
        this.embeddings = new OllamaEmbeddings({ model: this.embeddingModel });

        // 2. Load Documents
        const loader = new DirectoryLoader(this.path, {
            ".pdf": (p) => new PDFLoader(p),
        });
        const rawDocs = await loader.load();
        console.log(`📄 Loaded ${rawDocs.length} documents.`);

        // 3. Split Documents
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
        });
        this.docs = await splitter.splitDocuments(rawDocs);
        console.log(`✂️ Split into ${this.docs.length} chunks.`);

        // 4. Setup Hybrid Retrievers
        console.log("🧠 Creating Vector Store (Semantic)...");
        const vectorStore = await MemoryVectorStore.fromDocuments(this.docs, this.embeddings);
        const vectorRetriever = vectorStore.asRetriever({ k: this.k });

        console.log("🔍 Creating BM25 Retriever (Keyword)...");
        const bm25Retriever = await BM25Retriever.fromDocuments(this.docs, { k: this.k });

        // 5. Build Ensemble Retriever
        this.retriever = new EnsembleRetriever({
            retrievers: [vectorRetriever, bm25Retriever],
            weights: [0.5, 0.5], // Equal weight to both
        });

        // 6. Create RAG Chain
        const prompt = ChatPromptTemplate.fromTemplate(`
      You are an expert assistant. Use the following pieces of retrieved context to answer the question. 
      If you don't know the answer, just say that you don't know, don't try to make up an answer.
      
      Context: {context}
      
      Question: {input}
      
      Answer (be concise and professional):
    `);

        const combineDocsChain = await createStuffDocumentsChain({
            llm: this.llm,
            prompt,
        });

        this.chain = await createRetrievalChain({
            combineDocsChain,
            retriever: this.retriever,
        });

        console.log("✨ Initialization complete!\n");
        return this;
    }

    /**
     * Invoke the chain for a single response
     */
    async ask(question) {
        return await this.chain.invoke({ input: question });
    }

    /**
     * Stream the response for better UX
     */
    async streamAsk(question) {
        const stream = await this.chain.stream({ input: question });
        let fullResponse = "";

        process.stdout.write("🤖 Response: ");
        for await (const chunk of stream) {
            if (chunk.answer) {
                process.stdout.write(chunk.answer);
                fullResponse += chunk.answer;
            }
        }
        process.stdout.write("\n\n");
        return fullResponse;
    }
}

// Main Execution
const app = await new AdvancedPdfQA({
    model: "llama3.1:latest",
    path: "../materials/papers/" // Adjust path as needed
}).init();

// Demo: Streaming Query
const query = "What is the core idea of Chain-of-Thought prompting?";
await app.streamAsk(query);

const query2 = "Explain the ReAct framework in one sentence.";
await app.streamAsk(query2);
