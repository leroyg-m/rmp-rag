"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Modal,
  Typography,
} from "@mui/material";

export default function Home() {
  const [link, setLink] = useState("");
  const [linkBarOpen, setLinkBarOpen] = useState(false);

  const handleUpload = async () => {
    if (!link) {
      alert("Add a link to continue");
      return;
    }

    try {
        const scrapeRes = await fetch("/api/rmp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: link }), // Wrap the link in an object with the key 'query'
        });

      if (!scrapeRes.ok) {
        alert("Failed to scrape the professor link.");
      } else {
        alert("Professor link added successfully.");
      }

      setLink("");
      setLinkBarOpen(false);
    } catch (error) {
      console.error("Error uploading link:", error);
      alert("An error occurred while uploading the link.");
    }
  };

  const handleOpen = () => setLinkBarOpen(true);
  const handleClose = () => setLinkBarOpen(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Rate My Professor support assistant. How can I help you today?",
    },
  ]);

  const [message, setMessage] = useState("");
  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);
    setMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([...messages, { role: "user", content: message }]),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      reader.read().then(function processText({ done, value }) {
        if (done) return result;
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
    } catch (error) {
      console.error("Error sending message:", error);
    }
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
  onKeyDown={(e) => {
    console.log(" key pressed",e.key);
    if (e.key === "Enter") {
      e.preventDefault(); // Prevents new line if using a multiline TextField
      sendMessage();
    }
  }}
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
        <Typography
          sx={{
            color: "#bdbdbd",
            textAlign: "center",
            marginTop: 2,
            fontWeight: "bold",
          }}
        >
          Add a professor to improve the chatbot's knowledge
        </Typography>
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
          onClick={handleOpen}
        >
          Add Professor
        </Button>
      </Stack>

      {/* Add Professor Modal */}
      <Modal open={linkBarOpen} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={600}
          bgcolor="white"
          borderRadius={6}
          border="2px solid #0000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <Stack width="100%" direction="row" spacing={2}>
            <Typography>
              Add a link from Rate My Professor
            </Typography>
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
              variant="outlined"
              fullWidth
              value={link}
              onChange={(e) => setLink(e.target.value)}
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
              onClick={handleUpload}
            >
              Finish
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Button to Open Modal */}
    </Box>
  );
}
