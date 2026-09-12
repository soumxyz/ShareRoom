const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

const targetInterface = `interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isHost: boolean;`;
const newInterface = `interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isHost: boolean;
  isLastInGroup?: boolean;
  isFirstInGroup?: boolean;`;

content = content.replace(targetInterface, newInterface);

const targetComponent = `export const MessageBubble = ({
  message,
  isOwn,
  isHost,
  replyMessage,`;
const newComponent = `export const MessageBubble = ({
  message,
  isOwn,
  isHost,
  isLastInGroup = true,
  isFirstInGroup = true,
  replyMessage,`;

content = content.replace(targetComponent, newComponent);

fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
