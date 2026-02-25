# Chapter 7: The Vector Store Retriever

A "Retriever" is a specialized object that knows how to find documents given a string query. It is a level of abstraction over the raw database.

## Objects and Classes

- **Retriever Object**: We create this by calling `this.db.asRetriever()`.
- **`kDocuments`**: A parameter that tells the retriever how many pieces of information to bring back (e.g., "give me the top 5 most similar chunks").
- **`searchType`**: Defines the algorithm used for retrieval. The most common is `similarity`.

## Architectural Background

The Retriever is a bridge in the RAG architecture.
1. **Abstraction**: Instead of manually handling vectors and similarity scores, we have a simple interface that accepts a question and returns documents.
2. **Role in RAG**: The "R" in RAG stands for Retrieval. This object is the heart of that phase. It ensures that when a user asks a question, the application pulls exactly the right parts of the PDF to show to the LLM.

## Code Implementation

```javascript
class PdfQA {

  constructor({ ..., searchType = "similarity", kDocuments }) {
    this.searchType   = searchType;
    this.kDocuments   = kDocuments;
  }

  async init(){
    // ... loadings and vectors store creation
    this.createRetriever();
    return this;
  }

  createRetriever(){
    console.log("Initialize vector store retriever...");
    // Converting the database into a retriever object
    this.retriever = this.db.asRetriever({ 
      k: this.kDocuments,
      searchType: this.searchType 
    });
  }

}

// Usage: The retriever is now ready to be plugged into a Chain
```
