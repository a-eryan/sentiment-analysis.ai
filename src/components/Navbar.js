import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react'; // ← Add useState
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  // ✅ Add state to store session data
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
        } else {
          console.log('Fetched session:', data.session);
          setSession(data.session); // ✅ Store session in state
        }
      } catch (error) {
        console.error('Error:', error);
      } 
    };

    fetchSession();

    // ✅ Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session); //set session state every time an auth event happens
      }
    );

    // ✅ Cleanup subscription
    return () => subscription.unsubscribe();
  }, []);
  console.log('Navbar session:', session);

  return (
    <nav aria-label="Landing page navigation ">
      <div className="flex flex-wrap justify-between items-center gap-2 py-3 px-4 border-b-3 sm:px-8 bg-background">
        <span className="flex items-center space-x-2 text-lg sm:text-2xl md:text-4xl font-bold min-w-0">
          <Link href="/" className="shrink-0">
            <Image width={40} height={40} src="/sentiment-analysis.ai-logo-v2-light.svg" alt="sentiment-analysis.ai Logo" className="w-8 h-8 sm:w-10 sm:h-10 md:w-[40px] md:h-[40px] dark:hidden" />
            <Image width={40} height={40} src="/sentiment-analysis.ai-logo-v2.svg" alt="sentiment-analysis.ai Logo" className="hidden w-8 h-8 sm:w-10 sm:h-10 md:w-[40px] md:h-[40px] dark:block" />
          </Link>
          <Link href="/" className="hover:underline truncate">
            <span>sentiment-analysis.ai</span>
          </Link>
        </span>
        <ul className="flex flex-wrap space-x-3 sm:space-x-6 text-base sm:text-lg items-center">
          {session && !session.user.is_anonymous ? (
            <>
              <li>
                <Link href="/account" className="hover:underline">
                  <Image src="/person-circle.svg" width={57} height={57} alt="Account" className="w-8 h-8 sm:w-10 sm:h-10 md:w-[57px] md:h-[57px] dark:invert" />
                </Link>
              </li>
              <li className="hover:underline cursor-pointer" onClick={async () => await supabase.auth.signOut()}>Log out</li>
            </>
          ) : (
            <>
              <li><Link href="/login" className="hover:underline">Log in</Link></li>
              <li><Link href="/signup" className="hover:underline">Sign up</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}