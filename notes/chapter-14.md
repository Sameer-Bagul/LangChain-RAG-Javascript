# Chapter 14: State-of-the-Art - Hybrid Search and Streaming

The final step reaches production-grade standards by combining multiple search strategies and improving the user experience with streaming.

## Objects and Classes

- **BM25Retriever**: A traditional "keyword-based" retriever (like Google Search). It is excellent at finding specific words or product IDs.
- **EnsembleRetriever**: A specialized class that orchestrates multiple retrievers and combines their results into a single list.
- **`weights`**: Defines how much to trust each retriever (e.g., 50% Vector search, 50% Keyword search).
- **`.stream()`**: A method used instead of `.invoke()` to receive the answer piece-by-piece as it is generated.

## Architectural Background

The architecture is now a "Hybrid Retrieval & Streaming" system.
1. **Hybrid Search**: Semantic search is great for meaning, but bad at specific names. Keyword search is great at names but bad at meaning. By using an **Ensemble**, we get the best of both worlds. This is how professional RAG systems (like Bing Chat) work.
2. **Streaming UX**: Instead of the user waiting 10 seconds for a full paragraph, they see the first word in 500ms. This makes the application feel significantly faster and more interactive.

## Code Implementation

```javascript
import { BM25Retriever } from "@langchain/community/retrievers/bm25";
import { EnsembleRetriever } from "langchain/retrievers/ensemble";

class AdvancedPdfQA {

  async init() {
    // 1. Vector Retriever (Semantic)
    const vectorRetriever = vectorStore.asRetriever({ k: 4 });

    // 2. BM25 Retriever (Keyword)
    const bm25Retriever = await BM25Retriever.fromDocuments(this.docs, { k: 4 });

    // 3. The Ensemble (Mixing both)
    this.retriever = new EnsembleRetriever({
      retrievers: [vectorRetriever, bm25Retriever],
      weights: [0.5, 0.5],
    });
  }

  async streamAsk(question) {
    const stream = await this.chain.stream({ input: question });
    process.stdout.write("🤖 Response: ");
    for await (const chunk of stream) {
      if (chunk.answer) {
        process.stdout.write(chunk.answer);
      }
    }
  }
}
```
