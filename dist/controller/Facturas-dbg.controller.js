sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (Controller, _JSONModel, Filter, FilterOperator) {
        "use strict";

        var self;

        return Controller.extend("dev.facturas.controller.Facturas", {

            onInit: function () {
                sap.ui.getCore().getConfiguration().setLanguage("es");
                self = this;
                self._token;
            },

            onShowPdfPress: function (oEvent) {
                // Obtener el ID del archivo desde el contexto del botón
                var pdf_id = oEvent.getSource().getBindingContext().getObject().id_archivo;
            
                if (!pdf_id) {
                    sap.m.MessageToast.show("No se encontró la factura asociada.");
                    return;
                }

                var user = "sb-0527dcd3-b653-429e-8aa1-dd18137a10cb!b518061|sdm-di-SDM_DI_PROD-prod!b41064"
                var pass = "a623621b-37d1-4ae1-a395-300f53b20cad$ondNGl8ZD9wJTx5TlpWrqoR7GCMKYlLKhIMxIBSRuSA="
                var ulrAuth = "https://btp-invoice-xusbq15z.authentication.eu10.hana.ondemand.com/oauth/token?grant_type=client_credentials"

                jQuery.ajax({
                    url: ulrAuth,
                    method: "POST",
                    headers: {
                        "Authorization": "Basic " + btoa(user + ":" + pass)
                    },
                    success: (data) => { 
                        self._token = data.access_token;
                        self._getPdf(pdf_id);
                    },
                    
                    error: (e) => {console.log(e)}
                });
            },

            _getPdf: function(pdf_id){

                var appId = self.getOwnerComponent().getManifestEntry("/sap.app/id");              
                var appPath = appId.replaceAll(".", "/");              
                var appModulePath = jQuery.sap.getModulePath(appPath);
                var path = `${appModulePath}/dms/?objectId=${pdf_id}`;
                var pathLocal = `/dms?objectId=${pdf_id}`;

                /*var ulrDoc = "/document/?objectId=";
                ulrDoc = ulrDoc + pdf_id;*/

                jQuery.ajax({
                    url: path,
                    method: "GET",
                    headers:{
                        "Content-Type": "application/pdf"
                    },

                    success: (data) => {
                        sap.m.MessageToast.show("Se encontro la factura asociada.");
                    },
                    error: (e) => {
                        sap.m.MessageToast.show("No se encontró la factura asociada.");
                        console.log(e);
                    }
                });
            },
            
            _openPdf: function (data) {
                // Convertir el contenido Base64 en un Blob y abrir el PDF
                //var byteCharacters = atob(sPdfBase64);
                //var byteNumbers = Array.from(byteCharacters, char => char.charCodeAt(0));
                //var byteArray = new Uint8Array(byteNumbers);
                //var blob = new Blob([byteArray], { type: 'application/pdf' });
                var url = URL.createObjectURL(blob);
                window.open(url);
            },

            onFilter: function (_oEvent) {
                let filters = [];
                let oView = this.getView();
                //let shipName = oView.byId("shipName");
                let invoiceNumber = oView.byId("invoiceNumber");
                
                /*if (shipName.getValue() !== "") {
                    filters.push(new Filter("razon", FilterOperator.Contains, shipName.getValue()));
                }*/
            
                // Filtro por número de factura
                if (invoiceNumber.getValue() !== "") {
                    const factura = invoiceNumber.getValue();
                    const puntoVenta = factura.slice(0, 5);
                    const letra = factura.slice(5, 6);
                    const numeroComprobante = factura.slice(6);
            
                    const combinedFilter = new Filter({
                        filters: [
                            new Filter("punto_venta", FilterOperator.EQ, puntoVenta),
                            new Filter("letra", FilterOperator.EQ, letra),
                            new Filter("numero_comprobante", FilterOperator.EQ, numeroComprobante)
                        ],
                        and: true
                    });
            
                    filters.push(combinedFilter);
                }
            
                // Filtros de fecha
                let oDateFrom = this.byId("dateFrom").getDateValue();
                let oDateTo = this.byId("dateTo").getDateValue();
            
                if (oDateFrom && oDateTo) {
                    // Convertir fechas a formato ISO
                    let sDateFromISO = oDateFrom.toISOString().split("T")[0] + "T00:00:00Z";
                    let sDateToISO = oDateTo.toISOString().split("T")[0] + "T23:59:59Z";
            
                    filters.push(
                        new Filter("fecha_emision", FilterOperator.GE, sDateFromISO),
                        new Filter("fecha_emision", FilterOperator.LE, sDateToISO)
                    );
                }
            
                // Aplicar todos los filtros
                const oList = this.getView().byId("invoicesList");
                const oBinding = oList.getBinding("items");
                oBinding.filter(filters.length > 0 ? new Filter(filters, true) : []);
            },

            // Limpieza de filtros: Lo mantengo exactamente como estaba
            onClearFilter: function () {
                let oView = this.getView();
                /*const shipNameInput = oView.byId("shipName");
                if (shipNameInput) {
                    shipNameInput.setValue(""); // Limpiar el valor del control shipName
                }*/

                const dateFrom = oView.byId("dateFrom");
                if (dateFrom) {
                    dateFrom.setDateValue(null); // Limpiar la fecha
                }

                const dateTo = oView.byId("dateTo");
                if (dateTo) {
                    dateTo.setDateValue(null); // Limpiar la fecha
                }

                const invoiceNumber = oView.byId("invoiceNumber");
                if (invoiceNumber) {
                    invoiceNumber.setValue("");
                }

                // Reiniciar el filtro de estado a "Todos"
                const statusFilter = oView.byId("statusFilter");
                if (statusFilter) {
                    statusFilter.setSelectedKey("estado"); // Selecciona "Todos" en el dropdown
                }

                // Obtener la lista y su binding
                const oTable = oView.byId("invoicesList");
                const oBinding = oTable.getBinding("items");

                // Aplicar un filtro vacío para limpiar la lista
                oBinding.filter([]);
                oBinding.sort(null);
            },

            /* Método para manejar el evento de mostrar PDF
            onShowPdfPress2: function (oEvent) {
                // Obtener la codificación Base64 desde el CustomData del botón
                var sPdfBase64 = oEvent.getSource().data("pdfBase64");

                if (!sPdfBase64) {
                    MessageToast.show("No se encontró el PDF para esta factura.");
                    return;
                }

                // Crear la URL del PDF en formato base64
                var sPdfUrl = "data:application/pdf;base64," + sPdfBase64;

                // Crear un iframe para mostrar el PDF en un diálogo modal
                if (!this.oDialog) {
                    this.oDialog = new sap.m.Dialog({
                        title: "Vista Previa de la Factura",
                        contentWidth: "100%",
                        contentHeight: "100%",
                        verticalScrolling: false,
                        horizontalScrolling: false,
                        resizable: true,
                        content: new sap.ui.core.HTML({
                            content: "<iframe src='" + sPdfUrl + "' width='100%' height='100%' style='border:none;'></iframe>"
                        }),
                        endButton: new sap.m.Button({
                            text: "Cerrar",
                            press: function () {
                                this.oDialog.close();
                            }.bind(this)
                        })
                    });
                } else {
                    // Actualizar el contenido del iframe en caso de que el diálogo ya exista
                    this.oDialog.getContent()[0].setContent("<iframe src='" + sPdfUrl + "' width='100%' height='100%' style='border:none;'></iframe>");
                }

                this.oDialog.open();
            },*/

            removeFileExtension: function (fileName) {
                return fileName.substring(0, fileName.lastIndexOf('.'));
            },

            onOpenSortOptions: function (oEvent) {
                // Crear el ActionSheet solo la primera vez que se necesita
                if (!this.sortOptionsSheet) {
                    this.sortOptionsSheet = new sap.m.ActionSheet({
                        title: "Ordenar Por",
                        showCancelButton: true,
                        buttons: [
                            new sap.m.Button({
                                text: "Mayor a Menor",
                                press: this.onSortDescending.bind(this)
                            }),
                            new sap.m.Button({
                                text: "Menor a Mayor",
                                press: this.onSortAscending.bind(this)
                            })
                        ]
                    });

                    // Agregar el ActionSheet a la vista actual para el ciclo de vida
                    this.getView().addDependent(this.sortOptionsSheet);
                }

                // Abrir el ActionSheet en el botón que activó el evento
                this.sortOptionsSheet.openBy(oEvent.getSource());
            },

            onSortDescending: function () {
                const oList = this.getView().byId("invoicesList");
                const oBinding = oList.getBinding("items");

                // Crear un sorter que ordene en orden descendente
                const oSorter = new sap.ui.model.Sorter("total", true);
                oBinding.sort(oSorter);
            },

            onSortAscending: function () {
                const oList = this.getView().byId("invoicesList");
                const oBinding = oList.getBinding("items");

                // Crear un sorter que ordene en orden ascendente
                const oSorter = new sap.ui.model.Sorter("total", false);
                oBinding.sort(oSorter);
            },

            onStatusFilterChange: function (oEvent) {
                const selectedKey = oEvent.getParameter("selectedItem").getKey(); // Obtiene el valor seleccionado
                const oList = this.getView().byId("invoicesList"); // Obtén la lista de facturas
                const oBinding = oList.getBinding("items"); // Obtén el binding de los ítems de la lista
                const aFilters = [];

                // Si el usuario selecciona un estado específico, agregamos un filtro
                if (selectedKey) {
                    aFilters.push(new sap.ui.model.Filter("estado", sap.ui.model.FilterOperator.EQ, selectedKey));
                }

                // Aplica el filtro a la lista
                oBinding.filter(aFilters);
            }

        });
    }
);