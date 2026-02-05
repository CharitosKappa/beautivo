import OtpRequestForm from '@/components/auth/OtpRequestForm';
import OtpVerifyForm from '@/components/auth/OtpVerifyForm';

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Customer Login</h1>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Request OTP</h2>
          <OtpRequestForm />
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Verify OTP</h2>
          <OtpVerifyForm />
        </div>
      </div>
    </main>
  );
}
