import "@/styles/globals.css";
import Footer from "@/components/Footer";

export default function App({ Component, pageProps }) {
  //where all pages get rendered
  return (
    <>
      <Component {...pageProps} />
      <Footer />
    </>
  );
}
