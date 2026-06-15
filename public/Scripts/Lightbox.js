(function () {
    function fBuild() {
        const fRoot = document.createElement("div");
        fRoot.className = "lb";
        fRoot.innerHTML = `
      <div class="lbBack" data-lb-close="1"></div>
      <div class="lbPanel">
        <div class="lbImgWrap">
          <img class="lbImg" alt="" />
          <button class="lbClose" type="button" data-lb-close="1">×</button>
          <button class="lbNav lbPrev" type="button" data-lb-prev="1">‹</button>
          <button class="lbNav lbNext" type="button" data-lb-next="1">›</button>
        </div>
      </div>
    `;
        document.body.appendChild(fRoot);
        return fRoot;
    }

    let fLb = null;
    let fItems = [];
    let fIndex = 0;

    function fOpen(fNewItems, fNewIndex) {
        fItems = fNewItems;
        fIndex = fNewIndex;

        if (!fLb) fLb = fBuild();

        const fImg = fLb.querySelector(".lbImg");
        const fIt = fItems[fIndex];
        fImg.src = fIt.src;
        fImg.alt = fIt.alt || "";

        fLb.classList.add("isOpen");
        document.documentElement.style.overflow = "hidden";
    }

    function fClose() {
        if (!fLb) return;
        fLb.classList.remove("isOpen");
        document.documentElement.style.overflow = "";
    }

    function fMove(fDir) {
        if (!fItems.length) return;
        fIndex = (fIndex + fDir + fItems.length) % fItems.length;
        const fImg = fLb.querySelector(".lbImg");
        const fIt = fItems[fIndex];
        fImg.src = fIt.src;
        fImg.alt = fIt.alt || "";
    }

    document.addEventListener("click", (e) => {
        const fBtn = e.target.closest("[data-gallery-item]");
        if (fBtn) {
            const fGalleryId = fBtn.getAttribute("data-gallery") || "default";
            const fAll = Array.from(document.querySelectorAll(`[data-gallery="${fGalleryId}"][data-gallery-item]`));
            const fList = fAll.map((el) => ({
                src: el.getAttribute("data-src") || "",
                alt: el.getAttribute("data-alt") || ""
            }));
            const fNewIndex = Number(fBtn.getAttribute("data-index") || 0);
            fOpen(fList, fNewIndex);
            return;
        }

        if (e.target.closest("[data-lb-close]")) fClose();
        if (e.target.closest("[data-lb-prev]")) fMove(-1);
        if (e.target.closest("[data-lb-next]")) fMove(+1);
    });

    document.addEventListener("keydown", (e) => {
        if (!fLb || !fLb.classList.contains("isOpen")) return;
        if (e.key === "Escape") fClose();
        if (e.key === "ArrowLeft") fMove(-1);
        if (e.key === "ArrowRight") fMove(+1);
    });
})();