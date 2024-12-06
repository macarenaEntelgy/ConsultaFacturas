sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(e,t,n,o){"use strict";var s;return e.extend("dev.facturas.controller.Facturas",{onInit:function(){sap.ui.getCore().getConfiguration().setLanguage("es");s=this;s._token},onShowPdfPress:function(e){var t=e.getSource().getBindingContext().getObject().id_archivo;if(!t){sap.m.MessageToast.show("No se encontró la factura asociada.");return}var n="sb-0527dcd3-b653-429e-8aa1-dd18137a10cb!b518061|sdm-di-SDM_DI_PROD-prod!b41064";var o="a623621b-37d1-4ae1-a395-300f53b20cad$ondNGl8ZD9wJTx5TlpWrqoR7GCMKYlLKhIMxIBSRuSA=";var i="https://btp-invoice-xusbq15z.authentication.eu10.hana.ondemand.com/oauth/token?grant_type=client_credentials";jQuery.ajax({url:i,method:"POST",headers:{Authorization:"Basic "+btoa(n+":"+o)},success:e=>{s._token=e.access_token;s._getPdf(t)},error:e=>{console.log(e)}})},_getPdf:function(e){var t=s.getOwnerComponent().getManifestEntry("/sap.app/id");var n=t.replaceAll(".","/");var o=jQuery.sap.getModulePath(n);var i=`${o}/dms/?objectId=${e}`;var a=`/dms?objectId=${e}`;jQuery.ajax({url:i,method:"GET",headers:{"Content-Type":"application/pdf"},success:e=>{sap.m.MessageToast.show("Se encontro la factura asociada.")},error:e=>{sap.m.MessageToast.show("No se encontró la factura asociada.");console.log(e)}})},_openPdf:function(e){var t=URL.createObjectURL(blob);window.open(t)},onFilter:function(e){let t=[];let s=this.getView();let i=s.byId("invoiceNumber");if(i.getValue()!==""){const e=i.getValue();const s=e.slice(0,5);const a=e.slice(5,6);const r=e.slice(6);const c=new n({filters:[new n("punto_venta",o.EQ,s),new n("letra",o.EQ,a),new n("numero_comprobante",o.EQ,r)],and:true});t.push(c)}let a=this.byId("dateFrom").getDateValue();let r=this.byId("dateTo").getDateValue();if(a&&r){let e=a.toISOString().split("T")[0]+"T00:00:00Z";let s=r.toISOString().split("T")[0]+"T23:59:59Z";t.push(new n("fecha_emision",o.GE,e),new n("fecha_emision",o.LE,s))}const c=this.getView().byId("invoicesList");const d=c.getBinding("items");d.filter(t.length>0?new n(t,true):[])},onClearFilter:function(){let e=this.getView();const t=e.byId("dateFrom");if(t){t.setDateValue(null)}const n=e.byId("dateTo");if(n){n.setDateValue(null)}const o=e.byId("invoiceNumber");if(o){o.setValue("")}const s=e.byId("statusFilter");if(s){s.setSelectedKey("estado")}const i=e.byId("invoicesList");const a=i.getBinding("items");a.filter([]);a.sort(null)},removeFileExtension:function(e){return e.substring(0,e.lastIndexOf("."))},onOpenSortOptions:function(e){if(!this.sortOptionsSheet){this.sortOptionsSheet=new sap.m.ActionSheet({title:"Ordenar Por",showCancelButton:true,buttons:[new sap.m.Button({text:"Mayor a Menor",press:this.onSortDescending.bind(this)}),new sap.m.Button({text:"Menor a Mayor",press:this.onSortAscending.bind(this)})]});this.getView().addDependent(this.sortOptionsSheet)}this.sortOptionsSheet.openBy(e.getSource())},onSortDescending:function(){const e=this.getView().byId("invoicesList");const t=e.getBinding("items");const n=new sap.ui.model.Sorter("total",true);t.sort(n)},onSortAscending:function(){const e=this.getView().byId("invoicesList");const t=e.getBinding("items");const n=new sap.ui.model.Sorter("total",false);t.sort(n)},onStatusFilterChange:function(e){const t=e.getParameter("selectedItem").getKey();const n=this.getView().byId("invoicesList");const o=n.getBinding("items");const s=[];if(t){s.push(new sap.ui.model.Filter("estado",sap.ui.model.FilterOperator.EQ,t))}o.filter(s)}})});
//# sourceMappingURL=Facturas.controller.js.map