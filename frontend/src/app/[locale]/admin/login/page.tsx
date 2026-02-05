import AdminLoginForm from '@/components/auth/AdminLoginForm';

export default function Page() {
  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold">Admin Login</h1>
      <div className="mt-6">
        <AdminLoginForm />
      </div>
    </main>
  );
}
