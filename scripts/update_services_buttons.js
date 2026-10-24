const fs = require("fs");
const { execSync } = require("child_process");

const original = execSync('git -C grow-x show 36e2efe3:"app/(marketing)/services/page.tsx"', { encoding: "utf-8" });

const normOriginal = original.replace(/\r\n/g, "\n");
let normUpdated = normOriginal.replace(
  'import { Button } from "@/components/ui/Button";',
  'import { LiquidButton } from "@/components/ui/LiquidButton";'
);

const targetBlock = `{/* Action Button */}
                      <div className="pt-6 mt-auto">
                        {service.buttonHref.startsWith("http") ? (
                          <a 
                            href={service.buttonHref} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-full block"
                          >
                            <Button
                              className={cn(
                                "w-full uppercase font-semibold text-[12px] tracking-[0.04em] py-3.5 sm:py-4 transition-all duration-200 shadow-sm !rounded-none rounded-none cursor-pointer border border-[#22282C] bg-[#22282C] text-[#FFFFFF] hover:bg-[#343D43] active:scale-[0.99]"
                              )}
                            >
                              {service.buttonText}
                            </Button>
                          </a>
                        ) : (
                          <Link href={service.buttonHref} className="w-full block">
                            <Button
                              className={cn(
                                "w-full uppercase font-semibold text-[12px] tracking-[0.04em] py-3.5 sm:py-4 transition-all duration-200 shadow-sm !rounded-none rounded-none cursor-pointer border border-[#22282C] bg-[#22282C] text-[#FFFFFF] hover:bg-[#343D43] active:scale-[0.99]"
                              )}
                            >
                              {service.buttonText}
                            </Button>
                          </Link>
                        )}
                      </div>`;

const replacementBlock = `{/* Action Button with Fluid Fill Hover */}
                      <div className="pt-6 mt-auto">
                        <LiquidButton
                          href={service.buttonHref}
                          target={service.buttonHref.startsWith("http") ? "_blank" : undefined}
                          rel={service.buttonHref.startsWith("http") ? "noopener noreferrer" : undefined}
                          className="w-full"
                          size="default"
                        >
                          {service.buttonText}
                        </LiquidButton>
                      </div>`;

const normTarget = targetBlock.replace(/\r\n/g, "\n");
const normReplacement = replacementBlock.replace(/\r\n/g, "\n");

if (!normUpdated.includes(normTarget)) {
  console.error("Target block not matched!");
  process.exit(1);
}

normUpdated = normUpdated.replace(normTarget, normReplacement);
fs.writeFileSync("grow-x/app/(marketing)/services/page.tsx", normUpdated, "utf-8");
console.log("Successfully updated grow-x/app/(marketing)/services/page.tsx");
