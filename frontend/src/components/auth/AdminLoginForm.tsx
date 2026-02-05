'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import TwoFactorForm from './TwoFactorForm';

export default function AdminLoginForm() {
  const { adminLogin } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const response = await adminLogin(email, password);
      if ('requires2FA' in response && response.requires2FA) {
        setTempToken(response.tempToken);
      } else {
        setStatus('Logged in successfully.');
        router.replace(`/${locale}/admin`);
      }
    } catch (error) {
      setStatus('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  if (tempToken) {
    return <TwoFactorForm tempToken={tempToken} />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </form>
  );
}
