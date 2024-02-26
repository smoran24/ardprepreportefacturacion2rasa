/*global QUnit*/

sap.ui.define([
	"AR_DP_REP_FACTURACIONREPORTE_RASA/AR_DP_REP_FACTURACIONREPORTE_RASA/controller/app.controller"
], function (Controller) {
	"use strict";

	QUnit.module("app Controller");

	QUnit.test("I should test the app controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});