import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { BM25Retriever } from "@langchain/community/retrievers/bm25";
import { EnsembleRetriever } from "langchain/retrievers/ensemble";

/**
 * Master RAG Class (Step 15)
 * The peak of the RAG architecture.
 * Features:
 * 1. Query Transformation (Re-writing query for better retrieval)
 * 2. Hybrid Search (Semantic + Keyword)
 * 3. Self-Correction (Hallucination check against context)
 * 4. Streaming Output
 */
class MasterPdfQA {
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
        console.log("Starting Master RAG Initialization...");

        this.llm = new Ollama({ model: this.model, temperature: 0 });
        this.embeddings = new OllamaEmbeddings({ model: this.embeddingModel });

        const loader = new DirectoryLoader(this.path, {
            ".pdf": (p) => new PDFLoader(p),
        });
        const rawDocs = await loader.load();

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
        });
        this.docs = await splitter.splitDocuments(rawDocs);

        // Setup Hybrid Retriever
        const vectorStore = await MemoryVectorStore.fromDocuments(this.docs, this.embeddings);
        const vectorRetriever = vectorStore.asRetriever({ k: this.k });
        const bm25Retriever = await BM25Retriever.fromDocuments(this.docs, { k: this.k });

        this.retriever = new EnsembleRetriever({
            retrievers: [vectorRetriever, bm25Retriever],
            weights: [0.5, 0.5],
        });

        // Setup the Generation Chain
        const prompt = ChatPromptTemplate.fromTemplate(`
            Answer the user's question using the provided context.
            If the answer is not in the context, say "I don't know".
            
            Context: {context}
            Question: {input}
            Answer:
        `);

        const combineDocsChain = await createStuffDocumentsChain({
            llm: this.llm,
            prompt,
        });

        this.ragChain = await createRetrievalChain({
            combineDocsChain,
            retriever: this.retriever,
        });

        console.log("Master RAG Ready!");
        return this;
    }

    /**
     * ADVANCED: Query Transformation
     * Uses the LLM to expand/rewrite the user's query for better retrieval.
     */
    async rewriteQuery(originalQuery) {
        console.log("Transforming query...");
        const rewritePrompt = `Expand the following question into a detailed search query to find relevant research papers. Provide ONLY the expanded query text.
        
        Question: ${originalQuery}`;

        const expandedQuery = await this.llm.invoke(rewritePrompt);
        console.log(`Original: ${originalQuery}`);
        console.log(`Expanded: ${expandedQuery.trim()}`);
        return expandedQuery.trim();
    }

    /**
     * ADVANCED: Self-Correction Loop
     * Checks if the generated answer is grounded in the retrieved context.
     */
    async verifyAnswer(answer, context) {
        console.log("Verifying answer accuracy...");
        const verifyPrompt = `Context: ${context}
        Answer: ${answer}
        
        Is the Answer fully supported by the Context? If there is any hallucination or information not in the context, rewrite only the parts of the answer that are supported. If it's fully supported, repeat the answer.
        
        Grounded Answer:`;

        const verifiedResult = await this.llm.invoke(verifyPrompt);
        return verifiedResult.trim();
    }

    async masterQuery(userQuestion) {
        // 1. Transform the Query
        const searchOrder = await this.rewriteQuery(userQuestion);

        // 2. Run the RAG Chain
        const result = await this.ragChain.invoke({ input: searchOrder });

        // 3. Extract Context string for verification
        const contextText = result.context.map(d => d.pageContent).join("\n");

        // 4. Self-Correction
        const finalAnswer = await this.verifyAnswer(result.answer, contextText);

        console.log("\n--- Final Master Answer ---");
        console.log(finalAnswer);
        console.log("---------------------------\n");
    }
}

// Execution
const master = await new MasterPdfQA({}).init();
await master.masterQuery("What are the limitations of Chain-of-Thought prompting?");
