const fs = require('fs');
let content = fs.readFileSync('src/components/shareroom/RoomHeader.tsx', 'utf-8');

// 1. Reduce height from 84px to 64px
content = content.replace(
  /height: 'calc\(84px \+ env\(safe-area-inset-top, 0px\)\)'/,
  "height: 'calc(64px + env(safe-area-inset-top, 0px))'"
);

// 2. Reduce circular buttons from 44px to 36px
content = content.replace(
  /w-\[44px\] h-\[44px\]/g,
  "w-[36px] h-[36px]"
);

// 3. Reduce ChevronLeft/MoreHorizontal icons from 24px to 20px
content = content.replace(
  /<ChevronLeft className="w-\[24px\] h-\[24px\]/g,
  '<ChevronLeft className="w-[20px] h-[20px]'
);
content = content.replace(
  /<MoreHorizontal className="w-\[24px\] h-\[24px\]/g,
  '<MoreHorizontal className="w-[20px] h-[20px]'
);

// 4. Shrink the main title text from 28px to 17px (standard iOS centered title size)
content = content.replace(
  /text-\[28px\]/g,
  "text-[17px]"
);

// 5. Shrink the subtitle from 14px to 12px
content = content.replace(
  /text-\[14px\]/g,
  "text-[12px]"
);
// Shrink the green dot from 8px to 6px
content = content.replace(
  /w-\[8px\] h-\[8px\]/g,
  "w-[6px] h-[6px]"
);
// Decrease gap from 6px to 4px
content = content.replace(
  /gap-\[6px\]/g,
  "gap-[4px]"
);


fs.writeFileSync('src/components/shareroom/RoomHeader.tsx', content);
