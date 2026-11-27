import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import pageHtml from "../padrinhos/page.html?raw";
import padrinhosCss from "../padrinhos/padrinhos.css?url";
import padrinhosOverridesCss from "../padrinhos/padrinhos-overrides.css?url";
import { startBurgerScrub } from "../padrinhos/burger-scrub";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Padrinhos — Smash com crosta e personalidade" },
      { name: "description", content: "Padrinhos Smash Original — smash com crosta e personalidade em Brasília." },
      { property: "og:title", content: "Padrinhos — Smash com crosta e personalidade" },
      { property: "og:description", content: "Padrinhos Smash Original — smash com crosta e personalidade em Brasília." },
      { name: "theme-color", content: "#F6F0E8" },
    ],
    links: [
      { rel: "icon", type: "image/webp", href: "/padrinhos-avatar.webp" },
      { rel: "apple-touch-icon", href: "/padrinhos-avatar.webp" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Sans:wght@400;500;600;700;800&display=swap" },
      { rel: "stylesheet", href: padrinhosCss },
      { rel: "stylesheet", href: padrinhosOverridesCss },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => startBurgerScrub(), []);
  return <div dangerouslySetInnerHTML={{ __html: pageHtml }} />;
}
