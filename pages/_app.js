import "@/styles/globals.css";
import Footer from "@/components/Footer";

export default function App({ Component, pageProps }) {
  //where all pages get rendered
  return (
    <div className="flex flex-col min-h-dvh">
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}
