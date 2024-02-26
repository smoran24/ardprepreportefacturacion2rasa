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
		estado,
		arrtotal = [],
		arreglo = [];
	return Controller.extend("AR_DP_REP_FACTURACIONREPORTE_RASA.AR_DP_REP_FACTURACIONREPORTE_RASA.controller.detalle", {

		onInit: function () {

			var oRouter =
				sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("detalle").attachMatched(this._onRouteMatched, this);

		},
		onAfterRendering: function () {

			t = this;
			oView = this.getView();
			var arre2 = [];
			arre2.push(arreglo);
			t.obtenerPDF();
			t.obtenerPDF2();
			var dataT = new sap.ui.model.json.JSONModel(arre2);
			oView.setModel(dataT, "detalle");
			t.ConsultaFacturas();
			var json = oView.getModel("detalle").oData;
			var suma = 0;
			console.log(json);
			for (var i = 0; i < arrtotal.length; i++) {
				console.log(arrtotal[i].Total);
				var otSuma = Number((arrtotal[i].Total).replace(/\,/g, "."));
				suma = suma + otSuma;
				// suma=suma.toFixed(2);
				suma = Number.parseFloat(suma).toFixed(2);

			}
			console.log(suma);
			suma = suma.toString().replace(/\./g, ",");

			//	suma= suma.toFixed(2);
			oView.byId("Nfactura").setText(arreglo.Nrofactura);
			oView.byId("Faclegal").setText(arreglo.Factlegal);
			oView.byId("Fecrem").setText(arreglo.Fechadesde);
			oView.byId("descFactura").setText(arreglo.descFactura);
			// oView.byId("Total").setText(arreglo.Total);
			oView.byId("Dirent").setText(arreglo.Dirent);
			oView.byId("totalFactura").setText(suma + " " + arreglo.Moneda);

		},
		jsoncreacion: function (a, b) {
			arreglo = a;
			arrtotal = b;
			if (oView !== undefined) {
				this.cargar();
			}
		},
		cargar: function () {
			var json = oView.getModel("detalle").oData;
			console.log(arreglo.Fechadesde);

			oView.byId("Nfactura").setText(arreglo.Nrofactura);
			oView.byId("Faclegal").setText(arreglo.Factlegal);
			oView.byId("Fecrem").setText(arreglo.Fechadesde);
			oView.byId("descFactura").setText(arreglo.descFactura);

			oView.byId("Dirent").setText(arreglo.Dirent);
			var suma = 0;
			for (var i = 0; i < arrtotal.length; i++) {

				var otSuma = Number((arrtotal[i].Total).replace(/\,/g, "."));
				suma = suma + otSuma;
				// suma=suma.toFixed(2);
				suma = Number.parseFloat(suma).toFixed(2);

			}
			suma = suma.toString().replace(/\./g, ",");

			console.log(json);
			//suma= suma.toFixed(2);
			oView.byId("totalFactura").setText(suma + " " + arreglo.Moneda);

			t.ConsultaFacturas();
			t.obtenerPDF();
			t.obtenerPDF2();

		},

		obtenerPDF: function () {
			var arrjson = [];
			var json = {
				"HeaderSet": {
					"Header": {
						"Factura": "",
						"Nav_Header_Pdf": {
							"Pdf": [{
								"Factura": arreglo.Nrofactura,
								"Tipo": "R"
							}]
						}
					}
				}
			};

			arrjson = JSON.stringify(json);
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var url = appModulePath + '/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Reporte/Facturacion/pdf';

			$.ajax({
				type: 'POST',
				url: url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				data: arrjson,
				timeout: 180000,
				success: function (dataR, textStatus, jqXHR) {
					//	console.log(dataR);
					var base64 = dataR.HeaderSet.Header.Nav_Header_Pdf.Pdf.Base64
						//	console.log(base64);
					estado = 200;
					t.cargarPDF(base64);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					estado = 400;
					var base64 = [];
					t.cargarPDF();
				}

			});
		},
		cargarPDF: function (data64) {
			if (estado === 200) {
				var base64EncodedPDF = data64.toString();
				var decodedPdfContent = atob(base64EncodedPDF);
				var byteArray = new Uint8Array(decodedPdfContent.length);
				for (var i = 0; i < decodedPdfContent.length; i++) {
					byteArray[i] = decodedPdfContent.charCodeAt(i);
				}
				var blob = new Blob([byteArray.buffer], {
					type: 'application/pdf'
				});
				var _pdfurl = URL.createObjectURL(blob);
				jQuery.sap.addUrlWhitelist("blob");
				this._sValidPath = _pdfurl;

				this.getView().byId("vistaPDF").setSource(this._sValidPath);
			} else {
				this._sInvalidPath = sap.ui.require.toUrl("sap/m/sample/PDFViewerEmbedded") + "/sample_nonexisting.pdf";
				jQuery.sap.addUrlWhitelist(this._sInvalidPath);
				this.getView().byId("vistaPDF").setSource(this._sInvalidPath);
			}
			estado = "";
		},
		obtenerPDF2: function () {
			var arrjson = [];
			var json = {
				"HeaderSet": {
					"Header": {
						"Factura": "",
						"Nav_Header_Pdf": {
							"Pdf": [{
								"Factura": arreglo.Nrofactura,
								"Tipo": "E"
							}]
						}
					}
				}
			};

			arrjson = JSON.stringify(json);
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var url =appModulePath + '/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Reporte/Facturacion/pdf';

			$.ajax({
				type: 'POST',
				url: url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				data: arrjson,
				timeout: 180000,
				success: function (dataR, textStatus, jqXHR) {
					//	console.log(dataR);
					var base64 = dataR.HeaderSet.Header.Nav_Header_Pdf.Pdf.Base64
						//	console.log(base64);
					estado = 200;
					t.cargarPDF2(base64);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					estado = 400;
					var base64 = [];
					t.cargarPDF2();
				}

			});
		},
		cargarPDF2: function (data64) {
			if (estado === 200) {
				var base64EncodedPDF = data64.toString();
				var decodedPdfContent = atob(base64EncodedPDF);
				var byteArray = new Uint8Array(decodedPdfContent.length);
				for (var i = 0; i < decodedPdfContent.length; i++) {
					byteArray[i] = decodedPdfContent.charCodeAt(i);
				}
				var blob = new Blob([byteArray.buffer], {
					type: 'application/pdf'
				});
				var _pdfurl = URL.createObjectURL(blob);
				jQuery.sap.addUrlWhitelist("blob");
				this._sValidPath = _pdfurl;

				this.getView().byId("vistaPDF2").setSource(this._sValidPath);
			} else {
				this._sInvalidPath = sap.ui.require.toUrl("sap/m/sample/PDFViewerEmbedded") + "/sample_nonexisting.pdf";
				jQuery.sap.addUrlWhitelist(this._sInvalidPath);
				this.getView().byId("vistaPDF2").setSource(this._sInvalidPath);
			}
			estado = "";
		},
		ConsultaFacturas: function () {

			var dataT = new sap.ui.model.json.JSONModel(arrtotal);
			oView.setModel(dataT, "Facturacion");
			console.log(arrtotal);

		},

		atras: function () {
			t.limpieza();
			var oRouter =
				sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("master");

		},
		limpieza: function () {
			var arr = [];

			oView.byId("Nfactura").setText("");
			oView.byId("Faclegal").setText("");
			oView.byId("Fecrem").setText("");
			oView.byId("descFactura").setText("");
			//	oView.byId("Total").setText("");
			oView.byId("Dirent").setText("");
			var dataT = new sap.ui.model.json.JSONModel(arr);
			oView.setModel(dataT, "Facturacion");
			var a = [];
			t.cargarPDF(a);

		},
		//*********************popups***********
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
			}
			//*********************fin popups***********

	});

});