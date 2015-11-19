(function () {
    var Handsontable = require("../../bower_components/handsontable/dist/handsontable.full.min.js");
    var css = require("../../bower_components/handsontable/dist/handsontable.full.css");
    var dataService = require('../services/data.js');
    var configService = require('../services/config.js');
    var papa = require('papaparse');
    var mediator = require('mediatorjs');
    var _ = require('lodash');
    var that = {};
    var table;
    var hot;

    that.load = function (element) {
        var data = dataService.get();
        element.innerHTML = '<div id="input"></div><div id="table"></div>';
        input = element.querySelector('#input');
        input.innerHTML = '<textarea></textarea>' +
            '<button id="import">import</button>' +
            '<button id="transpose">transpose</button>';
        /*
         var xAxis = document.createElement('input');
         xAxis.type = 'checkbox';
         input.appendChild(xAxis);
         xAxis.checked = configService.getlabelsAxis('x');
         xAxis.onclick = function(event){
         configService.setlabelsAxis('x', this.checked)
         };
         */

        input.querySelector("#import").addEventListener("click", function () {
            dataService.setRaw(papa.parse(input.firstChild.value).data);
        });

        input.querySelector("#transpose").addEventListener("click", function () {
            dataService.setRaw(_.unzip(dataService.getRaw()));
        });

        table = element.querySelector('#table');
        hot = new Handsontable(table, {
            startRows: 8,
            startCols: 5,
            rowHeaders: true,
            colHeaders: true,
            contextMenu: true
        });

        if (!_.isEmpty(data)) {
            hot.updateSettings({
                data: data,
                colHeaders: dataService.getCategories()
            });
        }
        mediator.on('dataUpdate', function (data) {
            hot.updateSettings({
                data: data,
                colHeaders: dataService.getCategories()
            });
        });
    };

    that.destroy = function () {
        mediator.stopListening('dataUpdate', function (data) {
            hot.updateSettings({data: data});
        });
        dataService.set(removeEmptyRows(hot));
        hot.destroy();
    };

    function removeEmptyRows(hot) {
        var gridData = hot.getData();
        var cleanedGridData = [];

        _.forEach(gridData, function (object, rowKey) {
            if (!hot.isEmptyRow(rowKey)) cleanedGridData[rowKey] = object;
        });
        return cleanedGridData;
    }

    module.exports = that;
})();



