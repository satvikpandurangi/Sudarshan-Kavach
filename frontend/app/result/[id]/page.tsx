import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ResultView } from "@/components/ResultView";

export default function ResultPage({ params }: { params: { id: string } }) {
  return (
    <div className="main-viewport-wrapper">
      <Nav />
      <main className="page-container" style={{ flex: 1 }}>
        <ResultView id={params.id} />
      </main>
      <Footer />
    </div>
  );
}
