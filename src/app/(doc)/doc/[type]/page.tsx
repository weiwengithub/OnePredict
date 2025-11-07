import DocClient from "./DocClient";

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { type: 'privacy' },
    { type: 'items' },
    { type: 'about' },
    { type: 'faq' },
  ];
}

export default async function DocPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  return <DocClient type={type} />;
}


