(function () {
    const fEls = document.querySelectorAll(".reveal");
    if (!fEls.length) return;

    const fObs = new IntersectionObserver(
        (entries) => {
            for (const e of entries) {
                if (e.isIntersecting) {
                    e.target.classList.add("isVisible");
                    fObs.unobserve(e.target);
                }
            }
        },
        { root: null, threshold: 0.15 }
    );

    fEls.forEach((el) => fObs.observe(el));
})();