//hook to determine the state of which section is active (defaults to overview)
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from '@/lib/supabase';


import Squares from "./Squares";
import SpotlightCard from "./SpotlightCard";
import BrainIcon from "../../public/vecteezy_ai-technology-brain-icon-illustration-isolated_55810405.svg";
import SpeedometerIcon from "../../public/speedometer.svg";
import OpensourceIcon from "../../public/open-source.svg";
import SecurityIcon from "../../public/security.svg";
import ExpandDown from "../../public/Expand_down.svg";


let faqData = [
  {
    question: "Most chatbots natively support spreadsheet support. Why this product?",
    answer: "While it's true that many chatbots can natively process spreadsheets, chatbots are known to 'hack' by mapping common words to sentiment values in order to preserve excess token usage. This can lead to inaccurate sentiment analysis, especially when dealing with nuanced or context-dependent data. Our product is designed specifically for sentiment analysis, ensuring that the results are accurate and reliable.",
    isOpened: false
  },
  {
    question: "How is data stored?",
    answer: "Uploaded spreadsheets and analysis results are stored on Supabase's SOC 2 compliant infrastructure — files in encrypted object storage and results in a Postgres database — scoped privately to your account so only you can access them. Guest sentisheets are retained for 30 days (see below); deleting your account permanently removes all associated files and records.",
    isOpened: false
  },
  {
    question: "I found a bug, how can I report it?",
    answer: "We welcome bug reports and feedback! Please visit our GitHub repository and open an issue with a detailed description of the problem you encountered.",
    isOpened: false
  },
  {
    question: "What file formats are supported?",
    answer: "We support .csv and .xlsx file formats for spreadsheet uploads. If you have a different format, please let us know via our GitHub repository.",
    isOpened: false
  },
  {
    question: "How can I cancel my subscription?",
    answer: "You can cancel your subscription at any time by going to your account settings and selecting the 'Cancel Subscription' option. If you need assistance, please reach out via our Github repository.",
    isOpened: false
  },
  {
    question: "How long are my sentisheets retained as a guest?",
    answer: "We offer a generous retention period of 30 days for sentisheets created by guest users. This means that your sentisheets will be securely stored and accessible for up to 30 days from the date of creation. After this period, the sentisheets will be automatically deleted from our servers for storage efficency.",
    isOpened: false
  }

];

const pricingRows = [
  { key: "bestFor", label: "Best for" },
  { key: "cloudStorage", label: "Persistent Cloud storage" },
  { key: "charLimit", label: "Daily character limit*" },
  { key: "models", label: "Available models" },
  { key: "presets", label: "Sentiment presets" }
];

const pricingPlans = [
  {
    id: "guest",
    name: "Guest",
    price: "$0/mo",
    bestFor: "Casual researcher, student, marketer interested with performing sentiment analysis",
    cloudStorage: false,
    charLimit: "25,000 characters",
    models: [{ text: "Gemini Flash 2.5 Lite" }],
    presets: [
      { text: "Basic Sentiment" },
      { text: "Granular Sentiment Scale" },
      { text: "Dr. Ekman's Six Basic Emotions" }
    ],
    cta: { label: "Try for free", href: "/create", className: "w-full bg-foreground text-background hover:cursor-pointer" }
  },
  {
    id: "account",
    name: "Account",
    price: "$0/mo",
    bestFor: "Aspiring professionals seeking large-scale sentiment analysis",
    cloudStorage: true,
    charLimit: "250,000 characters",
    models: [{ text: "Gemini Flash 2.5 Lite" }],
    presets: [
      { text: "Basic Sentiment" },
      { text: "Granular Sentiment Scale" },
      { text: "Dr. Ekman's Six Basic Emotions" }
    ],
    cta: { label: "Sign up for free", href: "/signup", className: "w-full bg-foreground text-background hover:cursor-pointer" }
  },
  {
    id: "pro",
    name: "Pro",
    price: "$4.99/mo",
    rainbowName: true,
    bestFor: "Professionals requiring precision, benchmarking, at a large-scale basis",
    cloudStorage: true,
    charLimit: "250,000 characters",
    models: [
      { text: "Gemini Flash 2.5 Lite" },
      { text: "Gemini 2.5 Flash", rainbow: true },
      { text: "Gemini 2.5 Pro", rainbow: true },
      { text: "GPT-5 nano", rainbow: true },
      { text: "GPT-5 mini", rainbow: true },
      { text: "GPT-5", rainbow: true },
      { text: "Claude Sonnet 4", rainbow: true }
    ],
    presets: [
      { text: "Basic Sentiment" },
      { text: "Granular Sentiment Scale" },
      { text: "Dr. Ekman's Six Basic Emotions" },
      { text: "Unlimited custom presets", rainbow: true }
    ],
    cta: { label: "Subscribe", href: "/login?buyingSubscription=true", className: "rainbow-transition w-full bg-gradient-to-b from-blue-700 to-violet-600 text-white hover:cursor-pointer" }
  }
];

