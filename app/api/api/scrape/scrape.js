
export async function POST(req) {
  const data = await req.str(); // Parse the incoming request body as JSON
  console.log("Received data:", data);

  // Send the received array directly to the external API
  const response = await fetch("http://localhost:8000/scrape/",
     {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: data }), // Send the data directly as the body
  });
}