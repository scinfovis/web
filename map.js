var svg;
var path;
var route;
var width,height;
// PART-1 - map location and scale on the page
var MapScale=140;
var mapX=970;
var mapY=330;
//PART-2  the curly lines
var drift={X:-20,Y:-20};
// PART-3 - (the 10 circles showing the max hash tags
var part_3_title_line1='Top Hashtags of Science';
var part_3_title_line2='Tweets in the World';
var part_3_title_line3='';
var ORIGIN_PART_3={x:820,y:540}; // origin of twit circles position
var Space_Between_twit_circles=45; // span between twit circles
var overlay; // the left side chart
var mapLayer; //layer for the map
var titleLayer; //layer for the title
var TopHashTags=10; //number of hash tags to show beside the page
var clearUpTime=50000; //time to clear up connections
// PART-4
var sideLayer; //layer for the side diagram
var SideCircleX=265;
var SideCircleY=345;
var radius1=135;
var radius2=102;
var radius3=240;
var radius4=radius2*1.2;
var popped_items=0;
var MouseProximity={x:0,y:0,prox:10};
function ADDManualSVG(parent,code) {
    parent.append('g')
        .attr("transform","translate(40,8) scale(1)")
        .attr("id","theTITLE")
        .html(code)
        .style("opacity", 0)
        .transition()
        .duration(300)
        .style("opacity", 1)
}

function ADDCurlyLines(parent){



    var TheCurlyLines="<path class='st6' d='M998.1,489.2C680.8,917,305.1,871.1,145.3,697.5'></path>"
            +"<path class='st7' d='M1003.4,481.9c-3.8,2.5-9.1,5.1-13.4,6l7.3,2.2l4.2,6.3C1001.1,492.1,1002.1,486.3,1003.4,481.9z'></path>"
            +"<path class='st7_2' d='M985.9,675c-4.4,1.3-10.2,2.2-14.6,1.9l6.3,4.2l2.2,7.3C980.8,684.1,983.4,678.8,985.9,675z'></path>"
            +"<path class='st6_2' d='M978.7,680.4C770,835.7,386,992.7,131.2,711'></path>";





    parent.append('g')
        .attr("transform","translate("+drift.X +","+ drift.Y +") scale(.8)")
        .html(TheCurlyLines)
}


// PART-4
function setUpRings(id,innerR,w,x,y,fill,newAngle,text){
    var theDate = new Date();
    var theHour = theDate.getHours();
    var tau = 2 * Math.PI;
    var txtData={r:innerR+w/2,theHour:theHour,fill:fill};
    if(d3.selectAll('#rings'+id)._groups[0].length==0) {
        //console.log('appended');
        var g = svg.append('g').attr('id', 'rings' + id)
        .attr("transform", "translate(" + eval(x) + "," + eval(y) + ") rotate(" + eval(theHour * 15) + ")");
        var gt= svg.append('g').attr('id', 'rings_text' + id)
            .attr("transform", "translate(" + eval(x) + "," + eval(y) + ") rotate(" + eval((theHour)* 15) + ")");
        var foreground = g.append("path")
            .datum({endAngle: 0* tau})
            .attr("d", arc)
            .attr("id",'foreground'+id)
            .attr('fill','none');
        var arc = d3.arc()
            .innerRadius(innerR)
            .outerRadius(innerR+w)
            .startAngle(0);

    }
    else
    {
        var g=svg.select('#rings'+id);
        var gt=svg.select('#rings_text'+id);

        var foreground = g.select('path')
            .attr('fill',fill)
            .attr('opacity','.5');
        var arc = d3.arc()
            .innerRadius(innerR)
            .outerRadius(innerR+w)
            .startAngle(0);


        gt.selectAll("#textPatz"+id).remove();
        if(eval(text)>60) {

            gt.append("text")
                .attr('id', 'textPatz' + id)
                .attr('class', 'arcPathText')
                .attr("x", 1)   //Move the text from the start angle of the arc
                .attr("dy", -1*w/3) //Move the text down
                .append('textPath')
                .attr("xlink:href", '#foreground' + id)
                .text(text)
                .on('mouseenter',function(d){
                    var tooltip = d3.select('.Clock-tooltip')
                        .style('visibility','visible')
                        .style('opacity',1);
                    var coords = d3.mouse(this);
                    MouseProximity.x=coords[0];
                    MouseProximity.y=coords[1];
                })
                .on('mousemove',function(d){
                    // console.log('On mouse')
                    var coords = d3.mouse(this);
                    MouseProximity.x=coords[0];
                    MouseProximity.y=coords[1];
                    var tooltip = d3.select('.Clock-tooltip')
                        .style("left", Math.max(0, d3.event.pageX -10) + "px")
                        .style("top", (d3.event.pageY-40 ) + "px")
                        .style("opacity",1);
                    tooltip.select('.title')
                        .html("<div style='font-size: 6pt;color:#268a77'>Total tweets</div>")
                })
                .on('mouseover',function(d){
                    var coords = d3.mouse(this);
                    MouseProximity.x=coords[0];
                    MouseProximity.y=coords[1];
                    var tooltip = d3.select('.Clock-tooltip')
                        .style("left", Math.max(0, d3.event.pageX -10) + "px")
                        .style("top", (d3.event.pageY-40 ) + "px")
                        .style("opacity",1);
                    tooltip.select('.title')
                        .html("<div>Total tweets</div>")
                })
                .on('mouseout', function(d){
                    var tooltip = d3.select('.Clock-tooltip')
                        .style('visibility','hidden')
                        .style('opacity',0);
                })
        }


    }


    foreground.transition()
        .ease(d3.easeElastic)
        .duration(600)
        .attrTween("d", arcTween(newAngle));
    function arcTween(newAngle) {
        return function (d) {
            var interpolate = d3.interpolate(d.endAngle, newAngle);
            return function (t) {
                d.endAngle = interpolate(t);
                return arc(d);
            };
        };
    };

}


