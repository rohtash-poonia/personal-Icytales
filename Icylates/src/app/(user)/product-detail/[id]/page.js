import CommonHero from "@/components/common/CommonHero";
import ProductDetail from "@/components/details-page/ProductDetails";
import RelatedProducts from "@/components/details-page/RelatedProducts";
export default async function ProductPage({params}) {
  const {id}=await params;
  return <div><CommonHero/><div id="product-info"><ProductDetail productId={id}/></div><RelatedProducts productId={id}/></div>;
}
