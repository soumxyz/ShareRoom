import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, ArrowRight } from 'lucide-react';

interface UsernameFormProps {
  onSubmit: (username: string) => void;
  initialValue?: string;
}

export const UsernameForm = ({ onSubmit, initialValue = '' }: UsernameFormProps) => {
  const [username, setUsername] = useState(initialValue);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    
    if (trimmed.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    if (trimmed.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setError('Only letters, numbers, underscores and dashes allowed');
      return;
    }
    
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-mono-600 font-medium">
          Choose your username
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mono-400" />
          <Input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="anonymous_user"
            className="pl-10 h-12 bg-mono-100 border-mono-300 font-mono text-mono-800 placeholder:text-mono-400 focus:ring-2 focus:ring-mono-400 focus:border-mono-400"
            autoFocus
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full h-12 bg-mono-200 hover:bg-mono-300 text-mono-900 font-semibold border border-mono-300 transition-all"
      >
        Continue
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </form>
  );
};
