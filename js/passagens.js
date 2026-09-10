document.addEventListener("DOMContentLoaded",function(){
	const botoes = document.querySelectorAll(".format-button");
	botoes.forEach(function(botao){

		botao.addEventListener("click",function(){

			botoes.forEach(function(b){
				b.classList.remove("active");
			});

			this.classList.add("active");

		});

	});

});