function worldMap(mapSelector, colors) {
    var geoData = [];
    var userData=[];
    //First, append <svg> element and implement the margin convention
   // console.log("worldMap");
   var m = {t:20,r:10,b:20,l:10};
   var outerWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
   var outerHeight=0;outerWidth;
        //outerHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    width = outerWidth - m.l - m.r;
    height = 800;//outerHeight - m.t - m.b;

    var translate = [eval(mapX), eval(mapY)];
    var projection =  d3.geoEquirectangular()
        .translate(translate)
        .scale(MapScale);

    sizeChange();
    createSvgLayer(mapSelector);
    createMap();
    function createMap() {
          d3.json("data/countries.json", function(error, world) {
                                   path = d3.geoPath()
                                        .projection(projection);
                                        mapLayer.append("path")
                                        .datum(topojson.feature(world, world.objects.units))
                                        .attr("class", "land")
                                        .attr("d", path);
          });


        overlay.append('text')
            .attr('id','part_3_title_Line1')
            .attr('dx',eval(ORIGIN_PART_3.x+430))
            .attr('dy',eval(ORIGIN_PART_3.y-18.5))
            .attr('class','part-3_title')
            .text(part_3_title_line1)
            .style('opacity',1);
        overlay.append('text')
            .attr('id','part_3_title_Line2')
            .attr('dx',eval(ORIGIN_PART_3.x+430))
            .attr('dy',eval(ORIGIN_PART_3.y-4))
            .attr('class','part-3_title')
            .text(part_3_title_line2)
            .style('opacity',1);
        overlay.append('text')
            .attr('id','part_3_title_Line3')
            .attr('dx',eval(ORIGIN_PART_3.x+450))
            .attr('dy',eval(ORIGIN_PART_3.y+20))
            .attr('class','part-3_title')
            .text(part_3_title_line3)
            .style('opacity',1);


        ///////// PART-3 //////////
      for(var k=0;k<TopHashTags;k++){
           overlay.append("text")
            .attr("class","hashtext")
               .attr('letter-spacing',1)
		    .attr("id","hashtag"+k)
		    .attr("x",(ORIGIN_PART_3.x-3)+k*Space_Between_twit_circles)
		    .attr("y", ORIGIN_PART_3.y+10)
            .attr("transform",function(){
                return "rotate(90 "+ eval((ORIGIN_PART_3.x-3)+k*Space_Between_twit_circles) +" "+ eval(ORIGIN_PART_3.y+10) +")"
                        })
		   .text("");

           ///////// PART-3 //////////
           overlay
               .append("circle")
               .attr("id","bar"+k)
               .attr("cx",(ORIGIN_PART_3.x)+k*Space_Between_twit_circles)
               .attr("cy",ORIGIN_PART_3.y-5)
               .attr("height",0)
               .attr("width",6)
               .attr("transform",function(){return "rotate(180 "+ eval(ORIGIN_PART_3.x+k*Space_Between_twit_circles) +" "+eval(ORIGIN_PART_3.y-15) +")"
               });
               //.attr("transform",function(){return "rotate(180 "+ eval((1000)+k*10) +" 500)"});
                ///////// PART-3  vertical lines between each circle and text//////////
          overlay
              .append("line")
              .attr("id","vertical_line"+k)
              .attr("x1",(ORIGIN_PART_3.x-20)+k*Space_Between_twit_circles)
              .attr("x2",(ORIGIN_PART_3.x-20)+k*Space_Between_twit_circles)
              .attr("y1",ORIGIN_PART_3.y-25)
              .attr("y2",ORIGIN_PART_3.y+100)
              .attr('class','PART_3_vertical_lines')


	   }

  }
  function addGeoData(data,userdata) {

    geoData.push({cordata:data,userdata:userdata});

    updateDots();
      popper();
  }


/////////// /////////// /////////// /////////// /////////// ///////////
/////////// circles popping from center to the edges and then devolving
function popper() {

    var theDate = new Date();
    var theHour = theDate.getHours();

    var cx1=SideCircleX;
    var cy1=SideCircleY;
    var Pi=Math.PI;
    popped_items=popped_items+1;
    var arc_scale=d3.scaleLinear()
        .domain([0,3000])
        .range([0,3*Math.PI/2]);

    //console.log("I am popper "+popped_items)
//var sci=d3.find("titlePart2_scinece");
//sci.attr("fill","red");



    svg
        .append("text")
        .attr("x",552)
        .attr("y",84)
        .text("Science")
        .attr("opacity","1")
        .attr("fill","#25b293")
        .attr("class","titlePart2_scinece")
        .attr("id",popped_items)
        .transition()
        .duration(30)
        .attr('opacity', 0.010)
        .remove();

    if(popped_items>1) {
    //    svg.selectAll("#" + eval(popped_items - 1)).remove();
    }


    var cx2=eval(cx1+(radius4)*Math.cos(2*Pi*(theHour/24)-Pi/2));
    var cy2=eval(cy1+(radius4)*Math.sin(2*Pi*(theHour/24)-Pi/2));
    //console.log(theHour+ " :"+cy2+" changes to"+ cy1);
    //console.log(theHour+ " :"+cy2+" changes to"+ cy1);
    var cir=sideLayer
            .append('circle')
            .attr("opacity",1)
            .attr('cx',cx1)
            .attr('cy',cy1)
            .attr('r',3)
            .attr('class','popperClass')
            .transition()
                        .duration(1000)
            .attr('cx',cx2)
            .attr('cy',cy2)
            .attr("opacity",0);
    cir.remove();


    //setUpRings(2,eval(r2*1.05+(2*15)),14,cx,cy,'black',0);
    //setUpRings(2,eval(radius2*1.05+(2*15)),13,SideCircleX,SideCircleY,'#25B293',arc_scale(popped_items),'tweet @'+ theHour+ " o'clock");
    setUpRings(1,eval(radius2*.90+(2*10)),8,SideCircleX,SideCircleY,'#25b293',arc_scale(popped_items),popped_items);


}
/////////// /////////// /////////// /////////// /////////// ///////////
/////////// /////////// /////////// /////////// /////////// ///////////


  function updateDots() {
    if (!svg) return;
    // enter
    svg.selectAll("circle")
      .data(geoData)
      .enter()
        .append("circle")
        .classed("point", true)
        .attr("r", 10);

    // update


	  svg.selectAll("circle.point")
		  .data(geoData)
		  .attr("cx", function(d) {
			  return projection([d.cordata.longitude, d.cordata.latitude])[0];
		  })
		  .attr("cy", function(d) {
			  return projection([d.cordata.longitude, d.cordata.latitude])[1];
		  })
          .on('mousemove',function(d){

              var coords = d3.mouse(this);
              MouseProximity.x=coords[0];
              MouseProximity.y=coords[1];


              var tooltip = d3.select('.custom-tooltip')
                  .style("left", Math.max(0, d3.event.pageX -10) + "px")
                  .style("top", (d3.event.pageY-40 ) + "px")
                  .style("opacity",1);
              tooltip.select('.title')
                  .html("<table width='80px' style='table-layout:fixed;'><tbody><tr><td colspan=2 style='color:#a88950;font-size: 7.5pt'>"+ d.userdata.profile.location +"</td>"+
                        "</tr><tr><td width='30px'><img src="+ d.userdata.profile.profile_image_url +" width=25px>" +
                        "</td><td style='color:#5e5e5e;overflow: hidden;' align='left' width='50px'>"+ d.userdata.profile.screen_name + "</td>"+
                        "</tr><tr><td colspan=2 width='80px' style='font-size: 7.5pt;overflow: hidden;'>"+ d.userdata.text +"</td></tr></tbody></table>")

          })
          .on('mouseenter',function(){
              var tooltip = d3.select('.custom-tooltip')
                  .style('visibility','visible')
                  .style('opacity',1);
              var coords = d3.mouse(this);
              MouseProximity.x=coords[0];
              MouseProximity.y=coords[1];

          })
          .on('mouseout',function(){
              var coords = d3.mouse(this);
                  if((MouseProximity.x)>coords[0]+MouseProximity.prox||(MouseProximity.x)<coords[0]-MouseProximity.prox){
                  if((MouseProximity.y)>coords[1]+MouseProximity.prox||(MouseProximity.y)<coords[1]-MouseProximity.prox)
             {
                    var tooltip = d3.select('.custom-tooltip')
                         .style('opacity',1)
                         .transition()
                         .duration(50)
                         .style('opacity',.3)
                         .style('visibility','hidden');}}})
          .transition()
          .duration(300)
		  .attr("r","2")
		  .attr("fill", "#25b293");
          //var coords = d3.mouse(this);
              //if((MouseProximity.x)>coords[0]+MouseProximity.prox||(MouseProximity.x)<coords[0]-MouseProximity.prox){
                //  if((MouseProximity.y)>coords[1]+MouseProximity.prox||(MouseProximity.y)<coords[1]-MouseProximity.prox)
                 // {

                //      var tooltip =
                  //        d3.select('.custom-tooltip')
                         // .style('opacity',1)
                         // .transition()
                          //.duration(50)
                          //.style('opacity',.3)
                  //        .style('visibility','hidden');
	//  }
    //}}



  }
      return {
    addGeoData: addGeoData
  };
}
function updateHashTags(theTags)
{
    var theDate = new Date();
    theHour = theDate.getHours();
    var hashtagONcircle=d3.select('#hashTag_id'+theHour);
    var tau = 2 * Math.PI;
	if(theTags[0] !== "undefined")
	{
    //PART-3 old bars now circles.
        var twits_scale=d3.scaleLinear()
            .domain([1,theTags[0].values.length+2])
            //.domain([0,35])
            .range([1,20]);

        for(var k=0;k<Math.min(TopHashTags,theTags.length);k++)
            {

              ///////////////////on the circle PART-4////////////////////////////
                hashtagONcircle
                    .text("  "+ theTags[0].key+ " "+ theTags[0].values.length+"")
                    .attr("fill",GetHashTagColor(theTags[0].key));
                //---------------------------------------------------------
                  /////////////////////On the bar  PART-3///////////////////////////////
	            d3.select('#hashtag'+k)
	                .text(theTags[k].key+ "  "+ theTags[k].values.length+"")
		            .attr("fill",GetHashTagColor(theTags[k].key));
                d3.select('#bar'+k)
                    .attr("r",twits_scale(theTags[k].values.length))
                   // .attr('height',bar_scale(theTags[k].values.length))
                    .attr('fill',GetHashTagColor(theTags[k].key));
                d3.select('#part_3_title_Line1')
                   .transition()
                   .duration(1000)
                    .style('opacity',1);
                d3.select('#part_3_title_Line2')
                    .transition()
                    .duration(1000)
                    .style('opacity',1);




//console.log(theTags[k])
            //April 20 2017
              //  setUpRings(k,eval(radius2*1.05+(k*15)),13,SideCircleX,SideCircleY,GetHashTagColor(theTags[k].key),arc_scale(theTags[k].values.length),theTags[k].key);
                ////////////////////////////////////////////////////////////
        }
	}
}
function Draw_Connection_by_ID(FromPoint,ToPoint,strokeColor,id)
{
	//console.log();
	var lineColor=GetHashTagColor(id);
	coordinates=[FromPoint,ToPoint];
	route = {type: "LineString",coordinates:coordinates};
	if (!svg) return;
	svg.append("path")
		.datum(route)
		.attr("class", "arc")
    .attr("id",id)
    .attr("stroke",lineColor)
		.attr("d", path)
        .attr("stroke-opacity",1)
        .transition()
        .duration(clearUpTime)
        .attr("stroke-opacity",0.01);
}
function createSvgLayer(mapSelector){
    d3.select(window)
        .on("resize", sizeChange);
    svg = d3.select(mapSelector)
        .append("svg")
        .attr("width", "100%")
        .on("click",function(){
            var tooltip = d3.select('.custom-tooltip')
                .style('opacity',1)
                .transition()
                .duration(50)
                .style('opacity',.3)
                .style('visibility','hidden');
        })
        .append("g");

    mapLayer=svg.append("g")
        .attr("id","mapLayer");
    overlay=svg.append("g")
        .attr("id","Overlay");
    titleLayer=svg.append("g")
        .attr("id","titleLayer");
    sideLayer=svg.append('g')
        .attr('id','sideViz');
    sizeChange();
    sideVizStatic(sideLayer,SideCircleX,SideCircleY,radius1,radius2);
    titleSet(titleLayer,"Scientific Visualization",50,30);
    function titleSet(svgLayer,title,x,y) {
        //ADDManualSVG(svg,"<g transform='translate(80 0)'>"+data_title+"</g>");
        ADDCurlyLines(svg);



        svg
            .append("text")
            .attr("x",300)
            .attr("y",71)
            .text("SCiNFOVIS")
            .attr("fill","#5e5e5e")
            .attr("opacity",".8")
            .attr("class","MainTitle");
           // .attr("style","font-weight:bold; font-family: 'Times New Roman';font-size: 40px");




        svg
            .append("text")
            .attr("x",430)
            .attr("y",84)
            .text("World Live Tweets of Science")
            .attr("opacity",".4")
            .attr("fill","#a88950")
            .attr("class","titlePart2");
            //.attr("style","font-weight:bold; font-family: 'helvetica';font-size: 17px");

        //.attr("style","font-weight:bold; font-family: 'helvetica';font-size: 17px");


        svg
            .append("text")
            .attr("x",798)
            .attr("y",680)
            .text("Copyright © August. 2017 All rights reserved To Azam Majooni")
            .attr("opacity",".9")
            .attr("fill","#545454")
            .attr("style","font-weight:100; font-family: sans-serif;font-size: 9px")
        //    .transition()
        //    .duration(3000)
        //    .ease(d3.easeElastic)
        //    .attr("x",width/2);

    }
// PART-4 add the circles to the left side of the page
    function sideVizStatic(svgLayer,cx,cy,r1,r2,r3)
    {
        var degreeLines=[];
        var degreetexts=[];
        var hashTagText=[];
        var x2,y2;
        r4=r2*1.2;
        if(degreeLines.length==0)
        {
            for(var i=0;i<24;i++)
                {
                    x2=cx+r4*Math.cos(2*Math.PI*(i/24)-Math.PI/2);
                    y2=cy+r4*Math.sin(2*Math.PI*(i/24)-Math.PI/2);
                    degreeLines.push({x1:cx,x2:x2,y1:cy,y2:y2,class:"side_circle_lines",id:"id"+i});
                }
               var r3=r2*.85;
               var r5=r2*1.25;
            for(i=0;i<24;i++)
                {
                    var x=cx+(r3)*Math.cos(2*Math.PI*(i/24)-Math.PI/2);
                    var y=cy+(r3)*Math.sin(2*Math.PI*(i/24)-Math.PI/2);
                    degreetexts.push({x:x,y:y,id:"text_id"+i,val:i+"",rotate:360*(i/24)});
                    x=cx+(r5)*Math.cos(2*Math.PI*(i/24)-Math.PI/2);
                    y=cy+(r5)*Math.sin(2*Math.PI*(i/24)-Math.PI/2);
                    hashTagText.push({x:x,y:y,id:"hashTag_id"+i,val:i+"",rotate:360*((i)/24)+270});
                }
         }
        var circleData=[{cx:cx,cy:cy,r:r1,class:'bigCircle'},{cx:cx,cy:cy,r:r2,class:'SecondCircle'},{cx:cx,cy:cy,r:radius3,class:'thirdCircle'}];
        svgLayer.selectAll('lines')
            .data(degreeLines)
            .enter()
            .append('line')
            .attr('x1',function(d){return d.x1;})
            .attr('x2',function(d){return d.x2;})
            .attr('y1',function(d){return d.y1;})
            .attr('y2',function(d){return d.y2;})
            .attr("class",function(d){return d.class;})
            .attr("id",function(d){return d.id})
            .attr("stroke-opacity",.01)
            .exit()
            .remove();
        svgLayer.selectAll('times')
            .data(degreetexts)
            .enter()
            .append('text')
            .text(function(d){return d.val})
            .attr("text-anchor", "middle")
            .attr('x',function(d){return d.x})
            .attr('y',function(d){return d.y})
            .attr('id',function(d){return d.id })
            .attr('class','timeLabels')
            .attr("transform",function(d){return "rotate("+d.rotate +" "+ d.x +" "+d.y +")" } )
            .on('mouseenter',function(d){
                var tooltip = d3.select('.Clock-tooltip')
                    .style('visibility','visible')
                    .style('opacity',1);
                var coords = d3.mouse(this);
                MouseProximity.x=coords[0];
                MouseProximity.y=coords[1];
            })
            .on('mousemove',function(d){
               // console.log('On mouse')
                var coords = d3.mouse(this);
                MouseProximity.x=coords[0];
                MouseProximity.y=coords[1];
                var tooltip = d3.select('.Clock-tooltip')
                    .style("left", Math.max(0, d3.event.pageX -10) + "px")
                    .style("top", (d3.event.pageY-40 ) + "px")
                    .style("opacity",1);
                tooltip.select('.title')
                    .html("<div style='font-size: 6pt;color:#a88950'>Time of Tweet</div>")
            })
            .on('mouseover',function(d){
                var coords = d3.mouse(this);
                MouseProximity.x=coords[0];
                MouseProximity.y=coords[1];
                var tooltip = d3.select('.Clock-tooltip')
                    .style("left", Math.max(0, d3.event.pageX -10) + "px")
                    .style("top", (d3.event.pageY-40 ) + "px")
                    .style("opacity",1);
                tooltip.select('.title')
                    .html("<div>Time of Tweet</div>")
            })
            .on('mouseout', function(d){
                var tooltip = d3.select('.Clock-tooltip')
                    .style('visibility','hidden')
                    .style('opacity',0);
            })
            .exit()
            .remove();
        ///////////////////////////////////////
        // on circle PART-4
        //////////////////////////////////////
        svgLayer.selectAll('hashTagHolder')
            .append('g')
            .attr('id','hashTagHolder')
            .data(hashTagText)
            .enter()
            .append('text')
            .text('')
            .attr("text-anchor", "start")
            .attr('x',function(d){return d.x+14})
            .attr('y',function(d){return eval(d.y)})
            .attr('id',function(d){return d.id })
            .attr('class','HashLabels')
            .attr("letter-spacing", 1)
            .attr("transform",function(d){return "rotate("+d.rotate +" "+ eval(d.x) +" "+eval(d.y) +")" } )
            .exit()
            .remove();

        svgLayer.selectAll('circle')
            .data(circleData)
            .enter()
            .append('circle')
            .attr('cx',function(d){return d.cx})
            .attr('cy',function(d){return d.cy})
            .attr('r',function(d){return d.r})
            .attr('class',function(d){return d.class})
            .exit()
            .remove();



      //April 20
      //  for(i=0;i<10;i++)
      //  {
      //      setUpRings(i,eval(r2*1.05+(i*20)),14,cx,cy,'black',0);
      //  }
        setUpRings(2,eval(r2*1.05+(2*15)),14,cx,cy,'black',0);

    }
}
function sizeChange() {
    d3.select("g").attr("transform", "scale(" + $("#map").width()/1500 + ")");
    //$("svg").height($("#map").width()*0.618);
    $("svg").height("800");
}
var TheCurlyLines="<g id='line1'><path class='st32' d='M897.1,421.6C696,914,312.6,846.6,296.9,842.1/></g>"+
    "<g id='line2'><path class='st31' d='M1553.1,747.6c-59.2,176.7-272.6,359.3-822.8,204.3C364.1,848.8,185.2,849.6,159.6,848.8'/></g>"+
    "<g id='line3' class='st59'><path class='st60' d='M1463.9,1328C1072.1,868,185.2,849.6,159.6,848.8'/></g>";