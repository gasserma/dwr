$(document).ready(function () {
    $('.runSimButt').click(function () {
        $("#simgraph").remove();
        var body = $("#actualBody");
        $("<p id=\"simgraph\"></p>").appendTo(body);

        var data = {}

        $(".input_main").each(function () {
            data[this.name] = this.value
        });

        data['strategies'] = [];
        $(".Strategy:visible").each(function () {
            var strat = {};
            $(this).find(".input_strat").each(function() {
                strat['args'] = {};
                strat['args'][this.name] = this.value;
            });

            $(this).find(".weight").each(function() {
                strat["weight"] = this.value;
            });

            var assets = [];
            $(this).find(".stocks").each(function() {
                assets.push(this.value);
            });

            $(this).find(".bonds").each(function() {
                assets.push(this.value);
            });

            strat["asset_allocation"] = assets;
            strat["type"] = $(this).data("type");
            data['strategies'].push(strat)
        });

        data['dropdown'] = $('#sdd').find(":selected").attr("name");

        var j = JSON.stringify(data);
        console.log(j);

        $.ajax({
            type: 'POST',
            url: '/simulations',
            data: j,
            contentType: "application/json",
            dataType: 'json',
            success: function(data) {
                console.log('data: ' + JSON.stringify(data));
                showSimulation(data);
            }
        });
    });
});

var strategyCount = 0;
function addStrategy(c, t){
    var newStratDiv = $(".Strategy").last().clone().appendTo("#actualBody").show('slow');
    $(newStratDiv).data("type", t);
    $("<legend>" + c + "</legend>").last().clone().appendTo(newStratDiv.find('.stratFieldset'));
    $("." + c).last().clone().appendTo(newStratDiv.find('.stratFieldset')).show('slow');
    $(newStratDiv).find(".removeStrategyButt").click(function()
    {
        $(this).parent().parent().parent().remove()
        strategyCount--;
        if (strategyCount <= 0)
        {
            strategyCount = 0;
            $(".runSimButt").hide('slow');
        }
    });

    $(".runSimButt").show();
    strategyCount++;
}

$(document).ready(function (e) {
    $('#caSelect').click(function () {
        addStrategy("ConstAmount", "const_amount");
    });
});

$(document).ready(function (e) {
    $('#cpSelect').click(function () {
        addStrategy("ConstPercent", "const_percent");
    });
});

$(document).ready(function (e) {
    $('#gkSelect').click(function () {
        addStrategy("GuytonKlinger", "guyton_klinger");
    });
});