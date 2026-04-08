import Navbar from '../src/components/Navbar';
import Squares from '@/components/Squares';

export default function Custom404() {
  return (
    <div className="flex-1">
        <div className="fixed inset-0 -z-10 blur-[1.5px]">
          <Squares speed={0.2} cellWidth={100} cellHeight={40} direction="up" />
        </div>       
        <Navbar />
        <div className="flex flex-col gap-4 text-center border mx-auto p-6 my-12 rounded outlined w-full max-w-md ">
        <h1>404 - Page Not Found</h1>
        <p className="text-center text-4xl">Sorry, the page you are looking for does not exist.</p>
        </div>  
    </div>
  );
}