function sectionWrapperClass(isActive) {
  return `grid w-full transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isActive ? "grid-rows-[1fr] opacity-100 pointer-events-auto" : "grid-rows-[0fr] opacity-0 pointer-events-none"}`;
}

function renderPricingValue(plan, key) {
  const value = plan[key];
  if (key === "cloudStorage") return value ? "✓" : "";
  if (Array.isArray(value)) {
    return value.map((item, i) => (
      <div key={i} className={item.rainbow ? "rainbow-transition text-rainbow-mask" : ""}>{item.text}</div>
    ));
  }
  return value;
}

export default function LandingBody() {
  const [activeSection, setActiveSection] = useState("Overview");
  const [FAQstatus, setFAQstatus] = useState(faqData);
  const router = useRouter();
  useEffect(() => {
  
      const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
            if (session?.user && !session.user.is_anonymous) {
                router.push('/create');
            }
        };
        checkUser();
  }, [router]);  
  return (
    <>
      <div aria-label="Landing page content" className="flex flex-col items-center justify-start space-y-6 p-4 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 blur-[1.5px]">
          <Squares
            speed={0.2}
            cellWidth={100}
            cellHeight={40}
            direction="up"
          />
        </div>

        <h1 className="rainbow-transition text-rainbow-mask leading-tight text-3xl sm:text-5xl md:text-6xl">Sentiment analysis in seconds.</h1>
        <p className="text-base sm:text-lg text-center max-w-prose">Upload your spreadsheet and let AI conduct sentiment analysis in the matter of seconds — free of charge, no download and no account required.</p>
        <div className="relative inline-block group">
          <span aria-hidden="true" className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-700 to-violet-600 rainbow-transition translate-y-1"></span>
          <button className="relative [background:linear-gradient(var(--background),var(--background))_padding-box,linear-gradient(to_bottom,var(--color-blue-700),var(--color-violet-600))_border-box] text-foreground font-bold text-xl sm:text-2xl border-3 border-transparent rounded-2xl rainbow-transition transition-transform duration-150 group-hover:-translate-y-0.5 group-active:translate-y-1"><Link href="/create">Try for free</Link></button>
        </div>
        <div className="relative inline-block w-full max-w-[850px]">
          <Image src="/outline-sentisheet-2.png" alt="Sentisheet demo outline" width={850} height={400} className="rainbow-transition w-full h-auto"/>
          <Image src="/sentisheet-raw.png" alt="Sentisheet demo" width={850} height={400} className="absolute -top-[1.2px] left-0 z-0 w-full h-auto"/>
        </div>

      </div>
        <ul className="flex flex-wrap border-t-3 space-x-2 sm:space-x-4 text-lg sm:text-2xl md:text-4xl justify-center bg-background -mt-8 relative z-1 p-3 shadow-bottom">
          <li
            onClick={() => setActiveSection("Overview")}
            className="relative cursor-pointer"
          >
            Overview
            <hr className={`rainbow-transition absolute -bottom-3 inset-x-0 h-1 border-0 rounded-t-[20px] bg-gradient-to-b from-blue-700 to-violet-600 transition-opacity ${activeSection === "Overview" ? "opacity-100" : "opacity-0"}`} />
          </li>
          <div className="border-l-2 border-gray-400 h-8 w-2 self-center"/>

          <li
            onClick={() => setActiveSection("FAQ")}
            className="relative cursor-pointer"
          >
            FAQ
            <hr className={`rainbow-transition absolute -bottom-3 inset-x-0 h-1 border-0 rounded-t-[20px] bg-gradient-to-b from-blue-700 to-violet-600 transition-opacity ${activeSection === "FAQ" ? "opacity-100" : "opacity-0"}`} />
          </li>
          <div className="border-l-2 border-gray-400 h-8 w-2 self-center  "/>
          <li
            onClick={() => setActiveSection("Plans and pricing")}
            className="relative cursor-pointer"
          >
            Plans and pricing
            <hr className={`rainbow-transition absolute -bottom-3 inset-x-0 h-1 border-0 rounded-t-[20px] bg-gradient-to-b from-blue-700 to-violet-600 transition-opacity ${activeSection === "Plans and pricing" ? "opacity-100" : "opacity-0"}`} />
          </li>
        </ul>
        <div className={sectionWrapperClass(activeSection === "Overview")}>
          <div className="overflow-hidden min-h-0">
            <div className="bg-background grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 p-4 sm:p-8 w-full">
              <SpotlightCard className="bg-background rainbow-transition flex flex-col p-6 sm:p-12 outlined" spotlightColor="rgba(43, 108, 176, 0.18)" >
                <BrainIcon width={100} height={100} className="shrink-0 [&_path]:fill-blue-700" viewBox="0 0 5000 5000"/> {/*0 0: start showing the svg at the very beginning of the grid
                where: X-axis: Still goes left to right (0 to 5000)
                Y-axis: Still goes top to bottom (0 to 5000)
                5000 5000: Creates a canvas that is 5,000 units wide and 5,000 units high.
                think flash light analogy: the viewbox is the positon of the beam while the width and height determine how wide and how far the beam shines
                () */}
                <h2 className="py-1" >Algorithmic Batching</h2>
                <p>Sentiment analysis done with the mind of both accuracy and speed. Process hundreds of rows in seconds or thousands of rows in minutes.</p>
              </SpotlightCard>
              <SpotlightCard className="rainbow-transition flex flex-col p-6 sm:p-8 h-full gap-1 outlined" spotlightColor="rgba(43, 108, 176, 0.15)" >
                <SpeedometerIcon width={100} height={100} className="shrink-0 [&_path]:fill-blue-700/70" viewBox="0 0 139 139"/>
                <h2 className="py-1">Usage Transparency</h2>
                <p>Track your daily usage, manage data retention, and permanently delete requests. No hidden limits or surprise bills.</p>
              </SpotlightCard>
              <SpotlightCard className="rainbow-transition flex flex-col p-6 sm:p-8 h-full gap-1 outlined" spotlightColor="rgba(43, 108, 176, 0.15)" >
                <OpensourceIcon width={100} height={100} className="shrink-0 [&_path]:fill-blue-700/70" viewBox="0 0 512 512"/>
                <h2 className="py-1">Open Source</h2>
                <p>It&apos;s never been more easier to tinker with products. Running a different LLM model? Modifying the batching algorithm? Do so freely via the GitHub repository of this project.</p>
              </SpotlightCard>
              <SpotlightCard className="rainbow-transition flex flex-col p-6 sm:p-8 h-full gap-1 outlined" spotlightColor="rgba(43, 108, 176, 0.15)" >
                <SecurityIcon width={100} height={100} className="shrink-0 [&_path]:fill-blue-700/70" viewBox="0 0 512 512"/>
                <h2 className="py-1">Private by Design</h2>
                <p>Your data stays yours. Files are processed and stored on SOC 2 compliant infrastructure — never sold, never used for ads.</p>
              </SpotlightCard>
            </div>
          </div>
        </div>
        <div className={sectionWrapperClass(activeSection === "FAQ")}>
          <div className="overflow-hidden min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 p-4 sm:p-8 gap-4 sm:gap-8 text-lg sm:text-2xl mx-auto items-start w-full">
              {faqData.map((item, index) => (
                <div key={index} className=" bg-foreground text-background flex-1 p-4 rounded-2xl">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="min-w-0">{item.question}</h3>
                    <button onClick={() => {
                      setFAQstatus(faqData[index].isOpened = !faqData[index].isOpened);
                    }} className="rounded hover:cursor-pointer shrink-0">
                      <ExpandDown width={44} height={44} className={`transition-transform duration-300 ease-in-out [&_path]:stroke-background [&_path]:fill-none ${item.isOpened ? "rotate-180" : "rotate-0"}`}/>
                    </button>
                  </div>
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${item.isOpened ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <p className="overflow-hidden min-h-0">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={sectionWrapperClass(activeSection === "Plans and pricing")}>
          <div className="overflow-hidden min-h-0 p-4 sm:p-8 w-full">
          <div className="hidden sm:block rounded-2xl overflow-hidden bg-background text-foreground border-3 border-foreground">
            <table className="w-full table-fixed border-collapse text-left text-sm sm:text-base">
              <thead>
                <tr className="border-b-2 border-foreground/10">
                  <th className="p-2 sm:p-4 text-sm font-normal opacity-60 w-36">Plan type &amp; pricing</th>
                  {pricingPlans.map((plan) => (
                    <th key={plan.id} className="p-2 sm:p-4 ">
                      <div className={`text-2xl sm:text-4xl font-bold ${plan.rainbowName ? "rainbow-transition text-rainbow-mask" : ""}`}>{plan.name}</div>
                      <div className="text-sm font-normal opacity-60">{plan.price}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pricingRows.map((row) => (
                  <tr key={row.key} className="border-b-2 border-foreground/10">
                    <th className="p-2 sm:p-4 text-sm font-normal opacity-60 align-top">{row.label}</th>
                    {pricingPlans.map((plan) => (
                      <td key={plan.id} className="p-2 sm:p-4 align-top">{renderPricingValue(plan, row.key)}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-2 sm:p-4"></td>
                  {pricingPlans.map((plan) => (
                    <td key={plan.id} className="p-2 sm:p-4">
                      <Link href={plan.cta.href}>
                        <button className={plan.cta.className}>{plan.cta.label}</button>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="sm:hidden flex flex-col gap-4">
            {pricingPlans.map((plan) => (
              <div key={plan.id} className="rounded-2xl bg-background text-foreground border-3 border-foreground p-4">
                <div className="flex items-baseline justify-between border-b-2 border-foreground/10 pb-3 mb-3">
                  <div className={`text-3xl font-bold ${plan.rainbowName ? "rainbow-transition text-rainbow-mask" : ""}`}>{plan.name}</div>
                  <div className="text-sm font-normal opacity-60">{plan.price}</div>
                </div>
                <dl className="flex flex-col gap-3 text-sm">
                  {pricingRows.map((row) => (
                    <div key={row.key}>
                      <dt className="text-xs font-normal opacity-60">{row.label}</dt>
                      <dd>{renderPricingValue(plan, row.key)}</dd>
                    </div>
                  ))}
                </dl>
                <Link href={plan.cta.href}>
                  <button className={`mt-4 ${plan.cta.className}`}>{plan.cta.label}</button>
                </Link>
              </div>
            ))}
          </div>
          </div>
        </div>
    </>
  );
}
