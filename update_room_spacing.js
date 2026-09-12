const fs = require('fs');

let content = fs.readFileSync('src/pages/Room.tsx', 'utf-8');

// Change the map to include index and determine grouping
content = content.replace(
  /\{messages\.map\(\(message\) => \(/g,
  `{messages.map((message, index) => {
                  const nextMessage = messages[index + 1];
                  const prevMessage = messages[index - 1];
                  const isLastInGroup = !nextMessage || nextMessage.participant_id !== message.participant_id;
                  const isFirstInGroup = !prevMessage || prevMessage.participant_id !== message.participant_id;
                  
                  return (`
);

content = content.replace(
  /<MessageBubble\n                    key=\{message\.id\}/g,
  `<MessageBubble
                    key={message.id}
                    isLastInGroup={isLastInGroup}
                    isFirstInGroup={isFirstInGroup}`
);

// Close the return
content = content.replace(
  /                  \/>\n                \)\)\}/g,
  `                  />\n                  );\n                })}`
);

// Remove the gap-1 from the container so bubbles control their own spacing
content = content.replace(
  /<div className="flex flex-col gap-1 sm:gap-1.5">/g,
  `<div className="flex flex-col">`
);

fs.writeFileSync('src/pages/Room.tsx', content);
