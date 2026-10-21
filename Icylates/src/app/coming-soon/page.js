import Link from 'next/link';
import SignUp from '@/components/home/SignUp';
export default function ComingSoon() {
  return <main className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(120deg,#EFD7EF,#F5F9FC,#F8EAE1,#EAF8F9)] px-4 py-20 text-center">
    <h1 className="berkshire text-6xl text-darkbrown sm:text-[90px]">Coming Soon</h1>
    <div className="w-full max-w-[740px]"><SignUp compact/></div>
    <Link href="/" className="mt-8 text-pink underline">Back to Home</Link>
  </main>;
}
