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
const pageEmptyBorder = (pageWidth - chartWidth) / 2; /*Distance from browser edge to where chart begins. Used to offset mouseover tooltips, so they get positioned right before the rectangle begins.*/
//legend canvas dimensions
const legendWidth = chartWidth;
const legendHeight = pageHeight - chartHeight;


/*data text*/
const textXpos = 0;
const textYpos = 15;

/*
Variable to store custom duration for animation, for each rectangle. Storing x0 * y0 values to make animation depend on both, height and width of rectangle and have direction from top left corner (shortest duration) to bottom right (longest duration). Values are stored during "rect" creation process.
*/
const animationDurationData = [];

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
        req1.onerror = function(){
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
        req2.onerror = function(){
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
            console.log("There was a problem during main() function execution: " + values);
        });

};

/*Main program function*/
function main(dataArray){

    const videoGameData = dataArray[2];

    /*structure data in a way that d3.treemap can work with it. Using d3.hierarchy for that*/
    var drawTreeMap = d3.hierarchy(videoGameData)
        .sum(d=>d.value)
        .sort((a,b)=>b.value - a.value);
    
    /*create a treemap layout*/
    const treeMap = d3.treemap();

    /*set treemap size and padding between rectangles*/
    treeMap.size([chartWidth, chartHeight])
           .padding(1);

    /*pass data to the created treemap*/
    const root = treeMap(drawTreeMap);

    /*Object to store colors for each category*/
   let salesDataCategories = {};

   /*Add title and description*/
    document.getElementById("title").innerHTML = root.data["name"];
    document.getElementById("description").innerHTML = "Top 100 video games sold on each of gaming platforms";
		
	/*Add event listener that pasitions tooltip just above the mouse cursor. The visibility and content of tooltip is adjusted when mouse goes over one of the rectangles. Static CSS is in mainStyle.css file*/
	document.addEventListener("mousemove", (mouse)=>{
		toolTip
            .style("Left", (mouse.clientX + "px"))
            .style("Top",  ((mouse.clientY - padding*1.5) + "px"));
	});

    /*Main canvas for the treemap*/
    const svgTreeMap = d3.select("#treemap-diagram")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        /*center svgTreeMap element*/
        .style("margin-left", ()=>{
            if(pageWidth - chartWidth <=0) {
                    return 0 + "px";
            };
            return (pageWidth - chartWidth)/2 + "px";
        });
	
	/*Main canvas for the treemap legend*/
    const svgLegend = d3.select("#legend-element")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        /*center svgTreeMap element*/
        .style("margin-left", ()=>{
            if(pageWidth - legendWidth <=0) {
                    return 0 + "px";
            };
            return (pageWidth - legendWidth)/2 + "px";
        })
        .style("margin-top", "20px");

    /*Tooltips for each square*/
    const toolTip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);

    const cell = svgTreeMap.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g")
		.attr("class", "tile-group")
        .attr("transform", d=>"translate(" + d.x0 + "," + d.y0 + ")");
    
	/*Add a rectangle for each data element*/
    cell
        .append("rect")
		.attr("class", "tile")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", d=>d.x1-d.x0)
        .attr("height", d=>d.y1-d.y0)
		.attr("class", "tile")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", d=>d.x1-d.x0)
        .attr("height", d=>d.y1-d.y0)
        .attr("data-name", d=>d.data["name"])
        .attr("data-category", d=>{
			/*Assigning color for each category here, since I am accessing category data for attribute*/
            if(!salesDataCategories.hasOwnProperty(d.data["category"])){
                salesDataCategories[d.data["category"]] = "";
                salesDataCategories[d.data["category"]] = colorStyles[Object.keys(salesDataCategories).length-1];
            };
			/*Also storing animation duration for each rectangle element*/
			animationDurationData.push(d.x0 * d.y0);
            return d.data["category"];
        })
        .attr("data-value", d=>d.data["value"])
        
        .on("mouseover", (pelesEvent)=>{
            toolTip
            .transition()
            .duration(100)
            .style("opacity", 1);

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
		
	/*Create a data scale for animation values. Duration range 1-3s*/
	const animationDuration = d3.scaleLinear()
								.domain([d3.min(animationDurationData), d3.max(animationDurationData)])
								.range([1, 3]);
		
    /*Apply color for each data rectangle based on category and add custon duration for animation*/
    svgTreeMap.selectAll("rect")
        .style("fill", d=>{
            return salesDataCategories[d.data.category];
        })
		.style("animation-duration", (d, index)=>{
			return animationDuration(animationDurationData[index]) + "s";
		});
	
	/*Add a text element for each data rectangle*/
    cell
		.selectAll("text")
		.data((d) => d)
		.enter()
        .append("text")
		.attr("value", d=>d.data.name);
	/*Add tspan element for each word in the name of each data rectangle*/
	cell
		.select("text").selectAll("tspan")
		.data(d=>d.data.name.split(' '))//Splits the name into an array of words, separated by white space and it iterates through each element for that particular <text> element, adding as many <tspan> elements as needed
		.enter()
		.append("tspan")
        .attr("x", textXpos)
        .attr("y", textYpos)
        .attr("dy", (d,i)=>{
			//First word in array stays in initial position, every other word is shifted down
			return i==0?textXpos:(textYpos*i);
		})
		.text(d=>d);
		
	/*Create legend*/
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
    let legendDataObject = {};/*will contain [x,y] coordinates for each category item for legend*/
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
		/*Assign coordinates for each category*/
		legendDataObject[dataLegendArray[i]] = [xPos, yPos];
    };
	/*Generate legend*/
    svgLegend.append("g")
        .attr("id", "legend")
        .selectAll("rect")
        .data(Object.keys(salesDataCategories))
        .enter()
        .append("rect")
		.attr("class", "legend-item")
        .attr("width", rectangleDimm)
        .attr("height", rectangleDimm)
        .style("fill", d=>salesDataCategories[d])
		.style("stroke", "gray")
        .attr("x", d=>legendDataObject[d][0])
        .attr("y", d=>legendDataObject[d][1]);
		
	svgLegend.select("#legend").selectAll("text")
        .data(Object.keys(salesDataCategories))
        .enter()
		.append("text")
		.text(d=>d + " sales")
		.style("fill", "black")
		.attr("x", d=>legendDataObject[d][0] + rectangleDimm * 2)
		.attr("y", d=>legendDataObject[d][1] + (rectangleDimm * 0.8))/*0.8 is manual adjustment to align text with rectangle*/
		.attr("text-anchor", "left");

};
