'use client'
import { Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { purple } from '@mui/material/colors'
import { createTheme } from '@mui/material/styles';


export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello I am EduSage! I am your personal tutor with knowledge of any subject. What would you like to learn?`,
    }
  ]);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);  // State to handle loading spinner

  const theme = createTheme({
    palette: {
      primary: purple,
      secondary: "",
    },
  });
 
  const sendMessage = async () => {
    setMessage('');  // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },  // Add the user's message to the chat
      { role: 'assistant', content: '' },  // Add a placeholder for the assistant's response
    ]);

    // Send the message to the server
    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();  // Get a reader to read the response body
      const decoder = new TextDecoder();  // Create a decoder to decode the response text

      let result = '';
      // Function to process the text from the response
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true });  // Decode the text
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];  // Get the last message (assistant's placeholder)
          let otherMessages = messages.slice(0, messages.length - 1);  // Get all other messages
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },  // Append the decoded text to the assistant's message
          ];
        });
        return reader.read().then(processText);  // Continue reading the next chunk of the response
      });
    });
  };

  return (
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center"
      bgcolor="#c8bea0"
    >
      {/* Header */}
      <Box 
        width="50%" 
        bgcolor="#28511c" 
        color="white" 
        p={2}
        boxShadow={3}
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderRadius={4}
      >
        <Typography variant="h4">EduSage: The AI Tutor</Typography>
      </Box>

      {/* Chat Container */}
      <Stack 
        direction="column" 
        width="100%" 
        maxWidth="900px" 
        height="80%" 
        borderRadius={4} 
        boxShadow={3} 
        bgcolor="#f5ece5" 
        p={3} 
        spacing={3}
        mt={2}  // Add margin-top to separate the chat container from the header
      >
        <Stack 
          direction="column" 
          spacing={2} 
          flexGrow={1} 
          overflow="auto" 
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box 
              key={index} 
              display="flex" 
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box 
                bgcolor={message.role === 'assistant' ? '#28511c' : '#826e5e'} 
                color={message.role === 'assistant' ? 'white' : 'white'}    
                borderRadius={10} 
                p={2} 
                boxShadow={1}
                maxWidth="80%"
              >
                <Typography variant="body1">{message.content}</Typography>
              </Box>
            </Box>
          ))}
          {loading && (
            <Box display="flex" justifyContent="flex-start">
              <CircularProgress size={24} />
            </Box>
          )}
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField 
            label="Type a message..." 
            variant="outlined" 
            fullWidth 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}  // Send message on Enter key press
          />
          <Button 
            variant="contained" 
            color="primary"
            onClick={sendMessage}
            disabled={loading}  // Disable button while loading
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
