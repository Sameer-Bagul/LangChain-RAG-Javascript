# Chapter 9: Modern Retrieval Chains

The `RetrievalQAChain` (Chapter 8) is being phased out in favor of a more flexible, pipe-able architecture using the LCEL (LangChain Expression Language) style.

## Objects and Classes

- **ChatPromptTemplate**: Allows us to define a structured template for the LLM. It must include placeholders like `{context}` and `{input}`.
- **`createStuffDocumentsChain`**: A function that creates a chain to "stuff" (concatenate) retrieved documents into the specific `{context}` placeholder of the prompt.
- **`createRetrievalChain`**: A higher-level function that combines a retriever with the document-stuffing chain.

## Architectural Background

The philosophy has shifted towards "Modular Composition." 
1. **Separation of Concerns**: instead of one giant object, we have a retriever, a prompt, and a "combine documents" logic. 
2. **The Logic Loop**:
    - The `retriever` fetches documents.
    - The `combineDocsChain` joins those documents into a single block of text.
    - The `prompt` injects that text into a template alongside the user's question.
    - The final output is an object containing the answer *and* the original context documents, making it easier to verify where the answer came from.

## Code Implementation

```javascript
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";

class PdfQA {

  async createChain(){
    console.log("Creating Modern Retrieval Chain...");

    // 1. Defining the system instructions and placeholders
    const prompt = ChatPromptTemplate.fromTemplate(
      "Answer the user's question: {input} based on the following context {context}"
    );

    // 2. Creating the logic to handle retrieved documents
    const combineDocsChain = await createStuffDocumentsChain({
      llm: this.llm,
      prompt,
    });

    // 3. Linking the retriever with the document processing logic
    const chain = await createRetrievalChain({
      combineDocsChain,
      retriever: this.retriever,
    });

    return chain;
  }

}

// Result: Invoke now uses 'input' as keys instead of 'query'
const answer = await pdfQaChain.invoke({ input: "How to add a file type?" });
console.log(answer.answer); // The answer is now in the 'answer' property
```
