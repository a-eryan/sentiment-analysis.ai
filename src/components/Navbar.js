import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav aria-label="Landing page navigation ">
      <div className="flex justify-between items-center py-3 px-8 bg-background">
        <span className="flex items-center space-x-2 text-4xl font-bold">
          <Link href="/">
            <Image width={57} height={57} src="/sentiment-analysis.ai.svg" alt="Sentiment Analysis Logo" />
          </Link>
          <Link href="/" className="hover:underline">
            <span>sentiment-analysis.ai</span>
          </Link>
        </span>
        <ul className="flex space-x-6 text-lg items-center">
          {session && !session.user.is_anonymous ? (
            <>
              <li>
                <Link href="/account" className="hover:underline">
                  <Image src="/person-circle.svg" width={57} height={57} alt="Account" className='dark:invert' />
                </Link>
              </li>
              <li className="hover:underline cursor-pointer" onClick={handleLogout}>Log out</li>
            </>
          ) : (
            <>
              <li><Link href="/help" className="hover:underline">Help</Link></li>
              <li><Link href="/login" className="hover:underline">Log in</Link></li>
              <li><Link href="/signup" className="hover:underline">Sign up</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
