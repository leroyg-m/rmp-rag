"use client";
import Image from "next/image";
import { useState } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";


export default function Home() {

  const [link, setLink] = useState('')
  const [linkBarOpen, setLinkBarOpen] = useState(false)

  const handleUpload = async () => {
    if(!link){
      return "Add a link to continue"
    }
    const url = link;
    const scrapeRes = fetch("/api/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(link),
    });

    setLink('')

    setLinkBarOpen(false)


  }

    const handleOpen = () => setLinkBarOpen(true);
    const handleClose = () => setLinkBarOpen(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Rate My Professor support assistant. How can i help you today?"
    }
  ]);

  const [message, setMessage] = useState('');
  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    setMessage("");

    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = "";
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  return (
    <Box
      sx={{
        backgroundImage: `url('https://unbounce.com/photos/Gradient-Background.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        bgcolor="#3D314A"
        p={2}
        spacing={3}
        borderRadius={7}
        boxShadow={3}
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="1005%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={message.role === "assistant" ? "#1A1423" : "#684756"}
                color="#bdbdbd"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#684756",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "#96705B",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#bdbdbd",
              },
              "& .MuiInputBase-input": {
                color: "#bdbdbd",
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#bdbdbd",
              },
            }}
            label="message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <Button
            sx={{
              backgroundColor: "#96705B",
              color: "#bdbdbd",
              "&:hover": {
                backgroundColor: "#684756",
              },
              padding: "10px 20px",
              borderRadius: "20px",
              fontWeight: "bold",
            }}
            variant="contained"
            onClick={sendMessage}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
