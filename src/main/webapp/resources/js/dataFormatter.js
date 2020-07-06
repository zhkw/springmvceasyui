//boolean转换成有效、无效
function formatBoolean(value) {
	if (value == true)
		return "有效";
	else
		return "无效";

}
// check转换
function formatCheck(value) {
	if (value == true)
		return "<i class='icon-ok'></i>";
	else
		return "";
}

function formatBoolean1(value) {
	if (value == true)
		return "<i class='icon-ok'></i>";
	else
		return "";

}

//数据类型转换

function formatType(value) {
	if(value=="number"){
		return "#springMessage('number')";
	}else if(value=="char"){
		return "#springMessage('string')";
	}else if(value=="date"){
		return "#springMessage('date')";
	}else if(value=="enumerate"){
		return "#springMessage('enum')";
	}else
		return "#springMessage('bool')";
}

function formatBooleanIcon(value) {
	if (value==true || value=="true" || value==1) {
		return "<i class='icon-ok-sign' style='vertical-align:middle;font-size:12pt;color:green;'></i>";
	} else if (value==false || value=="false" || value==0){
		return "<i class='icon-remove-sign' style='vertical-align:middle;font-size:12pt;color:red;'></i>";
	}
}