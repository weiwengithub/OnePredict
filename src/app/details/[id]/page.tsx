import PredictionDetailsClient from './PredictionDetailsClient';

export async function generateStaticParams() {
  // Generate static params for all possible prediction IDs
  return Array.from({ length: 12 }, (_, i) => ({
    id: i.toString(),
  }));
}

export default async function PredictionDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <PredictionDetailsClient id={id} />;
}
