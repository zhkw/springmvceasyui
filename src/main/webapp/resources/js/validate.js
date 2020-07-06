/**
 * @Description:
 *              输入验证
 * @Author:
 *              Zheng Jia
 * @time:
 *              2015/01/07
 */


/**
* 判断输入是否为空
* 
* @param obj input对象的输入值
* @return true【空】/false【非空】
*/
function check_null(objVal) { 
	if (objVal == "undefined" || null == objVal || objVal.length == 0) {
		return true;
	}else if($.isArray(objVal)){
		return false;
	}else {
		objVal = $.trim(objVal);
		if (objVal.length == 0) {
			return true;
		}
	}
	return false;
}

/**
* 判断是否存在特殊字符
* 
* @param obj input对象的输入值
* @return true【存在】/false【不存在】
*/
function check_special(objVal) { 
    var re = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）&mdash;—|{}【】‘；：”“'。，、？]");
	if (re.test(objVal)) {
		return true;
	} else {
		return false;
	}
}

/**
* 判断输入长度
* 
* @param obj input对象的输入值
* @param minLen 最小长度
* @param maxLen 最大长度
* @return true【范围内】/false【范围外】
*/
function check_length(objVal,minLen,maxLen) {
	var inputLen = objVal.length       
    if(inputLen < minLen) {
        //alert("输入内容必须达到"+ minLen +"位");
        return false;
    }  
    if(inputLen > maxLen) {
        //alert("输入内容不能超过"+ maxLen +"位");
        return false;
    }
    return true;
}

/**
* 判断是否为数字
* 
* @param obj input对象的输入值
* @return true【全数字】/false【存在非数字】
*/
function check_number(objVal) {
	if (/^\d+$/.test(objVal)) {
		return true;
	} else {
		return false;
	}
}
/**
* 判断是否为整数
* 
* @param obj input对象的输入值
* @return true【整数】/false【非整数】
*/
function check_integer(objVal) {       
	if (/^(\+|-)?\d+$/.test(objVal)) {
		return true;
	} else {
		return false;
	}
}

/**
* 判断是否为浮点数
* 
* @param obj input对象的输入值
* @return true【浮点数】/false【非浮点数】
*/
function check_double(objVal) {
	var numReg;
	var strValueTemp, strInt, strDec;    
	try {        
        numReg =/[\-]/;
        strValueTemp = objVal.replace(numReg, "");
        numReg =/[\+]/;
        strValueTemp = strValueTemp.replace(numReg, "");
            
        numReg =/[\.]/;
        if(numReg.test(objVal) == false) {
        	return false;    
        }                   
        if(strValueTemp.indexOf(".") < 0) {
            return false;      
        }        
        return true;
    } catch(e) {
        //alert("in check_double = " + e);
        return false;
    }    
}

/**
* 判断是浮点数的整数和小数位数
* 
* @param obj input对象的输入值
* @param lenInt 整数位长度
* @param lenDec 小数位长度
* @return true【范围内】/false【范围外】
*/
function check_doubleLen(objVal,lenInt,lenDec) {
	var numReg;
	var strValueTemp, strInt, strDec;    
	try {        
        numReg =/[\-]/;
        strValueTemp = objVal.replace(numReg, "");
        numReg =/[\+]/;
        strValueTemp = strValueTemp.replace(numReg, "");
            
        strInt = strValueTemp.substr( 0, strValueTemp.indexOf("."));        
        if(strInt.length > lenInt) {
            return false;
        }
        strDec = strValueTemp.substr( (strValueTemp.indexOf(".")+1), strValueTemp.length);    
        if(strDec.length > lenDec) {
            return false;
        }         
        return true;
    } catch(e) {
        //alert("in check_doubleLen = " + e);
        return false;
    }   
}

/**
* 检查输入字符串是否只由汉字组成
* 
* @param obj input对象的输入值
* @return true【全汉字】/false【存在其他字符】
*/
function check_zh(objVal){
	if (/^[\u4e00-\u9fa5]+$/.test(objVal)) {
    	return true;
    } else {
        return false;
    } 
}

