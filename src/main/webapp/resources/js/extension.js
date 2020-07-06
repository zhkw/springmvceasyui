$.extend($.fn.datagrid.defaults.editors, {
    searchBoxEditor: {
        init: function(container, options) {
            var width = $(container).width() - 30;
            var input = $('<input class="t datagrid-editable-input" style="height:18px;width:'+width+'px;" readonly="readonly" id="'+options.textId+'"/>' + 
                '<i id="'+options.iconId+'"" class="icon-search icon-large" style="cursor:pointer;"/><input id="'+options.textId+'Inv" class="h" style="display:none;"/>').appendTo(container);
            $("#"+options.textId).validatebox({
                required: options.required
            });
            return input;
        },
        destroy: function(target) {
            $(target).find('input.t').validatebox('destroy');
        },
        getValue: function(target) {
            return $(target).find('input.t').val();
        },
        setValue: function(target, value) {
            $(target).find('input.t').val(value);
        },
        resize: function(target, width) {
            $(target).find('input.t').css('width', width);
        }
    }
});
/**
  * add validatebox rules
  */
$.extend($.fn.validatebox.defaults.rules, {
    idcard : {// 验证身份证 
        validator : function(value) { 
            return /^\d{15}(\d{2}[A-Za-z0-9])?$/i.test(value); 
        }, 
        message : '身份证号码格式不正确' 
    },
    minLength: {
        validator: function(value, param){
            return value.length >= param[0];
        },
        message: '请输入至少（2）个字符.'
    },
    maxLength: {
        validator: function(value, param){
            return value.length <= param[0];
        },
        message: '最多输入{0}个字符.'
    },
    length:{validator:function(value,param){ 
        var len=$.trim(value).length; 
            return len>=param[0]&&len<=param[1]; 
        }, 
            message:"输入内容长度必须介于{0}和{1}之间." 
        }, 
    phone : {// 验证电话号码 
        validator : function(value) { 
            return /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/i.test(value); 
        }, 
        message : '格式不正确,请使用下面格式:020-88888888' 
    }, 
    mobile : {// 验证手机号码 
        validator : function(value) { 
            return /^(13|15|18)\d{9}$/i.test(value); 
        }, 
        message : '手机号码格式不正确' 
    }, 
    intOrFloat : {// 验证整数或小数 
        validator : function(value) { 
            return /^\d+(\.\d+)?$/i.test(value); 
        }, 
        message : '请输入数字，并确保格式正确' 
    }, 
    currency : {// 验证货币 
        validator : function(value) { 
            return /^\d+(\.\d+)?$/i.test(value); 
        }, 
        message : '货币格式不正确' 
    }, 
    qq : {// 验证QQ,从10000开始 
        validator : function(value) { 
            return /^[1-9]\d{4,9}$/i.test(value); 
        }, 
        message : 'QQ号码格式不正确' 
    }, 
    integer : {// 验证整数 
        validator : function(value) { 
            return /0|-?[1-9]+\d*/i.test(value); 
        }, 
        message : '请输入整数' 
    }, 
    positive_double :{ //验证正数
    	validator: function(value){
    		return /^[+]?\d+([.]\d+)?$/i.test(value);
    	},
    	message : '请输入正数'
    },
    positive_integer : {// 验证正整数 
        validator : function(value) { 
            return /^[+]?[1-9]+\d*$/i.test(value); 
        }, 
        message : '请输入正整数' 
    }, 
    age : {// 验证年龄
        validator : function(value) { 
            return /^(?:[1-9][0-9]?|1[01][0-9]|120)$/i.test(value); 
        }, 
        message : '年龄必须是0到120之间的整数' 
    }, 
    
    chinese : {// 验证中文 
        validator : function(value) { 
            return /^[\Α-\￥]+$/i.test(value); 
        }, 
        message : '请输入中文' 
    }, 
    english : {// 验证英语 
        validator : function(value) { 
            return /^[A-Za-z]+$/i.test(value); 
        }, 
        message : '请输入英文' 
    }, 
    unnormal : {// 验证是否包含空格和非法字符 
        validator : function(value) { 
            return /.+/i.test(value); 
        }, 
        message : '输入值不能为空和包含其他非法字符' 
    }, 
    username : {// 验证用户名 
        validator : function(value) { 
            return /^[a-zA-Z][a-zA-Z0-9_]{5,15}$/i.test(value); 
        }, 
        message : '用户名不合法（字母开头，允许6-16字节，允许字母数字下划线）' 
    }, 
    faxno : {// 验证传真 
        validator : function(value) { 
            return /^((\(\d{2,3}\))|(\d{3}\-))?(\(0\d{2,3}\)|0\d{2,3}-)?[1-9]\d{6,7}(\-\d{1,4})?$/i.test(value); 
        }, 
        message : '传真号码不正确' 
    }, 
    zip : {// 验证邮政编码 
        validator : function(value) { 
            return /^[1-9]\d{5}$/i.test(value); 
        }, 
        message : '邮政编码格式不正确' 
    }, 
    ip : {// 验证IP地址 
        validator : function(value) { 
            return /d{1,3}.d{1,3}.d{1,3}.d{1,3}/i.test(value); 
        }, 
        message : 'IP地址格式不正确' 
    }, 
    name : {// 验证姓名，可以是中文或英文 
        validator : function(value) { 
            return /^[\Α-\￥]+$/i.test(value)|/^\w+[\w\s]+\w+$/i.test(value); 
        }, 
        message : '请输入姓名' 
    },
    date : {// 验证姓名，可以是中文或英文 
        validator : function(value) { 
        //格式yyyy-MM-dd或yyyy-M-d
            return /^(?:(?!0000)[0-9]{4}([-]?)(?:(?:0?[1-9]|1[0-2])\1(?:0?[1-9]|1[0-9]|2[0-8])|(?:0?[13-9]|1[0-2])\1(?:29|30)|(?:0?[13578]|1[02])\1(?:31))|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)([-]?)0?2\2(?:29))$/i.test(value); 
        },
        message : '清输入合适的日期格式'
    },
    msn: { 
        validator : function(value) { 
        	return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value); 
    	}, 
        message : '请输入有效的msn账号(例：abc@hotnail(msn/live).com)' 
    },
    same:{ 
        validator : function(value, param){ 
            if($("#"+param[0]).val() != "" && value != ""){ 
                return $("#"+param[0]).val() == value; 
            }else{ 
                return true; 
            } 
        }, 
        message : '两次输入的密码不一致！'    
    } 
});

