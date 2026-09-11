import "./page-transition.css";

let leaving = false;
export async function navigateWithFade(href: string) {
  if (leaving) return;
  leaving = true;
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const fade = document.body.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 360, easing: "ease-in-out", fill: "forwards",
    });
    await fade.finished.catch(() => {});
  }
  location.assign(href);
}

document.addEventListener("click", event => {
  if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target instanceof Element
    ? event.target.closest<HTMLAnchorElement>("a[data-page-transition]") : null;
  if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
  event.preventDefault();
  void navigateWithFade(link.href);
}, { capture: true });

// A history restore must not keep the outgoing opacity animation.
window.addEventListener("pageshow", event => {
  if (event.persisted) {
    leaving = false;
    document.body.getAnimations().forEach(animation => animation.cancel());
  }
});
