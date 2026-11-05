const footerScriptUrl = document.currentScript.src;
const intranetFooterRootUrl = new URL("../", footerScriptUrl);
const siteFooterRootUrl = new URL("../../../", footerScriptUrl);

fetch(new URL("components/footer.html", intranetFooterRootUrl))
  .then((response) => response.text())
  .then((data) => {
    data = data
      .replaceAll("{{SITE_ROOT}}", siteFooterRootUrl.href)
      .replaceAll("{{INTRANET_ROOT}}", intranetFooterRootUrl.href);
    document.getElementById("footer").innerHTML = data;
  })
  .catch((error) =>
    console.error("Erro ao carregar o rodapé da intranet:", error),
  );
