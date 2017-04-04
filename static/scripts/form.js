$(document).ready(function () {
    $("p").click(function () {
        $(this).hide();
    });
});

// The form submission
// Munges everything to json and sends it off to the server.
$(document).ready(function () {
    $("form[name='simulate']").on("submit", function (e) {
        e.preventDefault();
        var data = {}

        $(".input_main").each(function () {
            data[this.name] = this.value
        });

        data['strategies'] = [];
        $(".strategy:visible").each(function () {
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
        console.log(j)

        $.ajax({
            type: 'POST',
            url: '/simulations',
            data: j,
            contentType: "application/json",
            dataType: 'json',
            success: function(data) {
                alert('data: ' + JSON.stringify(data));
                showSimulation(data);
            }
        });
    });
});

var strategyIndex = 0;
$(document).ready(function () {
    $('#sdd').change(function () {
        var selected = $('#sdd').find(":selected").text();
        var newStratDiv = $("<div class=\"strategy\">");
        newStratDiv.appendTo('form');

        if (selected == "Guyton-Klinger") {
            $(newStratDiv).data("type", "guyton_klinger")
            $("<label for=\"strategy_" + strategyIndex + "\" id=\"label_" + strategyIndex + "\">Initial Withdrawal Amount</label>").hide().appendTo(newStratDiv).show('slow');
            $("<input type=\"text\" name=\"initial_amount\" id=\"strategy_" + strategyIndex + "\" value=\"50000\" class=\"input_strat\"/>").hide().appendTo(newStratDiv).show('slow');
        } else if (selected == "Constant Amount") {
            $(newStratDiv).data("type", "const_amount")
            $("<label for=\"strategy_" + strategyIndex + "\" id=\"label_" + strategyIndex + "\">Amount</label>").hide().appendTo(newStratDiv).show('slow');
            $("<input type=\"text\" name=\"amount\" id=\"strategy_" + strategyIndex + "\" value=\"40000\" class=\"input_strat\"/>").hide().appendTo(newStratDiv).show('slow');
        } else if (selected == "Constant Percent") {
            $(newStratDiv).data("type", "const_percentage")
            $("<label for=\"strategy_" + strategyIndex + "\" id=\"label_" + strategyIndex + "\">Percent</label>").hide().appendTo(newStratDiv).show('slow');
            $("<input type=\"text\" name=\"percent\" id=\"strategy_" + strategyIndex + "\" value=\".04\" class=\"input_strat\"/>").hide().appendTo(newStratDiv).show('slow');
        } else if (selected == "none") {
            //pass
        } else {
            alert("Unrecognized Selection.")
        }

        $("<label for=\"weight_" + strategyIndex + "\" id=\"weight_label_" + strategyIndex + "\">Weight</label>").hide().appendTo(newStratDiv).show('slow');
        $("<input type=\"text\" name=\"weight\" id=\"weight_" + strategyIndex + "\" value=\"1.0\" class=\"weight\"/>").hide().appendTo(newStratDiv).show('slow');

        $("<label for=\"stocks_" + strategyIndex + "\" id=\"stocks_label_" + strategyIndex + "\">Stock Allocation</label>").hide().appendTo(newStratDiv).show('slow');
        $("<input type=\"text\" name=\"stocks\" id=\"stocks_" + strategyIndex + "\" value=\".5\" class=\"stocks\"/>").hide().appendTo(newStratDiv).show('slow');

        $("<label for=\"bonds_" + strategyIndex + "\" id=\"bonds_label_" + strategyIndex + "\">Bond Allocation</label>").hide().appendTo(newStratDiv).show('slow');
        $("<input type=\"text\" name=\"bonds\" id=\"bonds_" + strategyIndex + "\" value=\".5\" class=\"bonds\"/>").hide().appendTo(newStratDiv).show('slow');

        strategyIndex++;
    });
});

// Wait for the DOM to be ready
$(document).ready(function () {
    $("form[name='simulate']").validate({
        // Specify validation rules
        rules: {
            initial_portfolio_value: "required", // TODO custom rules for weights sum to 1, and the fields for the various strategies
            retirement_length: "required",
            failure_threshhold: "required"
        },
        // Specify validation error messages
        messages: {
            initial_portfolio_value: "Please enter an initial portfolio value.", // TODO custom rules for weights sum to 1, and the fields for the various strategies
            retirement_length: "Please enter a retirement length.",
            failure_threshhold: "Please enter a failure threshhold."
        }
    });
});