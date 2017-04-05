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
          return "#335EFF";
        }
        return "#FF3333";
    };
    var key = function(sr) { return sr.year; };

    var getSingleSimulation = function(simulationStartYear) {
        simulationStartYear = Math.round(simulationStartYear);
        var index = simulationStartYear - simResults.simulation_start;
        var data = [];
        for(simYear=0; simYear < 30; simYear++){
            var ex = simResults.results[index].withdrawals[simYear] >= simResults.initial_withdrawal_amt;
            data.push({
                portfolio_amt : simResults.results[index].portfolio_values[simYear],
                withdrawal : simResults.results[index].withdrawals[simYear],
                exceeded : ex,
                year : simYear
            });
        }

        return data;
    };

    var displaySimulationStartYear = function(simulationStartYear) {
        dot.data(getSingleSimulation(simulationStartYear), key)
           .call(position)
           .style("fill", function(sr) { return color(sr); })
           .sort(order);
        label.text(Math.round(simulationStartYear));
    };



    var manualScroll = function() {
        var yearScale = d3.scaleLinear()
                          .domain([1926, 2010-30])
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
        var year = d3.interpolateNumber(1926, 2010-30);
        return function(t) {
            displaySimulationStartYear(year(t));
        };
    };

    var position = function(dot) {
        dot.attr("cx", function(sr) { return xScale(x(sr)); })
           .attr("cy", function(sr) { return yScale(y(sr)); })
           .attr("r", function(sr) { return rScale(radius(sr)); })
    };

    var order = function(a, b) {
        return radius(b) - radius(a);
    };

    var svg, xScale, yScale, rScale, xAxis, yAxis, label, simResults,
        dot, box, overlay;

    // Init all the svg stuffs
    this.init = function init() {
        // TODO, this is all rather arbirtrary...and we should either be okay with that or not.
        var margins = {top: 10, right: 10, bottom: 50, left: 100};
        var w = 1000 - margins.right;
        var h = ((w+margins.right)*(1080.0/1920.0)) - margins.top - margins.bottom; // TODO: Convince everyone to buy a 1920 by 1080 screen...

        // TODO, 30 year simulations, 4mil portfolios, and 200k withdrawal rates are all entirely arbitrary
        xScale = d3.scaleLinear().domain([0, 30]).range([0, w]);
        yScale = d3.scaleLinear().domain([0, 4000000]).range([h, 0]);
        rScale = d3.scaleSqrt().domain([0, 200000]).range([0, 25]);

        xAxis = d3.axisBottom(xScale);
        yAxis = d3.axisLeft(yScale);

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
           .text("time");

        svg.append("text")
           .attr("class", "y label")
           .attr("text-anchor", "end")
           .attr("y", 5)
           .attr("dy", ".75em")
           .attr("transform", "rotate(-90)")
           .text("portfolio size");

        label = svg.append("text")
                   .attr("class", "year label")
                   .attr("text-anchor", "end")
                   .attr("y", h - 10)
                   .attr("x", w)
                   .text(1926);
    };

    this.showSimulation = function showSimulation(results){
        simResults = results;

        // Actually do our animation and initialize the rest.
        dot = svg.append("g")
                 .attr("class", "dots")
                 .selectAll(".dot")
                 .data(getSingleSimulation(1926))
                 .enter().append("circle")
                 .attr("class", "dot")
                 .style("fill", function(sr) { return color(sr); })
                 .call(position)
                 .sort(order);

        box = label.node().getBBox();
        overlay = svg.append("rect")
                     .attr("class", "overlay")
                     .attr("x", box.x)
                     .attr("y", box.y)
                     .attr("width", box.width)
                     .attr("height", box.height)
                     .on("mouseover", manualScroll);

        this.animate();
    };

    this.animate = function animate(){
        svg.transition()
           .duration(30000) // ms, apparently
           .ease(d3.easeLinear)
           .attrTween("year", getMouseOverYear);
    };
};