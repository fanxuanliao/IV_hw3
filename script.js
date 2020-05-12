// 2. Use the margin convention practice 
var margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = window.innerWidth * 0.5 - margin.left - margin.right // Use the window's width 
    ,
    height = window.innerHeight * 0.5 - margin.top - margin.bottom; // Use the window's height

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




    var line = d3.line()
        .x(function(d) { return xScale(d.year); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.percentage); }); // set the y values for the line generator 
    //.curve(d3.curveMonotoneX) // apply smoothing to the line

    var color = d3.scaleOrdinal(d3.schemeSet2);
    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) { return d.nation; })
        .entries(data);



    // Loop through each symbol / key
    dataNest.forEach(function(d, i) {
        
            function mousemove() {
      var x0 = xScale.invert(d3.mouse(this)[0])
          var i = d3.bisector(data, x0, 1)
          var d0 = data[i - 1]
          var d1 = data[i]
          var d = x0 - d0.year > d1.year - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + xScale(d.year) + "," + yScale(d.percentage) + ")");
      focus.select("text").text(function() { return d.percentage; });
      focus.select(".x-hover-line").attr("y2", height*0.5 - yScale(d.percentage));
      focus.select(".y-hover-line").attr("x2", width*0.5 + width*0.5);
    }
var focus = svg.append("g")
            .attr("class", "focus")
            .style("display", null);

        focus.append("line")
            .attr("class", "x-hover-line hover-line")
            .attr("y1", 0)
            .attr("y2", height);

        focus.append("line")
            .attr("class", "y-hover-line hover-line")
            .attr("x1", width)
            .attr("x2", width);

        focus.append("circle")
            .attr("r", 7.5);

        focus.append("text")
            .attr("x", 15)
            .attr("dy", ".31em");

   svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", width*0.5)
        .attr("height", height*0.5)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        //.on("mousemove", mousemove);
        /* 
      var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none")
        .append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", width)
        .attr("x2", width)
        .append("line")

        .attr("y1", 0)
        //.attr("y2", height)
        .append("text")
        .style('fill', function(d, i) { return color(d.nation); })
        .attr("x", 15)
        .attr("dy", ".31em")
        .text(d.percentage);
        */
        //Append the path, bind the data, and call the line generator 
        svg.append("path")
            .attr("class", "line")
            .style("stroke", function() {
                return d.color = color(d.key);
            })
            .attr("d", line(d.values));

        // Appends a circle for each datapoint 
        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle") // Assign a class for styling
            .attr("class", "dot")
            .style('fill', function(d, i) { return color(d.nation); })
            .attr("cx", function(d) { return xScale(d.year) })
            .attr("cy", function(d) { return yScale(d.percentage) })
            .attr("r", 5)
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
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