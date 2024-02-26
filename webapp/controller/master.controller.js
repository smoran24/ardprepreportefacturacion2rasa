sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/core/IconPool",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function (Controller, Button, Dialog, List, StandardListItem, Text, mobileLibrary, IconPool, JSONModel, SimpleType, ValidateException,
	Export, ExportTypeCSV) {

	var oView, oSAPuser, t, company = "",
		arregloT = [];
	return Controller.extend("AR_DP_REP_FACTURACIONREPORTE_RASA.AR_DP_REP_FACTURACIONREPORTE_RASA.controller.master", {

		onInit: function () {
			t = this;
			oView = this.getView();
			var oRouter =
				sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("master").attachMatched(this._onRouteMatched, this);
			//Sentencia para minimizar contenido
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                    var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
				dataType: 'json',
				url: appModulePath + "/services/userapi/currentUser",
				success: function (dataR, textStatus, jqXHR) {
					oSAPuser = dataR.name;
					// oSAPuser = "P001442";
					t.leerUsuario(oSAPuser);
				},
				error: function (jqXHR, textStatus, errorThrown) {}
			});
			//t.leerUsuario(oSAPuser);
			t.ConsultaSolicitante();

			// t.Consulta();
			t.ConsultaTpedido();
		},
		leerUsuario: function (oSAPuser) {
			var flagperfil = true;
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                    var appModulePath = jQuery.sap.getModulePath(appid);
			var url =appModulePath + '/destinations/IDP_Nissan/service/scim/Users/' + oSAPuser;
			//Consulta
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: false,
				success: function (dataR, textStatus, jqXHR) {
				if (dataR["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"] === undefined) {
						var custom = "";
					} else {
						var custom = dataR["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes;
					}
					//	console.log(dataR);
					for (var i = 0; i < dataR.groups.length; i++) {

						if (dataR.groups[i].value === "AR_DP_ADMINISTRADORDEALER" || dataR.groups[i].value === "AR_DP_USUARIODEALER") {
							// company = dataR.company;
							flagperfil = false;
							for (var x = 0; x < custom.length; x++) {
								if (custom[x].name === "customAttribute6") {
									company = custom[x].value;
								}
							}
							//console.log(flagperfil);
						}
					}
					console.log(company);
					if (!flagperfil) {

						oView.byId("dealer").setSelectedKey("0000" + company);
						oView.byId("dealer").setEditable(false);
						oView.byId("dealer1").setVisible(false);
						//oView.byId("espacio1").setVisible(false);
						// oView.byId("dealertxt").setVisible(false);
						oView.byId("dealertxt").setVisible(false);

						t.ConsultaDestinatario();

					} else {
						oView.byId("dealer").setEditable(true);
						oView.byId("dealer1").setVisible(true);
						//	oView.byId("espacio1").setVisible(true);
						// oView.byId("dealertxt").setVisible(true);
						oView.byId("dealertxt").setVisible(true);

					}
				},
				error: function (jqXHR, textStatus, errorThrown) {

				}
			});

		},
		// consulta solicitante
		ConsultaSolicitante: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                    var appModulePath = jQuery.sap.getModulePath(appid);
			var UrlSolicitante =appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/solicitante';
			//Consulta
			$.ajax({
				type: 'GET',
				url: UrlSolicitante,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					var cliente = new sap.ui.model.json.JSONModel(dataR.d.results);
					oView.setModel(cliente, "cliente");
				},
				error: function (jqXHR, textStatus, errorThrown) {
					//console.log(JSON.stringify(jqXHR));
				}
			});
		},
		ConsultaDestinatario: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                    var appModulePath = jQuery.sap.getModulePath(appid);
			var key = '%27' + oView.byId("dealer").getSelectedKey() + '%27'; //aqui rescatas el valor 
			var Destinatario = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/destinatario?$filter=SOLICITANTE%20eq%20';
			var url = Destinatario + key; // aca juntas la url con el filtro que quiere hacer 
			//	console.log(Destinatario);
			//Consulta
			$.ajax({
				type: 'GET',
				url:appModulePath + url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {

					var Destinatarios = new sap.ui.model.json.JSONModel(dataR.d.results);

					oView.setModel(Destinatarios, "Destinatarios");
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		},
		ConsultaFacturas: function () {
			var total = [];
			if (oView.byId("Factura").getValue() === "" && oView.byId("Fecha").getValue() === "" && oView.byId("Remito").getValue() === "") {
				var obj2 = {
					codigo: "03",
					descripcion: "Debe seleccionar al menos una Fecha, una Factura o Remito  "
				};
				var arr2 = [];
				arr2.push(obj2);
				t.popSucces(arr2, "ERROR");
			} else {
				var descPedido, descFactura;
				t.popCarga();

				if (oView.byId("Fecha").getValue() === "") {
					var desde = "";
					var hasta = "";
				} else {
					var desde = oView.byId("Fecha").getDateValue();
					var hasta = oView.byId("Fecha").getSecondDateValue();
					desde = new Date(desde).toISOString().slice(0, 10).replace(/\-/g, "");
					hasta = new Date(hasta).toISOString().slice(0, 10).replace(/\-/g, "");
				}

				var arrjson = []; //***
				var json = {
					"HeaderSet": {
						"Header": {
							"Nrofactura": "",
							"Nav_Header_Facturas": {
								"Facturas": [{
									"Familiamat": "", //
									"Tipopedido": oView.byId("cmbPedido").getSelectedKey(),
									"Factlegal": "",
									"Fechahasta": hasta,
									"Pedidodealer": "",
									"Pedidosap": "",
									"Nrofactura": (oView.byId("Factura").getValue()).trim(),
									"Material": (oView.byId("Material").getValue()).trim(),
									"Nroremito": (oView.byId("Remito").getValue()).trim(),
									"Modelo": "",
									"Fechadesde": desde,
									"Dealer": oView.byId("dealer").getSelectedKey()
								}]
							}
						}
					}
				};
				arrjson = JSON.stringify(json);
				// console.log(arrjson);
                var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                    var appModulePath = jQuery.sap.getModulePath(appid);
				var url = appModulePath + '/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Reporte/Facturacion';
				$.ajax({
					type: 'POST',
					url: url,
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					async: true,
					data: arrjson,
					timeout: 180000,
					success: function (dataR, textStatus, jqXHR) {
						t.cerrarPopCarga2();
						var arrT = [];
						var rutina = dataR.HeaderSet.Header.Nav_Header_Facturas.Facturas;
						//	console.log(rutina.length);
						if (rutina.length === undefined) {
							var fecha;
							var dia = rutina.Fecrem.substring(6, 8);
							var mes = rutina.Fecrem.substring(4, 6);
							var year = rutina.Fecrem.substring(0, 4);
							fecha = dia + "/" + mes + "/" + year;
							rutina.Fecrem = fecha;

							var dia1 = rutina.Fechadesde.substring(6, 8);
							var mes1 = rutina.Fechadesde.substring(4, 6);
							var year1 = rutina.Fechadesde.substring(0, 4);
							var fecha1 = dia1 + "/" + mes1 + "/" + year1;
							rutina.Fechadesde = fecha1;

							if (rutina.Tipopedido === "YNCI") {
								descPedido = "Pedido Inmovilizado";
							}
							if (rutina.Tipopedido === "YNCS") {
								descPedido = "Pedido Stock";
							}
							if (rutina.Tipopedido === "YNCU") {
								descPedido = "Pedido Urgente";
							}
							if (rutina.Tipopedido === "YNPI") {
								descPedido = "Pedido Interno";
							}
							if (rutina.Tipopedido === "YNG2") {
								descPedido = "Nota de Crédito";
							}
							if (rutina.Tipopedido === "YNRE") {
								descPedido = "Devolución";
							}

							if (rutina.Tipofactura === "YNFX") {
								descFactura = "Exportación";
							}
							if (rutina.Tipofactura === "YNRE") {
								descFactura = "Nota de Crédito";
							}
							if (rutina.Tipofactura === "YNFN") {
								descFactura = "Factura Local";
							}
							if (rutina.Tipofactura === "YNG2") {
								descFactura = "Nota de Crédito";
							}
							if (rutina.Tipofactura === "YNDV") {
								descFactura = "Nota de Débito";
							}
							var conti = ((Number(rutina.Precioconc) / Number(rutina.Cantfact)));
							conti = conti.toString();
							console.log(conti.split(".")[1]);
							if (conti.split(".")[1] > 0) {
								conti = conti.split(".")[0];
							} else if (conti === NaN) {
								conti = "";
							} else {
								conti = Number(conti).toFixed(2);
							}
							arrT.push({
								Cantfact: Number(rutina.Cantfact),
								Dealer: rutina.Dealer,
								Descmat: rutina.Descmat,
								Destmerc: rutina.Destmerc,
								Dirent: rutina.Dirent,
								Doclista: (rutina.Doclista).replace(/\./g, ","),
								Factlegal: rutina.Factlegal,
								Familiamat: rutina.Familiamat,
								Fechadesde: rutina.Fechadesde,
								Fechahasta: rutina.Fechahasta,
								Fecrem: rutina.Fecrem,
								Impiva: (rutina.Impiva).replace(/\./g, ","),
								Margenconc: rutina.Margenconc,
								Material: rutina.Material,
								Modelo: rutina.Modelo,
								Moneda: rutina.Moneda,
								Nrofactura: rutina.Nrofactura,
								Nroremito: rutina.Nroremito,
								Pedidodealer: rutina.Pedidodealer,
								Pedidosap: rutina.Pedidosap,
								Percep: rutina.Percep.replace(/\./g, ","),
								Porciva: (rutina.Porciva).replace(/\./g, ","),
								Preciocliente: (rutina.Preciocliente).replace(/\./g, ","),
								Precioconc: (rutina.Precioconc).replace(/\./g, ","),
								Tipofactura: rutina.Tipofactura,
								Tipopedido: rutina.Tipopedido,
								descPedido: descPedido,
								descFactura: descFactura,
								Total: (rutina.Total).replace(/\./g, ","),
								PrecioUnitario: conti.toString().replace(/\./g, ","),
								TotalImpuesto: ((parseFloat(rutina.Total) + parseFloat(rutina.Impiva)).toFixed(2)).toString().replace(/\./g, ","),
								TotalConc: (Number(rutina.Precioconc) * Number(rutina.Cantfact))

							});
						} else {
							for (var i = 0; i < rutina.length; i++) {
								var fecha;
								var dia = rutina[i].Fecrem.substring(6, 8);
								var mes = rutina[i].Fecrem.substring(4, 6);
								var year = rutina[i].Fecrem.substring(0, 4);
								fecha = dia + "/" + mes + "/" + year;
								rutina[i].Fecrem = fecha;
								var dia1 = rutina[i].Fechadesde.substring(6, 8);
								var mes1 = rutina[i].Fechadesde.substring(4, 6);
								var year1 = rutina[i].Fechadesde.substring(0, 4);
								var fecha1 = dia1 + "/" + mes1 + "/" + year1;
								rutina[i].Fechadesde = fecha1;
								if (rutina[i].Tipopedido === "YNCI") {
									descPedido = "Pedido Inmovilizado";
								}
								if (rutina[i].Tipopedido === "YNCS") {
									descPedido = "Pedido Stock";
								}
								if (rutina[i].Tipopedido === "YNCU") {
									descPedido = "Pedido Urgente";
								}
								if (rutina[i].Tipopedido === "YNPI") {
									descPedido = "Pedido Interno";
								}
								if (rutina[i].Tipopedido === "YNG2") {
									descPedido = "Nota de Crédito";
								}
								if (rutina[i].Tipopedido === "YNRE") {
									descPedido = "Devolución";
								}
								if (rutina[i].Tipofactura === "YNFX") {
									descFactura = "Exportación";
								}
								if (rutina[i].Tipofactura === "YNRE") {
									descFactura = "Nota de Crédito";
								}
								if (rutina[i].Tipofactura === "YNFN") {
									descFactura = "Factura Local";
								}
								if (rutina[i].Tipofactura === "YNG2") {
									descFactura = "Nota de Crédito";
								}
								if (rutina[i].Tipofactura === "YNDV") {
									descFactura = "Nota de Débito";
								}
								// Rut = oArgs.data.split(",")[0];
								// Cotizacion = oArgs.data.split(",")[1];
								var conti = ((Number(rutina[i].Precioconc) / Number(rutina[i].Cantfact)));
								conti = conti.toString();

								console.log(conti.split(".")[1]);
								if (conti.split(".")[1] > 0) {
									conti = conti.split(".")[0];
								} else if (conti === NaN) {
									conti = "";
								} else {
									conti = Number(conti).toFixed(2);
								}

								//	rutina[i].Precioconc = (rutina[i].Precioconc).replace(/\./g, ",")
								arrT.push({
									Cantfact: Number(rutina[i].Cantfact),
									Dealer: rutina[i].Dealer,
									Descmat: rutina[i].Descmat,
									Destmerc: rutina[i].Destmerc,
									Dirent: rutina[i].Dirent,
									Doclista: (rutina[i].Doclista).replace(/\./g, ","),
									Factlegal: rutina[i].Factlegal,
									Familiamat: rutina[i].Familiamat,
									Fechadesde: rutina[i].Fechadesde,
									Fechahasta: rutina[i].Fechahasta,
									Fecrem: rutina[i].Fecrem,
									Impiva: (rutina[i].Impiva).replace(/\./g, ","),
									Margenconc: rutina[i].Margenconc,
									Material: rutina[i].Material,
									Modelo: rutina[i].Modelo,
									Moneda: rutina[i].Moneda,
									Nrofactura: rutina[i].Nrofactura,
									Nroremito: rutina[i].Nroremito,
									Pedidodealer: rutina[i].Pedidodealer,
									Pedidosap: rutina[i].Pedidosap,
									Percep: rutina[i].Percep.replace(/\./g, ","),
									Porciva: (rutina[i].Porciva).replace(/\./g, ","),
									Preciocliente: (rutina[i].Preciocliente).replace(/\./g, ","),
									Precioconc: (rutina[i].Precioconc).replace(/\./g, ","),
									Tipofactura: rutina[i].Tipofactura,
									Tipopedido: rutina[i].Tipopedido,
									descPedido: descPedido,
									descFactura: descFactura,
									Total: (rutina[i].Total).replace(/\./g, ","),
									PrecioUnitario: conti.toString().replace(/\./g, ","),
									TotalImpuesto: ((parseFloat(rutina[i].Total) + parseFloat(rutina[i].Impiva)).toFixed(2)).toString().replace(/\./g, ","),
									TotalConc: (Number(rutina[i].Precioconc) * Number(rutina[i].Cantfact))

								});
							}
						}
						console.log(arrT);
						var dataT = new sap.ui.model.json.JSONModel(arrT);
						oView.setModel(dataT, "Facturacion");
						//	arregloT = arrT;
					},
					error: function (jqXHR, textStatus, errorThrown) {
						t.cerrarPopCarga2();
						var arrT = [];
						var dataT = new sap.ui.model.json.JSONModel(arrT);
						oView.setModel(dataT, "Facturacion");
					}

				});
			}

		},
		onListItemPress: function (oEvent) {
			var arrtotal = [];
			var json = oView.getModel("Facturacion").oData;
			var productPath = oEvent.getSource().getBindingContext("Facturacion").getPath().replace(/\//g, "");

			for (var i = 0; i < json.length; i++) {
				if (json[i].Nrofactura === json[productPath].Nrofactura) {
					arrtotal.push({
						Cantfact: Number(json[i].Cantfact),
						Dealer: json[i].Dealer,
						Descmat: json[i].Descmat,
						Destmerc: json[i].Destmerc,
						Dirent: json[i].Dirent,
						Doclista: json[i].Doclista,
						Factlegal: json[i].Factlegal,
						Familiamat: json[i].Familiamat,
						Fechadesde: json[i].Fechadesde,
						Fechahasta: json[i].Fechahasta,
						Fecrem: json[i].Fecrem,
						Impiva: json[i].Impiva,
						Margenconc: json[i].Margenconc,
						Material: json[i].Material,
						Modelo: json[i].Modelo,
						Moneda: json[i].Moneda,
						Nrofactura: json[i].Nrofactura,
						Nroremito: json[i].Nroremito,
						Pedidodealer: json[i].Pedidodealer,
						Pedidosap: json[i].Pedidosap,
						Percep: json[i].Percep,
						Porciva: json[i].Porciva,
						Preciocliente: json[i].Preciocliente,
						Precioconc: json[i].Precioconc,
						Tipofactura: json[i].Tipofactura,
						Tipopedido: json[i].Tipopedido,
						descPedido: json[i].descPedido,
						descFactura: json[i].descFactura,
						Total: json[i].Total,
						TotalConc: json[i].TotalConc,
						PrecioUnitario: json[i].PrecioUnitario,
						TotalImpuesto: json[i].TotalImpuesto,
					});
				}

			}

			sap.ui.controller("AR_DP_REP_FACTURACIONREPORTE_RASA.AR_DP_REP_FACTURACIONREPORTE_RASA.controller.detalle").jsoncreacion(json[productPath],
				arrtotal);
			var oRouter =
				sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detalle");

		},
		ConsultaTpedido: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var consulta =appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/clasePedido';
			//Consulta
			$.ajax({
				type: 'GET',
				url: consulta,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {

					var Tpedido = new sap.ui.model.json.JSONModel(dataR.d.results);

					oView.setModel(Tpedido, "Tpedido");
				},

				error: function (jqXHR, textStatus, errorThrown) {
					//	console.log(JSON.stringify(jqXHR));
				},
			});
		},
		//////*****************************correo********

		EnvioCorreo: function (evt) {

			var oDialog = oView.byId("EnvioCorreo");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_FACTURACIONREPORTE_RASA.AR_DP_REP_FACTURACIONREPORTE_RASA.view.Correo", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();

		},
		cerrarEnvioCorreo: function () {
			//	t.limpiezacorreo();
			oView.byId("EnvioCorreo").close();
		},

		estructura: function () {
			var desde = oView.byId("Fecha").getDateValue();
			var hasta = oView.byId("Fecha").getSecondDateValue();
			desde = new Date(desde).toISOString().slice(0, 10);
			hasta = new Date(hasta).toISOString().slice(0, 10);
			var json = oView.getModel("Facturacion").oData;
			//	console.log(json.length);

			//	var solicitante = oUsuariosap;
			var datos = "";
			var titulo =
				"<table><tr><td class= subhead>REPORTE -<b> FACTURACIÓN </b><p></td></tr><p><tr><td class= h1>  Desde el portal de Dealer Portal," +
				"se Envia el reporte de Facturación <p> ";
			var final = "</tr></table><p>Saludos <p> Dealer Portal Argentina </td> </tr> </table>";
			var cuerpo =
				"<table><tr><th>Pedido dealer</th><th>Tipo Pedido</th><th>Factura</th><th>Material</th>" +
				"<th>Desc Material</th><th>Cant facturada</th><th>Precio Concecionario</th><th>Total </th><th>Factlegal</th><th>tipo Factura</th><th>Fecha factura</th><th>Destinatario</th><th>Remito</th><th>Precio Unitario</th><th>% iva</th><th>Descuento</th><th>IIBB</th><th>familia</th><th>Modelo</th>";
			for (var i = 0; i < json.length; i++) {
				var dato = "<tr><td>" + json[i].Pedidodealer + "</td><td>" + json[i].descPedido + "</td><td>" + json[i].Nrofactura + "</td><td>" +	json[i].Material + "</td><td>" + json[i].Descmat +
					"</td><td>" + json[i].Cantfact + "</td><td>" + json[i].Precioconc + "</td><td>" + json[i].Total + "</td><td>" + json[i].Factlegal +
					"</td><td>" + json[i].descFactura +	"</td><td>" + json[i].Dirent + "</td><td>" + json[i].Fecrem + "</td><td>" + json[i].Nroremito + 
					"</td><td>"	+ json[i].PrecioUnitario + "</td><td>" + json[i].Porciva +"</td><td>" + json[i].Doclista +"</td><td>" + json[i].Percep + "</td><td>" + json[i].Familiamat +
					"</td><td>" + json[i].Modelo + "</td></tr> ";
				datos = datos + dato;
			}
			//	var datos = datos + dato
			var contexto = titulo + cuerpo + datos + final;
			console.log(contexto);

			t.envio(contexto);
		},
		envio: function (contexto) {
			t.popCarga();
			var arr = [];
			var json = {
				"root": {
					"strmailto": oView.byId("mail").getValue(),
					"strmailcc": "",
					"strsubject": oView.byId("descrpcion").getValue(),
					"strbody": contexto
				}
			};
			var arrjson = JSON.stringify(json);
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                    var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'POST',
				url: appModulePath + '/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Mail',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				data: arrjson,
				success: function (dataR, textStatus, jqXHR) {

				},
				error: function (jqXHR, textStatus, errorThrown) {

					t.cerrarPopCarga2();

					var obj2 = {
						codigo: "200",
						descripcion: "Correo enviado exitosamente"
					};
					var arr2 = [];
					arr2.push(obj2);
					t.popSuccesCorreo(arr2, "Correo");
					oView.byId("mail").setValue();
					oView.byId("descrpcion").setValue();
				}
			});
			//	codigoeliminar = "";
		},

		popSuccesCorreo: function (obj, titulo) {
			var oDialog = oView.byId("SuccesCorreo");
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "Succes");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_FACTURACIONREPORTE_RASA.AR_DP_REP_FACTURACIONREPORTE_RASA.view.SuccesCorreo", this); //aqui se debe cambiar ar_dp_rep
				oView.addDependent(oDialog);
			}
			oView.byId("SuccesCorreo").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("SuccesCorreo").setTitle("" + titulo);
			//	oView.byId("dialogSucces").setState("Succes");
		},
		cerrarPopSuccesCorreo: function () {
			oView.byId("SuccesCorreo").close();
			//t.limpiezacorreo();
			t.cerrarEnvioCorreo();
		},
		onSalir: function () {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: "#"
				}
			});
		},

		//***********************fin correo
		//******************descargar excel************
		downloadExcel: sap.m.Table.prototype.exportData || function () {

			//var oModel =arregloT;
			var oModel = oView.getModel("Facturacion");

			var Pedidodealer = {
				name: " Pedido SAP ",
				template: {
					content: "{Pedidosap}"
				}
			};
			var descPedido = {
				name: " Tipo Pedido ",
				template: {
					content: "{descPedido}"
				}
			};
			var Nrofactura = {
				name: " Número Factura  ",
				template: {
					content: "{Nrofactura}"
				}
			};
			var Material = {
				name: " Material ",
				template: {
					content: "{Material}"
				}
			};
			var Descmat = {
				name: " Descripción Material ",
				template: {
					content: "{Descmat}"
				}
			};
			var Cantfact = {
				name: " Cantidad Fact ",
				template: {
					content: "{Cantfact}"
				}
			};
			var Precioconc = {
				name: " PRECIO CONCESIONARIO ",
				template: {
					content: "{Precioconc}"
				}
			};
			var Total = {
				name: " Total ",
				template: {
					content: "{Total}"
				}
			};
			var Factlegal = {
				name: " Factura Legal ",
				template: {
					content: "\'{Factlegal}"
				}
			};
			var descFactura = {
				name: " Descripción Factura ",
				template: {
					content: "{descFactura}"
				}
			};
			var Fecrem = {
				name: " Fecha Factura ",
				template: {
					content: "{Fechadesde}"
				}
			};
			var Dirent = {
				name: "Destinatario ",
				template: {
					content: "{Dirent}"
				}
			};
			var PrecioUnitario = {
				name: " Precio Unitario ",
				template: {
					content: "{PrecioUnitario}"
				}
			};
			var Porciva = {
				name: "  % iva ",
				template: {
					content: "{Porciva} %"
				}
			};
			var Doclista = {
				name: "Descuento ",
				template: {
					content: "{Doclista}"
				}
			};
			var Percep = {
				name: "IIBB ",
				template: {
					content: "{Percep}"
				}
			};
			var Familiamat = {
				name: "Familia ",
				template: {
					content: "{Familiamat}"
				}
			};
			var Modelo = {
				name: "Modelo ",
				template: {
					content: "{Modelo}"
				}
			};

			var Remito = {
				name: "Remito ",
				template: {
					content: "{Nroremito}"
				}
			};
			var oExport = new Export({

				exportType: new ExportTypeCSV({
					fileExtension: "csv",
					separatorChar: ";"
				}),

				models: oModel,

				rows: {
					path: "/"
				},
				columns: [
					Pedidodealer,
					descPedido,
					Nrofactura,
					Material,
					Descmat,
					Cantfact,
					Precioconc,
					Total,
					Factlegal,
					Remito,
					descFactura,
					Fecrem,
					Dirent,
					PrecioUnitario,
					Porciva,
					Doclista,
					Percep,
					Familiamat,
					Modelo

				]
			});
			oExport.saveFile("Listado Facturas").catch(function (oError) {

			}).then(function () {
				oExport.destroy();
				//	console.log("esto es una maravilla");
			});

		},

		//*******************fin excel*******************
		//********************************pop ups********************************
		popCarga: function () {
			var oDialog = oView.byId("indicadorCarga");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_FACTURACIONREPORTE_RASA.AR_DP_REP_FACTURACIONREPORTE_RASA.view.PopUp", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
			//	oView.byId("textCarga").setText(titulo);
		},
		cerrarPopCarga2: function () {
			oView.byId("indicadorCarga").close();
		},
		popSucces: function (obj, titulo) {
			var oDialog = oView.byId("dialogSucces");
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "Succes");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_FACTURACIONREPORTE_RASA.AR_DP_REP_FACTURACIONREPORTE_RASA.view.Succes", this);
				oView.addDependent(oDialog);
			}
			oView.byId("dialogSucces").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("dialogSucces").setTitle(": " + titulo);
			// oView.byId("dialogSucces").setState("Succes");
		},
		cerrarPopSucces: function () {
			oView.byId("dialogSucces").close();

		}

		//*************************fin popups******************

	});

});