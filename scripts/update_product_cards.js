const fs = require("fs");

let content = fs.readFileSync("grow-x/components/marketing/ProductCatalogTemplate.tsx", "utf-8");
const isCrlf = content.includes("\r\n");
let norm = content.replace(/\r\n/g, "\n");

// Replace ProductCard
const oldProductCardRegex = /export function ProductCard[\s\S]*?<\/article>\s*\);\s*\}/;

const newProductCard = `export function ProductCard({ product, className }: ProductCardProps) {
  const isExternal = product.isExternal ?? /^https?:/.test(product.href);
  const displayCategory = product.categoryTag?.startsWith("//")
    ? product.categoryTag
    : product.categoryTag
    ? \`// \${product.categoryTag.toUpperCase()}\`
    : "// PROPRIETARY PLATFORM";

  return (
    <article className={cn("h-full min-w-0 flex flex-col rounded-[6px] border border-[#17252D]/10 bg-[#B5CBD6] p-4 sm:p-5 text-[#17252D]", className)}>
      <Link 
        href={product.href} 
        target={isExternal ? "_blank" : undefined} 
        rel={isExternal ? "noopener noreferrer" : undefined} 
        className="block rounded-[4px] bg-[#8EAAB9] p-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#17252D]"
      >
        <div className="relative aspect-[16/9] overflow-hidden rounded-[3px] bg-[#0B1013]">
          {product.image && (
            <Image 
              src={product.image} 
              alt={\`\${product.name} preview\`} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
              className="object-cover object-top" 
            />
          )}
        </div>
      </Link>
      <div className="mt-6">
        {displayCategory && (
          <p className="mb-2 font-mono text-[10px] tracking-wider uppercase text-[#3E5B6B]">
            {displayCategory}
          </p>
        )}
        <Link 
          href={product.href} 
          target={isExternal ? "_blank" : undefined} 
          rel={isExternal ? "noopener noreferrer" : undefined} 
          className="block"
        >
          <h3 className="font-sans text-[18px] sm:text-[20px] font-medium leading-7 tracking-[-0.015em] hover:text-[#385568] transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.status && (
          <p className="mt-1 text-sm font-sans text-[#3E5B6B]">
            {product.status}
          </p>
        )}
        {product.description && (
          <p className="mt-3 text-[15px] sm:text-[16px] leading-6 font-sans text-[#3E5B6B]">
            {product.description}
          </p>
        )}
      </div>
      <div className="mt-auto pt-10 sm:pt-12">
        <LiquidButton 
          href={product.href} 
          target={isExternal ? "_blank" : undefined} 
          rel={isExternal ? "noopener noreferrer" : undefined} 
          variant="primary" 
          size="default"
        >
          {product.ctaText ?? (isExternal ? "Launch Platform" : "Explore Platform")}
        </LiquidButton>
      </div>
    </article>
  );
}`;

if (!oldProductCardRegex.test(norm)) {
  console.error("oldProductCardRegex did not match");
  process.exit(1);
}
norm = norm.replace(oldProductCardRegex, newProductCard);

// Update section padding and grid container
const oldContainer = `<div className="w-full bg-[#A2BECC] pb-32 pt-8 border-t border-[#D5E2E9]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 space-y-12">`;

const newContainer = `<div className="w-full bg-[#A2BECC] px-6 md:px-10 xl:px-16 2xl:px-24 pb-32 border-t border-[#D5E2E9] pt-12">
        <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto space-y-12">`;

if (norm.includes(oldContainer)) {
  norm = norm.replace(oldContainer, newContainer);
}

// Update items stack
const oldGrid = `{/* Product Cards Stack */}
          {items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {items.map((product) => (
                <ProductCard key={product.name} product={product} />
              ))}
            </div>
          ) : (`;

const newGrid = `{/* Product Cards Stack (Matching Portfolio Architectural Frame) */}
          {items.length > 0 ? (
            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-[#D5E2E9]">
                <h2 className="font-mono text-xs sm:text-sm font-bold text-[#17252D] tracking-[0.2em] uppercase">
                  Proprietary Platforms
                </h2>
                <span className="font-mono text-xs text-[#55788D] tracking-widest">[ 01 ]</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-5xl">
                {items.map((product) => (
                  <ProductCard key={product.name} product={product} />
                ))}
              </div>
            </div>
          ) : (`;

if (norm.includes(oldGrid)) {
  norm = norm.replace(oldGrid, newGrid);
} else {
  console.log("oldGrid literal not matched, checking regex...");
  const oldGridRegex = /\{\/\* Product Cards Stack \*\/\}[\s\S]*?<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">[\s\S]*?<\/div>\s*\)\s*:\s*\(/;
  if (oldGridRegex.test(norm)) {
    norm = norm.replace(oldGridRegex, newGrid);
  }
}

const finalContent = isCrlf ? norm.replace(/\n/g, "\r\n") : norm;
fs.writeFileSync("grow-x/components/marketing/ProductCatalogTemplate.tsx", finalContent, "utf-8");
console.log("Successfully updated ProductCatalogTemplate.tsx to match Portfolio cards design");