/**
* 判断是否为小写英文字母
* 
* @param obj input对象的输入值
* @return true【全小写英文】/false【存在小写英文以外字符】
*/
function check_lowerCase(objVal) {       
	if (/^[a-z]+$/.test(objVal)) {
		return true;
    } else {
        return false;
    }
}

/**
* 判断是否为大写英文字母
* 
* @param obj input对象的输入值
* @return true【全大写英文】/false【存在大写英文以外字符】
*/
function check_upperCase(objVal) {       
    if (/^[A-Z]+$/.test(objVal)) {
    	return true;
    } else {
        return false;
    }
}

/**
* 判断是否为英文字母【大小写均可】
* 
* @param obj input对象的输入值
* @return true【全英文】/false【存在英文以外字符】
*/
function check_letter(objVal) {       
    if (/^[A-Za-z]+$/.test(objVal)) {
    	return true;
    } else {
//    	alert("请输入英文字母");
        return false;
    }
}

/**
* 判断是否只由汉字、字母、数字组成
* 
* @param obj input对象的输入值
* @return true【】/false【】
*/
function check_ZhOrNumOrLett(objVal) {
    var regu = "^[0-9a-zA-Z\u4e00-\u9fa5]+$";   
    var re = new RegExp(regu);
    if (re.test(objVal)) {
    	return true;
    } else {
        return false;
    }
}

/**
* 校验IP地址的格式
* 
* @param obj input对象的输入值
* @return true【合法IP】/false【非法IP】
*/
function check_IP(obj) {
	var ipStr = $.trim(obj.val());
    var re = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
    if(re.test(ipStr)) {
    	if( RegExp.$1<256 && RegExp.$2<256 && RegExp.$3<256 && RegExp.$4<256) {
    		setNormal(obj);
    		return true;
    	} else {
        	setError("IP格式不对", obj);
            return false;
        }
    } else {
    	setError("IP格式不对", obj);
        return false;
    }
}
//验证端口号
function check_port(obj){
	var portStr = $.trim(obj.val());

	var re=/^(\d)+$/g;  
    if(re.test(portStr) && parseInt(portStr)<=65535 && parseInt(portStr)>=0){  
    	setNormal(obj);
        return true;  
     }else{  
    	setError("端口号错误", obj);
        return false;  
     }
}
//非零数字
function posOrNegNumber(obj){
	var val = $.trim(obj.val());
	var re = /^-?[1-9]\d*\.\d+$|^-?0\.\d*[1-9]\d*$|^-?[1-9]\d*$/;
	if(re.test(val)){
		val*=1;
		if(val>0 || val<0){
			setNormal(obj);
			return true;
		}else{
			setError("请输入非零数字", obj);
			return false;
		}
	}else{  
		setError("请输入非零数字", obj);
        return false;  
     }
}
/**
* 检查输入对象的值是否符合网址格式
* 
* @param obj input对象的输入值
* @return true【合法网址】/false【非法网址】
*/
function check_URL(objVal){  
	var strRegex = '^((https|http|ftp|rtsp|mms)?://)'
				  + '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' // ftp的user@
				  + '(([0-9]{1,3}.){3}[0-9]{1,3}'                                // IP形式的URL- 199.194.52.184
				  + '|'                                                          // 允许IP和DOMAIN（域名）
				  + '([0-9a-z_!~*\'()-]+.)*'                                     // 域名- www.
				  + '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].'                        // 二级域名
				  + '[a-z]{2,6})'                                                // first level domain- .com or .museum
				  + '(:[0-9]{1,4})?'                                             // 端口- :80
				  + '((/?)|'                                                     // a slash isn't required if there is no file name
				  + '(/[0-9a-z_!~*\'().;?:@&=+$,%#-]+)+/?)$'; 
	var re = new RegExp(strRegex);
    if(re.test(objVal)) {
    	return true;
    } else {
        return false;
    }
}


