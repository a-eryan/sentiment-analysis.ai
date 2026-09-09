import "@/styles/globals.css";
import Head from "next/head";
import Footer from "@/components/Footer";

export default function App({ Component, pageProps }) {
  //where all pages get rendered
  return (
    <div className="flex flex-col min-h-dvh">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}
