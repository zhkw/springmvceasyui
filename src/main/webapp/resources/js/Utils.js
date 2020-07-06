/**
 * 工具脚本
 */
var Utils = /**
 * @returns {___anonymous53_10925}
 */
/**
 * @returns {___anonymous53_10925}
 */
/**
 * @returns {___anonymous53_10925}
 */
function() {
	return {
		/**
		 * 获取项目根路径
		 */
		getRootPath : function() {
			var curWwwPath = window.document.location.href;
			var pathName = window.document.location.pathname;
			var pos = curWwwPath.indexOf(pathName);
			var localhostPaht = curWwwPath.substring(0, pos);
			var projectName = pathName
					.substring(0, pathName.substr(1).indexOf('/') + 1);
			return (projectName);
		},
		/**
		 * JS 取消冒泡事件 兼容火狐IE
		 */
		stopPropagation : function(e) {
			if (e && e.stopPropagation) {
				// W3C取消冒泡事件
				// e.preventDefault();
				e.stopPropagation();
			} else {
				// IE取消冒泡事件
				window.event.cancelBubble = true;
			}
		},
		/**
		 * 判断字符长度
		 */
		getByteLen : function(val) {
			var len = 0;
		    for (var i = 0; i < val.length; i++) {
				var length = val.charCodeAt(i);
				if (length >= 0 && length <= 128) {
				    len += 1;
				} else {
				    len += 2;
				}
		    }
			return len;
		},
		/**
		 * 设置宽度和高度自适应
		 */
		resizedGrid : function(div_id) {
			var height = $(window).height() - 100;
			$("#"+div_id).datagrid('resize', {
				height : height
			});
		},
		/**
		 * 设置宽度和高度自适应
		 */
		resizedTreeLayoutGrid : function(div_id) {
			var height = $(window).height() - 100;
			var width = $(window).width() - 200;
			if($("#maincont")){
				width = $("#maincont").width() - 200;
			}
			$("#"+div_id).datagrid('resize', {
				width : width,
				height : height
			});
		},
		/*
		 * 让datagrid在无数据的情况下显示横向滚动条
		 * 注意此方法要结合datagrid的onLoadSuccess方法使用，需要判断数据为0的情况下调用此方法。
		 * onLoadSuccess: function(data){
				if (data.total == 0) {
					scrollShow("dg",data.total);
				}
			}
		 */
		scrollShow : function(datagridId, total) {
		    if (total == 0) {
		        var datagrid = $("#" + datagridId);
		        var width = datagrid.prev(".datagrid-view2").find(".datagrid-header-row").width();
		        datagrid.prev(".datagrid-view2")
		            .children(".datagrid-body")
		            .html("<div style='width:" + width + "px;border:solid 0px;height:1px;'></div>");
		    }
		},
		/**
		 * 当前时间的前一年
		 */
		getOneYearBeforeDay : function() {
			var date=new Date();
	   		var str=new Date((+date)-365*24*3600*1000).format("yyyy-MM-dd hh:mm:ss");
			return str;
		},
		/**
		 * 当前时间的后三个月
		 */
		getThreeMonthAfterDay : function() {
			var date=new Date();
	   		var str=new Date((+date)+90*24*3600*1000).format("yyyy-MM-dd hh:mm:ss");
			return str;
		},
		/**
		 * 当前时间的前三天
		 */
		getThreeAfterDay : function() {
			var date=new Date();
	   		var str=new Date((+date)-3*24*3600*1000).format("yyyy-MM-dd hh:mm:ss");
			return str;
		},
		/**
		 * 当前时间的前两天
		 */
		getTwoAfterDay : function() {
			var date=new Date();
	   		var str=new Date((+date)-2*24*3600*1000).format("yyyy-MM-dd hh:mm:ss");
			return str;
		},
		/**
		 * 当前时间的前两天
		 */
		getTwoAfterDayForDate : function() {
			var date=new Date();
	   		var str=new Date((+date)-2*24*3600*1000).format("yyyy-MM-dd");
			return str;
		},
		/**
		 * 当前时间的前一天
		 */
		getOneAfterDay : function() {
			var date=new Date();
	   		var str=new Date((+date)-1*24*3600*1000).format("yyyy-MM-dd hh:mm:ss");
			return str;
		},
		/**
		 * 当前时间
		 */
		getNowDay : function() {
			var date=new Date();
	   		var str=new Date(+date).format("yyyy-MM-dd hh:mm:ss");
			return str;
		},
		/**
		 * 当前时间前90天
		 */
		getThreeMonthDay : function() {
			var date=new Date();
	   		var str=new Date((+date)-90*24*3600*1000).format("yyyy-MM-dd hh:mm:ss");
			return str;
		},
		/**
		 * 当前时间前30天
		 */
		getThirtyBeforeDay : function() {
			var date=new Date();
			var str=new Date((+date)-30*24*3600*1000).format("yyyy-MM-dd hh:mm:ss");
			return str;
		},
		/**
		 * 当前时间的后一天
		 */
		getOneBeforeDay : function() {
			var date=new Date();
	   		var str=new Date((+date)+1*24*3600*1000).format("yyyy-MM-dd hh:mm:ss");
			return str;
		},
		
		/**
		 * 当前时间的后一天
		 */
		getOneBeforeDayForDate : function() {
			var date=new Date();
	   		var str=new Date((+date)+1*24*3600*1000).format("yyyy-MM-dd");
			return str;
		},
		/**
		 * 当前时间的后七天
		 */
		getSevenDayAfter : function() {
			var date=new Date();
	   		var str=new Date((+date)+7*24*3600*1000).format("yyyy-MM-dd hh:mm:ss");
			return str;
		},
		//获取表格复选框选中值id给选择复选框值id加''
		convertStr:function(value){
			var convertValues = "";
			var strRecords=value.split(',');
			//从数组中取出选中的id值
			for(var i=0;i<strRecords.length;i++){
				convertValues+= "'"+strRecords[i]+"'," ;
			}			
			//判断是否为空
			if(null!=convertValues && ""!=convertValues){
				convertValues=convertValues.substring(0, convertValues.length-1);
			}
			return convertValues;
		},
		/**
		 * 当前时间的前七天
		 */
		getSevenAfterDay : function() {
			var date=new Date();
	   		var str=new Date((+date)-7*24*3600*1000).format("yyyy-MM-dd hh:mm:ss");
			return str;
		},
		/**
		 * 当前时间的前10分钟
		 */
		getTenBeforeMin : function() {
			var date=new Date();
	   		var str=new Date((+date)-600*1000).format("yyyy-MM-dd hh:mm:ss");
			return str;
		},
		
		/**
		 * 当前时间
		 */
		getNowTime : function() {
			var date=new Date();
	   		var str=new Date().format("yyyy-MM-dd hh:mm:ss");
			return str;
		},
		/**
		 * 当前时间:年月日
		 */
		getNowDate : function() {
			var date=new Date();
			var str=new Date().format("yyyy-MM-dd");
			return str;
		},
		/**
		 * 获得今天20:
		 */
		getToday8Hours : function(){
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1): date.getMonth() + 1;
			var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
			var dateStr = year + "-" + month + "-" + day ;
			return dateStr+" 20:00:00" ;
		},
		/**
		 * 获得明天20:
		 */
		get1DaysAfterToday8Hours : function(){
			var date = new Date();
	   		var date = new Date((+date)+1*24*3600*1000);
			var year = date.getFullYear();
			var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1): date.getMonth() + 1;
			var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
			var dateStr = year + "-" + month + "-" + day ;
			return dateStr+" 20:00:00" ;
		},
		
		/**
		 * 获得当前时间的生产日期开始时间 2015-07-22 07:22:00则生产日期为2015-07-21 20:00:00
		 */
		getCurrentProdDateStart : function(){
			
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1): date.getMonth() + 1;
			var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
			var dateStr = year + "-" + month + "-" + day ;  

			var dateB = new Date((+ date)-1*24*3600*1000); 
			var yearB = dateB.getFullYear();
			var monthB = dateB.getMonth() + 1 < 10 ? "0" + (dateB.getMonth() + 1): dateB.getMonth() + 1;
			var dayB = dateB.getDate() < 10 ? "0" + dateB.getDate() : dateB.getDate();
			var dateStrB = yearB + "-" + monthB + "-" + dayB ;   
			
			var hour = date.getHours()>20 ? dateStr: dateStrB;
		    return hour+" 20:00:00" ;
		},
		ajaxJson : function(url,data,okfun,errorfun) {
			$.ajax({
				type:'post',
				url : url,
				data:data,
				success:function(data, textStatus){
					if(okfun) {
						okfun(data);
					}
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					if(errorfun) {
						errorfun(XMLHttpRequest, textStatus, errorThrown);
					}
				},
				complete : function (XMLHttpRequest, textStatus) {
					
				}
			});
		},
		ajaxJsonForm : function(url,data,okfun,errorfun) {
			$.ajax({
				type:'post',
				url : url,
				data:JSON.stringify(data),
				dataType:"json",
				contentType : "application/json",
				success:function(data, textStatus){
					if(okfun) {
						okfun(data);
					}
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					if(errorfun) {
						errorfun(XMLHttpRequest, textStatus, errorThrown);
					}
				},
				complete : function (XMLHttpRequest, textStatus) {
					
				}
			});
		},
		ajaxJsonSync : function(url,data,okfun,errorfun) {
			$.ajax({
				type:'post',
				url : url,
				async:false,
				data:data,
				success:function(data, textStatus){
					if(okfun) {
						okfun(data);
					}
				},
				error : function(XMLHttpRequest, textStatus, errorThrown) {
					if(errorfun) {
						errorfun(XMLHttpRequest, textStatus, errorThrown);
					}
				},
				complete : function (XMLHttpRequest, textStatus) {
					
				}
			});
		},
		
		/**
		 * 将form表单的参数转为json
		 * @param id form表单的id
		 */
		form2Json :function(id) {
            var arr = $("#" + id).serializeArray()
            var jsonStr = "";
            jsonStr += '{';
            for (var i = 0; i < arr.length; i++) {
                jsonStr += '"' + arr[i].name + '":"' + $.trim(arr[i].value) + '",'
            }
            jsonStr = jsonStr.substring(0, (jsonStr.length - 1));
            jsonStr += '}'
 
            var json = JSON.parse(jsonStr)
            return json
        },
        
        /**
		 * 将form表单的参数转为json
		 * @param id form表单的id
		 */
		form2JsonTwo :function(form) {
            var arr = form.serializeArray()
            var jsonStr = "";
            jsonStr += '{';
            for (var i = 0; i < arr.length; i++) {
                jsonStr += '"' + arr[i].name + '":"' + $.trim(arr[i].value) + '",'
            }
            jsonStr = jsonStr.substring(0, (jsonStr.length - 1));
            jsonStr += '}'
 
            var json = JSON.parse(jsonStr)
            return json
        },
        
		
		/**
		 * 页面输入验证【判断日期是否在合理区间内】
		 * 
		 * @param firstData
		 *            开始日期
		 * @param secondData
		 *            结束日期
		 * @param action
		 *            比对方式【lt:< gt:> lteq:<= gteq:>= between】
		 * @returns returnFlag 
		 */
		checkDateInSection : function(firstData, secondData, action) {		 
			var firstDate = new Date(firstData.replace(/-/g,"\/"));
			var secondDate = new Date(secondData.replace(/-/g,"\/"));			
			if ("lt" == action) {
				if (firstDate < secondDate) {
					return false;
				}
			} else if ("gt" == action) {
				if (firstDate > secondDate) {
					return false;
				}
			} else if ("lteq" == action) {
				if (firstDate < secondDate || firstDate == secondDate) {
					return false;
				}
			} else if ("gteq" == action) {
				if (firstDate > secondDate || firstDate == secondDate) {
					return false;
				}
			}
			return true;
		},
		/**
		 * 日期格式转换
		 * 
		 * @param data 日期格式数据
		 * @returns 字符类型日期
		 */
		dateFormat1 : function(data,format){
			if(data) {
				var newDate = new Date(data);
				return newDate.pattern(format);
			}
			return "";
		},
		GetDateDiff:function(date1,date2) {
			var arrival = Utils.dateFormat(date1,'yyyy-mm-dd');
			var leave = Utils.dateFormat(date2,'yyyy-mm-dd');
		    var startTime = new Date(Date.parse(arrival.replace(/-/g,   "/"))).getTime();     
		    var endTime = new Date(Date.parse(leave.replace(/-/g,   "/"))).getTime();     
		    var dates = Math.abs((startTime - endTime))/(1000*60*60*24);     
		    return  dates;    
		},
		/**
		 * 日期格式转换
		 * 
		 * @param data 日期格式数据
		 * @returns 字符类型日期
		 */
		dateFormat : function(data,format){
			if(data) {
				var date1=new Date(data);
		   		var str=new Date(+date1).format("yyyy-MM-dd hh:mm:ss");
				return str;
			}
			return "";
		},
		
		/**
		 * 获得当前时间的生产日期结束时间 2015-07-22 07:22:00则生产日期为2015-07-22 20:00:00
		 */
		getCurrentProdDateEnd : function(){
			
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1): date.getMonth() + 1;
			var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
			var dateStr = year + "-" + month + "-" + day ;  

			var dateB = new Date((+ date)+1*24*3600*1000); 
			var yearB = dateB.getFullYear();
			var monthB = dateB.getMonth() + 1 < 10 ? "0" + (dateB.getMonth() + 1): dateB.getMonth() + 1;
			var dayB = dateB.getDate() < 10 ? "0" + dateB.getDate() : dateB.getDate();
			var dateStrB = yearB + "-" + monthB + "-" + dayB ;   
			
			var hour = date.getHours()<20 ? dateStr: dateStrB;
		    return hour+" 20:00:00" ;
		},
		/**
		 * 字符串转date
		 */
		Str2Date: function (str){
			var date = eval('new Date(' + str.replace(/\d+(?=-[^-]+$)/, 
					   function (a) { return parseInt(a, 10) - 1; }).match(/\d+/g) + ')');
			return date;
		},
		/**
		 * 判断数组中是否存在元素
		 */
		containsByArr: function(arr,value){
			for (var i = 0; i < arr.length; i++) {
				if(arr[i] == value){
					return true;
				}
			}
			return false;
		},
		/**
		 * 判断数组中是否存在元素
		 */
		containsByArr2: function(arr,value){
			for (var i = 0; i < arr.length; i++) {
				if(arr[i] == value){
					return i;
				}
			}
			return null;
		},
		/**
		 * 数组排序
		 * arr 元素组
		 * i 取 0
		 * j 取 arr.length - 1
		 * sort 0 小到大 1 大到小
		 */
		sortArr: function(arr,sort){
			var i = 0;
			var j = arr.length - 1;
			arr = Utils.sort(arr,i,j,0);
			var rs = new Array();
			if(sort == 1){
				for(var i = arr.length - 1; i >= 0; i--){
					rs.push(arr[i]);
				}
			}else{
				rs = arr;
			}
			return rs;
		},
		sort: function(arr,i,j,flag){
			if(i < j){
				var a = i; 
				var b = j;
				var x = arr[i];
				while(a < b){
					while(a < b && arr[b] >= x){
						b--;
					}
					if(a < b){
						arr[a] = arr[b];
						a++;
					}
					while(a < b && arr[a] < x){
						a++;
					}
					if(a < b){
						arr[b] = arr[a];
						b--;
					}
				}
				arr[a]= x;
				Utils.sort(arr, i, a - 1,1); // 递归调用   
				Utils.sort(arr, a + 1, j,1);
			}
			if(flag == 0){
				return arr;
			}
		}
	};
}();