/**
* 检查输入手机号码是否正确
* 一、移动电话号码为11位
* 二、第一位和第二位为"3-8"
* 三、第四位至第十一位为"0-9"的数字
* 
* @param obj input对象的输入值
* @return true【合法手机号码】/false【非法手机号码】
*/
function check_mobile(objVal) {   
	//var regu = /1[3-8]+\d{9}/; 
	var regu = /^1[3|4|5|8][0-9]\d{4,8}$/;
    var re = new RegExp(regu);
    if (re.test(objVal)) {
    	return true;
    } else {
        return false;
    }
}

/**
* 检查输入固定电话号码是否正确
* 一、区号：前面一个0，后面跟2-3位数字
* 二、电话号码：7-8位数字
* 三、分机号：一般都是3位数字【可选】
* 
* @param obj input对象的输入值
* @return true【合法固定电话】/false【非法固定电话】
*/
function check_phone(objVal) {   
	var regu = /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/;
    var re = new RegExp(regu);
    if (re.test(objVal)) {
    	return true;
    } else {
        return false;
    }
}

/**
* 判断是否为邮政编码
* 
* @param obj input对象的输入值
* @return true【合法邮编】/false【非法邮编】
*/
function check_zipcode(objVal)
{
    if(!check_number(objVal)) {
    	return false;
    }
    if(objVal.length != 6) {
        return false;
    } else {
    	return true;
    }
}

/**
* 用户ID：判断是否只由数字、字母、下划线组成,且第一个字符不能为数字
* 
* @param obj input对象的输入值
* @return true【合法输入】/false【非法输入】
*/
function check_userID(objVal) {
    if(!isNaN(objVal.charAt(0))) {
        return false;
    }
    if(!/^\w{1,20}$/.test(objVal)) {
        return false;
    }
    return true;
}

/**
* 判断是否为日期
* 
* @param obj input对象的输入值
* @param format yyyy-MM-dd 
* @return true【】/false【】
*/
function checkDate(obj) {
    var dateStr = $.trim(obj.val());
    if(dateStr===""){
    	return true;
    }
    var parts = dateStr.split('-');
    if(parts==null || parts.length!=3){
    	setError("日期格式不对", obj);
    	return false;
    }
    var funcs = ['getFullYear','getMonth','getDate'];
    
    var date = new Date(dateStr.replace(/-/g,'/'));
    parts[1]--;
    for(var i=0; i<parts.length; i++){
    	if(parts[i]*1 != date[funcs[i]]()){
    		setError("日期格式不对", obj);
    		return false;
    	}
    }
    setNormal(obj);
    return true;
}
function checkDate2(obj) {
    var dateStr = $.trim(obj.val());
    if(dateStr===""){
    	return true;
    }
    var parts = dateStr.split('-');
    if(parts==null || parts.length!=3){
    	setError2("日期格式不对", obj);
    	return false;
    }
    var funcs = ['getFullYear','getMonth','getDate'];
    
    var date = new Date(dateStr.replace(/-/g,'/'));
    parts[1]--;
    for(var i=0; i<parts.length; i++){
    	if(parts[i]*1 != date[funcs[i]]()){
    		setError2("日期格式不对", obj);
    		return false;
    	}
    }
    setNormal2(obj);
    return true;
}
/**
* 检查输入对象的值是否符合E-Mail格式
* 
* @param obj input对象的输入值
* @return true【是E-Mail格式】/false【非E-Mail格式】
*/
function checkEmail(obj){
	var val = $.trim(obj.val());
	if(val==="") {
		setNormal(obj);
		return true;
	}
	var myReg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
	if(myReg.test(val)) {
		setNormal(obj);
		return true;
	}else{
		setError(message_emailError, obj);
		return false;
	}
}
function checkEmail2(obj){
	if(obj.val()=="") {
		return true;
	}
	var myReg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
	if(myReg.test(obj.val())) {
		setNormal2(obj);
		return true;
	}else{
		setError2("请输入正确的电子邮箱", obj);
		return false;
	}
}
/**
* 判断是否为正数，负数，0
* 
* @param obj input对象的输入值
* @return true【全数字】/false【存在非数字】
*/
function check_num2(obj) {
	var val = $.trim(obj.val())*1;
	if(val=="") {
		return true;
	}
	var reg = /^(-|\+)?(\d+.)?\d+$/;
	if(reg.test(val)) {
		setNormal2(obj);
		return true;
	}else{
		setError2("请输入正确的数字", obj);
		return false;
	}
}
//添加错误信息以及错误类
function setError(errorInfo, obj) {
	obj.parent().find(".conErr").remove();
	obj.parent().find(".conRight").remove();
	var errorSpan = "<span class='conErr help-inline'>" + errorInfo + "！</span>";
	obj.parent().append(errorSpan);
	obj.closest(".control-group").addClass("error");
}
//添加正确信息
function setRight(rightInfo, obj) {
	obj.parent().find(".conErr").remove();
	obj.parent().find(".conRight").remove();
	var rightSpan = "<span class='conRight help-inline'>" + rightInfo + "！</span>";
	obj.parent().append(rightSpan);
	obj.closest(".control-group").removeClass("error");
}
//消除错误信息以及错误类
function setNormal(obj) {
	obj.parent().find(".conErr").remove();
	obj.closest(".control-group").removeClass("error");
}
//验证必填项
function isFilled(id) {
	var obj = $("#"+id);
	var value = $("#" + id).val();
	if (check_null(value)) {
		setError("此项为必填项", obj);
		return false;
	}
	setNormal(obj);
	return true;
}

