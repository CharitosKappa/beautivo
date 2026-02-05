'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

export default function AdminTwoFactorSetup() {
  const { setup2fa, confirm2fa, disable2fa } = useAuth();
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSetup = async () => {
    setStatus(null);
    try {
      const data = await setup2fa();
      setSecret(data.secret);
      setQrCode(data.qrCode);
    } catch {
      setStatus('Failed to start 2FA setup.');
    }
  };

  const handleConfirm = async () => {
    setStatus(null);
    try {
      await confirm2fa(code);
      setStatus('2FA enabled successfully.');
    } catch {
      setStatus('2FA confirmation failed.');
    }
  };

  const handleDisable = async () => {
    setStatus(null);
    try {
      await disable2fa(disableCode, disablePassword);
      setStatus('2FA disabled successfully.');
    } catch {
      setStatus('2FA disable failed.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Button type="button" onClick={handleSetup}>
          Generate 2FA Secret
        </Button>
        {qrCode && (
          <div className="space-y-2">
            <img src={qrCode} alt="2FA QR" className="h-40 w-40" />
            {secret && (
              <p className="text-xs text-muted-foreground">Secret: {secret}</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Confirm code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          maxLength={6}
        />
        <Button type="button" onClick={handleConfirm}>
          Confirm 2FA
        </Button>
      </div>

      <div className="space-y-2">
        <Input
          placeholder="Disable code"
          value={disableCode}
          onChange={(event) => setDisableCode(event.target.value)}
          maxLength={6}
        />
        <Input
          type="password"
          placeholder="Password"
          value={disablePassword}
          onChange={(event) => setDisablePassword(event.target.value)}
        />
        <Button type="button" variant="destructive" onClick={handleDisable}>
          Disable 2FA
        </Button>
      </div>

      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  );
}
