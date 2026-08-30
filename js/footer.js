fetch("/components/footer.html") // Busca direto da raiz, ignorando em qual página você está
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("footer").innerHTML = data;
  })
  .catch((error) => console.error("Erro ao carregar o footer:", error));
