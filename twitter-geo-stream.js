var nodes=[];
var edges=[];
var hashTagJson=[];
var uniqTags;
var nodeId=0;
var tagColors=[];
var xNode=0;
var MaxAllowedHashTagLength=15;
//to prevent spam twitts
var filteredWords_list=['it','love','parttime','retail','photo','nowplaying','hospitality','veterans','sales','trndnl','job','jobs','hiring','career','careerarc'];
function streamGeoDataOnPort(port) {
	var colors = d3.schemeCategory20b;
	var map = worldMap('#map', colors);
	startListeningForGeoData(port);
  /* Listening Process */
  function startListeningForGeoData(port) {
    var webSocket = new WebSocket(hostURL(port));
    webSocket.onmessage = function(event) {
      var Data = JSON.parse(event.data);
      var tooltipData={profile:Data.alltheTweet.user,text:Data.text};
      var geoData=Data.cor;
        //I filter such that in the text the word science is clearly stated
        var str=Data.text.toLowerCase();
        var n= str.search("science");
        //if(n>=0) {

        xNode++;
       // console.log("The Nodes"+xNode);
        if(xNode<500)
        {
            ConnectionMethod(Data);
            addGeoData(geoData,tooltipData);
        }
        else
        {
           webSocket.close();
        }
    };
  }
  function hostURL(port) {
      return 'ws://' + "twittserver.herokuapp.com";
  }
	/* end of Listening Process */
	function addGeoData(geoData,userData) {
		map.addGeoData(geoData,userData);
	}
	function ConnectionMethod(data) {
		var hashTag = data.hashtags;
        hashTag=refineHashTag(hashTag);
		function refineHashTag(R_tags){
            var ending = '...';
                for(var i=0;i<R_tags.length;i++){
                    if(R_tags[i].length>MaxAllowedHashTagLength){
                        R_tags[i]=R_tags[i].substring(0, MaxAllowedHashTagLength - ending.length) + ending;
                    }
                }
		    return R_tags
        }

		// check if tag is enlisted before - return found locations
		if (hashTag.length > 0) {
			for (var i = 0; i < hashTag.length; i++) {
				if (wordfilter(hashTag[i])) { continue; } // filter some tags from the input
					if(hashTag[i]!==undefined) {
					var temp = check_if_already_inside(hashTag[i]);
					uniqTags=d3.nest()
						.key(function(d){return d.tag})
						.entries(hashTagJson);
					var res=	uniqTags.sort(function(a,b){
						return d3.descending(a.values.length, b.values.length);
					} );
					/* add color to each link function*/
						////////////////////////////////
						////////////////////////////////
						addColorToLink(hashTag[i]);
						function addColorToLink(theTag)
						{
							if(CheckHashTagColor(tagColors,theTag)){
							}
							else
							{
								tagColors.push({tag:theTag,color:Azi_colores(nodeId)})
							}
						}
						////////////////////////////
						////////////////////////////
						////////////////////////////
					if (temp !== undefined) {
					if (temp.length > 0) {
						for (var j = 0; j < temp.length; j++) {
							updateHashTags(res);
							Draw_Connection_by_ID(temp[j], [data.cor.longitude, data.cor.latitude], '#aaa8b0',hashTag[i]);
						}
					}
							hashTagJson.push({Id: nodeId, tag: hashTag[i], lat: data.cor.latitude, lng: data.cor.longitude});
						}
				}
			}
			nodeId = nodeId + 1;
          //  restart(nodeId);
		}
		function wordfilter(word)
		{//console.log("input:"+word);
			word=word.trim();
			word=word.toLowerCase();
			if(filteredWords_list.indexOf(word)>=0){
				return true;
			}
			else
			{return false;}
		}
		function CheckHashTagColor(data,code) {
			for(var i=0;i<data.length;i++){
				if(data[i].tag==code){
				return true;
				}
			}
			return false;
		}
// local functions
		function Azi_colores(n) {
           /* var colores_g = [
                "#e6b0aa",
                "#e4938b",
                "#c39bd3",
                "#af7ac5",
                "#7fb3d5",
                "#5499c7",
                "#a2d9ce",
                "#45b39d",
                "#dfcfa9",
                "#7dcea0",
                "#53be79",
                "#fcb4db",
                "#a5a5a5",
                "#6a72ff",
                "#f8b687",
                "#bfc1ff",
                "#ffb388"];*/
            var colores_g = [
                "#BBB8B7",
                "#A8A5A5",
                "#989594",
                "#898585",
                "#797776",
                "#6C6A6A",
                "#5E5D5D",
                "#525352",
                "#444545"];

            //BBB8B7  A8A5A5  989594  898585  797776  6C6A6A  5E5D5D  525352  4B4C4B  444545
			return colores_g[(n+Math.floor(Math.random()*10)) % colores_g.length];
		}
		function check_if_already_inside(str)
		{ var foundItems=[];
			for(var i=0;i< hashTagJson.length;i++){
				if(hashTagJson[i].tag.toString()==str.toString()) {
					edges.push({source:nodeId,target:i});
					foundItems.push([hashTagJson[i].lng,hashTagJson[i].lat])
				}
			}
			return foundItems;
		}
	}
}
function GetHashTagColor(code) {
	for(var i=0;i<tagColors.length;i++){
		if(tagColors[i].tag==code){
			return tagColors[i].color;
		}
	}
	return false;
}