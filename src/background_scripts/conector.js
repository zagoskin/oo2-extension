'use strict';

console.log('Connecting to DrafP2P');

class ControlEvent extends CustomEvent{

	constructor(name,detail){

        super(
            name,
            {
             detail:
             {
               message: detail,
               time: new Date()
             },
             bubbles: true,
             cancelable: true
        });

        this.nameEvent=name;
        this.detailMessage=detail;
        this.inicio=new Date();
        this.customTarget=null;
        this.finishEvent=false;
		this.finishTime;
		this.data;
	}

	setData(data){
		this.data = data;
	}

	getData(){
		return this.data;
	}

	getEvent(){
        return this.event;
    }

    getName(){
        return this.nameEvent;
	}

	assignEvent(objeto,callback){
        try {
			
			objeto.addEventListener(this.nameEvent,callback, false);
			
        } catch (error) {
            console.log(error);
            console.log('Error al asignar objeto');
        }
	}

	removeEvent(objeto,callback){
        try {
            objeto.removeEventListener(this.nameEvent,callback,true);
        } catch (error) {
            console.log('Error al remover objeto');
        }
	}
	
}

class ConectorP2P{
	
	constructor(){
		try {

			this.extensionParent="";
			this.port=null;
			this.extensionName=""
			this.messageRequest=[];
			this.messageResponse=[];
			this.peername="";
			this.extensionId="";
			this.resultQuery=null;
			this.signal=false;
			this.msjData;
			this.controlMessage=new ControlEvent('controlMessage','onmessage');
			this.elementDom = document.createElement("BUTTON");
			this.listenEventMSG = document.createElement("BUTTON");
			this.customExtension;

		} catch(e) {
			// statements
			console.log('Error al instanciar un conectorP2P ',e);
		}
	}

	setExtension(objeto){
		this.customExtension=objeto;
	}

	getExtension(){
		return this.customExtension;
	}

	getResultQuery(){
		return this.resultQuery;
	}

	getData(){
		return this.msjData;
	}

	getNamePeer(){
		return this.peername;
	}

	connect(){
		try {
			
			this.port = browser.runtime.connect(
				  this.getParentConector()
			);

		} catch(e) {
			console.log('Error al realizar conector');
			console.log(e);
		}
	}

	getData(){
		return this.msjData;
	}

	sendEvent(data){

		console.log('Evento signal');
		//console.log(data);
		if (this.signal){
			this.msjData=data;
			let check_msg = JSON.parse(data);
			if (check_msg.type=="responseQuery"){
				this.listenEventMSG.dispatchEvent(this.controlMessage);
			}else{
				this.elementDom.dispatchEvent(this.controlMessage);	
			}
		}
	}

	/*
	queryResult(event){
		console.log("Llamada a evento: ",event);
		//la funcion de instancia esta fuera del scope de la funcion de evento
		let dato = this.extractDataCallback();
		this.callback(dato);
	}
	*/

	getConnect(){
		try {
			return this.port;
		} catch(e) {
			console.log('Error al realizar retornar puerto de conexion');
			console.log(e);
		}
	}

	setName(name){
		this.extensionName=name;
	}
	getName(){
		return this.extensionName;
	}

	setParentConector(name){
		try {
			this.extensionParent=name;
		} catch(e) {
			console.log(e);
		}
	}

	getParentConector(){
		return this.extensionParent;
	}

	sendData(obj){
		try {
			this.port.postMessage(JSON.stringify(obj));
		} catch(e) {
			console.log("Error al enviar datos desde la extension");
			console.log(e);
		}
	}

	sendQuery(query,callback){
		try {
				/*
				if (!this.port.onMessage.hasListener(callback)){
					this.port.onMessage.addListener(callback);
				}
				*/

				try{
					if (query.method){
						this.controlMessage.removeEvent(this.listenEventMSG,callback);
						this.controlMessage.assignEvent(this.listenEventMSG,callback);
					}else{
						this.controlMessage.removeEvent(this.elementDom,callback);	
						this.controlMessage.assignEvent(this.elementDom,callback);		
					}
					
				}catch(error) {
					console.log("No existe evento aun");
				}
				
				this.signal=true;
				this.getQuery(query);
				
		}catch(e){
				console.log("Error al enviar consulta remota");
				console.log(e);
			}
	}

	getExtensionId(){
			return this.extensionId;
	}

	setNameExtensionId(name){
			this.extensionId=name;
	}

	getQuery(query){
		try {

				let jsonQuery=query;
				//let resultado=null;
				let data=null;
				if (jsonQuery.data){
						data=jsonQuery.data;
				}

				let peerslist={
						'type':'queryExtension',
						'method':jsonQuery.method,
						'data':data,
						'extensioname':this.getName(),
						'extensionId':this.getExtensionId()
				};

				this.sendData(peerslist);

		} catch(e) {
				console.log("Error al realizar pedido de peers remotos.");
				console.log(e);
		}
	}