//验证多选框必填项
function isMultiSelectFilled(id) {
	var obj = $("#"+id);
	var value = "";
	// 如果不为空，则设置并跳出循环
	$("#"+id+" option:selected").each(function(i){	
		var idVal = $(this).val();
		if (!check_null(idVal)) {
			value = idVal;
			return false;
		}			
	  });
	if (check_null(value)) {
		setError("此项为必填项", obj);
		return false;
	}
	setNormal(obj);
	return true;
}

//验证数字：正整数+正浮点数
function isNum(obj) {
	var value = $.trim(obj.val());
	if(value===""){
		return true;
	}
	var regI = /^[0-9]*[1-9][0-9]*$/;//正整数
	var regF = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;//正浮点数
	if(!(regI.test(value) || regF.test(value))) {
		if(!obj.closest(".control-group").hasClass("error")){
			setError("请输入数字", obj);
		}
		return false;
	}
	setNormal(obj);
	return true;
}
//验证数字：正整数+正浮点数
function isNum2(obj) {
	var value = obj.val();
	var regI = /^[0-9]*[1-9][0-9]*$/;//正整数
	var regF = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;//正浮点数
	if(!(regI.test(value) || regF.test(value))) {
		setError2(message_numInput, obj);
//		setError2("请输入数字", obj);
		return false;
	}
	setNormal2(obj);
	return true;
}
//验证数字：0+正数
function isZeroOrPosNum(obj,message) {
	var value = $.trim(obj.val());
	var regI = /^[0-9]*[1-9][0-9]*$/;//正整数
	var regF = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;//正浮点数
	if(!(value==="0" || regI.test(value) || regF.test(value))) {
		setError(message, obj);
//		setError2("请输入数字", obj);
		return false;
	}
	setNormal(obj);
	return true;
}
//验证数字：正整数
function isPositiveInt(obj) {
	var value = obj.val();
	var regI = /^[0-9]*[1-9][0-9]*$/;//正整数
	if(!(regI.test(value))) {
		setError2("请填写正整数", obj);
		return false;
	}
	setNormal2(obj);
	return true;
}
/**
 * 行内验证-多选下拉列表行内验证必填项
 * @param id selectID
 * @param idErrorPlace 控件可见DIV的ID
 * @returns {Boolean}
 */
function isMultiSelectFilled2(id,idErrorPlace) {
	var obj = $("#"+id);
	var objErrorPlace = $("#"+idErrorPlace);	
	var value = "";
	// 如果不为空，则设置并跳出循环
	$("#"+id+" option:selected").each(function(i){	
		var idVal = $(this).val();
		if (!check_null(idVal)) {
			value = idVal;
			return false;
		}			
	  });
	if (check_null(value)) {
		setError2(message_noNullInput, objErrorPlace);
		return false;
	}
	setNormal2(objErrorPlace);
	return true;
}