/**
 * add datagrid datebox editor
 * */
$.extend($.fn.datagrid.defaults.editors, {
	datebox : {
		init : function(container, options) {
			var input = $('<input type="text">').appendTo(container);
			input.datebox(options);
			return input;
		},
		destroy : function(target) {
			$(target).datebox('destroy');
		},
		getValue : function(target) {
			return $(target).datebox('getValue');
		},
		setValue : function(target, value) {
			$(target).datebox('setValue', formatDatebox(value));
		},
		resize : function(target, width) {
			$(target).datebox('resize', width);
		}
	}
});

/**
  * tree loadFilter to construct a hierarchical structure from flat lists
  */
function treeConstructor(rows) {
    function hasParent(rows, parentId) {
        for (var i in rows) {
            if (rows[i].id == parentId)
                return true;
        }
        return false;
    }
    if(rows.length > 0){
    	rows[0].state = "open";
        for (var i in rows) {
            // change icon
            if (rows[i].flag == 0){
            	rows[i].iconCls = "tree-file";
            }else{
            	rows[i].iconCls = "tree-folder";
            }
                
        }

        // extract all nodes without parent -- root nodes
        var nodes = [];
        for (var i in rows) { 
            var row = rows[i];
            if (!hasParent(rows, row.parentId)) { 
                nodes.push(row);
            }
        }

        var todo = [];
        for (var i in nodes) { 
            todo.push(nodes[i]);
        }

        // add children to "parent" nodes recursively
        while(todo.length) {
            var node = todo.shift();
            for (var i in rows) {
                var row = rows[i];
                if (row.parentId == node.id) {
                    if (node.children) {
                        node.children.push(row);
                    } else {
                        node.children = [row];
                    }
                    if (!node.state) {
                        node.state = "closed";
                    }
                    todo.push(row);
                }
            }
        }
        return nodes;
    }else{
    	return [];
    }
    
}

function isInList(id, list) {
    for (var i in list) {
        if (list[i].id == id)
            return true
    }
    return false;
}

function isInListId(id, list) {
    for (var i in list) {
        if (list[i] == id)
            return true
    }
    return false;
}

