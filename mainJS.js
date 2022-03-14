/*
Load dataset from
Kickstarter Pledges: https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json

Movie Sales: https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json

Video Game Sales: https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json
*/

const JSON_KICKSTARTER = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

const JSON_MOVIE = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

const JSON_GAMES = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
       
/*Set up SVG canvas to work on*/
const padding = 60;
const pageWidth  = document.documentElement.scrollWidth;
/*reducing page height by padding value to get rid of scroll bars*/
const pageHeight = document.documentElement.scrollHeight-padding;
const chartWidth = 1024;
const chartHeight = pageHeight*0.8;/*tree map takes 80% of page height, the rest 20% is for legend*/

/*colors for categories*/
const colorStyles = [
    "red",
    "purple",
    "green",
    "yellow",
    "teal",
    "aqua",
    "chocolate",
    "darkkhaki",
    "darkorange",
    "greenyellow",
    "hotpink",
    "dodgerblue",
    "lightblue",
    "lightcoral",
    "lightpink",
    "mediumaquamarine",
    "olive",
    "palegreen"
];

document.addEventListener("DOMContentLoaded", function(){

    const req1 = new XMLHttpRequest();
    const req2 = new XMLHttpRequest();
    const req3 = new XMLHttpRequest();

    getData(req1, req2, req3);
    
});

function getData(req1, req2, req3){
    /*Define 3 promises for each dataset to be loaded*/
    const p1 = new Promise((resolve, reject) => {

        req1.open("GET",JSON_KICKSTARTER,true);
        req1.send();
        req1.onload = function(){
            let jsonDATA = JSON.parse(req1.responseText);
            resolve(jsonDATA);
        };
        req3.onerror = function(){
            reject(JSON_KICKSTARTER);
        };
    
    });
    const p2 = new Promise((resolve, reject) => {

        req2.open("GET",JSON_MOVIE,true);
        req2.send();
        req2.onload = function(){
            let jsonDATA = JSON.parse(req2.responseText);
            resolve(jsonDATA);
        };
        req3.onerror = function(){
            reject(JSON_MOVIE);
        };
    });
    const p3 = new Promise((resolve, reject) => {

        req3.open("GET",JSON_GAMES,true);
        req3.send();
        req3.onload = function(){
            let jsonDATA = JSON.parse(req3.responseText);
            resolve(jsonDATA);
        };
        req3.onerror = function(){
            reject(JSON_GAMES);
        };
    });
    
    /*Get all data and then execute main() function*/
    Promise.all([p1, p2, p3])
        .then((values)=>{
            main(values);
        })
        .catch((values)=>{
            console.log("There was a problem getting all data: " + values);
        });

};