String.prototype.replaceAll = function(reallyDo, replaceWith, ignoreCase) {
	if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
		return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi" : "g")),
				replaceWith);
	} else {
		return this.replace(reallyDo, replaceWith);
	}
};

Date.prototype.format =function(format){
    var o = {
    	"M+" : this.getMonth()+1, // month
    	"d+" : this.getDate(), // day
    	"h+" : this.getHours(), // hour
    	"m+" : this.getMinutes(), // minute
    	"s+" : this.getSeconds(), // second
    	"q+" : Math.floor((this.getMonth()+3)/3), // quarter
    	"S" : this.getMilliseconds() // millisecond
    };
    if(/(y+)/.test(format)) 
	format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4- RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
	format = format.replace(RegExp.$1,
	    RegExp.$1.length==1? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
	return format;
};


 /**
  * 验证邮箱
 * @param email
 * @returns
 */
verifyEmail =function(email){
	var reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
	return reg.test(email);
}

/**
 * 验证手机
* @param email
* @returns
*/
verifyPhone = function(phone){
	var reg = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/;
	return reg.test(phone);
}

//创建一个模式化dialog
modalDialog = function(options) {
	var opts = $.extend({
		modal : true,
		onClose : function() {
			$(this).dialog('destroy');
		}
	}, options);
	opts.modal = true;// 强制此dialog为模式化，无视传递过来的modal参数
	if (options.url) {
		opts.content = '<iframe id="" src="' + options.url + '" allowTransparency="true"  scrolling="auto" width="100%" height="98%" frameBorder="0" name=""></iframe>';
	}
	return $('<div/>').dialog(opts);
};
// tree  parentId  
function convert(rows) {
    function exists(rows, parentId) {
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].id == parentId) return true;
        }
        return false;
    }

    var nodes = [];
    // get the top level nodes
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (!exists(rows, row.parentId)) {
            nodes.push({
                id: row.id,
                text: row.name,
                memo: row.memo,
                parentName: row.parentName,
                orderNumber: row.ordernumber,
                parentId: row.parentId
            });
        }
    }

    var toDo = [];
    for (var i = 0; i < nodes.length; i++) {
        toDo.push(nodes[i]);
    }
    while (toDo.length) {
        var node = toDo.shift();    // the parent node
        // get the children nodes
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (row.parentId == node.id) {
                var child = {
                    id: row.id,
                    text: row.name,
                    memo: row.memo,
                    parentName: row.parentName,
                    orderNumber: row.ordernumber,
                    parentId: row.parentId
                };
                if (node.children) {
                    node.children.push(child);
                } else {
                    node.children = [child];
                }
                toDo.push(child);
            }
        }
    }
    return nodes;
}

function decimalHandel(num,length){
	if(num == Infinity || num == -Infinity || isNaN(num) ){
		return 0;
	}
	var rs = parseFloat(""+num);
	rs = parseFloat(rs.toFixed(length));
	return rs;
}

function getTpValue(value){
	//$('<span title=\"' + value + '\" class=\"easyui-tooltip\">' + value + '</span>')
	return value ;
}
