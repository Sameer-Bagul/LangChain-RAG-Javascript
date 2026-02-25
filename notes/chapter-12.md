# Chapter 12: Optimization - MMR and Nomic Embeddings

In this step, we upgrade our embedding model and our retrieval strategy to improve the accuracy and diversity of results.

## Objects and Classes

- **`nomic-embed-text`**: We switch from `all-minilm` to a more modern and powerful embedding model from Nomic. It has a larger context window and better mathematical representation of text.
- **MMR (Maximal Marginal Relevance)**: This is a retrieval strategy that balances two themes:
    1. **Relevance**: How similar a chunk is to the question.
    2. **Diversity**: How different a chunk is from already selected chunks.
- **`fetchK`**: The number of initial documents to fetch (usually a large number like 20 or 200).
- **`lambda`**: A number between 0 and 1. Low values prioritize diversity (dissimilar chunks), while high values prioritize pure similarity.

## Architectural Background

The architecture moves towards "Results Refining."
1. **Model Upgrade**: By using a better embedding model, our vector space becomes more precise.
2. **Redundancy Reduction**: Standard similarity search often brings back 5 chunks that say almost the exact same thing. MMR helps the LLM by providing 5 *different* perspectives or pieces of information, which leads to a more comprehensive answer.

## Code Implementation

```javascript
class PdfQA {

  async init(){
    // Switching models
    this.selectEmbedding = new OllamaEmbeddings({ model: "nomic-embed-text:latest" });
    // ...
  }

  createRetriever(){
    console.log("Initialize MMR retriever...");
    // searchType: "mmr"
    // fetchK: 200 (initial broad search)
    // k: 3 (final chunks passed to LLM)
    this.retriever = this.db.asRetriever({ 
      k: this.kDocuments,
      searchType: "mmr",
      searchKwargs: { fetchK: 200, lambda: 1 } 
    });
  }

}
```