/*
* 行内验证
*/
function isFilled2(id){
	var obj = $("#"+id);
	var value = $("#" + id).val();
	if (check_null(value)) {
//		setError2("此项为必填项", obj);
		setError2(message_noNullInput, obj);
		return false;
	}
	setNormal2(obj);
	return true;
}

/*
* 行内验证动态属性检验
*/
function isFilled2AutoAttr(obj){
	var value = obj.val();
	if (check_null(value)) {
		setError2(message_noNullInput, obj);
		return false;
	}
	setNormal2(obj);
	return true;
}

/**
 * 行内验证-带检索下拉列表
 * @param id selectID
 * @param idErrorPlace 控件可见DIV的ID
 * @returns {Boolean}
 */
function isFilled2ChosenSelect(id,idErrorPlace){
	var obj = $("#"+id);
	var objErrorPlace = $("#"+idErrorPlace);
	var value = $("#" + id).val();
	if (check_null(value)) {
//		setError2("此项为必填项", obj);
		setError2(message_noNullInput, objErrorPlace);
		return false;
	}
	setNormal2(objErrorPlace);
	return true;
}

//行内添加错误信息以及错误类
function setError2(errorInfo, obj) {
	removeError(obj);
	
	var x = obj.position().left;
	var y = obj.position().top + obj.innerHeight();
	var warning = $('<div class="tooltip fade bottom in" style="display: block;" rel="'+obj.attr("id")+'">'
					+'<div class="tooltip-arrow"></div>'
					+'<div class="tooltip-inner">'+errorInfo+'</div>'
				  +'</div>');
	warning.css({"top":y, "left":x});
	obj.parent().addClass("error");
	obj.closest("table").append(warning);
}
//行内消除错误信息以及错误类
function setNormal2(obj) {
	obj.parent().removeClass("error");
	removeError(obj);
}
//
function removeError(obj){
	var id = obj.attr("id");
	$(".tooltip[rel='"+id+"']").remove();
}
//消除提示
$(function(){
	$(document).on("keyup", "td input[type='text'].required", function(){
		if($.trim($(this).val())!==""){
			setNormal2($(this));
		}else{
			setError2("此项为必填项", $(this));
		}
	});
	$(document).on("change", "td select.required", function(){
		if($.trim($(this).val())!=="" && $(this).val()!=="undefined"){
			setNormal2($(this));
		}else{
			setError2("此项为必填项", $(this));
		}
	});
});

/*
* 行内验证-弹窗列表
*/
function isFilled2List(obj,modalId){
	var value = obj.val();
	if (check_null(value)) {
		setError2List("此项为必填项", obj,modalId);
		return false;
	}
	setNormal2(obj);
	return true;
}

//行内添加错误信息以及错误类-弹窗列表
function setError2List(errorInfo, obj,modalId) {
	removeError(obj);	
//	var x = obj.offset().left;
//	var y = obj.offset().top + obj.innerHeight();
	var x = obj.position().left;
	var y = obj.position().top + obj.innerHeight();
	var warning = $('<div class="tooltip fade bottom in" style="display: block;" rel="'+obj.attr("id")+'">'
					+'<div class="tooltip-arrow"></div>'
					+'<div class="tooltip-inner">'+errorInfo+'</div>'
				  +'</div>');
	warning.css({"top":y, "left":x});
	obj.parent().addClass("error");
	$("#"+modalId).find("table").append(warning);
//	$("#"+modalId).find("div.modal-body").append(warning);
}

//验证数字：正整数+正浮点数-弹窗列表
function isNum2List(obj,modalId) {
	var value = obj.val();
	var regI = /^[0-9]*[1-9][0-9]*$/;//正整数
	var regF = /^(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*))$/;//正浮点数
	if(!(regI.test(value) || regF.test(value))) {
		setError2List("请输入数字", obj,modalId);
		return false;
	}
	setNormal2(obj);
	return true;
}
//验证下拉是否选中有效项
function isSelected(obj){
	var value = $.trim(obj.val());
	if(value===""){
		setError2("请选择一项", obj);
		return false;
	}
	setNormal2(obj);
	return true;
}