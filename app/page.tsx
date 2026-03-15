import MagicApp from "./MagicApp";

export default function Home() {
  return (
    <main>
      <div id="loading-check" style={{ display: 'none' }}>Next.js Loaded</div>
      <MagicApp />
    </main>
  );
}
