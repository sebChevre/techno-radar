const d3 = require('d3');
const _ = {
    map: require('lodash/map'),
    uniqBy: require('lodash/uniqBy'),
    capitalize: require('lodash/capitalize'),
    each: require('lodash/each')
};

const XLSX = require('xlsx');
const InputSanitizer = require('./inputSanitizer');
const AppConstant = require('./appConstant');
const Radar = require('../models/radar');
const Quadrant = require('../models/quadrant');
const Ring = require('../models/ring');
const Blip = require('../models/blip');
const GraphingRadar = require('../graphing/radar');
const ContentValidator = require('./contentValidator');
const fs = require('browserify-fs');
const path = require('path');
const base64 = require('base-64');

var appConstant = new AppConstant(global.appRoot);



const RadarElements = function (radar_id) {

    var self = {};

    self.build = function () {

        //var url = "xls/" + fileName;

        /* if(description === undefined){
         description = fileName;
         }*/

        var oReq = new XMLHttpRequest();

        oReq.open("GET", 'http://localhost:8080/techno-radar/element?filter={"_ref":"' + radar_id + '"}', true);
        oReq.setRequestHeader("Authorization", "Basic " + base64.encode("admin:changeit"));
        oReq.responseType = "json";

        //oReq.open("GET", url, true);
        //oReq.responseType = "arraybuffer";


        oReq.onload = function(e) {
            console.log(e);
            console.log(oReq.response);

            var radarElements = oReq.response;

            /* convert data to binary string */
            // var data = new Uint8Array(arraybuffer);
            // var arr = new Array();

            //for(var i = 0; i != data.length; ++i) {
            //   arr[i] = String.fromCharCode(data[i]);
            //}

            //var bstr = arr.join("");

            /* Call XLSX */
            // var workbook = XLSX.read(bstr, {type:"binary"});

            // console.log(workbook);

            /* Get worksheet */
            //var worksheet = workbook.Sheets["Feuil1"];

            //var columnsName = getColumnNames(worksheet);

            var elements = oReq.response._embedded;

            createRadar(
                function (anneaux,quadrants) {
                    console.log(anneaux)
                    console.log(quadrants)

                    var ringMap = {};
                    var rings = [];

                    var maxRings = 4;

                    _.each(anneaux, function (ringName, i) {

                        console.log(i);

                        ring = new Ring(ringName, i);
                        rings.push(ring);
                        ringMap[ringName] = new Ring(ringName, i);
                    });

                    console.log(ringMap);

                    var quadrantsObj = {};

                    _.each(quadrants, function (quadrant) {

                        console.log(quadrant);

                        quadrantsObj[quadrant] = new Quadrant(_.capitalize(quadrant));

                    });


                    console.log(quadrantsObj)
                    console.log(ringMap);

                    _.each(elements, function (element) {

                        console.log(element);

                        blip = new Blip(element.name,
                            ringMap[element.qualification],
                            element.isNew.toLowerCase() === 'true',
                            element.topic,
                            element.description);

                        console.log(blip.ring().name())

                        quadrantsObj[element.theme]


                            .add(blip);


                    });



                    console.log(quadrantsObj)

                    var radar = new Radar();
                    _.each(quadrantsObj, function (quadrant) {
                        radar.addQuadrant(quadrant)
                    });

                    console.log(radar.rings())
                    console.log(rings)

                    var size = (window.innerHeight - 133) < 620 ? 620 : window.innerHeight - 133;

                    new GraphingRadar(size, radar,rings).init().plot();
                },
                function () {}
            );

        }

        oReq.send();

        function createRadar(okCallback, failCallback) {


            var oReq = new XMLHttpRequest();
            //oReq.open("GET", 'xls/directory.json', true);
            oReq.open("GET", 'http://localhost:8080/techno-radar/radar/' + radar_id, true);
            oReq.setRequestHeader("Authorization", "Basic " + base64.encode("admin:changeit"));
            oReq.responseType = "json";

            oReq.onload = function(event) {

                console.log(oReq.response);

                var radar = oReq.response;
                console.log(radar);

                var anneaux = radar.anneaux;
                var quadrants = radar.quadrants;

                okCallback(anneaux,quadrants);
                // var rings = radar.

            }

            oReq.send();

            /*
             try {

             console.log('create radar')
             console.log(elements)

             // var columnNames = getColumnNames(worksheet);

             //var contentValidator = new ContentValidator(columnNames);
             //contentValidator.verifyContent();
             //contentValidator.verifyHeaders();

             //var all = getElements(worksheet);


             //var blips = _.map(elements, new InputSanitizer().sanitize);

             document.title = description;
             d3.selectAll(".chargement").remove();

             getRings(radar_id,
             function () {},
             function () {}
             );

             var ringMap = {};
             var maxRings = 4;

             _.each(rings, function (ringName, i) {

             ringMap[ringName] = new Ring(ringName, i);
             });

             var quadrants = {};
             _.each(blips, function (blip) {
             if (!quadrants[blip.quadrant]) {
             quadrants[blip.quadrant] = new Quadrant(_.capitalize(blip.quadrant));
             }

             quadrants[blip.quadrant]
             .add(new Blip(blip.name,
             ringMap[blip.ring],
             blip.isNew.toLowerCase() === 'true',
             blip.topic,
             blip.description))
             });

             var radar = new Radar();
             _.each(quadrants, function (quadrant) {
             radar.addQuadrant(quadrant)
             });

             var size = (window.innerHeight - 133) < 620 ? 620 : window.innerHeight - 133;

             new GraphingRadar(size, radar).init().plot();

             } catch (exception) {
             console.log(exception);
             }
             */
        }



        function getColumnNames (worksheet) {
            var columnnames = [];

            var range = XLSX.utils.decode_range(worksheet['!ref']);
            var col, line = range.s.r;

            for(col = range.s.c; col <= range.e.c; ++col) {
                var cell = worksheet[XLSX.utils.encode_cell({c:col, r:line})] /* find the cell in the first row */

                if(cell !== undefined){
                    columnnames.push(cell.h);
                }
            }

            return columnnames;
        }

        function getElements (worksheet) {
            var elementsName = [];

            var range = XLSX.utils.decode_range(worksheet['!ref']);
            var col, line = range.s.r + 1;


            for(line = range.s.r + 1; line <= range.e.r; ++line){


                var blip = {};

                blip.name = worksheet[XLSX.utils.encode_cell({c:0, r:line})].h;
                blip.ring = worksheet[XLSX.utils.encode_cell({c:1, r:line})].h;
                blip.quadrant = worksheet[XLSX.utils.encode_cell({c:2, r:line})].h;
                blip.isNew = worksheet[XLSX.utils.encode_cell({c:3, r:line})].h;
                blip.description = worksheet[XLSX.utils.encode_cell({c:4, r:line})].v;

                console.log(XLSX);
                console.log(XLSX.utils);

                console.log(blip.description);

                var topic = worksheet[XLSX.utils.encode_cell({c:5, r:line})];

                if(topic !== undefined){
                    blip.topic = topic.h;
                }
                // blip.topic = worksheet[XLSX.utils.encode_cell({c:5, r:line})].h;

                elementsName.push(blip);

            }

            return elementsName;
        }
    };

    self.init = function () {
        var content = d3.select('body')
            .append('div')
            .attr('class', 'chargement')
            .append('div')
            .attr('class', 'input-sheet');

        set_document_title();

        plotLogo(content);

        var bannerText = '<h1>En cours de génération...</h1><p>Cela vient...</p>';
        plotBanner(content, bannerText);
        plotFooter(content);


        return self;
    };

    return self;
}


