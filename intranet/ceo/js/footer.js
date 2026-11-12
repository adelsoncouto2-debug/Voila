const footerScriptUrl = document.currentScript.src;
const intranetFooterRootUrl = new URL("../", footerScriptUrl);
const siteFooterRootUrl = new URL("../../../", footerScriptUrl);

fetch(new URL("components/footer.html", intranetFooterRootUrl))
  .then((response) => {
    if (!response.ok) {
      throw new Error(`Falha ao carregar o rodapé: HTTP ${response.status}`);
    }
    return response.text();
  })
  .then((data) => {
    document.getElementById("footer").innerHTML = data
      .replaceAll("{{SITE_ROOT}}", siteFooterRootUrl.href)
      .replaceAll("{{INTRANET_ROOT}}", intranetFooterRootUrl.href);
  })
  .catch((error) => console.error("Erro ao carregar o footer:", error));
