# Chapter 8: Retrieval QA Chain (Legacy)

This step introduces "Chains"—the core of LangChain's philosophy. A chain "links" different components together in a sequence.

## Objects and Classes

- **RetrievalQAChain**: A pre-built class that combines an LLM and a Retriever into a single object.
- **`fromLLM`**: A static method that automatically creates the logic for: "Take query -> Search Retriever -> Send results to LLM -> Get final answer."

## Architectural Background

This is the "Orchestration" layer. 
1. **The Flow**: Before this, we had separate objects for loading, splitting, and searching. The Chain brings them together into a unified workflow.
2. **Legacy Note**: `RetrievalQAChain` is easy to use but lacks flexibility. It is considered "Legacy" because newer versions of LangChain prefer more modular and customizable chains.

## Code Implementation

```javascript
import { RetrievalQAChain } from "langchain/chains";

class PdfQA {

  async init(){
    // ... all previous steps
    this.chain = await this.createChain();
    return this;
  }

  async createChain(){
    console.log("Creating Retrieval QA Chain...");
    // Linking the LLM and the Retriever
    const chain = RetrievalQAChain.fromLLM(this.llm, this.retriever);
    return chain;
  }

}

// Execution: One simple call to get a RAG-powered answer
const pdfQaChain = pdfQa.chain;
const answer = await pdfQaChain.invoke({ query: "How to add a file type?" });
console.log(answer.text);
```
