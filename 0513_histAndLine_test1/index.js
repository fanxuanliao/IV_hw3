function format(d) {
    return {
        year: +d["年"],
        month: +d["月"],
        passenger: +d["旅客人數"],
        number: +d["列車次數"]
    }
}

d3.csv("1588237706-m0.csv", format).then(data => {
    draw(data);
});

function draw(dataset) {
    const margin = {
        left: 80,
        right: 80,
        top: 60,
        bottom: 60
    };
    const padding = 10;
    const width = 900;
    const height = 450;

    const white = "#fff";
    const orange = "#d85221";
    const green = "#aed581";

    let formatRound = d3.format(".0f");
    let formatComma = d3.format(",d");

    let chart = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    let xScale = d3.scaleBand()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        .range([margin.left, width - margin.right])
        .padding(0.1);

    let y1Scale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d.passenger)])
        .range([height - margin.bottom, margin.top]);

    let y2Scale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d.number)])
        .range([height - margin.bottom, margin.top]);

    let axis = chart.append('g').attr('class', 'axis');
    // x axis
    axis.append('g')
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale)
            .tickFormat(d => d + " 月")
            .tickPadding(padding));
    // y axis left
    axis.append('g')
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(y1Scale)
            .tickFormat(d => d / 10000 + " 萬")
            .tickPadding(padding))
        .selectAll('text')
        .style('fill', orange)
        .style('font-weight', 'bold');
    // y axis right
    axis.append('g')
        .attr('transform', `translate(${width - margin.right}, 0)`)
        .call(d3.axisRight(y2Scale)
            .tickPadding(padding))
        .selectAll('text')
        .style('fill', green)
        .style('font-weight', 'bold');
    // x axis title
    axis.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height - 5)
        .text('月份');
    // y axis left title
    axis.append('text')
        .attr('text-anchor', 'end')
        .attr('x', margin.left - padding)
        .attr('y', margin.top - 20)
        .text('旅客人數');
    // y axis right title
    axis.append('text')
        .attr('text-anchor', 'start')
        .attr('x', width - margin.right + padding)
        .attr('y', margin.top - 20)
        .text('列車次數');

    axis.selectAll('text')
        .style('font-size', 14);

    let data = dataset.slice(0, 12);
    let barChart = chart.append('g').attr('class', 'bar-chart');
    let lineChart = chart.append('g').attr('class', 'line-chart');
    lineChart.append('path')
        .datum(data)
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', green)
        .attr('stroke-width', 1.5)
        .attr('d', d3.line()
            .x(d => xScale(d.month) + xScale.bandwidth() / 2)
            .y(d => y2Scale(d.number)));
    update(data);

    // slider
    let minYear = d3.min(dataset, d => d.year);
    let maxYear = d3.max(dataset, d => d.year);
    let slider = d3.sliderHorizontal()
        .domain([minYear, maxYear])
        .step(1)
        .width(width - margin.left - margin.right)
        .tickFormat(d => d + " 年")
        .displayValue(true)
        .on('onchange', val => {
            let currentData = dataset.slice((val - minYear) * 12, (val - minYear + 1) * 12);
            update(currentData);
        });

    d3.select('#slider')
        .append('svg')
        .attr('width', width)
        .attr('height', 120)
        .append('g')
        .attr('transform', `translate(${margin.left}, 80)`)
        .call(slider)
        .selectAll('text')
        .style('font-size', 14);
    d3.select('.parameter-value')
        .append('image')
        .attr('xlink:href', 'hsr.svg')
        .attr('width', 80)
        .attr('x', -40)
        .attr('y', -80);

    function update(newData) {
        let sumPassenger = d3.sum(newData, d => d.passenger);
        let minPassenger = d3.min(newData, d => d.passenger);
        let maxPassenger = d3.max(newData, d => d.passenger);
        let avgPassenger = sumPassenger / newData.length;

        let sumNumber = d3.sum(newData, d => d.number);
        let minNumber = d3.min(newData, d => d.number);
        let maxNumber = d3.max(newData, d => d.number);
        let avgNumber = sumNumber / newData.length;

        document.querySelector("#year").innerHTML = newData[0].year;
        document.querySelector("#sumPassenger").innerHTML = formatComma(sumPassenger);
        document.querySelector("#avgPassenger").innerHTML = formatComma(formatRound(avgPassenger));
        document.querySelector("#sumNumber").innerHTML = formatComma(sumNumber);
        document.querySelector("#avgNumber").innerHTML = formatComma(formatRound(avgNumber));

        let sortPassenger = d => {
            if (d.passenger == minPassenger) {
                document.querySelector("#minPassenger").innerHTML = `${formatComma(minPassenger)} (${d.month}月)`;
                return 0.2;
            } else if (d.passenger == maxPassenger) {
                document.querySelector("#maxPassenger").innerHTML = `${formatComma(maxPassenger)} (${d.month}月)`;
                return 1;
            } else {
                return 0.6;
            }
        };

        let sortNumber = d => {
            if (d.number == minNumber) {
                document.querySelector("#minNumber").innerHTML = `${formatComma(minNumber)} (${d.month}月)`;
                return green;
            } else if (d.number == maxNumber) {
                document.querySelector("#maxNumber").innerHTML = `${formatComma(maxNumber)} (${d.month}月)`;
                return green;
            } else {
                return white;
            }
        };

        let bar_tooltip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(d => {
                return `<div>旅客人數 (${d.month}月)</div><div>${formatComma(d.passenger)} 人</div>`;
            });
        barChart.call(bar_tooltip);

        let bar = barChart.selectAll('.bar').data(newData);
        bar.exit().remove();
        bar.enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('fill', orange)
            .attr('opacity', d => sortPassenger(d))
            .attr('x', d => xScale(d.month))
            .attr('y', d => y1Scale(d.passenger))
            .attr('width', xScale.bandwidth())
            .attr('height', d => y1Scale(0) - y1Scale(d.passenger))
            .on("mouseover", bar_tooltip.show)
            .on("mouseout", bar_tooltip.hide);
        bar.transition()
            .duration(500)
            .ease(d3.easeLinear)
            .attr('opacity', d => sortPassenger(d))
            .attr('y', d => y1Scale(d.passenger))
            .attr('height', d => y1Scale(0) - y1Scale(d.passenger));

        let barLabel = barChart.selectAll('.bar-label').data(newData);
        barLabel.exit().remove();
        barLabel.enter()
            .append('text')
            .attr('class', 'bar-label')
            .text(d => formatRound(d.passenger / 10000) + " 萬")
            .attr('x', d => xScale(d.month) + xScale.bandwidth() / 2)
            .attr('y', d => y1Scale(d.passenger) + 25)
            .attr('text-anchor', 'middle')
            .attr('font-size', 12)
            .attr('fill', white);
        barLabel.transition()
            .duration(500)
            .ease(d3.easeLinear)
            .text(d => formatRound(d.passenger / 10000) + " 萬")
            .attr('y', d => y1Scale(d.passenger) + 25);

        let line_tooltip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-30, 0])
            .html(d => {
                return `<div>列車次數 (${d.month}月)</div><div>${formatComma(d.number)} 台</div>`;
            });
        lineChart.call(line_tooltip);

        let line = lineChart.selectAll('.line').datum(newData);
        line.transition()
            .duration(500)
            .ease(d3.easeLinear)
            .attr('d', d3.line()
                .x(d => xScale(d.month) + xScale.bandwidth() / 2)
                .y(d => y2Scale(d.number)));

        let dot = lineChart.selectAll('.dot').data(newData);
        dot.exit().remove();
        dot.enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(d.month) + xScale.bandwidth() / 2)
            .attr('cy', d => y2Scale(d.number))
            .attr('fill', d => sortNumber(d))
            .attr('stroke', green)
            .attr('stroke-width', 2)
            .attr('r', 6)
            .on("mouseover", line_tooltip.show)
            .on("mouseout", line_tooltip.hide);;
        dot.transition()
            .duration(500)
            .ease(d3.easeLinear)
            .attr('cx', d => xScale(d.month) + xScale.bandwidth() / 2)
            .attr('cy', d => y2Scale(d.number))
            .attr('fill', d => sortNumber(d));

        let dotLabel = lineChart.selectAll('.dot-label').data(newData);
        dotLabel.exit().remove();
        dotLabel.enter()
            .append('text')
            .attr('class', 'dot-label')
            .text(d => formatComma(d.number))
            .attr('x', d => xScale(d.month) + xScale.bandwidth() / 2)
            .attr('y', d => y2Scale(d.number) - 15)
            .attr('text-anchor', 'middle')
            .attr('font-size', 12);
        dotLabel.transition()
            .duration(500)
            .ease(d3.easeLinear)
            .text(d => formatComma(d.number))
            .attr('y', d => y2Scale(d.number) - 15);
    }
}