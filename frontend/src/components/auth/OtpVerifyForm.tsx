'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

export default function OtpVerifyForm() {
  const { verifyCustomerOtp } = useAuth();
  const [shopId, setShopId] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await verifyCustomerOtp(shopId, email, otp);
      setStatus('Verified successfully.');
    } catch (error) {
      setStatus('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input
        placeholder="Shop ID"
        value={shopId}
        onChange={(event) => setShopId(event.target.value)}
        required
      />
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <Input
        placeholder="6-digit OTP"
        value={otp}
        onChange={(event) => setOtp(event.target.value)}
        maxLength={6}
        required
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify OTP'}
      </Button>
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </form>
  );
}
