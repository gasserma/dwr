function numberWithCommas(x) {
    return x.toString().replace(/\D/g,'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

$.fn.digits = function(){ 
    return this.each(function(){
        $(this).val( $(this).val().replace(/\D/g,'').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") ); 
    })
}

function myFloatParse(s, allowNeg=true){
    if (typeof s == "string"){
        s = s.replace(new RegExp(',', 'g'), '');    
    }
    
    var res = parseFloat(s);
    
    if (res < 0.0 && !allowNeg){
        res = Math.abs(res);
    }
    
    return res;
}

function validateForm(){
    for (var i = 0; i < 2; i++){
        var totalWeight = 0.0;
        var strats = false;
        for (var s = 0; s < strategies[i].length; s++){
            $(strategies[i][s]).find(".weight").each(function() {
                totalWeight += myFloatParse(this.value)/100.0;
                strats = true;
            });
        }

        if (totalWeight * 1.0000001 <= 1.0 && strats){
            for (var s = 0; s < strategies[i].length; s++){
                $(strategies[i][s]).find(".weight").each(function() {
                    $(this).effect("highlight", { color: "red" }, 1000);
                });
            }

            return false;
        }
    }

    var foundBad = false;
    $('input[name=retirement_length]').each(function() {
        if ($(this).val() > 80){ // Very arbitrary. We should probably cap somewhere around 50. 83 is the actual limit right now.
            $(this).effect("highlight", { color: "red" }, 1000);
            foundBad = true;
        }
    });

    if (foundBad){
        return false;
    }

    return true;
}

var minYear = 1926;
var maxYear = 2010;
function getJsonRequest(createDiv) {
    var data = {}

    createDiv.find(".input_main").each(function () {
        data[this.name] = myFloatParse(this.value);
    });

    // Hardcoded for now...
    data["min_year"] = minYear;
    data["max_year"] = maxYear;

    data['strategies'] = [];
    createDiv.nextUntil(".CreateSimulation").each(function () {
        if ($(this).is(":visible") && $(this).attr('class') == "Strategy") { //There is certainly a jquery'er way to do this.
            var strat = {};
            var assets = [];
            strat['args'] = {};
            $(this).find(".input_strat").each(function() {
                if (this.name.indexOf("percent") != -1){
                    strat['args'][this.name] = myFloatParse(this.value)/100.0;
                } else {
                    strat['args'][this.name] = myFloatParse(this.value);
                }

                strat["type"] = $(this).data("type");
            });

            $(this).find(".weight").each(function() {
                strat["weight"] = myFloatParse(this.value)/100.0;
            });

            $(this).find(".stocks").each(function() {
                assets.push(myFloatParse(this.value)/100.0);
            });

            $(this).find(".bonds").each(function() {
                assets.push(myFloatParse(this.value)/100.0);
            });

            strat["asset_allocation"] = assets;
            strat["type"] = $(this).data("type");
            data['strategies'].push(strat)
        }
    });

    console.log(JSON.stringify(data));
    return data;
}

function hideInputs(){
    $(".CreateSimulation").hide(200);
    $(".Strategy:visible").hide(200);
    $(".runSimButt").hide();
    $(".compareButt").hide();
}

function showInputs(){
    $(".CreateSimulation").show(200);
    $(".Strategy:not(#stratClone)").show(200);
    if (runSimulationAvailable()) {
        $(".runSimButt").show();
    }
    $(".compareButt").show();
}

var currentYear;
var doStatsDisplay = false;
function displayYearCallback(year){
    currentYear = year;
    if (doStatsDisplay){
        yearIndex = currentYear - minYear;
        
        var s = []
        for (var key in simResult1.yearly_stats) {
            if (simResult1.yearly_stats.hasOwnProperty(key)) {
                var data = { name:key, stat:simResult1.yearly_stats[key][yearIndex] };
                if (simResult2 != null){
                    data.stat2 = simResult2.yearly_stats[key][yearIndex];
                    
                    var tryParseFloat = parseFloat(simResult1.yearly_stats[key][yearIndex]);
                    if (!isNaN(tryParseFloat)){
                        var diff = tryParseFloat - parseFloat(simResult2.yearly_stats[key][yearIndex]);
                        data.diff = diff;
                    } else if (simResult1.yearly_stats[key][yearIndex] == true || simResult1.yearly_stats[key][yearIndex] == false) {
                        if (simResult1.yearly_stats[key][yearIndex] != simResult2.yearly_stats[key][yearIndex]){
                            data.diff = "different";
                        } else {
                            data.diff = "none";                        
                        }
                    } else {
                        data.diff = "";
                    }        
                }
            
                s.push(data);
            }
        }
        
        $("#YearlyStats").children().first().tabulator("setData", s);
    }
}

// Taken from the tabulator source, since I can't figure out how to actually access this...
function tickCross(value, data, cell, row, options, formatterParams){
    var tick = '<svg enable-background="new 0 0 24 24" height="14" width="14" viewBox="0 0 24 24" xml:space="preserve" ><path fill="#2DC214" clip-rule="evenodd" d="M21.652,3.211c-0.293-0.295-0.77-0.295-1.061,0L9.41,14.34  c-0.293,0.297-0.771,0.297-1.062,0L3.449,9.351C3.304,9.203,3.114,9.13,2.923,9.129C2.73,9.128,2.534,9.201,2.387,9.351  l-2.165,1.946C0.078,11.445,0,11.63,0,11.823c0,0.194,0.078,0.397,0.223,0.544l4.94,5.184c0.292,0.296,0.771,0.776,1.062,1.07  l2.124,2.141c0.292,0.293,0.769,0.293,1.062,0l14.366-14.34c0.293-0.294,0.293-0.777,0-1.071L21.652,3.211z" fill-rule="evenodd"/></svg>';
    var cross = '<svg enable-background="new 0 0 24 24" height="14" width="14"  viewBox="0 0 24 24" xml:space="preserve" ><path fill="#CE1515" d="M22.245,4.015c0.313,0.313,0.313,0.826,0,1.139l-6.276,6.27c-0.313,0.312-0.313,0.826,0,1.14l6.273,6.272  c0.313,0.313,0.313,0.826,0,1.14l-2.285,2.277c-0.314,0.312-0.828,0.312-1.142,0l-6.271-6.271c-0.313-0.313-0.828-0.313-1.141,0  l-6.276,6.267c-0.313,0.313-0.828,0.313-1.141,0l-2.282-2.28c-0.313-0.313-0.313-0.826,0-1.14l6.278-6.269  c0.313-0.312,0.313-0.826,0-1.14L1.709,5.147c-0.314-0.313-0.314-0.827,0-1.14l2.284-2.278C4.308,1.417,4.821,1.417,5.135,1.73  L11.405,8c0.314,0.314,0.828,0.314,1.141,0.001l6.276-6.267c0.312-0.312,0.826-0.312,1.141,0L22.245,4.015z"/></svg>';

    if(value === true || value === "true" || value === "True" || value === 1){
        cell.attr("aria-checked", true);
        return tick;
    }else{
        cell.attr("aria-checked", false);
        return cross;
    }
}

// Thanks :) http://stackoverflow.com/questions/21792367/replace-underscores-with-spaces-and-capitalize-words
function humanize(str) {
    var frags = str.split('_');
    for (i=0; i<frags.length; i++) {
        frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
    }
    return frags.join(' ');
}

function myFormatter(value, data, cell, row, options, formatterParams){
    var formatAs = "plaintext";
    if (formatterParams && formatterParams.hasOwnProperty("formatAs")){
        formatAs = formatterParams.formatAs;
    } else {
        var tryParseFloat = parseFloat(value);
        if (!isNaN(tryParseFloat)){
            if (tryParseFloat > 2.0 || tryParseFloat < -2.0){ // This is a stupid way to do this...
                formatAs = "money";
            } else {
                formatAs = "percent";
            }
        } else {
            if (value == true || value == false){
                formatAs = "bool";
            }
        }    
    }
        
    switch (formatAs){
        case "percent":
            return (tryParseFloat * 100).toFixed(0) + "%";
        case "money":
            var result = myFloatParse(value, allowNeg=true).toFixed(0);
            if (result < 0){
                return "-$" + numberWithCommas(Math.abs(result));
            }
            return "$" + numberWithCommas(result);
        case "bool":
            return tickCross(value, data, cell, row, options);
        default:
            return humanize(value);        
    }
}

function tooltipFunc(field, value, data){
    return data.tooltip;
}

function showStats(){
    var displayBoth = false;
    if (simResult2 != null) {
        displayBoth = true;
    }
    
    $(".Stats").show().children().show().children().show();
    
    if (!displayBoth){    
        $("#YearlyStats").children().first().tabulator({
            fitColumns:true,
            movableCols: true,
            columns:[
                {title:"Stat", field:"name", sorter:"string", formatter:myFormatter},
                {title:"Value", field:"stat", sorter:"number", formatter:myFormatter}
            ]
        });
    } else {
        $("#YearlyStats").children().first().tabulator({
            fitColumns:true,
            movableCols: true,
            columns:[
                {title:"Stat", field:"name", sorter:"string", formatter:myFormatter},
                {title:"Strategy 1 Value", field:"stat", sorter:"number", formatter:myFormatter},
                {title:"Strategy 2 Value", field:"stat2", sorter:"number", formatter:myFormatter},
                {title:"Difference", field:"diff", sorter:"number", formatter:myFormatter}
            ]
        });
    }
    doStatsDisplay=true;
    displayYearCallback(currentYear);
    
    var distDisplay = [{ class:"#DistStats1", stats:simResult1.dist_stats }];
    
    if (displayBoth){
        distDisplay.push({ class:"#DistStats2", stats:simResult2.dist_stats });
    }
    
    $("#DistStats").children().first().tabulator({
        fitColumns:true,
        movableCols: true,
        columns:[ 
            {title:"Stat", field:"name", formatter:myFormatter, tooltip:tooltipFunc},
            {title:"Min", field:"min", sortable:false, formatter:myFormatter, formatterParams:{formatAs:"money"}},
            {title:"5th Percentile", field:"fifth_percentile", sortable:false, formatter:myFormatter, formatterParams:{formatAs:"money"}},
            {title:"Mean", field:"mean", formatter:myFormatter, sortable:false, formatterParams:{formatAs:"money"}},
            {title:"95th Percentile", field:"nintey_fifth_percentile", sortable:false, formatter:myFormatter, formatterParams:{formatAs:"money"}},
            {title:"Max", field:"max", formatter:myFormatter, sortable:false, formatterParams:{formatAs:"money"}},
            {title:"Standard Deviation", field:"std_dev", sortable:false, formatter:myFormatter, formatterParams:{formatAs:"money"}}
        ]
    });
    
    var s = []
    for (var key in simResult1.dist_stats) {
        if (simResult1.dist_stats.hasOwnProperty(key)) {
            s.push(simResult1.dist_stats[key]);
            
            if (displayBoth){
                var stratTwoData = simResult2.dist_stats[key];
                stratTwoData.name = stratTwoData.name + " (Strategy 2)";
                s.push(stratTwoData);
            }
        }
    }
    
    $("#DistStats").children().first().tabulator("setData", s);
    
    if (!displayBoth){    
        $("#MainStats").children().first().tabulator({
            fitColumns:true,
            movableCols: true,
            columns:[
                {title:"Stat", field:"name", sorter:"string", formatter:myFormatter},
                {title:"Value", field:"stat", sorter:"number", formatter:myFormatter}
            ]
        });
    } else {
        $("#MainStats").children().first().tabulator({
            fitColumns:true,
            movableCols: true,
            columns:[
                {title:"Stat", field:"name", sorter:"string", formatter:myFormatter},
                {title:"Strategy 1 Value", field:"stat", sorter:"number", formatter:myFormatter},
                {title:"Strategy 2 Value", field:"stat2", sorter:"number", formatter:myFormatter},
                {title:"Difference", field:"diff", sorter:"number", formatter:myFormatter}
            ]
        });
    }
    
    var s = []
    for (var key in simResult1.stats) {
        if (simResult1.stats.hasOwnProperty(key)) {
            var data = { name:key, stat:simResult1.stats[key] };
            if (simResult2 != null){
                data.stat2 = simResult2.stats[key];
                
                var tryParseFloat = parseFloat(simResult1.stats[key]);
                if (!isNaN(tryParseFloat)){
                    var diff = tryParseFloat - parseFloat(simResult2.stats[key]);
                    data.diff = diff;
                } else if (simResult2.stats[key] == true || simResult2.stats[key] == false) {
                    if (simResult2.stats[key] != simResult1.stats[key]){
                        data.diff = "different";
                    } else {
                        data.diff = "none";                        
                    }
                } else {
                    data.diff = "";
                }
            }
        
            s.push(data);
        }
    }
    
    $("#MainStats").children().first().tabulator("setData", s);
}

function hideStats(){
    $(".Stats").children().hide(200);
}

var simResult1, simResult2;
$(document).ready(function () {
    $('.runSimButt').click(function () {
        if (!validateForm()){
            $(this).effect("highlight", { color: "red" }, 1000);
            return;
        }
        
        $(".Stats").hide();
        $(".StatsChild").children().remove();
        $(".StatsChild").each(function (){
            $("<div class=\"tabulator\"></div>").appendTo($(this));
        });
        doStatsDisplay = false;
        
        $("#simgraph").remove();
        $(".showParamsButt").remove();
        $(".displayStatsButt").remove();
        $(".Key:visible").remove();
        $(".Results:visible").remove();

        $(".runSimButt").hide(350); // This is so you don't notice how long the web calls take :)
        $(".compareButt").hide(350);

        var body = $("#actualBody");

        var data = {};


        requests = [];
        failureThresholds = [];
        $(document).find(".CreateSimulation").each(function (){
            requests.push(getJsonRequest($(this)));
            failureThresholds.push(Number(requests[requests.length-1].failure_threshold))
        });
        
        currentYear = requests[0].min_year;

        $("<label type=\"submit\" class=\"showParamsButt\">+</label>").appendTo(body).click(function() {
            if ($(".showParamsButt").text() == "+"){
                $(".showParamsButt").text("-");
                showInputs();
            } else {
                $(".showParamsButt").text("+");
                hideInputs();
            }
        });

        $("<p id=\"simgraph\"></p>").appendTo(body);


        function success(result1, result2) {
            // Clearly there is something I am missing.
            // On single ajax call we get the data in result1
            // On double ajax call we get the data at result1[0] and result2[0]
            // Not sure why, but its working for now...so TODO figure this out.
            console.log(JSON.stringify(result1));
            $("#keyClone").clone().removeAttr('id').insertAfter("#simgraph").show();
            $("#resultsClone").clone().removeAttr('id').insertAfter("#simgraph").show();
            sim.init(
                Number(requests[0].retirement_length),
                Number(requests[0].initial_portfolio_value),
                Number(requests[0].min_year),
                Number(requests[0].max_year),
                failureThresholds,
                displayYearCallback);
            if (requests.length == 2) {
                simResult1 = result1[0];
                simResult2 = result2[0];
                $(".keyLabel1").find("circle").each(function (){
                    $(this).css('opacity', '0.5');
                });
                $(".keyLabel2").find("circle").each(function (){
                    $(this).css('opacity', '0.5');
                });
                $(".keyLabel2").show();
                
                $("label.successRate1").each(function (){
                    $(this).html((result1[0].stats.success_rate * 100).toFixed(0) + " % (Strategy 1)");
                });
                
                $("label.successRate2").each(function (){
                    $(this).html((result2[0].stats.success_rate * 100).toFixed(0) + " % (Strategy 2)");
                });                
                
                sim.showSimulation(result1[0], result2[0]);
            } else {
                simResult1 = result1;
                simResult2 = null;
                $(".keyLabel1").find("circle").each(function (){
                    $(this).css('opacity', '0.9');
                });
                $(".keyLabel2").hide();
                $("label.successRate1").each(function (){
                    $(this).html((result1.stats.success_rate * 100).toFixed(0) + " %");
                });
                $("label.successRate2").hide();
                sim.showSimulation(result1, null);
            }
            $("<label type=\"submit\" class=\"displayStatsButt\">Show Statistics</label>").appendTo(body).click(function() {
                if ($(this).text() == "Show Statistics"){
                    $(this).text("Hide Statistics");
                    showStats();
                } else {
                    $(this).text("Show Statistics");
                    hideStats();
                }
            });           
            
            $(".Stats").appendTo($("#actualBody")).hide();
        }
        function failure(response) {
            alert("Failed to call web server." + JSON.stringify(response)); // TODO clean up error conditions
        }

        // There has to be a better way to write this...
        if (requests.length == 1){
            $.when(
                $.ajax({
                    type: 'POST',
                    url: '/simulations',
                    data: JSON.stringify(requests[0]),
                    contentType: "application/json",
                    dataType: 'json'
                }))
            .then(success, failure);
        } else {
            $.when(
                $.ajax({
                    type: 'POST',
                    url: '/simulations',
                    data: JSON.stringify(requests[0]),
                    contentType: "application/json",
                    dataType: 'json'
                }),
                $.ajax({
                    type: 'POST',
                    url: '/simulations',
                    data: JSON.stringify(requests[1]),
                    contentType: "application/json",
                    dataType: 'json'
                }))
            .then(success, failure);
        }

        hideInputs();
    });
});

var comparing = false;
$(document).ready(function () {
    $('.compareButt').click(function () {
        if (!comparing){
            comparing = true;
            $(".runSimButt").hide();

            var newCreateDiv = $("#createClone").clone().removeAttr('id').insertAfter(".compareButt").show('slow');
            newCreateDiv.find('.caSelect').click(function () {
                addStrategy("ConstAmount", "const_amount", $(".CreateSimulation").last(), 1);
            });
            newCreateDiv.find(".cpSelect").click(function () {
                addStrategy("ConstPercent", "const_percent", $(".CreateSimulation").last(), 1);
            });
            newCreateDiv.find('.gkSelect').click(function () {
                addStrategy("GuytonKlinger", "guyton_klinger", $(".CreateSimulation").last(), 1);
            });
            newCreateDiv.find(".hebelerSelect").click(function () {
                addStrategy("HebelerAutopilot", "hebeler_autopilot", $(".CreateSimulation").last(), 1);
            });
            newCreateDiv.find('.vpwSelect').click(function () {
                addStrategy("VPW", "vpw", $(".CreateSimulation").last(), 1);
            });
            newCreateDiv.find('input[name=initial_portfolio_value]').change(function () {
                portfolioChange($(this), 1);
            });
            newCreateDiv.find('input[name=initial_portfolio_value]').focus(function () {
                $(this).data('oldVal', myFloatParse($(this).val(), allowNeg=false));
            });

            newCreateDiv.find('input[name=retirement_length]').change(function () {
                var newVal = myFloatParse($(this).val(), allowNeg=false);
                $(this).val(newVal).digits();
            });
            newCreateDiv.find('input[name=failure_threshold]').change(function () {
                var newVal = myFloatParse($(this).val(), allowNeg=false);
                $(this).val(newVal).digits();
            });   

            newCreateDiv.find('input[name=retirement_length]').change(function () {
                var value = Math.floor(myFloatParse($(this).val(), allowNeg=false));
                $(document).find('.CreateSimulation').first().find('input[name=retirement_length]').each(function (){
                    $(this).val(value).digits().effect("highlight", { color: '#84b1f9'}, 3000);
                });
            });

            $(this).text("Remove Second Strategy");
        } else {
            $(".runSimButt").show();
            comparing = false;
            var lastCreate = $(".CreateSimulation").last();
            $(lastCreate).nextUntil(".CreateSimulation").each(function () {
                if ($(this).is(":visible") && $(this).attr('class') == "Strategy") {
                    $(this).remove();
                }
            });

            strategies[1] = [];

            $(lastCreate).remove();
            $(this).text("Compare With Another Strategy");
        }
    });
});

function runSimulationAvailable(){
    var available = false;
    $('.CreateSimulation').each(function () {
        available = false;
        $(this).nextUntil(".CreateSimulation").each(function () {
            if ($(this).is(":visible") && $(this).attr('class') == "Strategy") {
                available = true;
            }
        });

        if (!available){
            return false;
        }
    });

    return available;
}

var strategies = [[],[]]
var stratId = 0;
function addStrategy(c, t, create, strategyIndex){
    var ratio;
    $(create).find('input[name=initial_portfolio_value]').each(function() {
        ratio = myFloatParse($(this).val(), allowNeg=false) / 1000000.0;
    });

    if (strategies[strategyIndex].length == 0){
       var newStratDiv = $("#stratClone").clone()
                                  .removeAttr('id')
                                  .insertAfter($(create))
                                  .show();
    } else {
        var newStratDiv = $("#stratClone").clone()
                                          .removeAttr('id')
                                          .insertAfter($(strategies[strategyIndex][strategies[strategyIndex].length -1]))
                                          .show();
    }

    stratId++;
    newStratDiv.data("stratId", stratId);
    strategies[strategyIndex].push(newStratDiv);
    $(newStratDiv).data("type", t);
    $(newStratDiv).data("strategyIndex", strategyIndex);
    var newStrat = $("." + c).last().clone();
    if (c == "GuytonKlinger"){
        $("<legend>Guyton Klinger</legend>").appendTo(newStratDiv.find('.stratFieldset'));
        $(newStrat).find('input[name=initial_amount]').each(function() {
            var defaultVal = myFloatParse($(this).val(), allowNeg=false);
            $(this).val(defaultVal * ratio).digits();
        });
    }

    if (c == "ConstAmount"){
        $("<legend>Constant Amount</legend>").appendTo(newStratDiv.find('.stratFieldset'));
        $(newStrat).find('input[name=amount]').each(function() {
            var defaultVal = myFloatParse($(this).val(), allowNeg=false);
            $(this).val(defaultVal * ratio).digits();
        });
    }

    if (c == "ConstPercent") {
        $("<legend>Constant Percent</legend>").appendTo(newStratDiv.find('.stratFieldset'));
    }

    if (c == "HebelerAutopilot") {
        $("<legend>Hebeler Autopilot</legend>").appendTo(newStratDiv.find('.stratFieldset'));
    }

    if (c == "VPW") {
        $("<legend>VPW</legend>").appendTo(newStratDiv.find('.stratFieldset'));
    }
    
    // Right now all the strategies have numeric and only positive input.
    $(newStrat).find('.input_strat').change(function() {
        var newVal = myFloatParse($(this).val(), allowNeg=false);
        $(this).val(newVal).digits();
    });

    $(newStrat).find('input[name=expected_return_percent]').off('change').change(function() {
        var newVal = myFloatParse($(this).val(), allowNeg=false);
        $(this).val(newVal);
    });

    $(newStrat).appendTo(newStratDiv.find('.stratFieldset')).show();

    var id = stratId;
    $(newStratDiv).find(".removeStrategyButt").click(function(){
        for (var i = 0; i < strategies[strategyIndex].length; i++){
            if (strategies[strategyIndex][i].data("stratId") == id){
                strategies[strategyIndex].splice(i, 1);
            }
        }

        $(this).parent().parent().parent().remove()
        balanceWeights();

        if (!runSimulationAvailable()){
            $(".runSimButt").hide('slow');
        }
    });

    if (runSimulationAvailable()){
        $(".runSimButt").show();
    }

    $(".compareButt").show();

    $(newStratDiv).find(".weight").change(function (){
        $(this).data('manualChange', true);
        balanceWeights();
    });

    $(newStratDiv).find(".stocks").change(function (){
        var newVal = Math.floor(myFloatParse($(this).val(), allowNeg=false));
        $(this).val(newVal);

        var bondVal = 100 - newVal;
        $(this).parent().parent()
        .find(".bonds")
        .val(bondVal.toFixed(0))
        .effect("highlight", { color: '#84b1f9'}, 3000); // Thats like a lightish blueish color.
    });

    $(newStratDiv).find(".bonds").change(function (){
        var newVal = Math.floor(myFloatParse($(this).val(), allowNeg=false));
        $(this).val(newVal);

        var stockVal = 100 - newVal;
        $(this).parent().parent()
        .find(".stocks")
        .val(stockVal.toFixed(0))
        .effect("highlight", { color: '#84b1f9'}, 3000); // Thats like a lightish blueish color.
    });

    balanceWeights();
}

$(document).ready(function (e) {
    $('.caSelect').click(function () {
        addStrategy("ConstAmount", "const_amount", $(".CreateSimulation").first(), 0);
    });

    $('.cpSelect').click(function () {
        addStrategy("ConstPercent", "const_percent", $(".CreateSimulation").first(), 0);
    });

    $('.gkSelect').click(function () {
        addStrategy("GuytonKlinger", "guyton_klinger", $(".CreateSimulation").first(), 0);
    });

    $('.hebelerSelect').click(function () {
        addStrategy("HebelerAutopilot", "hebeler_autopilot", $(".CreateSimulation").first(), 0);
    });

    $('.vpwSelect').click(function () {
        addStrategy("VPW", "vpw", $(".CreateSimulation").first(), 0);
    });
});

$(document).ready(function (e) {
    $('.CreateSimulation').find('input[name=initial_portfolio_value]').change(function () {
        portfolioChange($(this), 0);
    });

    $('.CreateSimulation').find('input[name=initial_portfolio_value]').focus(function () {
        $(this).data('oldVal', myFloatParse($(this).val(), allowNeg=false));
    });
            
    $('.CreateSimulation').find('input[name=retirement_length]').change(function () {
        var newVal = myFloatParse($(this).val(), allowNeg=false);
        $(this).val(newVal).digits();
    });
    $('.CreateSimulation').find('input[name=failure_threshold]').change(function () {
        var newVal = myFloatParse($(this).val(), allowNeg=false);
        $(this).val(newVal).digits();
    });   
});

$(document).ready(function (e) {
    $('.CreateSimulation').find('input[name=retirement_length]').change(function () {
        if ($(document).find('.CreateSimulation').length > 1){
            var value = Math.floor(myFloatParse($(this).val(), allowNeg=false));
            $(document).find('.CreateSimulation').last().find('input[name=retirement_length]').each(function (){
                $(this).val(value).effect("highlight", { color: '#84b1f9'}, 3000);
            });
        }
    });
});

function portfolioChange(inputDiv, strategyIndex){
    $(inputDiv).digits();
    var oldVal = myFloatParse(inputDiv.data('oldVal'), allowNeg=false);
    var newVal = myFloatParse($(inputDiv).val());

    if (newVal == oldVal){
        return;
    }

    var ratio = newVal / oldVal;

    $('.Strategy').each(function (){
        if (Number($(this).data("strategyIndex")) == strategyIndex){
            $(this).find('.GuytonKlinger :input').each(function (){
                var old = $(this).val();
                $(this).val(myFloatParse(old, allowNeg=false) * ratio, allowNeg=false).digits().effect("highlight", { color: '#84b1f9'}, 3000);
            });

            $(this).find('.ConstAmount :input').each(function (){
                var old = $(this).val();
                $(this).val(myFloatParse(old, allowNeg=false) * ratio, allowNeg=false).digits().effect("highlight", { color: '#84b1f9'}, 3000);
            });
        }
    });

    if (strategyIndex == 0){
        $('.CreateSimulation').first().find('input[name=failure_threshold]').each(function () {
            var old = $(this).val();
            $(this).val(myFloatParse(old) * ratio).digits().effect("highlight", { color: '#84b1f9'}, 3000);
        });
    } else {
        $('.CreateSimulation').last().find('input[name=failure_threshold]').each(function () {
            var old = $(this).val();
            $(this).val(myFloatParse(old) * ratio).digits().effect("highlight", { color: '#84b1f9'}, 3000);
        });
    }
}

function balanceWeights() {
    $(':input').stop(true, true);
    for (i = 0; i < 2; i++){
        var weightCount = 0;
        var roundingError = 100.0;
        var accountedFor = 0.0;

        $('.weight').each(function (){
            if (Number($(this).parent().parent().parent().data("strategyIndex")) == i){
                if ($(this).data("manualChange")){
                    accountedFor += Math.floor(myFloatParse($(this).val(), allowNeg=false));
                } else {
                    weightCount++;
                }
            }
        });

        if (accountedFor > 100.0){
            accountedFor = 0.0;
            $('.weight').each(function (){
                if (Number($(this).parent().parent().parent().data("strategyIndex")) == i){
                    $(this).data("manualChange", false)
                }
            });
        }

        var lastWeightChanged = null;
        $('.weight').each(function (){
            if (Number($(this).parent().parent().parent().data("strategyIndex")) == i){
                if (!$(this).data("manualChange")){
                    var newString = Math.floor((100.0-accountedFor)/weightCount);
                    if ($(this).val() != newString){
                        $(this).val(newString);
                       lastWeightChanged = $(this);
                    }
                }

                roundingError -= Math.floor(myFloatParse($(this).val(), allowNeg=false));
           }
        });

        if (lastWeightChanged != null){
            var newVal = myFloatParse(lastWeightChanged.val(), allowNeg=false);
            newVal += roundingError;
            lastWeightChanged.val(Math.floor(newVal)).digits();
        }

        $('.weight').each(function (){
            if (Number($(this).parent().parent().parent().data("strategyIndex")) == i){
                weightChanged($(this));
            }
        });
    }
}

function weightChanged(weightInputReference) {
    var oldVal = Math.floor(myFloatParse(weightInputReference.data('oldVal'), allowNeg=false));
    var newVal = Math.floor(myFloatParse($(weightInputReference).val(), allowNeg=false));
    $(weightInputReference).data('oldVal', newVal);
    $(weightInputReference).val(newVal);

    if (newVal == oldVal){
        return;
    }

    var highlight = true;
    if (isNaN(oldVal)){
        oldVal = 100.0;
        if (newVal == 100){
            highlight = false;
        }
    }

    var ratio = newVal / oldVal;

    if (highlight){
        $(weightInputReference).effect("highlight", { color: '#84b1f9'}, 3000);
    }

    $(weightInputReference).parent().parent().parent().find('.GuytonKlinger :input').each(function (){
        var old = $(this).val();
        $(this).val(Math.floor(myFloatParse(old, allowNeg=false) * ratio)).digits();
        if (highlight){
            $(this).effect("highlight", { color: '#84b1f9'}, 3000);
        }
    });

    $(weightInputReference).parent().parent().parent().find('.ConstAmount :input').each(function (){
        var old = $(this).val();
        $(this).val(Math.floor(myFloatParse(old, allowNeg=false) * ratio)).digits();
        if (highlight){
            $(this).effect("highlight", { color: '#84b1f9'}, 3000);
        }
    });
}