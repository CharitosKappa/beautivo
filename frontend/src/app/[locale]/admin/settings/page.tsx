import AdminTwoFactorSetup from '@/components/auth/AdminTwoFactorSetup';

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="mt-6 space-y-4">
        <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
        <AdminTwoFactorSetup />
      </div>
    </main>
  );
}
