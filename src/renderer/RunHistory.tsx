import { Box } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { extractAction } from '../main/store/extractAction';

export function RunHistory() {
  const { runHistory } = useStore();

  const messages = runHistory
    .filter((m) => m.role === 'assistant')
    .map((m) => extractAction(m));
    //console.log('Filtered messages:', messages); // Log filtered messages

  useEffect(() => {
    const element = document.getElementById('run-history');
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]); // Scroll when messages change

  let lastProcessedMessageCount = 0; // Track how many messages have been processed

  useEffect(() => {
    console.log('useEffect triggered. Message count:', messages.length); // Log total messages
  
    // Only process messages that are new
    if (messages.length > lastProcessedMessageCount) {
      const newMessages = messages.slice(lastProcessedMessageCount); // Get only new messages
      console.log('New messages detected:', newMessages);
  
      newMessages.forEach((message) => {
        if (message.reasoning) {
          console.log('useEffect sending reasoning:', message.reasoning);
          window.electron.ipcRenderer.send('speak-text', message.reasoning);
        } else {
          console.log('No reasoning or text found in message:', message);
        }
      });
  
      // Update the count of processed messages
      lastProcessedMessageCount = messages.length;
    }
  }, [messages]); // Trigger effect whenever messages change // Trigger effect whenever messages change

  if (runHistory.length === 0) return null;

  return (
    <Box
      id="run-history" // Add ID for scrolling
      w="100%"
      h="100%"
      bg="white"
      borderRadius="16px"
      border="1px solid"
      borderColor="rgba(112, 107, 87, 0.5)"
      p={4}
      overflow="auto"
    >
      {messages.map((action, index) => {
        const { type, ...params } = action.action;
        return (
          <Box key={index} mb={4} p={3} borderRadius="md" bg="gray.50">
            <Box mb={2} fontSize="sm" color="gray.600">
              {action.reasoning}
            </Box>
            <Box fontFamily="monospace" color="blue.600">
              {type}({params ? JSON.stringify(params) : ''})
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}