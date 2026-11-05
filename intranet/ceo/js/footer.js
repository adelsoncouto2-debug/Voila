function footerBasePath() {
  if (window.location.hostname.endsWith("github.io")) {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts.length ? `/${parts[0]}` : "";
  }
  return "";
}

fetch(`${footerBasePath()}/intranet/ceo/components/footer.html`)
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
  })
  .catch((error) => console.error("Erro ao carregar o footer:", error));