function toggleColumns(major, obj) {
    var display;
    var option = obj.treegrid("getColumnOption", "description");
    
    if ("E711"!=major&&"E611"!=major&&"E131"!=major&&"E121"!=major&&"E111"!=major&&"E431"!=major&&
        "E811"!=major&&"E911"!=major&&"E921"!=major&&"E931"!=major&&
        "EA31"!=major) {
        option.title = "规格型号";
        display = "showColumn";
    } else {
        display = "showColumn";
        option.title = "规格型号/结构形式";
    }
    
    obj.treegrid(display, "unitWeight"); // 单重
    obj.treegrid(display, "totalWeight"); // 总重
    obj.treegrid(display, "power"); // 电机功率
    obj.treegrid(display, "motorQty"); // 电机总数
    obj.treegrid(display, "hasChild"); // 是否含附属设备
    obj.treegrid(display, "isImport"); // 是否进口
    obj.treegrid(display, "isPatent"); // 是否公司专利

    if ("E111"==major||"E431"==major||"E711"==major||"E611"==major||
        "E811"==major||"E911"==major||"E921"==major||"E931"==major||
        "EA31"==major) {
        display = "hideColumn";
    } else {
        display = "hideColumn";
    }
    obj.treegrid(display, "outlineSize"); // 外形尺寸
    obj.treegrid(display, "groundArea"); // 占地面积
    obj.treegrid(display, "outlineLength"); // 长度/高度
    obj.treegrid(display, "area"); // 面积/建筑面积
    obj.treegrid(display, "volume"); // 体积/建筑体积
    if ("E131"==major||"E121"==major) {
        display = "hideColumn";
        obj.treegrid(display, "outlineLength");
    } else {
        display = "hideColumn";
    }
    obj.treegrid(display, "supportType"); // 支护形式
    obj.treegrid(display, "supportThickness"); // 支护厚度
    obj.treegrid(display, "netSectionArea"); // 净断面积
    obj.treegrid(display, "excavatedSectionArea"); // 掘进面积
    obj.treegrid(display, "excavatedQty"); // 掘进量
    obj.treegrid(display, "supportQty"); // 支护量
    obj.treegrid(display, "steelQty"); // 钢材量
}

function toggleCol(type,obj,status,major) {
    var display;
    if (status) {
        display = "showColumn";
    }else {
        display = "hideColumn";
    }
    if (type === "EQ") {
        obj.treegrid(display, "unitWeight"); // 单重
        obj.treegrid(display, "totalWeight"); // 总重
        obj.treegrid(display, "power"); // 电机功率
        obj.treegrid(display, "motorQty"); // 电机总数
        obj.treegrid(display, "hasChild"); // 是否含附属设备
        obj.treegrid(display, "isImport"); // 是否进口
        obj.treegrid(display, "isPatent"); // 是否公司专利
    }else {
        if ("E131" == major || "E121" == major) {
            obj.treegrid(display, "outlineLength");
            obj.treegrid(display, "supportType"); // 支护形式
            obj.treegrid(display, "supportThickness"); // 支护厚度
            obj.treegrid(display, "netSectionArea"); // 净断面积
            obj.treegrid(display, "excavatedSectionArea"); // 掘进面积
            obj.treegrid(display, "excavatedQty"); // 掘进量
            obj.treegrid(display, "supportQty"); // 支护量
            obj.treegrid(display, "steelQty"); // 钢材量
        }else if ("E111" == major || "E431" == major || "E711" == major || "E611" == major ||
            "E811" == major || "E911" == major || "E921" == major || "E931" == major ||
            "EA31" == major) {

            obj.treegrid(display, "outlineSize"); // 外形尺寸
            obj.treegrid(display, "groundArea"); // 占地面积
            obj.treegrid(display, "outlineLength"); // 长度/高度
            obj.treegrid(display, "area"); // 面积/建筑面积
            obj.treegrid(display, "volume"); // 体积/建筑体积
        }
    }
}
/* messager class
 */
var Messager = function(type) {
    this.type = type;
}

Messager.prototype.show = function(opt_title, opt_msg, opt_text, opt_confirmFunction) {
    switch(this.type) {
        case "progress":
        $.messager.progress({
            title: opt_title,
            msg: opt_msg,
            text: opt_text,
            interval: "100"
        });
        break;
        case "slideTip":
        $.messager.show({
            title: opt_title,
            msg: opt_msg,
            showSpeed: 100
        });
        break;
        case "confirm":
        $.messager.confirm(opt_title, opt_msg, opt_confirmFunction);
        break;
		case "alert":
		$.messager.alert(opt_title,opt_msg);
		break;
        default:
        break;
    }
}

Messager.prototype.close = function() {
    switch(this.type) {
        case "progress":
        $.messager.progress("close");
        break;
        case "slideTip":
        $.messager.show("close");
        break;
        default:
        break;
    }
}

Messager.prototype.setValue = function(value) {
    switch(this.type) {
        case "progress":
        $.messager.progress("bar").progressbar("setValue", value);
        break;
        default:
        break;
    }
}

var MyMessager = {
    prog: new Messager("progress"),
    slide: new Messager("slideTip"),
    conf: new Messager("confirm"),
	alert: new Messager("alert")
};

