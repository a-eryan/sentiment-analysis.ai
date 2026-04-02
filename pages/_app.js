import "@/styles/globals.css";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";

export default function App({ Component, pageProps }) {
  //where all pages get rendered
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Footer />
    </AuthProvider>
  );
}
