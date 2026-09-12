const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/RoomHeader.tsx', 'utf-8');

// Replace the solid background with a frosted, slightly grayer material background
content = content.replace(
  /bg-\[#FAFAFA\]/g,
  "bg-[#F5F5F7]/85 backdrop-blur-[20px] supports-[backdrop-filter]:bg-[#F5F5F7]/70"
);

// Optional: tweak the border to be slightly more visible but still subtle (Apple often uses rgba(0,0,0,0.1) or similar for separated headers)
// Currently it's 0.04. Let's make it 0.08 so it separates a bit better with the frost.
content = content.replace(
  /borderBottom: '1px solid rgba\\(0,0,0,0.04\\)'/,
  "borderBottom: '1px solid rgba(0,0,0,0.08)'"
);

fs.writeFileSync('src/components/shareroom/RoomHeader.tsx', content);
