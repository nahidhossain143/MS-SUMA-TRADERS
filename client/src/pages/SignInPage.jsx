// src/pages/SignInPage.jsx
import { SignIn } from '@clerk/clerk-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-white mb-1">স্বাগতম!</h1>
          <p className="text-green-400">Sign in to place rice orders</p>
          <p className="text-green-500 text-sm font-bengali mt-0.5">চাল অর্ডার করতে লগ ইন করুন</p>
        </div>
        <SignIn routing="path" path="/sign-in" afterSignInUrl="/" />
      </div>
    </div>
  );
}
