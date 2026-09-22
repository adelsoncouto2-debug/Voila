function getBasePath() {
  if (location.hostname.endsWith("github.io")) {
    const partes = location.pathname.split("/").filter(Boolean);
    return partes.length > 0 ? "/" + partes[0] : "";
  }
  return "";
}

function basePath(caminho) {
  if (!caminho.startsWith("/")) caminho = "/" + caminho;
  return getBasePath() + caminho;
}

fetch(basePath("/components/footer.html"))
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
  })
  .catch((error) => console.error("Erro ao carregar o footer:", error));
