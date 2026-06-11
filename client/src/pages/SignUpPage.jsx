// src/pages/SignUpPage.jsx
import { SignUp } from '@clerk/clerk-react';

export default function SignUpPage() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-white mb-1">নিবন্ধন করুন</h1>
          <p className="text-green-400">Create a free account to order rice</p>
          <p className="text-green-500 text-sm font-bengali mt-0.5">বিনামূল্যে একাউন্ট খুলুন</p>
        </div>
        <SignUp routing="path" path="/sign-up" afterSignUpUrl="/" />
      </div>
    </div>
  );
}
