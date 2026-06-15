(function () {
    const fCarousels = document.querySelectorAll("[data-carousel]");
    if (!fCarousels.length) return;

    function fInit(fWrap) {
        const fTrack = fWrap.querySelector(".carouselTrack");
        const fDots = fWrap.querySelectorAll(".carouselDot");
        const fItems = fWrap.querySelectorAll(".carouselItem");
        if (!fTrack || !fDots.length || !fItems.length) return;

        const fObs = new IntersectionObserver(
            (entries) => {
                // اختار العنصر الأكثر ظهورًا
                const fVisible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (!fVisible) return;

                const fIndex = Number(fVisible.target.getAttribute("data-index") || 0);
                fDots.forEach((d, i) => d.classList.toggle("isOn", i === fIndex));
            },
            { root: fTrack, threshold: [0.55, 0.7, 0.85] }
        );

        fItems.forEach((it) => fObs.observe(it));

        // click on dots
        fDots.forEach((dot, i) => {
            dot.addEventListener("click", () => {
                const fTarget = fItems[i];
                if (fTarget) fTarget.scrollIntoView({ behavior: "smooth", inline: "start" });
            });
        });
    }

    fCarousels.forEach(fInit);
})();