	getDataResponseQuery(msj){
		try {
				 console.log('Desde getDataResponseQuery conector Query: ${msj}');
				 let msj_data = JSON.parse(msj);
				 //console.log(msj_data);
				 switch (msj_data.type){
						case 'responseQuery':
								switch (msj_data.method){
										case 'getPeers':
												//console.log(msj_data.data.peers);
												this.resultQuery=msj_data.data.peers;
												break;
										case 'getSession':
												//console.log(msj_data.data.peers);
												this.resultQuery=msj_data.data;
												break;
								}
								break;
				 }
		} catch(e) {
				console.log("Error al realizar parser de query");
				console.log(e);
		}
	}

	removeListenerQuery(callback){
		try {
				if (this.port.onMessage.hasListener(callback)){
					this.port.onMessage.removeListener(callback);
				}else{
					console.log("No existe una listener a remover.");
				}
		} catch(e) {
				console.log("Remove listener query");
				console.log(e);
		}
	}

	getRequestMessage(){
		try {
			let obj={
				'type':'messagesRequest',
				'extensioname':this.getName()
			};
			this.sendData(obj);
		} catch(e) {
			console.log("Error al solicitar mensajes response de la extension.");
			console.log(e);
		}
	}

	getResponseMessage(){
		try {
			let obj={
				'type':'messagesResponse',
				'extensioname':this.getName()
			};
			this.sendData(obj);
		} catch(e) {
			console.log("Error al solicitar mensajes request de la extension.");
			console.log(e);
		}
	}


	extractDataCallback(){
		try {
			
			let dato=null;
			//obtiene la lista de la querry al plugin principal p2p
			this.getDataResponseQuery(this.getData());
			//con la respuesta async obtenemos el resultado correspondiente ya parseado
			if (this.getResultQuery()!=null || this.getResultQuery()!="undefined"){
			  dato=this.getResultQuery();
			}else{
			  console.log("No hay datos disponibles");
			  return null;
			}
			
			console.log("Indo desde extract_data: ",dato);
			
			return dato;

		} catch (error) {
			console.log("Error al realizar extrac: ",error);
		}
	}

	instalarExtension(){
		try {
			let install={
				'type':'addExtension',
				'name': this.getName()
			};
			this.sendData(install);
		} catch(e) {
			console.log("Error al instalar la extension");
			console.log(e);
		}
	}

	sendDataType(name,id,data,peer,type){
		try {
			
			let objquery={
				'extensioname':name,
				'type':type,
				'data':data,
				'id':id,
				'destiny':peer
			  };

			this.sendData(objquery);

		} catch (error) {
			console.log("Error al realizar send request");
		}
	}

}

class ListActionExtension {

	constructor(){
			this.actionCalls = [];
	}

	addAction(c){
			this.actionCalls.push(c);
	}

	getAction(name){
			try {

					return this.actionCalls.find(item => item.getName()==String(name));

			} catch (error) {
					console.error("Error al solicitar action de extension: ",error);
			}
	}
}

class ActionAddon {

	constructor(name){
			this.name = name;
	}
	getName(){
			return this.name;
	}
	setName(name){
			this.name = name;
	}

	do(msj=null,obj=null){
			console.log("Implementar");
	}
}

class RequestAction extends ActionAddon {

	constructor(name){
			super(name);

	}

	do(msj_data,obj=null){
			try {

			console.log("request sin accept");
									browser.notifications.create({
													"type": "basic",
													"iconUrl": browser.extension.getURL("icons/quicknote-48.png"),
													"title": "Llega un request del Peer remoto: "+msj_data.source,
													"message": "Para aceptar el request tiene que aceptar el mensaje"
									});
			} catch (error) {
					console.error("Error al ejecutar RequestCMD: ",error);
			}
	}
}

class RequestAcceptAction extends ActionAddon {
	constructor(name){
			super(name);
	}

	do(msj_data,conectorp2p){
			try {

							console.log("Es un request");

							console.log(msj_data);
							
							let msjRemote = msj_data.data;
							
							console.log(msjRemote);
							
							if (msjRemote.data.automatic){
									console.log("auditar");
									conectorp2p.automaticProcessing(msjRemote.data,msjRemote.source);
							}else{
									//this.conector.getExtension().processRequest(msjRemote.data, msjRemote.source);
									//Como es por herencia la instancia hija implementa processrequest
									conectorp2p.processRequest(msjRemote.data, msjRemote.source);
							}

			} catch (error) {
					console.error("Error al ejecutar RequestCMD: ",error);
			}
	}
}

