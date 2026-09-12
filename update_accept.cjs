const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/ChatInput.tsx', 'utf-8');

content = content.replace(
  'accept=".txt,.java,.c,.py,.cpp,.zip,.pdf,.jpg,.jpeg,.png,.gif,.webp"',
  'accept=".txt,.java,.c,.py,.cpp,.zip,.pdf,.jpg,.jpeg,.png,.gif,.webp,.ipynb,.pptx,.docx"'
);

fs.writeFileSync('src/components/shareroom/ChatInput.tsx', content);
