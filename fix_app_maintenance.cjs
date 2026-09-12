const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const importStatement = "import NotFound from \"./pages/NotFound\";\nimport Maintenance from \"./pages/Maintenance\";";
content = content.replace('import NotFound from "./pages/NotFound";', importStatement);

const oldApp = `const App = () => (
  <QueryClientProvider client={queryClient}>`;

const newApp = `const App = () => {
  // Toggle this by adding VITE_MAINTENANCE_MODE=true to your .env file
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Maintenance />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>`;

content = content.replace(oldApp, newApp);

// Fix the closing bracket of the App arrow function since we changed it to a block `{`
content = content.replace(/<\/QueryClientProvider>\n\);/g, '</QueryClientProvider>\n  );\n};');

fs.writeFileSync('src/App.tsx', content);
