import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav aria-label="Landing page navigation">
      <div className="flex justify-between items-center py-3 px-8">
        <span className="flex items-center space-x-2 text-4xl font-bold">
          <Link href="/"><Image width={57} height={57} src="/sentiment-analysis.ai.svg" alt="Sentiment Analysis Logo" /></Link>
          <Link href="/" className="hover:underline"><span>sentiment-analysis.ai</span></Link>
        </span>
        <ul className="flex space-x-6 text-lg">
          <li><Link href="/help" className="hover:underline">Help</Link></li>
          <li><Link href="/log-in" className="hover:underline">Log in</Link></li>
          <li><Link href="/sign-up" className="hover:underline">Sign up</Link></li>
        </ul>
      </div>
    </nav>
  );
}