class ResponseAction extends ActionAddon {
	constructor(name){
			super(name);
	}

	do(msj_data,conectorp2p=null){
			try {
					console.log("response llego");
											browser.notifications.create({
															"type": "basic",
															"iconUrl": browser.extension.getURL("icons/quicknote-48.png"),
															"title": "Llega un response del Peer remoto: "+msj_data.source,
															"message": "Para aceptar el response tiene que aceptar el mensaje"
											});
			} catch (error) {
					console.error("Error al ejecutar RequestCMD: ",error);
			}
	}
}


class ResponseAcceptAction extends ActionAddon {
	constructor(name){
			super(name);
	}

	do(msj_data,conectorp2p=null){
			try {
					console.log("Es un response");
					
					console.log(msj_data);
					
					let responseData = msj_data.data;
					
					conectorp2p.receiveResponse(responseData.data, responseData.source);

			} catch (error) {
					console.error("Error al ejecutar RequestCMD: ",error);
			}
	}
}

class AbstractP2PExtensionBackground {
	
	constructor(){
		this.portEvent;
		this.conector;
		//patch callback handler;
		this.callback;
		
	}
	
    connect(){

		this.conector = new ConectorP2P();
		this.conector.setExtension(this);
		this.conector.setParentConector("device1@oncosmos.com");
        this.conector.setName(this.getExtensionName());
		this.conector.setNameExtensionId(this.getExtensionId());
        this.conector.connect();
		this.portEvent=this.conector.getConnect();
		
		//Acciones por extension
		let callExtensions = new ListActionExtension();
		callExtensions.addAction(new RequestAction("Request"));
		callExtensions.addAction(new RequestAcceptAction("AcceptRequest"));
		callExtensions.addAction(new ResponseAction("Response"));
		callExtensions.addAction(new ResponseAcceptAction("AcceptResponse"));

		//this.initialize();
		this.portEvent.onMessage.addListener((msj) =>{

				let msj_data = JSON.parse(msj);

				this.conector.sendEvent(msj);

				let actionCall = callExtensions.getAction(msj_data.type);

				if (!!actionCall){
						actionCall.do(msj_data,this);
				}else{
						console.log(`La accion ${msj_data.type} solicitada no esta soportado.`)
				}

		});
		
		//this.initialize();
		/*
		this.portEvent.onMessage.addListener((msj) =>{

			let msj_data = JSON.parse(msj);
			this.conector.sendEvent(msj);
			switch (msj_data.type){
				case "Message":
					console.log("Arriva mensaje");
					break
				case "Request":
						console.log("request sin accept");
						browser.notifications.create({
								"type": "basic",
								"iconUrl": browser.extension.getURL("icons/quicknote-48.png"),
								"title": "Llega un request del Peer remoto: "+msj_data.source,
								"message": "Para aceptar el request tiene que aceptar el mensaje"
						});
					  break;
				case "AcceptRequest":
					try {			
						console.log("Es un request");
						console.log(msj_data);
						let msjRemote = msj_data.data;
						if (msjRemote.data.automatic){
							console.log("auditar");
							this.automaticProcessing(msjRemote.data,msjRemote.source);
						}else{
							//this.conector.getExtension().processRequest(msjRemote.data, msjRemote.source);
							//Como es por herencia la instancia hija implementa processrequest
							this.processRequest(msjRemote.data, msjRemote.source);
						}	
					} catch (error) {
						console.log("Error al procesar requestAccept: ",error);
					}
					
					break;
				case "Response":
					console.log("response llego");
						browser.notifications.create({
								"type": "basic",
								"iconUrl": browser.extension.getURL("icons/quicknote-48.png"),
								"title": "Llega un response del Peer remoto: "+msj_data.source,
								"message": "Para aceptar el response tiene que aceptar el mensaje"
						});
					break;	
				case "AcceptResponse":
					console.log("Es un response");
					console.log(msj_data);
					let responseData = msj_data.data;
					this.receiveResponse(responseData.data, responseData.source);
					break;

			}
		});
		*/

		
		this.conector.instalarExtension();
    }
 
    initialize (){
		console.log("Algo para inicio");
    }
 	
	getPeers(callback){
		try {
			this.conector.sendQuery({method:'getPeers',data:{}},callback);
		} catch (error) {
			console.log("Error al realizar peticion de peers: ",error);
		}
	}

    sendResponse(msg, peer){
		console.log("Send response");
		this.conector.sendDataType(this.getExtensionName(),this.getExtensionId(),msg,peer,'Response');
    }
 
    sendRequest(msg, peer){
		this.conector.sendDataType(this.getExtensionName(),this.getExtensionId(),msg,peer,'Request');
		console.log("Send Request");
	}

	getDataCallBack(){
		return this.conector.extractDataCallback();
	}

}