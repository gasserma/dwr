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
    var tooltip = function(sr, simulationStartYear) {
        simulationStartYear = Math.round(simulationStartYear);
        var year = sr.year + simulationStartYear;
        var inflationFactor = getInflationFactor(simulationStartYear - 1, year - 1);
        return "Withdrawal (Real): $" + Number(sr.withdrawal.toFixed(0)).toLocaleString('en-US', {currency: 'USD'}) + " " +
               "\nWithdrawal (Nominal): $" + Number((sr.withdrawal * inflationFactor).toFixed(0)).toLocaleString('en-US', {currency: 'USD'}) + " " +
               "\nYear: " + year + " " +
               "\nPortfolio (after last withdrawal of this year): $" + Number((sr.portfolio_amt).toFixed(0)).toLocaleString('en-US', {currency: 'USD'})
    }

    // Turns out this looks like shit, but I will leave it in while I brainstorm.
    var backgroundColor = function(sr){
        return "transparent";

        /*if (sr.length == 1){
            if (!sr[0]) {
                return "#ffbfbf"; // light red
            }
        } else {
            if (!sr[0] && !sr[1]){
                return "#ffbd6d"; // light orange, duh
            } else if (!sr[0]) {
                return "#ffbfbf"; // light red
            } else if (!sr[1]) {
                return "#ffff72"; // light yellow
            }
        }

        return "transparent";*/
    }

    // This has the potential to fail if we ever get market data for the year 926 or earlier
    var key = function(sr) { return sr.year - (sr.resultSet * 1000)};
    var comparing = function() { return secondSimResults != null }

    var getSingleSimulation = function(simulationStartYear) {
        simulationStartYear = Math.round(simulationStartYear);
        var index = simulationStartYear - simResults.simulation_start;
        var retVal = {};
        retVal.data = [];
        retVal.success = [];
        retVal.success.push(true);
        if (comparing()){
            retVal.success.push(true);
        }

        for(simYear=0; simYear < retirementLength; simYear++){
            // These * 1.000001 are ghetto floating point comparisons.
            var ex = simResults.results[index].withdrawals[simYear] * 1.000001 >= simResults.grumpy_amt;
            var w = simResults.results[index].withdrawals[simYear];
            retVal.data.push({
                portfolio_amt : simResults.results[index].portfolio_values[simYear],
                withdrawal : w,
                exceeded : ex, //TODO we should name this something to reflect the "or =" part
                year : simYear,
                resultSet : 0
            });

            if (w < failureThresholds[0]){
                retVal.success[0] = false;
            }

            if (comparing()) {
                ex = secondSimResults.results[index].withdrawals[simYear] * 1.000001 >= secondSimResults.grumpy_amt;
                var w2 = secondSimResults.results[index].withdrawals[simYear];
                retVal.data.push({
                    portfolio_amt : secondSimResults.results[index].portfolio_values[simYear],
                    withdrawal : w2,
                    exceeded : ex,
                    year : simYear,
                    resultSet : 1
                });

                if (w2 < failureThresholds[1]){
                    retVal.success[1] = false;
                }
            }
        }

        return retVal;
    };

    var displaySimulationStartYear = function(simulationStartYear) {
        dot.selectAll("title").remove();

        var singleStartYear = getSingleSimulation(simulationStartYear);
        dot.data(singleStartYear.data, key)
           .call(position)
           .style("opacity", function(sr) { return opacity(sr); })
           .style("fill", function(sr) { return color(sr); })
           .sort(order)
           .append("svg:title")
           .text(function(sr) { return tooltip(sr, simulationStartYear); });

        d3.select(graphElement).style("background-color", backgroundColor(singleStartYear.success))

        if (singleStartYear.success.length == 1){
            if (singleStartYear.success[0]){
                d3.select("#redx").style("visibility", "hidden");
            } else {
                d3.select("#redx").style("visibility", "visible");
            }
        } else {
            if (singleStartYear.success[0]){
                d3.select("#redx")
                  .attr("x", box.x - 20)
                  .style("visibility", "hidden");
            }
            if (!singleStartYear.success[0]) {
                d3.select("#redx")
                  .attr("x", box.x - 20)
                  .style("visibility", "visible");
            }
            if (singleStartYear.success[1]){
                d3.select("#yellowx")
                  .attr("x", box.x + 20)
                  .style("visibility", "hidden");
            }
            if (!singleStartYear.success[1]) {
                d3.select("#yellowx")
                  .attr("x", box.x + 20)
                  .style("visibility", "visible");
            }
        }

        currentYear = Math.round(simulationStartYear);
        label.text(currentYear);
        if (displayYearCallback != null){
            displayYearCallback(currentYear);
        }
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
            showPlayButton();
            displaySimulationStartYear(yearScale.invert(d3.mouse(this)[0]));
        }
    }

    var position = function(point) {
        point.attr("cx", function(sr) { return xScale(x(sr)); })
             .attr("cy", function(sr) { return yScale(y(sr)); })
             .attr("r", function(sr) { return rScale(radius(sr)); })
    };

    var order = function(a, b) {
        return radius(b) - radius(a);
    };

    var svg, xScale, yScale, rScale, xAxis, yAxis, label, sizes,
        retirementLength, initialPortfolio, startYear, endYear, currentYear, failureThresholds, displayYearCallback,
        simResults, secondSimResults, maxDot, playButtonShowing, // Clearly we are moving from 1 to 2, not 1 to n...
        dot, box, overlay, maxW, maxH, changeRatio, formScaleCallback, graphElement=null;

    // Init all the svg stuffs
    this.init = function init(length, initPortfolio, start, end, failureLimits, yearCallback, maxWidth, maxHeight, maxD, scaleCallback, targetElement) {
        retirementLength = length;
        initialPortfolio = initPortfolio;
        startYear = start;
        currentYear = start;
        endYear = end;
        failureThresholds = failureLimits;
        displayYearCallback = yearCallback;
        maxH = maxHeight;
        maxW = maxWidth;
        maxDot = maxD;
        formScaleCallback = scaleCallback;
        graphElement = targetElement;

        this.reInit();
    }

    this.reInit = function reInit() {  
        playButtonShowing = false
        currentYear = startYear;  
        // These represent the ideal conditions for...ummm...my browser on my monitor. (Or pretty generally a 1920x1080 screen)
        // Based on the inputs we recieved about screen width and height.
        // All of these numbers are talking about pixels.
        
        // This nonsense is wanting a 55 margin at 300 width, and a 100 margin at 1000 width. y=mx+b
        // The most brittle coupling here is the y axis scale and the left margin.
        var wMargins = Math.min(100, Math.max(0, maxW * .06 + 36));
        var margins = {top: 10, right: wMargins, bottom: 50, left: wMargins};
        var wTemp = 1000-margins.right-margins.left;
        sizes = {
            w:wTemp,
            h:((wTemp+margins.right+margins.left)*(1080.0/1920.0)) - margins.top - margins.bottom,
            r:35
        }
        
        var htwRatio = sizes.h / sizes.w;
        var minW = 350;
        var minH = minW * htwRatio;
        
        var newW, newH;
        if ((maxH + margins.top + margins.bottom) / (maxW + margins.left + margins.right) > htwRatio) {
            // The width is the limiting factor
            newW = Math.min(maxW - margins.left - margins.right, sizes.w);
            newH = newW * htwRatio;            
        } else {
            // The height is the limiting factor
            newH = Math.min(maxH - margins.top - margins.bottom, sizes.h);
            newW = newH / htwRatio;
        }
        
        changeRatio = newW / sizes.w;
        sizes.w = newW;
        sizes.h = newH;
        sizes.r = sizes.r * changeRatio;
        
        if (formScaleCallback != null){
            scaleCallback(changeRatio);
        }
        
        // Some dots escape the graph. Do we care? Probably, but its not a huge issue.
        yScale = d3.scaleLinear().domain([0, maxDot]).range([sizes.h, 0]);
        xScale = d3.scaleLinear().domain([0, retirementLength]).range([0, sizes.w]);
        rScale = d3.scaleSqrt().domain([0, initialPortfolio / 5.0]).range([0, sizes.r]);

        xAxis = d3.axisBottom(xScale);
        yAxis = d3.axisLeft(yScale)
                  .tickFormat( function(d) { return "$" + d });

        svg = d3.select(graphElement)
                .append("svg")
                .attr("width", sizes.w + margins.left + margins.right)
                .attr("height", sizes.h + margins.top + margins.bottom)
                .append("g")
                .attr("transform", "translate(" + margins.left + "," + margins.top + ")");

        svg.append("g")
           .attr("class", "x axis")
           .attr("transform", "translate(0," + sizes.h + ")")
           .call(xAxis);

        svg.append("g")
           .attr("class", "y axis")
           .call(yAxis);

        svg.append("text")
           .attr("class", "x label")
           .attr("text-anchor", "end")
           .style("font-size", (15 * changeRatio).toFixed(0) + "px")
           .attr("x", sizes.w)
           .attr("y", sizes.h - 5)
           .text("Years Into Simulation");

        svg.append("text")
           .attr("class", "y label")
           .attr("text-anchor", "end")
           .style("font-size", (15 * changeRatio).toFixed(0) + "px")
           .attr("y", 5)
           .attr("dy", ".75em")
           .attr("transform", "rotate(-90)")
           .text("Portfolio Size in Inflation Adjusted Dollars");

        label = svg.append("text")
                   .attr("class", "year label")
                   .attr("text-anchor", "end")
                   .style("font-size", (80 * changeRatio).toFixed(0) + "px")
                   .attr("y", (margins.top + 70) * changeRatio)
                   .attr("x", (margins.left + 160) * changeRatio)
                   .text(startYear.toString());
    };

    this.showSimulation = function showSimulation(results, secondResults){
        simResults = results;
        secondSimResults = secondResults;

        this.reShowSimulation();
    }

    this.reShowSimulation = function reShowSimulation(){
        playButtonShowing = false;
        currentYear = startYear;
        box = label.node().getBBox();

        // Actually do our animation and initialize the rest.
        dot = svg.append("g")
                 .attr("class", "dots")
                 .selectAll(".dot")
                 .data(getSingleSimulation(startYear).data)
                 .enter()
                     .append("circle")
                     .attr("class", "dot")
                     .style("opacity", function(sr) { return opacity(sr); })
                     .style("fill", function(sr) { return color(sr); })
                     .call(position)
                     .sort(order);

        var buttSize = 40 * changeRatio;
        var betweenButtSize = box.width - (buttSize * 4)
        svg.append("svg:image")
           .attr("class", "backButt")
           .attr("x", box.x)
           .attr("y", box.y+box.height)
           .attr("width", buttSize)
           .attr("height", buttSize)
           .attr("xlink:href", "/static/content/back.png")
           .on("click", back);

        svg.append("svg:image")
           .attr("class", "reanimateButt")
           .attr("x", box.x + buttSize + (betweenButtSize/3))
           .attr("y", box.y+box.height)
           .attr("width", buttSize)
           .attr("height", buttSize)
           .attr("xlink:href", "/static/content/refresh.png")
           .on("click", function(){
                currentYear = startYear;
                svg.transition().duration(0);
                d3.select(graphElement).html("");
                sim.reInit();
                reShowSimulation();
            });

        svg.append("svg:image")
           .attr("class", "playPauseButt")
           .attr("x", box.x + buttSize + buttSize + (2 * betweenButtSize / 3))
           .attr("y", box.y+box.height)
           .attr("width", buttSize)
           .attr("height", buttSize)
           .attr("xlink:href", "/static/content/pause.png")
           .on("click", playPause);

        svg.append("svg:image")
           .attr("class", "fwdButt")
           .attr("x", box.x + buttSize + buttSize + buttSize + betweenButtSize)
           .attr("y", box.y+box.height)
           .attr("width", buttSize)
           .attr("height", buttSize)
           .attr("xlink:href", "/static/content/fwd.png")
           .on("click", fwd);

        svg.append("svg:image")
           .attr("id", "redx")
           .attr("x", box.x)
           .attr("y", box.y)
           .attr("width", box.width)
           .attr("height", box.height)
           .attr("xlink:href", "/static/content/redX.png")
           .style("visibility", "hidden");

        svg.append("svg:image")
           .attr("id", "yellowx")
           .attr("x", box.x)
           .attr("y", box.y)
           .attr("width", box.width)
           .attr("height", box.height)
           .attr("xlink:href", "/static/content/yellowX.png")
           .attr("opacity", .9)
           .style("visibility", "hidden");

        overlay = svg.append("rect")
           .attr("class", "overlay")
           .attr("x", box.x)
           .attr("y", box.y)
           .attr("width", box.width)
           .attr("height", box.height)
           .on("mouseover", manualScroll);

        animate(endYear, startYear, retirementLength);
    };

    this.forwardPress = function forwardPress(){
        if (graphElement != null && !d3.select(graphElement).empty()){
            fwd();
        }
    }

    var fwd = function fwd(){
        svg.transition().duration(0);
        showPlayButton();
        displaySimulationStartYear((currentYear == endYear) ? endYear : currentYear + 1);
    };

    this.backwardPress = function backwardPress(){
        if (graphElement != null && !d3.select(graphElement).empty()){
            back();
        }
    }

    var back = function back(){
        svg.transition().duration(0);
        showPlayButton();
        displaySimulationStartYear((currentYear == startYear) ? startYear : currentYear - 1);
    };

    this.playPausePress = function playPausePress(){
        if (graphElement != null && !d3.select(graphElement).empty()){
            playPause();
        }
    }

    var playPause = function playPause(){
        if (!playButtonShowing){
            showPlayButton();
        } else {                    
            showPauseButton();
        }
    };
    
    var showPlayButton = function showPlayButton(){
        svg.transition().duration(0);
        d3.select(".playPauseButt").attr("xlink:href", "/static/content/play.png");
        playButtonShowing = true;
    }
    
    var showPauseButton = function showPauseButton(){
        svg.transition().duration(0);
        d3.select(".playPauseButt").attr("xlink:href", "/static/content/pause.png");
        playButtonShowing = false;
        animate(endYear, currentYear, retirementLength);   
    }

    var animYear, animEndYear, animRetirementLength;
    var animateTween = function() {
        var year = d3.interpolateNumber(animYear, animEndYear - animRetirementLength + 1);
        return function(t) {
            displaySimulationStartYear(year(t));
        };
    };
    
    var animate = function animate(ey, sy, rl){
        animYear = sy;
        animEndYear = ey;
        animRetirementLength = rl;
        svg.transition()
           .duration((ey - sy - rl + 1) * 500) // If I was clever Id reference the yearscale. Also 650ms is totally arbitrary
           .ease(d3.easeLinear)
           .attrTween("year", animateTween); // THE PROBLEM IS GETMOUSEOVER YEAR HAS STARTYEAR
    };

    var getInflationFactor = function getInflationFactor(baseYear, currentYear){
        startCpi = cpi[baseYear];
        endCpi = cpi[currentYear];
        return 1.0 + ((endCpi - startCpi) / startCpi);
    }

    // This is a huge chunk of brittleness. It is a copy of the CPI used on the server side...
    // So, make sure they stay in sync...
    var cpi = {
        "1924": 17.3,
        "1925": 17.3,
        "1926": 17.9,
        "1927": 17.5,
        "1928": 17.3,
        "1929": 17.1,
        "1930": 17.1,
        "1931": 15.9,
        "1932": 14.3,
        "1933": 12.9,
        "1934": 13.2,
        "1935": 13.6,
        "1936": 13.8,
        "1937": 14.1,
        "1938": 14.2,
        "1939": 14,
        "1940": 13.9,
        "1941": 14.1,
        "1942": 15.7,
        "1943": 16.9,
        "1944": 17.4,
        "1945": 17.8,
        "1946": 18.2,
        "1947": 21.5,
        "1948": 23.7,
        "1949": 24,
        "1950": 23.5,
        "1951": 25.4,
        "1952": 26.5,
        "1953": 26.6,
        "1954": 26.9,
        "1955": 26.7,
        "1956": 26.8,
        "1957": 27.6,
        "1958": 28.6,
        "1959": 29,
        "1960": 29.3,
        "1961": 29.8,
        "1962": 30,
        "1963": 30.4,
        "1964": 30.9,
        "1965": 31.2,
        "1966": 31.8,
        "1967": 32.9,
        "1968": 34.1,
        "1969": 35.6,
        "1970": 37.8,
        "1971": 39.8,
        "1972": 41.1,
        "1973": 42.6,
        "1974": 46.6,
        "1975": 52.1,
        "1976": 55.6,
        "1977": 58.5,
        "1978": 62.5,
        "1979": 68.3,
        "1980": 77.8,
        "1981": 87,
        "1982": 94.3,
        "1983": 97.8,
        "1984": 101.9,
        "1985": 105.5,
        "1986": 109.6,
        "1987": 111.2,
        "1988": 115.7,
        "1989": 121.1,
        "1990": 127.4,
        "1991": 134.6,
        "1992": 138.1,
        "1993": 142.6,
        "1994": 146.2,
        "1995": 150.3,
        "1996": 154.4,
        "1997": 159.1,
        "1998": 161.6,
        "1999": 164.3,
        "2000": 168.8,
        "2001": 175.1,
        "2002": 177.1,
        "2003": 181.7,
        "2004": 185.2,
        "2005": 190.7,
        "2006": 198.3,
        "2007": 202.416,
        "2008": 211.08,
        "2009": 211.143,
        "2010": 216.687,
        "2011": 220.223,
        "2012": 226.665,
        "2013": 230.280,
        "2014": 233.916,
        "2015": 233.707
    }
};