import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

const systemPrompt = `
You are a "Rate My Professor" assistant. Your role is to assist students in finding the best professors according to what they ask



Ask them what they need help with if not specified

Be friendly, patient, and understanding of student concerns

When interacting with users:

Greet them politely and ask how you can help
Clarify their question or issue if needed
Provide clear, concise answers
    
`

export async function POST(req) {
  const data = await req.json();
  const pc = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pc.index("rmp").namespace("ns1");
  const openai = new OpenAI();

 

  const text = data[data.length - 1].content;
  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

 
  

  const results = await index.query({
    topK: 3,
    includeMetadata: true,
    vector: embedding.data[0].embedding
  })

  let resultsString = 
  '\n\nReturned results from vector db {done automatically}: '
  results.matches.forEach((match)=>{
    resultsString+=`\n
    Professor: ${match.id}
    Review: ${match.metadata.review}
    Department: ${match.metadata.department}
    Rating: ${match.metadata.rating}
    Stars: ${match.metadata.stars}
    \n\n
    
    `
  })


  const lastMessage = data[data.length-1]
  const lastMessageContent = lastMessage.content + resultsString
  const lastDataWithoutLastMessage = data.slice(0, data.length -1)
  const completion = await openai.chat.completions.create({
    messages:  [
        {role: 'system', content: systemPrompt},
        ...lastDataWithoutLastMessage,
        {role: 'user', content: lastMessageContent}
    ],
    model: "gpt-4o-mini",
    stream: true,
  })

  const stream = new ReadableStream({
    async start(controller){
        const encoder = new TextEncoder ()
        try{
            for await (const chunk of completion){
                const content = chunk.choices[0]?.delta?.content
                if(content){
                    const text = encoder.encode(content)
                    controller.enqueue(text)
                }
            }
        }
        catch(err){
            controller.error(err)
        } finally {
            controller.close()
        }
    },
  })

  return new NextResponse(stream)
}


//just dump the full scrape into pinecone and let the ai use it