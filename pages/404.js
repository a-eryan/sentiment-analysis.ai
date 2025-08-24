import Header from '../src/components/Header';
import Navbar from '../src/components/Navbar';

export default function Custom404() {
  return (
    <div>
        <Navbar />
        <Header className = "text-center" bodyText="404 - Page Not Found"/>
        <p className="text-center text-4xl">Sorry, the page you are looking for does not exist.</p>
    </div>
  );
}