var QueryParams = function (queryString) {
    var decode = function (s) {
        return decodeURIComponent(s.replace(/\+/g, " "));
    };

    var search = /([^&=]+)=?([^&]*)/g;

    var queryParams = {};
    var match;
    while (match = search.exec(queryString))
        queryParams[decode(match[1])] = decode(match[2]);

    return queryParams
};



function getSheetList (okCallback,failCallback) {

    //var url = "/xls/directory.json";
    var oReq = new XMLHttpRequest();
    //oReq.open("GET", 'xls/directory.json', true);
    oReq.open("GET", 'http://localhost:8080/techno-radar/radar', true);

    oReq.setRequestHeader("Authorization", "Basic " + base64.encode("admin:changeit"));
    oReq.responseType = "json";

    //oReq.onreadystatechange = function()

    /*oReq.open("GET","Page.aspx",false);
    {
        if (xmlhttp.readyState==4)
        {
            if (xmlhttp.status==200)
            {
                //Ajax handling logic
            }
        }
    }*/

    oReq.onreadystatechange = function() {

        if (oReq.readyState === XMLHttpRequest.DONE) {
            if (oReq.status === 200) {
                alert(oReq.response);
            } else {
                alert('There was a problem with the request.');
            }
        }

        console.log(oReq.response);


        //url no dispo
        if(oReq.status === 404){
            console.error("Error during retrieving sheet directory list");
            console.log(event);
            failCallback(event);
        }else{
            var filesArray = oReq.response;

            filesArray._embedded.forEach(function (f){
                console.log(f);
            })

            okCallback(filesArray);
        }


    }

    oReq.send();

    console.log('after')


}



