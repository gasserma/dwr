function scaleCallback(ratio){
    $(".successRate1, .successRate2, .keyLabelboth, .keyLabel1, .keyLabel2").each(function() {
        var current = parseFloat($(this).css("font-size"));
        var newSize = Math.max(10, (current * ratio));
        $(this).css("font-size", newSize.toFixed(0)+"px")
    });
}

function success(result1, result2) {
    // Clearly there is something I am missing.
    // On single ajax call we get the data in result1
    // On double ajax call we get the data at result1[0] and result2[0]
    // Not sure why, but its working for now...so TODO figure this out.
    var maxW = $(window).width();
    var maxH = $(window).height();
    
    sim.init(
        Number(requests[0].retirement_length),
        Number(requests[0].initial_portfolio_value),
        Number(requests[0].min_year),
        Number(requests[0].max_year),
        0.0,
        null,
        maxW,
        maxH,
        4*1000*1000,
        scaleCallback,
        element);
    if (requests.length == 2) {
        result1.grumpy_amt = 40000;
        sim.showSimulation(result1[0], result2[0]);
    } else {
        result1.grumpy_amt = 40000;
        result2.grumpy_amt = 40000;
        sim.showSimulation(result1, null);
    }
}

function failure(response) {
    alert("Failed to call web server." + JSON.stringify(response)); // TODO clean up error conditions
}

// This function is a hearkening back to the days of not knowing how the shit to write code.
// Instead of carefully and thoughtfully designed OO or functional principals, we just
// use a deluge of global variables and just hope for the best.
//
// Consider caching all this stuff. Its not changing.
// Wouldn't it be fun to have scale issues? :)
function call(){
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
}

var requests = [];
var element = null;
$(document).ready(function () {
    $('.trinityGraphButt').click(function () {
        $("#compareGraph").hide().children().remove();
        $(".compareGraphButt").text("Show Graph");
        $("#percentGraph").hide().children().remove();
        $(".percentGraphButt").text("Show Graph");

        $("#trinityGraph").toggle(350);
        if ($(".trinityGraphButt").text() == "Show Graph"){
            $('.trinityGraphButt').text("Hide Graph");

            element = "#trinityGraph";
            requests = [];
            requests.push({
                initial_portfolio_value:1000000,
                retirement_length:30,
                failure_threshold:0,
                min_year:1926,
                max_year:2009,
                strategies:[
                    {
                        weight:1.0,
                        type:"const_amount",
                        args:{
                            amount:40000
                        },
                        asset_allocation:[.5, .5]
                    }
                ]
            });
            call();
        } else {
            $('.trinityGraphButt').text("Show Graph");
        }
    });
});


$(document).ready(function () {
    $('.percentGraphButt').click(function () {
        $("#compareGraph").hide().children().remove();
        $(".compareGraphButt").text("Show Graph");
        $("#trinityGraph").hide().children().remove();
        $(".trinityGraphButt").text("Show Graph");

        $("#percentGraph").toggle(350);
        if ($(".percentGraphButt").text() == "Show Graph"){
            $('.percentGraphButt').text("Hide Graph");

            element = "#percentGraph";
            requests = [];
            requests.push({
                initial_portfolio_value:1000000,
                retirement_length:30,
                failure_threshold:20000,
                min_year:1926,
                max_year:2009,
                strategies:[
                    {
                        weight:1.0,
                        type:"const_percent",
                        args:{
                            percent:.04
                        },
                        asset_allocation:[.5, .5]
                    }
                ]
            });
            call();
        } else {
            $('.percentGraphButt').text("Show Graph");
        }
    });
});

$(document).ready(function () {
    $('.compareGraphButt').click(function () {
        $("#trinityGraph").hide().children().remove();
        $(".trinityGraphButt").text("Show Graph");
        $("#percentGraph").hide().children().remove();
        $(".percentGraphButt").text("Show Graph");


        $("#compareGraph").toggle(350);
        if ($(".compareGraphButt").text() == "Show Graph"){
            $('.compareGraphButt').text("Hide Graph");

            element = "#compareGraph";
            requests = [];
            requests.push({
                initial_portfolio_value:1000000,
                retirement_length:30,
                failure_threshold:0,
                min_year:1926,
                max_year:2009,
                strategies:[
                    {
                        weight:1.0,
                        type:"const_amount",
                        args:{
                            amount:40000
                        },
                        asset_allocation:[.5, .5]
                    }
                ]
            });
            requests.push({
                initial_portfolio_value:1000000,
                retirement_length:30,
                failure_threshold:20000,
                min_year:1926,
                max_year:2009,
                strategies:[
                    {
                        weight:1.0,
                        type:"const_percent",
                        args:{
                            percent:.04
                        },
                        asset_allocation:[.5, .5]
                    }
                ]
            })
            call();
        } else {
            $('.compareGraphButt').text("Show Graph");
        }
    });
});