(function verificarSeguranca(){
  const estaLogado = sessionStorage.getItem("usuarioLogado");
  if (estaLogado != "Voila@gmail.com"){
    alert("Acesso restrito! Identifique-se na tela de login.");
    window.location.href = "../index.html";
  }
})();
