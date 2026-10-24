const fs = require("fs");

let content = fs.readFileSync("grow-x/components/layout/Navbar.tsx", "utf-8");
const isCrlf = content.includes("\r\n");
let norm = content.replace(/\r\n/g, "\n");

// 1. Add isWordmarkHidden state
const targetState = `export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);`;

const replaceState = `export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isWordmarkHidden, setIsWordmarkHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);`;

if (!norm.includes(targetState)) {
  console.error("targetState not found");
  process.exit(1);
}
norm = norm.replace(targetState, replaceState);

// 2. Update scroll handler
const targetScroll = `  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);`;

const replaceScroll = `  useEffect(() => {
    let ticking = false;
    let prevScrolled = typeof window !== "undefined" ? window.scrollY > 20 : false;
    let prevHidden = typeof window !== "undefined" ? window.scrollY > 120 : false;

    if (prevScrolled) setIsScrolled(true);
    if (prevHidden) setIsWordmarkHidden(true);

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const nextScrolled = scrollY > 20;
          const nextHidden = scrollY > 120;

          if (nextScrolled !== prevScrolled) {
            setIsScrolled(nextScrolled);
            prevScrolled = nextScrolled;
          }
          if (nextHidden !== prevHidden) {
            setIsWordmarkHidden(nextHidden);
            prevHidden = nextHidden;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);`;

if (!norm.includes(targetScroll)) {
  console.error("targetScroll not found");
  process.exit(1);
}
norm = norm.replace(targetScroll, replaceScroll);

// 3. Update centered wordmark container and tabIndex/aria-hidden
const targetLogo = `            {/* Centered Serif Logo (True absolute mathematical center on all devices) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto flex items-center justify-center">
              {(() => {
                const resolvedHref = getAbsoluteUrl("/");
                const isExternal = resolvedHref.startsWith("http") && isMounted;
                if (isExternal) {
                  return (
                    <a href={resolvedHref} className="flex items-center group notranslate" translate="no" aria-label="GrowxLabs home">
                      <div className="flex items-center text-base sm:text-xl md:text-2xl font-serif font-bold tracking-tight transition-transform group-hover:scale-[1.02] duration-300 whitespace-nowrap">
                        <span className={logoColor1}>GrowxLabs</span>
                        <span className={logoColor2}>.tech</span>
                      </div>
                    </a>
                  );
                }
                return (
                  <Link href="/" className="flex items-center group notranslate" translate="no" aria-label="GrowxLabs home">
                    <div className="flex items-center text-base sm:text-xl md:text-2xl font-serif font-bold tracking-tight transition-transform group-hover:scale-[1.02] duration-300 whitespace-nowrap">
                      <span className={logoColor1}>GrowxLabs</span>
                      <span className={logoColor2}>.tech</span>
                    </div>
                  </Link>
                );
              })()}
            </div>`;

const replaceLogo = `            {/* Centered Serif Logo (True absolute mathematical center on all devices; smoothly fades out on scroll >120px to prevent overlapping content) */}
            <div 
              className={cn(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center transition-[opacity,visibility] duration-[250ms] ease-out motion-reduce:transition-none",
                isWordmarkHidden 
                  ? "opacity-0 pointer-events-none invisible" 
                  : "opacity-100 pointer-events-auto visible"
              )}
              aria-hidden={isWordmarkHidden ? "true" : undefined}
            >
              {(() => {
                const resolvedHref = getAbsoluteUrl("/");
                const isExternal = resolvedHref.startsWith("http") && isMounted;
                if (isExternal) {
                  return (
                    <a 
                      href={resolvedHref} 
                      className="flex items-center group notranslate" 
                      translate="no" 
                      aria-label="GrowxLabs home"
                      tabIndex={isWordmarkHidden ? -1 : 0}
                    >
                      <div className="flex items-center text-base sm:text-xl md:text-2xl font-serif font-bold tracking-tight transition-transform group-hover:scale-[1.02] duration-300 whitespace-nowrap">
                        <span className={logoColor1}>GrowxLabs</span>
                        <span className={logoColor2}>.tech</span>
                      </div>
                    </a>
                  );
                }
                return (
                  <Link 
                    href="/" 
                    className="flex items-center group notranslate" 
                    translate="no" 
                    aria-label="GrowxLabs home"
                    tabIndex={isWordmarkHidden ? -1 : 0}
                  >
                    <div className="flex items-center text-base sm:text-xl md:text-2xl font-serif font-bold tracking-tight transition-transform group-hover:scale-[1.02] duration-300 whitespace-nowrap">
                      <span className={logoColor1}>GrowxLabs</span>
                      <span className={logoColor2}>.tech</span>
                    </div>
                  </Link>
                );
              })()}
            </div>`;

if (!norm.includes(targetLogo)) {
  console.error("targetLogo not found");
  process.exit(1);
}
norm = norm.replace(targetLogo, replaceLogo);

const finalContent = isCrlf ? norm.replace(/\n/g, "\r\n") : norm;
fs.writeFileSync("grow-x/components/layout/Navbar.tsx", finalContent, "utf-8");
console.log("Successfully updated grow-x/components/layout/Navbar.tsx");
