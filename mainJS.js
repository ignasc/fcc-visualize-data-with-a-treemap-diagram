/*
Load dataset from
Kickstarter Pledges: https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json

Movie Sales: https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json

Video Game Sales: https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json
*/
/*Using one if the 3 data sets below. Video game sales data is chosen.*/
const JSON_KICKSTARTER = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

const JSON_MOVIE = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

const JSON_GAMES = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
       
/*Set up SVG canvas to work on*/
const padding = 60;
const pageWidth  = document.documentElement.scrollWidth;
/*reducing page height by padding value to get rid of scroll bars if page height is bigger than 1024*/
const pageHeight = document.documentElement.scrollHeight<1024?1024:document.documentElement.scrollHeight-padding;
const chartWidth = 1024;
const chartHeight = pageHeight*0.8;/*tree map takes 80% of page height, the rest 20% is for legend*/

/*colors for categories. This should be changed to avoid hard coded colours in case number of items change in the future*/
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
            console.log("There was a problem durin main() function execution: " + values);
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

    /*Object to store colors for each category*/
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
			/*Asigning color for each category here, since I am accessing category data for attribute*/
            if(!salesDataCategories.hasOwnProperty(d.data["category"])){
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
        .attr("x", d=>d.x0 + 2)
        .attr("y", d=>{return d.y0 + 20})
        .attr("text-anchor", "start")
        .text((d)=>d.data["name"]);

    /*Shift whole treemap down to make room for title*/
    svg.select("g")
        .attr("transform", "translate(0," + padding + ")");

	/*add a title*/
    svg.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", padding / 2)
        .attr("text-anchor", "middle")
        .attr("id", "title")
        .text(root.data["name"]);

    /*Preparing data for legend*/
    let legendZeroCoordinate = chartHeight + padding/3;/*Offset from tree map with a gap of 1/3 of padding*/
    let legendEntryRowOffset = (pageHeight - legendZeroCoordinate)/6;/*legend item row offset*/
    /*
    generate starting coordinates for each legend entry. Legend layout will be 3 columns of 6 entries each.
	1	7	13
	2	8	14
	3	9	15
	4	10	16
	5	11	17
	6	12	18
	
	Rows in first column are multiplied by index number.
	Rows in second column are multiplied by (index number - 6).
	Rows in third column are multiplied by (index number - 12).
	This is to trim down the index to 1-6 and use row offset with 1-6 as multiplier.
    */
    let dataLength = Object.keys(salesDataCategories).length-1;
	let dataLegendArray = Object.keys(salesDataCategories);
    let legendDataObject = {};/*contains [x,y] coordinates for each category item for legend*/
	let rectangleDimm = 20; /*Size of rectangle icon in legend*/
	
    for(let i = 0; i <= dataLength; i++){
        let offset = 0; /*first column*/
		let secondColumn = chartWidth / 3;
		let thirdColumn = chartWidth * (2 / 3);
		
		let xPos = 0;
		let yPos = 0;

	       /*set item row and column position based on index number*/
        if(i+1<=6){/*first 6 items (column 1), using yPos = 0*/
			yPos = i*legendEntryRowOffset;
        };
        if(i+1>6 && i+1<=12){/*second 6 items (column 1)*/
            xPos = secondColumn;
			yPos = (i-6)*legendEntryRowOffset;
        };
		if(i+1>12){/*last 6 items (column 3)*/
			xPos = thirdColumn;
			yPos = (i-12)*legendEntryRowOffset;
		};
		/*asign coordinates for each category*/
		legendDataObject[dataLegendArray[i]] = [xPos, yPos];
    };
	/*Generate legend*/
    svg.append("g")
        .attr("id", "legend")
        .selectAll("rect")
        .data(Object.keys(salesDataCategories))
        .enter()
        .append("rect")
        .attr("width", rectangleDimm)
        .attr("height", rectangleDimm)
        .style("fill", d=>salesDataCategories[d])
		.style("stroke", "gray")
        .attr("x", d=>legendDataObject[d][0])
        .attr("y", d=>legendDataObject[d][1]);
		
	svg.select("#legend").selectAll("text")
        .data(Object.keys(salesDataCategories))
        .enter()
		.append("text")
		.text(d=>d + " sales")
		.style("fill", "black")
		.attr("x", d=>legendDataObject[d][0] + rectangleDimm * 2)
		.attr("y", d=>legendDataObject[d][1] + (rectangleDimm * 0.8))/*0.8 is manual adjustment to align text with rectangle*/
		.attr("text-anchor", "left");
	
	/*Shift legend table below the tree map*/
	svg.select("#legend")
		.attr("transform", "translate(0," + legendZeroCoordinate + ")");
    /*
    study a little bit more
    https://dev.to/hajarnasr/treemaps-with-d3-js-55p7
    */
};