/*Main program function*/
function main(dataArray){

    const videoGameData = dataArray[2];

    /*Main canvas for the treemap*/
    const svg = d3.select("#treemap-diagram");

    /*Tooltips for each square*/
    const toolTip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);

        svg.attr("width", chartWidth)
        .attr("height", pageHeight)
        /*center svg element*/
        .style("margin-left", (d)=>{
               if(pageWidth - chartWidth <=0) {
                      return 0 + "px";
               };
               return (pageWidth - chartWidth)/2 + "px";
        })
        .style("margin-top", "20px");

    /*structure data in a way that d3.treemap can work with it. Using d3.hierarchy for that*/
    var drawTreeMap = d3.hierarchy(videoGameData)
        .sum(d=>d.value)
        .sort((a,b)=>b.value - a.value);
    
    /*create a treemap layout*/
    const treeMap = d3.treemap();

    /*set treemap size and padding between rectangles*/
    treeMap.size([chartWidth, chartHeight-padding])
           .padding(1);

    /*pass data to the created treemap*/
    const root = treeMap(drawTreeMap);

    /*
    creating an array of all values to determine scaling of each color for each category.
    Data will be stored to salesData and later color will be applied after processing this data.
    */
   let salesDataCategories = {};

    svg.append("g").selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("x", d=>d.x0)
        .attr("y", d=>d.y0)
        .attr("width", d=>d.x1-d.x0)
        .attr("height", d=>d.y1-d.y0)
        .attr("data-name", d=>d.data["name"])
        .attr("data-category", d=>{
            if(!salesDataCategories.hasOwnProperty(d.data["category"])){
                /*Asign color style to each category*/
                salesDataCategories[d.data["category"]] = "";
                salesDataCategories[d.data["category"]] = colorStyles[Object.keys(salesDataCategories).length-1];
            };
            return d.data["category"];
        })
        .attr("data-value", d=>d.data["value"])
        .attr("id", "data-block")
        
        .on("mouseover", (pelesEvent)=>{
            toolTip
            .transition()
            .duration(100)
            .style("opacity", 0.9);

            toolTip
            .html(
                   pelesEvent.target.attributes.getNamedItem("data-name").nodeValue +

                   "</br>" +

                   "Category: " +

                   pelesEvent.target.attributes.getNamedItem("data-category").nodeValue +

                   "</br>" + 

                   "Sales: " + 

                   pelesEvent.target.attributes.getNamedItem("data-value").nodeValue
            )
            .style("position", "fixed")
            .style("background-color", "white")
            .style("width", "25ch")
            .style("border-radius", "5px")
            .style("box-shadow", "0px 5px 10px rgba(44, 72, 173, 0.5)")
            /*tooltip positioning by getting data from mouseover event target*/
            .style("margin-left", pelesEvent.layerX + "px")
            .style("Top",  (pelesEvent.layerY-80) + "px")

            .attr("data-name", pelesEvent.target.attributes.getNamedItem("data-name").nodeValue)
            .attr("data-category", pelesEvent.target.attributes.getNamedItem("data-category").nodeValue)
            .attr("data-value", pelesEvent.target.attributes.getNamedItem("data-value").nodeValue);
     })
        .on("mouseout", ()=>{
                toolTip
                .transition()
                .duration(100)
                .style("opacity", 0);
        });

    /*Apply color for each data rectangle based on category*/
    svg.selectAll("rect")
        .style("fill", d=>{
            return salesDataCategories[d.data.category];
        })

    svg.select("g").selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("id", "block-description")
        .attr("x", d=>d.x0+2)
        .attr("y", d=>{return d.y0+20})
        .attr("text-anchor", "start")
        .text((d)=>d.data["name"]);

    /*Shift whole treemap down for title*/
    svg.select("g")
        .attr("transform", "translate(0," + padding + ")");

    svg.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", padding / 2)
        .attr("text-anchor", "middle")
        .attr("id", "title")
        .text(root.data["name"]);

    /*Generate legend*/
    let legendZeroCoordinate = chartHeight + padding/3;/*Offset from tree map with a gap of 1/3 of padding*/
    let legendEntryRowOffset = (pageHeight - legendZeroCoordinate)/6;
    /*
    generate starting coordinates for each legend entry. Legend layout will be 3 columns of 6 entries each.
    */
    let dataLength = Object.keys(salesDataCategories).length-1;
    let legendDataObject = {};
    for(let i = 0; i <= dataLength; i++){
        console.log("Legend name: " + Object.keys(salesDataCategories)[i]);

        let offset = 0;
        if(i>=6 && i<12){
            
        };
        if(i>=12){
            
        };
    };

    svg.append("g")
        .attr("id", "legend")
        .selectAll("rect")
        .data(Object.keys(salesDataCategories))
        .enter()
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", "blue")
        .attr("x", (d, i)=>{
            console.log(d + " " + i);
            let firstColumn = 0;
            let secondColumn = chartWidth/3;
            let thirdColumn = chartWidth*2/3;
            let offset = 0;
            if(i>=6 && i<12){
                offset = secondColumn;
            };
            if(i>=12){
                offset = thirdColumn;
            };
            return offset;
        })
        .attr("y", (d, i)=>{
            return legendZeroCoordinate;
        });

    
        

    /*
    study a little bit more
    https://dev.to/hajarnasr/treemaps-with-d3-js-55p7
    */
    console.log(salesDataCategories);
};