//Gere les requetes entrantes et le chargement de l'app
const App = function () {


    var self = {};

    //Point d'entrée app
    self.build = function () {

        //recup query
        var queryParams = QueryParams(window.location.search.substring(1));
        console.log(queryParams);


        //si param f ok, génération auto du radar
        if (queryParams.rid) {
            var sheet = RadarElements(queryParams.rid);
            sheet.init().build();
        } else {

            var content = d3.select('body')
                .append('div')
                .attr('class', 'input-sheet');

            set_document_title();

            plotLogo(content);

            var bannerText = '<h2 class="shadow-text">'.concat(appConstant.RADAR_VERSIONS_TITLE,'</h2>');

            var versionsList = '<div class="numberlist"><ol>';


            getSheetList(
                function (allFiles) {
                    console.log(allFiles);

                    allFiles._embedded.forEach(function (radar){
                        console.log(radar._id);
                        versionsList = versionsList.concat("<li><a href='?rid=",radar._id.$oid,"'>",radar.description,"</a></li>");
                    });

                    versionsList = versionsList.concat("</ol></div>");

                    plotBanner(content, bannerText);

                    plotSheetVersionsList(content,versionsList);

                    plotFooter(content);
                },
                function (failEvent) {

                    //versionsList = versionsList.concat("Error Happened</div>");



                    plotBanner(content, bannerText);

                    content.append('div')
                        .attr('class', 'files-retrieve-error')
                        .html(appConstant.URL_DIRECTORY_ERROR);
                    plotSheetVersionsList(content,versionsList);

                    plotFooter(content);


                }
            );



        }
    };

    return self;
};

function set_document_title() {
    document.title = "Radar Technologique";
}

function plotLogo(content) {
    content.append('div')
        .attr('class', 'input-sheet__logo')
        .html('<h1 class="shadow-text">Radar Technologique</h1>');
}

function plotFooter(content) {
    content
        .append('div')
        .attr('id', 'footer')
        .append('div')
        .attr('class', 'footer-content')
        .append('p')
        .html('Librement inspiré du Radar Technologique de <a href="https://www.thoughtworks.com"> ThoughtWorks</a>. ');

}
function plotSheetVersionsList(content, html){
    content
        .append('div')
        .attr('class', 'versions-list')
        .html(html);
}


function plotBanner(content, text) {


    content.append('div')
        .attr('class', 'input-sheet__banner')
        .html(text);


}


module.exports = App;
