import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 pt-32">
      <div className="w-full max-w-md">
        <SignUp />
      </div>
    </div>
  );
}
