var body = document.getElementsByTagName("BODY")[0];


chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id,{call: 'devolverNumero'},function(response){
      // var spanelem = document.createElement("span");
      // spanelem.textContent = response.results;
      //
      // body.appendChild(spanelem);
      var promedios = new Array(20);
      for (var i = 0; i < promedios.length; i++){
        var suma = 0;
        for (var j = 0; j < response.ranksForResult[i].length; j++){
          suma += response.ranksForResult[i][j];
        }
        promedios[i] = suma/response.ranksForResult[i].length;
      }
      var listaresultados = response.results;
      var lengths = new Array();
      for (var i = 0; i < listaresultados.length; i++) {
        lengths.push(listaresultados[i].length);
      }
      var maxlength = Math.max(...lengths);

      for (var i = 0; i < maxlength; i++){
        for (var j = 0; j < listaresultados.length; j++){
          if (i < listaresultados[j].length){
            var aelem = document.createElement("a");

            aelem.href = listaresultados[j][i].urltarget;
            if ((j == 0) && (typeof response.textForResult[i] !== 'undefined')){
              aelem.textContent = "Resultado "+(i+1)+" de "+listaresultados[j][i].urlsrc+" ("+aelem.hostname+") | Posicion promedio "+(promedios[i] + 1)+" ("+response.textForResult[i]+")" ;
            }else {
              aelem.textContent = "Resultado "+(i+1)+" de "+listaresultados[j][i].urlsrc+" ("+aelem.hostname+")";

            }
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
