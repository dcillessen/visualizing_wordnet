let graph = []
const url = "https://en-word.net/json/lemma/fond"
let requestCounter = 0

const data = d3.json(url)
.then(data => {
  async function getData(){
    let nodes_list = []
    let links_list = []
      nodes_list.push(JSON.parse(`{"id": "${url}", "name": "${url.substring(31, (url.length))}", "pos": "${url}"}`));
      // parse out 2 layers of nodes based on inital data as well as their accompanying links
      data.forEach(firstlayerNode =>  {
        firstlayerNode.relations.forEach(secondlayerNode => { 
          nodes_list.push(JSON.parse(`{"id": "${secondlayerNode.target}", "name": "${secondlayerNode.trg_word}", "pos": "${(secondlayerNode.target[13])}", "match": "null"}`)),
          links_list.push(JSON.parse(`{"source":"${firstlayerNode.id}", "target": "${secondlayerNode.target}"}`))
        }),
        nodes_list.push(JSON.parse(`{"id": "${firstlayerNode.id}", "name": "${firstlayerNode.lemmas[0].lemma}", "pos": "${firstlayerNode.pos}", "match": "null"}`))
        links_list.push(JSON.parse(`{"source":"${url}", "target": "${firstlayerNode.id}"}`));
        let nodes = {"nodes": nodes_list}              
        let links = {"links": links_list}
        graph = [nodes, links]
      })

    let nodes = {"nodes": nodes_list}              
    let links = {"links": links_list}
    graph = [nodes, links]
    

      graph[0].nodes.forEach(node => {
        if (node.id != url){
          let newName = ""
          node.name = "No New Data"
          let idurl = `https://en-word.net/json/id/${node.id}`
          requestCounter = (requestCounter + 1)
          let moreData = d3.json(idurl)
          .then(moreData =>{
            if (moreData[0].lemmas[1] != undefined){
              requestCounter = (requestCounter - 1)
              let newName = `${moreData[0].lemmas[0].lemma}, ${moreData[0].lemmas[1].lemma}`
              node.name = newName
              graphYet()
          }
            if (moreData[0].lemmas[1] === undefined){
              requestCounter = (requestCounter - 1)
              let newName = `${moreData[0].lemmas[0].lemma}`
              node.name = newName
              graphYet()
          }
        })
      }
        else{
          //console.log("url") //- increment "i" on data request, then decrement "i" when it comes back.  when "i" = 0 (again,) function(graphData)
        //- perhaps more research into concurrent programming in JS could help here too. 
        }
      })
    }

  function graphData(){
    console.log(graph[0].nodes)

    function boxingForce() {
      const radius = width;
  
      for (let node of graph[0].nodes) {
          node.x = Math.max(0 + (2*r), Math.min(radius - (2*r), node.x));
          node.y = Math.max(0 + (2*r), Math.min(radius - (2*r), node.y));
      }
    }
    const domain = [`${url}`, "n", "v", "a", "s", "r"]
    const range =  ["grey", "red", "green", "blue", "orange", "purple"]
    var color = d3.scaleOrdinal().domain(domain).range(range);
    var svg = d3.select("svg");
    var width = svg.attr("width");
    var height = svg.attr("height");
    let r = 25

  var simulation = d3
    .forceSimulation(graph[0].nodes) 
    .force("link",d3.forceLink().id(function(d) {return d.id;}).links(graph[1].links).strength(2))
    .force("charge", d3.forceManyBody().strength(-3000))
    .force("collide", d3.forceCollide().strength(-1).radius(r))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("bounds", boxingForce)
    .on("tick", ticked);

  var link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph[1].links)
    .enter()
    .append("line")
    .attr("stroke-width", function(d) {
      return 3;
    });

  var node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph[0].nodes)
    .enter()
    .append("circle")
    .style("stroke", "grey")
    .attr("r", r)
    .attr("fill", function(d) { return color(d.pos); })
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  var texts = svg 
    .append("g")
    .selectAll("text")
    .data(graph[0].nodes)
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .attr("font-family", "Sans-serif")
    .attr("font-size", "20px")
    .text(d => d.name);         

  function ticked() {
    texts.attr("x", d => d.x)
    texts.attr("y", d => d.y);
    link
      .attr("x1", function(d) {
        return d.source.x;
      })
      .attr("y1", function(d) {
        return d.source.y;
      })
      .attr("x2", function(d) {
        return d.target.x;
      })
      .attr("y2", function(d) {
        return d.target.y;
      });

    node
      .attr("cx", function(d) {
        return d.x;
      })
      .attr("cy", function(d) {
        return d.y;
      });
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}



async function graphYet(){
  if (requestCounter === 0){
    graphData()
    console.log("Loaded")
  }
}
  if (requestCounter > 0){}

getData()

console.log("Loading")
})

.catch(err => console.log(err))


  
