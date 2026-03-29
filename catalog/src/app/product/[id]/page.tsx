import { notFound } from "next/navigation";
import productsData from "@/src/data/products.json";
import { Product } from "@/src/types";
import ProductDetailClient from "@/src/components/ProductDetailClient";

const products = productsData as Product[];

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = products.find((p) => p.id === decodeURIComponent(id));
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
