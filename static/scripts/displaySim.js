// A great deal of this was inspired by Mike Bostocks work in which he gives examples for D3.
// In particular, https://bost.ocks.org/mike/nations/
// Which is just about the best example of visualized 4/5 dimensional data I can find.
//


// sim is the namespace
// In case I forget...
//   things declared like this are PUBLIC
//     this.foo = function foo(args) {...};
//   things declared like this are PRIVATE
//     var bar = function(args) {...};
var sim = new function(){
    // Some remappings so that you can think about a graph instead of constantly having to remember
    // that radius of our circles is the withdrawal rate.
    var x = function(sr) { return sr.year; };
    var y = function(sr) { return sr.portfolio_amt; };
    var radius = function(sr) { return sr.withdrawal; };
    var color = function(sr) {
        if (sr.exceeded){
            if (sr.resultSet == 0){
                return "blue";
            }
            return "green";
        }

        if (sr.resultSet == 0){
            return "red";
        }
        return "yellow";
    };
    var opacity = function(sr) {
        if (comparing()){
            return 0.5;
        }

        return .9;
    };
    var tooltip = function(sr) {
        return "$" + Number(sr.withdrawal.toFixed(0)).toLocaleString('en-US', {currency: 'USD'});
    }

    // This has the potential to fail if we ever get market data for the year 926 or earlier
    var key = function(sr) { return sr.year - (sr.resultSet * 1000)};
    var comparing = function() { return secondSimResults != null }

    var getSingleSimulation = function(simulationStartYear) {
        simulationStartYear = Math.round(simulationStartYear);
        var index = simulationStartYear - simResults.simulation_start;
        var data = [];
        for(simYear=0; simYear < retirementLength + 1; simYear++){
            // These * 1.000001 are ghetto floating point comparisons.
            var ex = simResults.results[index].withdrawals[simYear] * 1.000001 >= simResults.initial_withdrawal_amt;
            data.push({
                portfolio_amt : simResults.results[index].portfolio_values[simYear],
                withdrawal : simResults.results[index].withdrawals[simYear],
                exceeded : ex, //TODO we should name this something to reflect the "or =" part
                year : simYear,
                resultSet : 0
            });

            if (comparing()) {
                ex = secondSimResults.results[index].withdrawals[simYear] * 1.000001 >= secondSimResults.initial_withdrawal_amt;
                data.push({
                    portfolio_amt : secondSimResults.results[index].portfolio_values[simYear],
                    withdrawal : secondSimResults.results[index].withdrawals[simYear],
                    exceeded : ex,
                    year : simYear,
                    resultSet : 1
                });
            }
        }

        return data;
    };

    var currentYear = null;
    var displaySimulationStartYear = function(simulationStartYear) {
        dot.selectAll("title").remove();

        dot.data(getSingleSimulation(simulationStartYear), key)
           .call(position)
           .style("opacity", function(sr) { return opacity(sr); })
           .style("fill", function(sr) { return color(sr); })
           .sort(order)
           .append("svg:title")
           .text(function(sr) { return tooltip(sr); });
        currentYear = Math.round(simulationStartYear);
        label.text(currentYear);
    };

    var manualScroll = function() {
        var yearScale = d3.scaleLinear()
                          .domain([startYear, endYear - retirementLength + 1])
                          .range([box.x + 10, box.x + box.width - 10])
                          .clamp(true);

        // Apparently this is how you cancel ongoing transitions.
        svg.transition().duration(0);

        overlay.on("mouseover", mouseover)
               .on("mouseout", mouseout)
               .on("mousemove", mousemove)
               .on("touchmove", mousemove);

        function mouseover() {
            label.classed("active", true);
        }

        function mouseout() {
            label.classed("active", false);
        }

        function mousemove() {
            displaySimulationStartYear(yearScale.invert(d3.mouse(this)[0]));
        }
    }

    var getMouseOverYear = function() {
        var year = d3.interpolateNumber(startYear, endYear - retirementLength);
        return function(t) {
            displaySimulationStartYear(year(t));
        };
    };

    var position = function(point) {
        point.attr("cx", function(sr) { return xScale(x(sr)); })
             .attr("cy", function(sr) { return yScale(y(sr)); })
             .attr("r", function(sr) { return rScale(radius(sr)); })
    };

    var order = function(a, b) {
        return radius(b) - radius(a);
    };

    var svg, xScale, yScale, rScale, xAxis, yAxis, label, w, h,
        retirementLength, initialPortfolio, startYear, endYear,
        simResults, secondSimResults, // Clearly we are moving from 1 to 2, not 1 to n...
        dot, box, overlay;

    // Init all the svg stuffs
    this.init = function init(length, initPortfolio, start, end) {
        retirementLength = length;
        initialPortfolio = initPortfolio;
        startYear = start;
        endYear = end;

        this.reInit();
    }

    this.reInit = function reInit() {

        // TODO, this is all rather arbirtrary...and we should either be okay with that or not.
        var margins = {top: 10, right: 100, bottom: 50, left: 100};
        w = 1000 - margins.right;
        h = ((w+margins.right)*(1080.0/1920.0)) - margins.top - margins.bottom; // TODO: Convince everyone to buy a 1920 by 1080 screen...

        xScale = d3.scaleLinear().domain([0, retirementLength]).range([0, w]);
        yScale = d3.scaleLinear().domain([0, initialPortfolio * 4]).range([h, 0]);
        rScale = d3.scaleSqrt().domain([0, initialPortfolio / 5.0]).range([0, 35]);

        xAxis = d3.axisBottom(xScale);
        yAxis = d3.axisLeft(yScale)
                  .tickFormat( function(d) { return "$" + d });

        svg = d3.select("#simgraph")
                .append("svg")
                .attr("width", w + margins.left + margins.right)
                .attr("height", h + margins.top + margins.bottom)
                .append("g")
                .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        svg.append("g")
           .attr("class", "x axis")
           .attr("transform", "translate(0," + h + ")")
           .call(xAxis);

        svg.append("g")
           .attr("class", "y axis")
           .call(yAxis);

        svg.append("text")
           .attr("class", "x label")
           .attr("text-anchor", "end")
           .attr("x", w)
           .attr("y", h - 5)
           .text("Years Into Simulation");

        svg.append("text")
           .attr("class", "y label")
           .attr("text-anchor", "end")
           .attr("y", 5)
           .attr("dy", ".75em")
           .attr("transform", "rotate(-90)")
           .text("Portfolio Size in Inflation Adjusted Dollars");

        label = svg.append("text")
                   .attr("class", "year label")
                   .attr("text-anchor", "end")
                   .attr("y", 80)
                   .attr("x", margins.left + 160)
                   .text(startYear.toString());
    };

    this.showSimulation = function showSimulation(results, secondResults){
        simResults = results;
        secondSimResults = secondResults;

        this.reShowSimulation();
    }

    this.reShowSimulation = function reShowSimulation(){
        box = label.node().getBBox();

        // Actually do our animation and initialize the rest.
        dot = svg.append("g")
                 .attr("class", "dots")
                 .selectAll(".dot")
                 .data(getSingleSimulation(startYear))
                 .enter()
                     .append("circle")
                     .attr("class", "dot")
                     .style("opacity", function(sr) { return opacity(sr); })
                     .style("fill", function(sr) { return color(sr); })
                     .call(position)
                     .sort(order);

        var buttSize = 56;
        back = svg.append("svg:image")
                       .attr("class", "backButt")
                       .attr("x", box.x)
                       .attr("y", box.y+box.height)
                       .attr("width", buttSize)
                       .attr("height", buttSize)
                       .attr("xlink:href", "/static/content/back.png")
                       .on("click", function() {
                            svg.transition().duration(0);
                            displaySimulationStartYear((currentYear == startYear) ? startYear : currentYear - 1);
                        });

        reanimate = svg.append("svg:image")
                       .attr("class", "reanimateButt")
                       .attr("x", box.x + buttSize)
                       .attr("y", box.y+box.height)
                       .attr("width", buttSize)
                       .attr("height", buttSize)
                       .attr("xlink:href", "/static/content/refresh.png")
                       .on("click", function() {
                            svg.transition().duration(0);
                            d3.select("svg").remove();
                            sim.reInit();
                            reShowSimulation();
                        });

        fwd = svg.append("svg:image")
                       .attr("class", "fwdButt")
                       .attr("x", box.x + buttSize + buttSize)
                       .attr("y", box.y+box.height)
                       .attr("width", buttSize)
                       .attr("height", buttSize)
                       .attr("xlink:href", "/static/content/fwd.png")
                       .on("click", function() {
                            svg.transition().duration(0);
                            displaySimulationStartYear((currentYear == endYear) ? endYear : currentYear + 1);
                        });

        overlay = svg.append("rect")
                     .attr("class", "overlay")
                     .attr("x", box.x)
                     .attr("y", box.y)
                     .attr("width", box.width)
                     .attr("height", box.height)
                     .on("mouseover", manualScroll);

        animate();
    };

    var animate = function animate(){
        svg.transition()
           .duration((endYear - startYear - retirementLength + 1) * 650) // If I was clever Id reference the yearscale. Also 650ms is totally arbitrary0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
           .ease(d3.easeLinear)
           .attrTween("year", getMouseOverYear);
    };
};