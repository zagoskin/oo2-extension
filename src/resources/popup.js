var body = document.getElementsByTagName("BODY")[0];


chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id,{call: 'devolverNumero'},function(response){
      // var spanelem = document.createElement("span");
      // spanelem.textContent = response.results;
      //
      // body.appendChild(spanelem);
      var listaresultados = response.results;
      var lengths = new Array();
      for (var i = 0; i < listaresultados.length; i++) {
        lengths.push(listaresultados[i].length);
      }
      var maxlength = Math.max(...lengths);
      console.log(maxlength);
      console.log(listaresultados);
      for (var i = 0; i < maxlength; i++){
        for (var j = 0; j < listaresultados.length; j++){
          if (i < listaresultados[j].length){
            var aelem = document.createElement("a");

            aelem.href = listaresultados[j][i].urltarget;
            aelem.textContent = "Resultado "+(i+1)+" de "+listaresultados[j][i].urlsrc+" ("+aelem.hostname+")";

            aelem.style.padding = "2px";
            aelem.style.fontWeight = "550";
            body.appendChild(aelem);
            var salto = document.createElement("br");
            body.appendChild(salto);
          }
        }
      }
  });
});
