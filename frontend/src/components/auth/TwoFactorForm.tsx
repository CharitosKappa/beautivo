'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

export default function TwoFactorForm({ tempToken }: { tempToken: string }) {
  const { verifyAdmin2fa } = useAuth();
  const router = useRouter();
  const locale = useLocale();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await verifyAdmin2fa(tempToken, code);
      setStatus('2FA verified successfully.');
      router.replace(`/${locale}/admin`);
    } catch (error) {
      setStatus('2FA verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        placeholder="6-digit code"
        value={code}
        onChange={(event) => setCode(event.target.value)}
        maxLength={6}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </Button>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </form>
  );
}
