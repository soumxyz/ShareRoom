const fs = require('fs');
let content = fs.readFileSync('src/components/ui/button.tsx', 'utf-8');

// Update base styles
content = content.replace(
  /font-medium ring-offset-background/g,
  'font-medium tracking-[-0.01em] ring-offset-background'
);

// Update default (Primary) variant
content = content.replace(
  /"bg-primary text-primary-foreground hover:bg-primary\/90"/g,
  '"bg-primary text-primary-foreground hover:bg-primary/90 tracking-[-0.02em]"'
);

fs.writeFileSync('src/components/ui/button.tsx', content);
