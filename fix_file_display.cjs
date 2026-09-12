const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/MessageBubble.tsx', 'utf-8');

// 1. Fix the Image Display (iMessage Style)
const oldImgBlock = `              {isImage ? (
                <div className="space-y-2">
                  <img
                    src={message.file_url}
                    alt={message.file_name || 'Shared image'}
                    className="max-w-full max-h-[200px] sm:max-h-[300px] rounded-lg object-contain"
                    loading="lazy"
                  />
                  <div className="flex items-center gap-2">
                    <Image className={\`w-4 h-4 shrink-0 text-white/80\`} />
                    <span className={\`font-mono text-xs break-all \${isOwn ? 'text-mono-100' : 'text-mono-800'}\`}>
                      {message.file_name}
                    </span>
                  </div>
                </div>
              ) : (`;

const newImgBlock = `              {isImage ? (
                <div className={\`relative max-w-full \${isLastInGroup && isOwn ? 'imessage-tail-right' : ''} \${isLastInGroup && !isOwn ? 'imessage-tail-left' : ''}\`}>
                  <img
                    src={message.file_url}
                    alt={message.file_name || 'Shared image'}
                    className="max-w-full max-h-[300px] sm:max-w-[300px] object-cover"
                    style={{
                      borderRadius: '20px',
                      borderBottomRightRadius: isOwn && isLastInGroup ? '4px' : '20px',
                      borderBottomLeftRadius: !isOwn && isLastInGroup ? '4px' : '20px',
                    }}
                    loading="lazy"
                  />
                  {/* Image filename hidden to match iMessage clean aesthetic */}
                </div>
              ) : (`;

content = content.replace(oldImgBlock, newImgBlock);

// 2. Add visual support for new file types (pptx, docx, ipynb)
// We need to define some booleans at the top
content = content.replace(
  "const isPdf = message.file_type?.includes('pdf');",
  `const isPdf = message.file_type?.includes('pdf');
  const isPptx = message.file_name?.endsWith('.pptx');
  const isDocx = message.file_name?.endsWith('.docx');
  const isIpynb = message.file_name?.endsWith('.ipynb');`
);

// We need to import extra icons.
content = content.replace(
  "import { Reply, Trash2, MoreVertical, VolumeX, UserX, ExternalLink, FileText, File, Image } from 'lucide-react';",
  "import { Reply, Trash2, MoreVertical, VolumeX, UserX, ExternalLink, FileText, File, Image, Presentation, FileCode, FileType2 } from 'lucide-react';"
);

// We need to update the file icon display
const oldFileDisplay = `                    {isPdf ? (
                      <FileText className={\`w-4 h-4 shrink-0 text-red-400\`} />
                    ) : (
                      <File className={\`w-4 h-4 shrink-0 text-white/80\`} />
                    )}`;

const newFileDisplay = `                    {isPdf ? (
                      <FileText className={\`w-4 h-4 shrink-0 \${isOwn ? 'text-white' : 'text-red-500'}\`} />
                    ) : isPptx ? (
                      <Presentation className={\`w-4 h-4 shrink-0 \${isOwn ? 'text-white' : 'text-orange-500'}\`} />
                    ) : isDocx ? (
                      <FileType2 className={\`w-4 h-4 shrink-0 \${isOwn ? 'text-white' : 'text-blue-500'}\`} />
                    ) : isIpynb ? (
                      <FileCode className={\`w-4 h-4 shrink-0 \${isOwn ? 'text-white' : 'text-yellow-600'}\`} />
                    ) : (
                      <File className={\`w-4 h-4 shrink-0 \${isOwn ? 'text-white/80' : 'text-gray-500'}\`} />
                    )}`;

content = content.replace(oldFileDisplay, newFileDisplay);

// Because I changed the colors, I also need to update the background of the file container to match iMessage.
// Previously it wasn't wrapped in the bubble styling. Let's wrap the file container in the same bubble style!
const oldFileContainer = `                <>
                  <div className="flex items-center gap-2">`;
                  
const newFileContainer = `                <div className={\`relative max-w-full \${isLastInGroup && isOwn ? 'imessage-tail-right' : ''} \${isLastInGroup && !isOwn ? 'imessage-tail-left' : ''}\`}>
                  <div className={\`px-[16px] py-[12px] flex flex-col gap-2 \${isOwn ? 'bg-[#34C759] text-white' : 'bg-[#E9E9EB] text-[#1D1D1F]'} \`}
                       style={{ 
                         fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                         borderRadius: '20px',
                         borderBottomRightRadius: isOwn && isLastInGroup ? '4px' : '20px',
                         borderBottomLeftRadius: !isOwn && isLastInGroup ? '4px' : '20px',
                         marginRight: isOwn && isLastInGroup ? '8px' : '0',
                         marginLeft: !isOwn && isLastInGroup ? '8px' : '0'
                       }}>
                  <div className="flex items-center gap-2">`;

content = content.replace(oldFileContainer, newFileContainer);

const oldFileEnd = `                    {(isPdf || isTxt) && (
                      <button
                        onClick={() => setShowPdfViewer(!showPdfViewer)}
                        className={\`text-xs text-white/70 hover:text-white/90\`}
                      >
                        {showPdfViewer ? 'Hide' : 'Preview'}
                      </button>
                    )}
                  </div>

                  {showPdfViewer && isPdf && (
                    <iframe
                      src={message.file_url}
                      className="w-full h-[250px] sm:h-[400px] rounded-md border border-mono-300 mt-2"
                    />
                  )}

                  {showPdfViewer && isTxt && (
                    <iframe
                      src={message.file_url}
                      className="w-full h-[150px] sm:h-[200px] rounded-md border border-mono-300 bg-mono-100 mt-2"
                    />
                  )}
                </>`;

const newFileEnd = `                    {(isPdf || isTxt) && (
                      <button
                        onClick={() => setShowPdfViewer(!showPdfViewer)}
                        className={\`text-xs \${isOwn ? 'text-white/70 hover:text-white/90' : 'text-gray-500 hover:text-gray-700'}\`}
                      >
                        {showPdfViewer ? 'Hide' : 'Preview'}
                      </button>
                    )}
                  </div>

                  {showPdfViewer && isPdf && (
                    <iframe
                      src={message.file_url}
                      className="w-full h-[250px] sm:h-[400px] rounded-md border border-mono-300 mt-2 bg-white"
                    />
                  )}

                  {showPdfViewer && isTxt && (
                    <iframe
                      src={message.file_url}
                      className="w-full h-[150px] sm:h-[200px] rounded-md border border-mono-300 bg-white mt-2"
                    />
                  )}
                </div>
                </div>`;

content = content.replace(oldFileEnd, newFileEnd);

// One last thing, change the open link color:
const oldLink = `className={\`flex items-center gap-1 text-xs hover:underline text-blue-400 hover:text-blue-300\`}`;
const newLink = `className={\`flex items-center gap-1 text-[13px] hover:underline font-medium \${isOwn ? 'text-white' : 'text-[#007AFF]'}\`}`;
content = content.replace(oldLink, newLink);

// Remove the `text-white` from the filename text
const oldFilename = `<span className={\`font-mono text-xs sm:text-sm break-all text-white\`}>`;
const newFilename = `<span className={\`font-mono text-[14px] leading-tight break-all \${isOwn ? 'text-white' : 'text-[#1D1D1F]'}\`}>`;
content = content.replace(oldFilename, newFilename);


fs.writeFileSync('src/components/shareroom/MessageBubble.tsx', content);
