import { Terminal } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo = ({ size = 'md', showText = true }: LogoProps) => {
  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
        <Terminal className={`${iconSizes[size]} text-primary relative`} />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold font-mono gradient-text`}>
          ShareRoom
        </span>
      )}
    </div>
  );
};
