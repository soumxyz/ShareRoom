const fs = require('fs');
let content = fs.readFileSync('src/pages/Room.tsx', 'utf-8');

// I will use regex to replace everything between `<div className="max-w-[95%] sm:max-w-[780px] mx-auto w-full px-2 sm:px-4 py-2 sm:py-4">` and `{/* Input - floating at bottom */}`

const startMarker = '<div className="max-w-[95%] sm:max-w-[780px] mx-auto w-full px-2 sm:px-4 py-2 sm:py-4">';
const endMarker = '{/* Input - floating at bottom */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newBlock = \`<div className="max-w-[95%] sm:max-w-[780px] mx-auto w-full px-2 sm:px-4 py-2 sm:py-4">
              <div className="flex flex-col">
                {messages.length === 0 && (
                  <div className="text-center py-8 sm:py-12 text-mono-500">
                    <p className="text-sm">No messages yet. Start the conversation!</p>
                  </div>
                )}

                {messages.map((message, index) => {
                  const nextMessage = messages[index + 1];
                  const prevMessage = messages[index - 1];
                  const isLastInGroup = !nextMessage || nextMessage.participant_id !== message.participant_id;
                  const isFirstInGroup = !prevMessage || prevMessage.participant_id !== message.participant_id;

                  return (
                    <MessageBubble
                      key={message.id}
                      isLastInGroup={isLastInGroup}
                      isFirstInGroup={isFirstInGroup}
                      message={message}
                      isOwn={message.participant_id === participant?.id}
                      isHost={isHost}
                      replyMessage={
                        message.reply_to_id
                          ? messages.find((m) => m.id === message.reply_to_id) || null
                          : null
                      }
                      onReply={() =>
                        setReplyTo({
                          id: message.id,
                          username: message.username,
                          content: message.content || '',
                        })
                      }
                      onDelete={isHost || message.participant_id === participant?.id ? () => deleteMessage(message.id) : undefined}
                      onMuteUser={message.participant_id ? () => muteUser(message.participant_id!) : undefined}
                      onKickUser={message.participant_id ? () => kickUser(message.participant_id!, true) : undefined}
                      onScrollToMessage={scrollToMessage}
                    />
                  );
                })}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>
          </div>

          \`;

  content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
  fs.writeFileSync('src/pages/Room.tsx', content);
  console.log("Fixed Room.tsx");
} else {
  console.log("Could not find markers.");
}
