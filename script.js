// 2. Use the margin convention practice 
var margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = window.innerWidth * 0.8 - margin.left - margin.right // Use the window's width 
    ,
    height = window.innerHeight * 0.8 - margin.top - margin.bottom; // Use the window's height

var xScale;
var yMax;
var yMin;
var yScale;
var xAxis;
var yAxis;
const parseTime = d3.timeParse('%Y')
const svg = d3.select("div#mutiline_chart_container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//----------------------------DATA-----------------------------//
function row(d) {
    //console.log(d);
    return {
        year: parseTime(d.year),
        nation: d.nation,
        percentage: +d.percentage,
    }
};

d3.csv("data.csv", row).then(function(data) {
    //----------------------------SCALES----------------------------//
    xScale = d3.scaleTime()
        .domain(d3.extent(data.map(function(d) { return d.year; }))) // input
        .rangeRound([0, width * 0.8]); // output range

    yMax = d3.max(data, function(d) { return d.percentage; });
    yMin = d3.min(data, function(d) { return d.percentage; });
    yScale = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([0, yMax]);


    xAxis = d3.axisBottom()
        .scale(xScale) //把範圍丟進去
        .tickFormat(d3.timeFormat("%Y"))

    yAxis = d3.axisLeft()
        .scale(yScale)
        //.tickSize(-width, 0, 0)
        .ticks(10); // 區間有幾個

    //----------------------------DRAW AXIS----------------------------//
    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
    //.selectAll("text")
    //.attr("y", 20)
    //.attr("dy", ".50em")
    //.style("text-anchor", "middle");

    svg.append("g")
        .attr("class", "yAxis")
        .call(yAxis)
        .attr("transform", "translate(0,0)");
    //----------------------------DRAW LINE---------------------------//

    var dataset = d3.map(function(d) { return { "y": d.percentage } })


    var tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip");

    var line = d3.line()
        .x(function(d) { return xScale(d.year); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.percentage); }); // set the y values for the line generator 
    //.curve(d3.curveMonotoneX) // apply smoothing to the line

    var color = d3.scaleOrdinal(d3.schemeSet2);
    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) { return d.nation; })
        .entries(data);



    // Loop through each  key
    dataNest.forEach(function(d, i) {
        //Append the path, bind the data, and call the line generator 
        svg.append("path")
            .attr("class", "line")
            .attr("id", d.key)
            .style("stroke", function() {
                return d.color = color(d.key);
            })
            .style("opacity", .4)
            .attr("d", line(d.values))
            .on("mouseover", function(d) {

                // animate point useful when we have points ploted close to each other.
                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("opacity", 1);

                d3.selectAll("#" + keyID)
                    .transition()
                    .duration(300)
                    .style("opacity", 1);

            })
            .on("mouseout", function(d) {
                // animate line back to origional style
                d3.select(this)
                    .transition()
                    .duration(300)
                    .style("opacity", .4);
            });
        var keyID = d.key;
        // Appends a circle for each datapoint 
        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle") // Assign a class for styling
            .attr("class", "dot")
            .style("opacity", .4)
            .style('fill', function(d, i) { return color(d.nation); })
            .attr("cx", function(d) { return xScale(d.year) })
            .attr("cy", function(d) { return yScale(d.percentage) })
            .attr("r", 6)
            .on("mouseover", function(d) {

                // animate point useful when we have points ploted close to each other.
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr("r", 8)
                    .style("opacity", 1);

                d3.selectAll("#" + keyID)
                    .transition()
                    .duration(300)
                    .style("opacity", 1);

                // code block for tooltip
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltipDiv.html(d.percentage + '%')
                    .style("background", color(d.nation))
                    .style("left", (d3.event.pageX) - 30 + "px")
                    .style("top", (d3.event.pageY - 40) + "px");
            })
            .on("mouseout", function(d) {

                // animate point back to origional style
                d3.select(this)
                    .transition()
                    .duration(300)
                    .attr("r", 6)
                    .style("opacity", .4);

                d3.select("#" + keyID)
                    .transition()
                    .duration(300)
                    .style("opacity", 0.4);


                tooltipDiv.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        //.on("mouseover", function() { focus.style("display", null); })
        //.on("mouseout", function() { focus.style("display", "none"); })
        // .on("mousemove", mousemove);

        var legendSpace = height * 0.8 / dataNest.length;
        // Add the Legend
        svg.append("text")
            .attr("x", width * 0.8 + margin.right * 2) // space legend
            .attr("y", i * legendSpace)
            .attr("class", "legend") // style the legend
            .style("font-size", "15px") // Change the font size
            .style("font-weight", "bold") // Change the font to bold
            .style("text-anchor", "middle") // center the legend
            .style("fill", function() { // Add the colours dynamically
                return d.color = color(d.key);
            })
            .text(d.key);

        /*
        .on("click", function() {
            // Determine if current line is visible 
            var active = d.active ? false : true,
                newOpacity = active ? 0 : 1;
            // Hide or show the elements based on the ID
            d3.select("#tag" + d.key.replace(/\s+/g, ''))
                .transition().duration(100)
                .style("opacity", newOpacity);
            // Update whether or not the elements are active
            d.active = active;
        })
        */

    });

    /* 好像只有D3 v4有bisectDate
    function mousemove() {
      var x0 = xScale.invert(d3.mouse(this)[0]),
          i = bisectDate(data, x0, 1),
          d0 = data[i - 1],
          d1 = data[i],
          d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + xScale(d.year) + "," + y(d.percentage) + ")");
      focus.select("text").text(function() { return d.value; });
      focus.select(".x-hover-line").attr("y2", height - yScale(d.percentage));
      focus.select(".y-hover-line").attr("x2", width + width);
    }
*/
});