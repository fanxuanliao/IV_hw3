//https://stackoverflow.com/questions/39264821/d3-v4-multi-series-line-chart-adding-data-points-to-lines-with-same-color-as-li


var lookBookData = z.domain().map(function (name) {
  return {
    name: name,
    values: data.map(function (d) {
      return {date: d.date, lookbookcount: d[name], name: name};
    })
  };
});

    console.log(lookBookData);

    x.domain(d3.extent(data, function (d) {
      console.log(d)
      return d.date;
    }));

    y.domain([
      d3.min(lookBookData, function (c) {
        return d3.min(c.values, function (d) {
          return d.lookbookcount;
        });
      }),
      d3.max(lookBookData, function (c) {
        return d3.max(c.values,
          function (d) {
            return d.lookbookcount;
          });
      })
    ]);

    z.domain(lookBookData.map(function (c) {
      console.log(c);
      return c.name;
    }));

    // Add the X Axis
    svg.append("g")
      .style("font", "14px open-sans")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%d/%m")));

    // Add the Y Axis
    svg.append("g")
      .style("font", "14px open-sans")
      .call(d3.axisLeft(y));

    // Add Axis labels
    svg.append("text")
      .style("font", "14px open-sans")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .text("Sales / Searches");

    svg.append("text")
      .style("font", "14px open-sans")
      .attr("text-anchor", "end")
      // .attr("x", 6)
      .attr("dx", ".71em")
      .attr("transform", "translate(" + width + "," + (height +
        (margin.bottom)) + ")")
      .text("Departure Date");

    var chartdata = svg.selectAll(".chartdata")
      .data(lookBookData)
      .enter().append("g")
      .attr("class", "chartdata");

    chartdata.append("path")
      .attr("class", "line")
      .attr("d", function (d) {
        return line(d.values);
      })
      .style("fill", "none")
      .style("stroke", function (d) {
        return z(d.name);
      })
      .style("stroke-width", "2px");

    chartdata.append("text")
      .datum(function (d) {
        return {
          name: d.name, value: d.values[d.values.length - 1]
        };
      })
      .attr("transform", function (d) {
        return "translate(" +
          x(d.value.date) + "," + y(d.value.lookbookcount) + ")";
      })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "14px open-sans")
      .text(function (d) {
        return d.name;
      });

    // add the dots with tooltips
    chartdata.selectAll(".circle")
      .data(function (d) {
        return d.values;
      })
      .enter().append("circle")
      .attr("class", "circle")
      .attr("r", 4)
      .attr("cx", function (d) {
        console.log(d);
        return x(d.date);
      })
      .attr("cy", function (d) {
        return y(d.lookbookcount);
      })
      .style("fill", function(d) { // Add the colours dynamically
        console.log(d);
        return z(d.name);
      });