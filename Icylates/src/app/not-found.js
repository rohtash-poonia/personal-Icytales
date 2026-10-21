import Link from 'next/link';
export default function NotFound() {
  return <main className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(120deg,#EFD7EF,#F5F9FC,#F8EAE1,#EAF8F9)] px-5 py-20 text-center">
    <p className="berkshire text-[140px] leading-none text-pink">404</p>
    <h1 className="berkshire mt-10 text-3xl sm:text-[40px]">Sorry! The Page Not Found</h1>
    <p className="mt-5 max-w-xl text-lg leading-7 text-lightbrown">The page may have moved. Return home to explore our ice cream flavors.</p>
    <Link href="/" className="mt-8 rounded-full bg-pink px-8 py-5 font-semibold text-white">← Back to Home</Link>
  </main>;
}
