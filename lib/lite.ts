// lite = reduced motion OR <768px: poster frames + simple fades, no pins.
export const getLite = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  window.innerWidth < 768;

export const subscribeLite = (cb: () => void) => {
  const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
  mm.addEventListener("change", cb);
  window.addEventListener("resize", cb);
  return () => {
    mm.removeEventListener("change", cb);
    window.removeEventListener("resize", cb);
  };
};
