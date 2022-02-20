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
const pageWidth  = document.documentElement.scrollWidth;
const chartWidth = 1024;
const chartHeight = 800;
const padding = 60;

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
            console.log("All data loaded succesfully");
            main(values);
        })
        .catch((values)=>{
            console.log("There was a problem getting all data: " + values);
        });

};

/*Main program function*/
function main(dataArray){
    console.log("Main function called, data ready: " + dataArray);

};
