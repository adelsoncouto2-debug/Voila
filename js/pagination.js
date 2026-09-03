/**
 * Componente reutilizável de Paginação (bolinhas)
 */

function createPaginator({
  dotsContainerId,
  items,
  itemsPerPage = 6,
  maxPages = 5,
  withNumbers = false,
  onPageChange,
}) {
  const dotsContainer = document.getElementById(dotsContainerId);

  if (!dotsContainer) {
    console.error(
      `[pagination] Elemento #${dotsContainerId} não encontrado no HTML.`,
    );
    return null;
  }

  const totalPagesCalculadas = Math.ceil(items.length / itemsPerPage) || 1;
  const totalPages = Math.min(totalPagesCalculadas, maxPages);

  let currentPage = 0;

  function getItemsForPage(pageIndex) {
    const start = pageIndex * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }

  function renderDots() {
    dotsContainer.innerHTML = "";
    dotsContainer.classList.toggle("with-numbers", withNumbers);

    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "pagination-dot" + (i === currentPage ? " active" : "");
      dot.setAttribute("aria-label", `Ir para página ${i + 1}`);
      if (withNumbers) dot.textContent = i + 1;

      dot.addEventListener("click", () => goToPage(i));
      dotsContainer.appendChild(dot);
    }
  }

  function goToPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    currentPage = pageIndex;
    renderDots();

    if (typeof onPageChange === "function") {
      onPageChange(getItemsForPage(currentPage), currentPage);
    }
  }

  renderDots();
  goToPage(0);

  return {
    next: () => goToPage(currentPage + 1),
    prev: () => goToPage(currentPage - 1),
    goToPage,
    getCurrentPage: () => currentPage,
    getTotalPages: () => totalPages,
  };
}
