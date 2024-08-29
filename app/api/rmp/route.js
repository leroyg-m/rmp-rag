import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Parse the incoming request body as JSON
    const { query } = await req.json(); // Destructure the 'query' from the request body
    console.log("Received data:", query);

    // Send the received query directly to the external API
    const response = await fetch(
      "https://rmprag-abdulsz-abduls-projects-03968352.vercel.app/scrape/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }), // Send the query in the correct format
      }
    );

    // Check if the response is OK (status code 200-299)
    if (!response.ok) {
      console.error("Failed to scrape:", response.statusText);
      return new Response(
        JSON.stringify({
          message: "Scrape failed.",
          error: response.statusText,
        }),
        { status: response.status }
      );
    }

    // Optionally handle the response data from the scrape API
    const result = await response.json();
    console.log("Scrape result:", result);

    // Return a success response to the client
    return new Response(
      JSON.stringify({ message: "Scrape successful.", data: result }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ message: "An error occurred.", error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
