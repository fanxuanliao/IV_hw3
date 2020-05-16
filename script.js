var margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = window.innerWidth * 0.8 - margin.left - margin.right // Use the window's width 
    ,
    height = window.innerHeight * 0.8 - margin.top - margin.bottom; // Use the window's height

let xScale;
//let yMax;
//let yMin;
let y1Scale;
let y2Scale;
let xAxis;
let y1Axis;
let y2Axis;
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
        money: +d.money
    }
};

d3.csv("data.csv", row).then(function(data) {
    //----------------------------SCALES----------------------------//
    //xScale = d3.scaleLinear()
    //    .domain(d3.extent(data.map(function(d) { return d.year; }))) // input
    xScale = d3.scaleBand()
        .domain([parseTime(2009), parseTime(2010), parseTime(2011), parseTime(2012), parseTime(2013), parseTime(2014), parseTime(2015), parseTime(2016), parseTime(2017), parseTime(2018), parseTime(2019), ])
        .rangeRound([0, width * 0.8]); // output range

    //yMax = d3.max(data, function(d) { return d.percentage; });
    //yMin = d3.min(data, function(d) { return d.percentage; });

    y1Scale = d3.scaleLinear() //貧窮率
        .rangeRound([height, 0])
        .domain([0, d3.max(data, function(d) { return d.percentage; })]);

    y2Scale = d3.scaleLinear() //社福支出
        .rangeRound([height, 0])
        //.domain([0, d3.max(data, function(d) { return d.money; })]);
        .domain([0, 100]); //0%-100%

    xAxis = d3.axisBottom()
        .scale(xScale) //把範圍丟進去
        .tickFormat(d3.timeFormat("%Y"))

    y1Axis = d3.axisLeft()
        .scale(y1Scale)
        //.tickSize(-width, 0, 0)
        .ticks(10); // 區間有幾個
    y2Axis = d3.axisRight()
        .scale(y2Scale)
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
        .call(y1Axis)
        .attr("transform", "translate(0,0)");
    svg.append("g")
        .attr("class", "yAxis")
        .call(y2Axis)
        .attr("transform", "translate(" + (width * 0.8) + ",0)");


    //----------------------------DRAW LINE---------------------------//
    var dataset = d3.map(function(d) { return { "y": d.percentage } })


    var tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip");

    var line = d3.line()
        .x(function(d) { return xScale(d.year); }) // set the x values for the line generator
        .y(function(d) { return y1Scale(d.percentage); }); // set the y values for the line generator 
    //.curve(d3.curveMonotoneX) // apply smoothing to the line

    var color = d3.scaleOrdinal(d3.schemeSet2);
    // Nest the entries by symbol
    var dataNest = d3.nest()
        .key(function(d) { return d.nation; })
        .entries(data);


    var tick = d3.select
    // Loop through each  key
    dataNest.forEach(function(d, i) {
        //Append the path, bind the data, and call the line generator 
        svg.append("path")
            .attr("class", "line")
            .attr("id", d.key)
            .attr("transform", "translate(" + xScale.bandwidth() / 2 + ",0)")
            .style("stroke", function() { return d.color = color(d.key); })
            //.style("opacity", .4)
            .attr("d", line(d.values))
            /*
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

            })
            */
            .on("click", function() {
                // Determine if current line is visible
                var active = d3.select.active ? false : true,
                    newOpacity = active ? 0 : 1;
                // Hide or show the elements
                d3.select("#blueLine").style("opacity", newOpacity);
                d3.select("#blueAxis").style("opacity", newOpacity);
                // Update whether or not the elements are active
            });


        var keyID = d.key;
        // Appends a circle for each datapoint 
        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle") // Assign a class for styling
            .attr("class", "dot")
            .attr("id", d.key)
            .attr("transform", "translate(" + xScale.bandwidth() / 2 + ",0)")
            //.style("opacity", .4)
            .style('fill', function(d, i) { return color(d.nation); })
            .attr("cx", function(d) { return xScale(d.year) })
            .attr("cy", function(d) { return y1Scale(d.percentage) })
            .attr("r", 6)
            
            .on("mouseover", function(d) {
/*
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
*/
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
                    //.style("opacity", .4);
/*
                d3.select("#" + keyID)
                    .transition()
                    .duration(300)
                    .style("opacity", 0.4);
*/

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

    //--------------------------DRAW HISTOGRAM------------------------//
    let barChart = svg.append('g').attr('class', 'bar-chart');

    //Tooltip of histogram
    let bar_tooltip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(d => {
            return `<div>社福支出比</div><div>${(d.money)} %</div>`;
        });
    barChart.call(bar_tooltip);

    //Draw first histogram
    var dataTW = data.filter(function(d) {
        if (d['nation'] == 'Taiwan') {
            return d;
        }
    }); //找到該button對應的資料  
    firstHist(dataTW);

    //first histogram 
    function firstHist(newData) {
        console.log('enter first')

        //Draw histogram
        let bar = barChart.selectAll('.bar').data(newData);
        bar.enter()
            .append('rect')
            .attr('class', 'bar')
            .merge(bar)
            .attr('fill', d => color(d.nation))
            //.attr('opacity', d => sortPassenger(d))
            .attr('x', d => xScale(d.year))
            .attr('y', d => y2Scale(d.money))
            .attr('width', xScale.bandwidth())
            .attr('height', d => y2Scale(0) - y2Scale(d.money))
            .on("mouseover", bar_tooltip.show)
            .on("mouseout", bar_tooltip.hide);

        //一開始的 transition 沒有用啦??????????
        //bar.transition()
        //    .duration(500)
        //    .ease(d3.easeLinear)
        //.attr('opacity', d => sortPassenger(d))
        //    .attr('y', d => y2Scale(d.money))
        //    .attr('height', d => y2Scale(0) - y2Scale(d.money));

    };

    //Update histogram data
    function update(newData) {
        console.log('enter update')

        //Draw histogram
        let bar = barChart.selectAll('.bar').data(newData);
        bar.exit().remove();
        bar.enter()
            .append('rect')
            .attr('class', 'bar')
            .merge(bar)
            .attr('fill', d => color(d.nation))
            //.attr('opacity', d => sortPassenger(d))
            .attr('x', d => xScale(d.year))
            //.attr('y', d => y2Scale(d.money))
            .attr('width', xScale.bandwidth())
            //.attr('height', d => y2Scale(0) - y2Scale(d.money))
            .on("mouseover", bar_tooltip.show)
            .on("mouseout", bar_tooltip.hide);
        bar.transition()
            .duration(500)
            .ease(d3.easeLinear)
            //.attr('opacity', d => sortPassenger(d))
            .attr('y', d => y2Scale(d.money))
            .attr('height', d => y2Scale(0) - y2Scale(d.money));
    };


    //click function
    let button = d3.selectAll('#button > button').on('click', function() {
        var chartType = d3.select(this).attr('id'); //按下button出現哪一年
        console.log(chartType);

        //which nation's data
        var dataSelect = data.filter(function(d) {
            if (d['nation'] == chartType) {
                return d;
            }
        }); //找到該button對應的資料

        update(dataSelect);

    });





});