//hook to determine the state of which section is active (defaults to overview)
import Link from "next/link";
import Header from "./Header";


export default function LandingBody() {
  return (
    <>
      <div aria-label="Landing page content" className="flex flex-col items-center justify-start space-y-6 m-8">
        <Header bodyText="Sentiment analysis in seconds."/>
        <p className="text-4xl">Upload your spreadsheet and let AI conduct sentiment analysis in the matter of seconds — free of charge, no download and no account required.</p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded text-4xl"><Link href="/create">Try for free</Link></button>
        <ul className="flex space-x-4 text-4xl">
          <li>Overview</li>
          <li>FAQ</li> 
          <li>Plans and pricing</li>
        </ul>
      </div>
    </>
  );
}
