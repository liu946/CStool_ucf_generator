// ucf.js
// Author Michael liu 2015-07-27
var debug = true;
var datalist=[];
var datatype={};
function gettype (str) {
	var tl = (str.replace(")","")).split("(");
	var type = {};
	type["name"] = tl[0].toLowerCase();
	if (type["name"]=="std_logic_vector") {
		var tlsplit = tl[1].split(/(downto|to)/);
		type["begin"] = Number(tlsplit[0]);
		type["end"] = Number(tlsplit[2]);
	};
	return type;
}

$(function() {
	$('#generate').click(function(){


		// 0 - get data
		var txt = $("#component").val();
		if (debug) {console.log("[get txt]"+txt)};
		// 1 - remove comment , in|out cmp,init valuable and blank
		txt = txt.replace(/--.*?\n/g,"\n");
		if (debug) {console.log("[replaced txt 0]"+txt)};
		txt = txt.replace(/(in|out|inout) /ig,"");
		if (debug) {console.log("[replaced txt 1]"+txt)};
		txt = txt.replace(/\:\=.*?\n/g,"");
		if (debug) {console.log("[replaced txt 2]"+txt)};
		txt = txt.replace(/[\s]/g,"");
		if (debug) {console.log("[replaced txt 3]"+txt)};
		// 2 - slice
		var itemlist = txt.split(";");
		for (var i = 0;i < itemlist.length ; i++) {
			var value_type = itemlist[i].split(":");
			var valuelist = value_type[0].split(",");
			var type = gettype(value_type[1]);
			for (var j = 0;j < valuelist.length ; j++) {
				datalist.push(valuelist[j]);
				datatype[valuelist[j]]=type;
			}
		};
		// 3 - port feet 
		var portmap = $("#portmap").val();
		if (debug) {console.log("[get portmap]"+portmap)};
			// remove blank
		portmap = portmap.replace(/[\s]/g,"").toLowerCase();
		if (debug) {console.log("[replaced portmap]"+portmap)};
			// slice
		var portlist = portmap.split(",");
		var tportstr="";
		for(var i = 0;i<portlist.length;i++){
			var item = (portlist[i].replace(")","")).split('(');
			if (item.length == 1) {
				tportstr+=(','+map[item[0]]);
			} else{
				var maxbit = map[item[0]].length - 1;
				var b_e = item[1].split(/(downto|to)/);
				var list = [];
				if (b_e[1]=="downto") {
					list = map[item[0]].slice(maxbit-b_e[0],maxbit-b_e[2]+1);
				}else{
					list = map[item[0]].slice(maxbit-b_e[2],maxbit-b_e[0]+1);
					list.reverse();
				}
				tportstr+=(','+list)
			};
		}
		tportstr=tportstr.slice(1);
		var ports = tportstr.split(',');
		// 4 - generate
		var generatestr = "";
		var portspointer = 0;
		for(var i = 0;i<datalist.length;i++){
			var data = datalist[i];
			var type = datatype[data];
			if (type['name']=='std_logic_vector') {
				var drect = (type['end'] - type['begin'])/Math.abs(type['end'] - type['begin']);
				for (var j = type['begin']; j != type['end']+drect; j+=drect) {
					generatestr += ("net \""+data+"("+j+")\" loc=p"+ports[portspointer++]+";\n");
				};
			}else{
				generatestr += ("net \""+data+"\" loc=p"+ports[portspointer++]+";\n");
			}
			generatestr += "\n";
		}
		$("#ucf").val(generatestr);
	})
})

