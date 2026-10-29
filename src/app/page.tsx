// The page builds up block by block, like the settings page.
const rise = "animate-[rise_300ms_ease-out_backwards] motion-reduce:animate-none";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-10 py-16">
      <div className={`text-center ${rise}`}>
        <h1 className="text-5xl leading-none font-bold tracking-tight text-heading">TICKLOG</h1>
        <p className="mt-1.5 text-[17px] leading-7 text-search-text">Track all your Minecraft stats with a single mod.</p>
      </div>
    </main>
  );
}
