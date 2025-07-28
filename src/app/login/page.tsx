"use client";

import Card from '@/components/ui/Card';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card title="Login" className="w-full">
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}
