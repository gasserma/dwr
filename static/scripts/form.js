$.fn.digits = function(){ 
    return this.each(function(){ 
        $(this).val( $(this).val().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") ); 
    })
}

function myFloatParse(s){
    if (typeof s == "string"){
        s = s.replace(new RegExp(',', 'g'), '');    
    }
    
    return parseFloat(s);
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
function displayYearCallback(year){
    currentYear = year;
    yearIndex = currentYear - minYear;
    
    $(".YearlyStats").tabulator({
        fitColumns:true, //fit columns to width of table (optional)
        columns:[ //Define Table Columns
            {title:"Stat", field:"name", sorter:"string", width:150},
            {title:"Value", field:"stat", sorter:"number", align:"left"}
        ],
        rowClick:function(e, id, data, row){ //trigger an alert message when the row is clicked
            alert("Row " + id + " Clicked!!!!");
        },
    });
    
    var s = []
    for (var key in simResult1.yearly_stats) {
        if (simResult1.yearly_stats.hasOwnProperty(key)) {
            s.push({name:key, stat:simResult1.yearly_stats[key][yearIndex]});
        }
    }
    
    $(".YearlyStats").tabulator("setData", s);
}

function showStats(){
    $(".DistStats").tabulator({
        fitColumns:true, //fit columns to width of table (optional)
        columns:[ //Define Table Columns
            {title:"Stat", field:"name", sorter:"string", width:150},
            {title:"Min", field:"min", sorter:"number", align:"left"},
            {title:"5th Percentile", field:"fifth_percentile", sorter:"number", align:"left"},
            {title:"Mean", field:"mean", sorter:"number", align:"left"},
            {title:"95th Percentile", field:"nintey_fifth_percentile", sorter:"number", align:"left"},
            {title:"Max", field:"max", sorter:"number", align:"left"},
        ],
        rowClick:function(e, id, data, row){ //trigger an alert message when the row is clicked
            alert("Row " + id + " Clicked!!!!");
        },
    });
    $(".DistStats").tabulator("setData", simResult1.dist_stats);
    
    $(".MainStats").tabulator({
        fitColumns:true, //fit columns to width of table (optional)
        columns:[ //Define Table Columns
            {title:"Stat", field:"name", sorter:"string", width:150},
            {title:"Value", field:"stat", sorter:"number", align:"left"}
        ],
        rowClick:function(e, id, data, row){ //trigger an alert message when the row is clicked
            alert("Row " + id + " Clicked!!!!");
        },
    });
    
    var stats = []
    for (var key in simResult1.stats) {
        if (simResult1.stats.hasOwnProperty(key)) {
            stats.push({name:key, stat:simResult1.stats[key]});
        }
    }
    
    $(".MainStats").tabulator("setData", stats);
    
    
    $(".YearlyStats").show(200);
    $(".MainStats").show(200);
    $(".DistStats").show(200);
}

function hideStats(){
    $(".YearlyStats").hide(200);
    $(".MainStats").hide(200);
    $(".DistStats").hide(200);
}

var simResult1, simResult2;
$(document).ready(function () {
    $('.runSimButt').click(function () {
        if (!validateForm()){
            $(this).effect("highlight", { color: "red" }, 1000);
            return;
        }
        $("#simgraph").remove();
        $(".showParamsButt").remove();
        $(".Key:visible").remove();
        $(".Results:visible").remove();

        $(".runSimButt").hide(350); // This is so you don't notice how long the web calls take :)
        $(".compareButt").hide(350);

        var body = $("#actualBody");

        var data = {};


        requests = [];
        failureThreshholds = [];
        $(document).find(".CreateSimulation").each(function (){
            requests.push(getJsonRequest($(this)));
            failureThreshholds.push(Number(requests[requests.length-1].failure_threshhold))
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
                failureThreshholds,
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
            
            $(".displayStatsButt").appendTo($("#actualBody")).html("Show Statistics").show();
            $(".YearlyStats").appendTo($("#actualBody")).hide();
            $(".MainStats").appendTo($("#actualBody")).hide();
            $(".DistStats").appendTo($("#actualBody")).hide();
            $(".displayStatsButt").click(function() {
                if ($(".displayStatsButt").text() == "Show Statistics"){
                    $(".displayStatsButt").text("Hide Statistics");
                    showStats();
                } else {
                    $(".displayStatsButt").text("Show Statistics");
                    hideStats();
                }
            });
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
                $(this).data('oldVal', myFloatParse($(this).val()));
            });

            newCreateDiv.find('input[name=retirement_length]').change(function () {
                var value = Math.floor(myFloatParse($(this).val()));
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
        ratio = myFloatParse($(this).val()) / 1000000.0;
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
            var defaultVal = myFloatParse($(this).val());
            $(this).val(defaultVal * ratio).digits();
        });
    }

    if (c == "ConstAmount"){
        $("<legend>Constant Amount</legend>").appendTo(newStratDiv.find('.stratFieldset'));
        $(newStrat).find('input[name=amount]').each(function() {
            var defaultVal = myFloatParse($(this).val());
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
        var newVal = Math.floor(myFloatParse($(this).val()));
        $(this).val(newVal);

        var bondVal = 100 - newVal;
        $(this).parent().parent()
        .find(".bonds")
        .val(bondVal.toFixed(0))
        .effect("highlight", { color: '#84b1f9'}, 3000); // Thats like a lightish blueish color.
    });

    $(newStratDiv).find(".bonds").change(function (){
        var newVal = Math.floor(myFloatParse($(this).val()));
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
        $(this).data('oldVal', myFloatParse($(this).val()));
    });
});

$(document).ready(function (e) {
    $('.CreateSimulation').find('input[name=retirement_length]').change(function () {
        if ($(document).find('.CreateSimulation').length > 1){
            var value = Math.floor(myFloatParse($(this).val()));
            $(document).find('.CreateSimulation').last().find('input[name=retirement_length]').each(function (){
                $(this).val(value).effect("highlight", { color: '#84b1f9'}, 3000);
            });
        }
    });
});

function portfolioChange(inputDiv, strategyIndex){
    $(inputDiv).digits();
    var oldVal = myFloatParse(inputDiv.data('oldVal'));
    var newVal = myFloatParse($(inputDiv).val());

    if (newVal == oldVal){
        return;
    }

    var ratio = newVal / oldVal;

    $('.Strategy').each(function (){
        if (Number($(this).data("strategyIndex")) == strategyIndex){
            $(this).find('.GuytonKlinger :input').each(function (){
                var old = $(this).val();
                $(this).val(myFloatParse(old) * ratio).digits().effect("highlight", { color: '#84b1f9'}, 3000);
            });

            $(this).find('.ConstAmount :input').each(function (){
                var old = $(this).val();
                $(this).val(myFloatParse(old) * ratio).digits().effect("highlight", { color: '#84b1f9'}, 3000);
            });
        }
    });

    if (strategyIndex == 0){
        $('.CreateSimulation').first().find('input[name=failure_threshhold]').each(function () {
            var old = $(this).val();
            $(this).val(myFloatParse(old) * ratio).digits().effect("highlight", { color: '#84b1f9'}, 3000);
        });
    } else {
        $('.CreateSimulation').last().find('input[name=failure_threshhold]').each(function () {
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
                    accountedFor += Math.floor(myFloatParse($(this).val()));
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

                roundingError -= Math.floor(myFloatParse($(this).val()));
           }
        });

        if (lastWeightChanged != null){
            var newVal = myFloatParse(lastWeightChanged.val());
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
    var oldVal = Math.floor(myFloatParse(weightInputReference.data('oldVal')));
    var newVal = Math.floor(myFloatParse($(weightInputReference).val()));
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
        $(this).val(Math.floor(myFloatParse(old) * ratio)).digits();
        if (highlight){
            $(this).effect("highlight", { color: '#84b1f9'}, 3000);
        }
    });

    $(weightInputReference).parent().parent().parent().find('.ConstAmount :input').each(function (){
        var old = $(this).val();
        $(this).val(Math.floor(myFloatParse(old) * ratio)).digits();
        if (highlight){
            $(this).effect("highlight", { color: '#84b1f9'}, 3000);
        }
    });
}