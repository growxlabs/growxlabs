const fs = require("fs");

let content = fs.readFileSync("grow-x/components/ui/LiquidButton.tsx", "utf-8");
const isCrlf = content.includes("\r\n");
let norm = content.replace(/\r\n/g, "\n");

const target = `    // Primary dark button: Midnight #22282C -> Earth #E9E7E1 fill rising from bottom
    primary: {
      container: "bg-[#22282C] text-[#FFFFFF] border border-[#22282C]",
      fill: "bg-[#E9E7E1]",
      hoverText: "group-hover:text-[#22282C] group-focus-visible:text-[#22282C] group-active:text-[#22282C]",
    },`;

const replacement = `    // Primary dark button: Midnight #22282C -> Air Force Blue #A2BECC fill rising from bottom
    primary: {
      container: "bg-[#22282C] text-[#FFFFFF] border border-[#22282C]",
      fill: "bg-[#A2BECC]",
      hoverText: "group-hover:text-[#22282C] group-focus-visible:text-[#22282C] group-active:text-[#22282C]",
    },`;

if (!norm.includes(target)) {
  console.error("Target primary block not found");
  process.exit(1);
}
norm = norm.replace(target, replacement);

const targetGhost = `    ghost: {
      container: "bg-transparent text-[#22282C] border border-transparent",
      fill: "bg-[#E9E7E1]",
      hoverText: "group-hover:text-[#22282C] group-focus-visible:text-[#22282C] group-active:text-[#22282C]",
    },`;

const replaceGhost = `    ghost: {
      container: "bg-transparent text-[#22282C] border border-transparent",
      fill: "bg-[#A2BECC]",
      hoverText: "group-hover:text-[#22282C] group-focus-visible:text-[#22282C] group-active:text-[#22282C]",
    },`;

if (norm.includes(targetGhost)) {
  norm = norm.replace(targetGhost, replaceGhost);
}

const finalContent = isCrlf ? norm.replace(/\n/g, "\r\n") : norm;
fs.writeFileSync("grow-x/components/ui/LiquidButton.tsx", finalContent, "utf-8");
console.log("Successfully updated LiquidButton.tsx with Air Force Blue fill");
