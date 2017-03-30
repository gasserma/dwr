// A great deal of this was inspired by Mike Bostocks work in which he gives examples for D3.
// In particular, https://bost.ocks.org/mike/nations/
// Which is just about the best example of visualized 4/5 dimensional data I can find.

// TODO, this is all rather arbirtrary...and we should either be okay with that or not.
var margins = {top: 10, right: 10, bottom: 50, left: 100};
var w = 1000 - margins.right;
var h = ((w+margins.right)*(1080.0/1920.0)) - margins.top - margins.bottom; // TODO: Convince everyone to buy a 1920 by 1080 screen...

// TODO, 30 year simulations, 4mil portfolios, and 200k withdrawal rates are all entirely arbitrary
var xScale = d3.scale.linear().domain([0, 30]).range([0, w]);
var yScale = d3.scale.linear().domain([0, 4000000]).range([h, 0]);
var rScale = d3.scale.sqrt().domain([0, 200000]).range([0, 25]);

var xAxis = d3.svg.axis().orient("bottom").scale(xScale).ticks(10, d3.format(",d"));
var yAxis = d3.svg.axis().scale(yScale).orient("left");

var svg = d3.select("#simgraph").append("svg")
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

var label = svg.append("text")
    .attr("class", "year label")
    .attr("text-anchor", "end")
    .attr("y", h - 10)
    .attr("x", w)
    .text(1926);

// Some remappings so that you can think about a graph instead of constantly having to remember
// that radius of our circles is the withdrawal rate.
function x(sr) { return sr.year; }
function y(sr) { return sr.portfolio_amt; }
function radius(sr) { return sr.withdrawal; }
function color(sr) {
  if (sr.exceeded){
    return "#335EFF";
  }
  return "#FF3333";
}
function key(sr) { return sr.year; }

// Actually do our animation and initialize the rest.
d3.json("/example", function(simResults) {
  var dot = svg.append("g")
               .attr("class", "dots")
               .selectAll(".dot")
               .data(getSingleSimulation(1926))
               .enter().append("circle")
               .attr("class", "dot")
               .style("fill", function(sr) { return color(sr); })
               .call(position)
               .sort(order);

  var box = label.node().getBBox();
  var overlay = svg.append("rect")
                   .attr("class", "overlay")
                   .attr("x", box.x)
                   .attr("y", box.y)
                   .attr("width", box.width)
                   .attr("height", box.height)
                   .on("mouseover", manualScroll);

  svg.transition()
      .duration(30000) // ms, apparently
      .ease("linear")
      .tween("year", getMouseOverYear) // tween...wut
      .each("end", enableInteraction);

  function position(dot) {
    dot.attr("cx", function(sr) { return xScale(x(sr)); })
       .attr("cy", function(sr) { return yScale(y(sr)); })
       .attr("r", function(sr) { return rScale(radius(sr)); });
  }

  function order(a, b) {
    return radius(b) - radius(a);
  }

  function manualScroll() {
    var yearScale = d3.scale.linear()
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

  function getMouseOverYear() {
    var year = d3.interpolateNumber(1926, 2010-30);
    return function(t) {
      displaySimulationStartYear(year(t));
    };
  }

  function displaySimulationStartYear(simulationStartYear) {
    dot.data(getSingleSimulation(simulationStartYear), key)
       .call(position)
       .style("fill", function(sr) { return color(sr); })
       .sort(order);
    label.text(Math.round(simulationStartYear));
  }

  function getSingleSimulation(simulationStartYear) {
    simulationStartYear = Math.round(simulationStartYear)
    var index = simulationStartYear - simResults.simulation_start;
    var data = []
    for(simYear=0; simYear < 30; simYear++){
      var ex = simResults.results[index].withdrawals[simYear] > simResults.initial_withdrawal_amt;
      data.push({
          portfolio_amt : simResults.results[index].portfolio_values[simYear],
          withdrawal : simResults.results[index].withdrawals[simYear],
          exceeded : ex,
          year : simYear
        }
      )
    }

    return data;
  }
});