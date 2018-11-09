const dims = { height: 350, width: 350, radius: 150};
const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) };

const svg = d3.select('.canvas')
    .append('svg')
    .attr('width', dims.width + 150)
    .attr('height', dims.height + 150);

const graph = svg.append('g')
    .attr('transform', ` translate(${cent.x}, ${cent.y}) `);

const pie = d3.pie()
        .sort(null)
        .value(d => d.cost);

const arcPath = d3.arc()
    .outerRadius(dims.radius)
    .innerRadius(dims.radius / 2);

const color = d3.scaleOrdinal(d3['schemeSet1']);

const legendGroup = svg.append('g')
  .attr('transform', `translate(${dims.width + 30}, 80)`);

const legend = d3.legendColor()
  .shape('path', d3.symbol().type(d3.symbolCircle)())
  .shapePadding(5)
  .scale(color);

const tip = d3.tip()
    .attr('class', 'tip card')
    .html( d => {
        let content =  ` 
        
        <div class="name">${d.data.name}</div>
        <div class="cost">$${d.data.cost}</div>
        <div class="delete">Double click to delete</div>

         `;
         return content
    });

graph.call(tip);


//update real time function
const update = (data)=> {

//color domain
color.domain( data.map(d => d.name ));

// update legend
legendGroup.call(legend);
legendGroup.selectAll('text').attr('fill', 'white');


    const paths = graph.selectAll('path')
        .data(pie(data));

    //update the paths when updates
    paths.exit()
    .transition().duration(750)
        .attrTween('d', arcTweenExit)
    .remove();

    paths.attr('d', arcPath)
        .transition().duration(750)
        .attrTween('d', arcTweenUpdate);

    paths.enter()
        .append('path')
            .attr('class', 'arc')
            // .attr('d', arcPath)
            .attr('stroke', '#00695c ')
            .attr('stroke-width', 4)
            .attr('fill', d => color(d.data.name))
            .each( function(d) { this._current = d } )
            .transition().duration(750)
                .attrTween('d', arcTweenEnter);

    //add events

    graph.selectAll('path')
        .on('mouseover', (d,i,n) => {
            tip.show(d, n[i])
            handleMouseOver(d,i,n)
        })
        .on('mouseleave', (d, i, n) => {
            tip.hide();
            handleMouseOut(d,i,n)
        })
        .on('dblclick', handleClick);
    
}

//data array
let data = []

db.collection('expenses').onSnapshot( res => {

    res.docChanges().forEach(change => {

        const doc = {

            ...change.doc.data(),
            id: change.doc.id

        };

    switch(change.type) {

        case 'added':
        data.push(doc);
        break;

        case 'modified':
        const index = data.findIndex(d => d.id == doc.id);
        data[index] = doc;
        break;

        case 'removed':
        data = data.filter(d => d.id !== doc.id);
        break;

        default:
        break;
    }

    });

    update(data);
});


//Tween transitions
const arcTweenEnter = (d) => {

    let i = d3.interpolate(d.endAngle, d.startAngle);

    return (t) => {
        d.startAngle = i(t);
        return arcPath(d);
    };

};
const arcTweenExit = (d) => {

    let i = d3.interpolate(d.startAngle, d.endAngle);

    return function(t) {
        d.startAngle = i(t);
        return arcPath(d);
    };

};

function arcTweenUpdate(d) {

    let i = d3.interpolate(this._current, d);

    this._current = d;

    return function(t) {

        return arcPath(i(t));

    };

};


//event functions

const handleMouseOver = (d, i, n) => {

    d3.select(n[i])
        .transition('changeSliceFill').duration(300)
            .attr('fill', '#80cbc4');

}

const handleMouseOut = (d, i, n) => {

    d3.select(n[i])
        .transition('changeSliceFill').duration(300)
            .attr('fill', color(d.data.name));

}

const handleClick = (d) => {

    const id = d.data.id;

    db.collection('expenses').doc(id).delete();

}
