

/**
 * 人工时信息查看主界面js
 */
var basePath = $("#basePath").val();//项目根目录
var pbsVersionId = $("#pbsVersionId").val();//pbs版本Id
var projectId = $("#projectId").val();//项目Id
var designSumId;
var editIndex = 0;
var prices ; //价格信息
var pricesArr = new Array(); //价格信息
var PURISWORK;
var CONISWORK;
var ISFREEACCRUED;
var planManHourMain = function(){
	
	/**
	 * 页面初始化
	 */
	var initPage = function() {
		//获取单价信息 ，根据勘察设计标准计取的设计费、管理费   designCost:根据版本找基数*设备费合价（接口：getNetConstructionPrice  取price）
		Utils.ajaxJsonSync(basePath+"/manHour/getManHourPrice","",function(obj){
			prices = obj;
			for(var i in obj){
				pricesArr[obj[i].TYPE] = obj[i].PRICE;
			}
		});
		Utils.ajaxJson(basePath+"/manHour/getDesignCost","pbsVersionId="+pbsVersionId,function(obj){
			$("#designCost").val(obj.price);	
		});
		$("#planHourGrid").datagrid({
			title :'项目总工时及费用估算(表1)',
			pagination : false,
			singleSelect : true,
			fit : true,
			fitColumns:true,
			rownumbers:true,
			loadMsg : '数据加载中,请稍候...',
			checkOnSelect : false,
			nowarp : true,
			columns:[
		        [    
		          {field:'type',title:'类别',align : "left",width:'25%'}, 
		          {field:'hour',title:'',align : "left",width:'25%'},
		          {field:'sumHour',title:'总工时',align : "right",width:'22%',editor:{type:"numberbox",options:{required:true}},
		        	  formatter:function(value,row,index){
		        		  return (value/1).toFixed(2);
		        	  }
		          },
		          {field:'price',title:'预计内部交易费用',align : "right",width:'22%',
		        	  formatter:function(value,row,index){
		        		  return (value/10000).toFixed(2);
		        	  }
		          }
		        ]
		    ],
			    onLoadSuccess:function(data){
			    	mergeCells(this);
			    	
			    },
			    onClickRow:function(){
		    		 $(this).datagrid('endEdit', editIndex);
		    		 mergeCells(this);
		    		/* mergeCells(this);
		    		 var changeRows = $(this).datagrid("getChanges"); 
		    		 if(changeRows.length < 1){
		    			 return;
		    		 }
		    		 $.messager.progress({
						interval:100,
						text:'正在处理中'
					});
		    		 var rows = $(this).datagrid("getRows"); 
		    		 if(rows.length < 1){
		    			 return;
		    		 }
		    		 var unpredictableHour =rows[10].sumHour;
		    		 var rewardHour =rows[11].sumHour;
		    		 var marketingCost =rows[12].sumHour;
		    		 Utils.ajaxJsonSync(basePath+"/manHour/saveOtherMh",
		    					{manHourSumId:designSumId,
		    			 		unpredictableHour:unpredictableHour,
		    			 		rewardHour:rewardHour,
		    			 		marketingCost:marketingCost
		    					},
		    			function(obj){
    						setTimeout("getRs("+obj.rs+")",1000);
					});
		    		 */
		    			
			    },
			    onDblClickRow:function(index,field,value){
			    	if(index == 12 || index == 13 || index == 14){
				    	if($(this).datagrid('getEditors',editIndex).length < 1){
				    		$(this).datagrid('beginEdit', index);
				    		editIndex = index;
				    	}
			    	}
			    },
		});
		//数据保存
		$("#savePlanManHour").on("click", function(){
			 $("#planHourGrid").datagrid('endEdit', editIndex);
			 mergeCells("#planHourGrid");
	   		 var changeRows = $("#planHourGrid").datagrid("getChanges"); 
	   		 // if(changeRows.length < 1){
	   			//  return;
	   		 // }
	   		 $.messager.progress({
				interval:100,
				text:'正在处理中'
			});
	   		 var rows = $("#planHourGrid").datagrid("getRows"); 
	   		 if(rows.length < 1){
	   			 return;
	   		 }
	   		 var unpredictableHour =rows[12].sumHour;
	   		 var rewardHour =rows[13].sumHour;
	   		 var marketingCost =rows[14].sumHour;
	   		 var remark = $("#remark").val();
	   		 Utils.ajaxJsonSync(basePath+"/manHour/saveOtherMh",
	   					{manHourSumId:designSumId,
	   			 		unpredictableHour:unpredictableHour,
	   			 		rewardHour:rewardHour,
	   			 		marketingCost:marketingCost,
							remark:remark
	   					},
	   			function(obj){
	   				$.messager.progress('close');	
   						if(obj.rs == 0){
   							$("#planHourGrid").datagrid('reload');
   							$.messager.show({
   								title : '提示',
   								msg : '保存成功！',
   								timeout : 3000,
   								showType : 'slide'
   							});
   						}else{
   							$.messager.alert("错误", "操作失败");
   						}
   						loadDatas();
						//setTimeout("getRs("+obj.rs+")",1000);
				});
			});

        $("#freeAccrued").on("click", function(){

        });
		// 加载数据
		loadDatas();
	};

	// 加载页面列表数据
	var loadDatas = function(){
		var data;
		var accruedHour = 0;
		var manageHourPrice = pricesArr['公司管理工时'];
		$.ajax({
			url : basePath+"/manHour/summary",
			data:{pbsVersionId:pbsVersionId,projectId:projectId},
			type:'post',
			async:false,
			beforeSend:function() {
				MyMessager.prog.show("提示","请等待","数据处理中...");
			},
			complete:function() {
				MyMessager.prog.close();
			},
			error:function(jqXHR, textStatus, errorThrown) {
				MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
			},
			success:function(obj){
				data = obj;
				//console.log(data);
				designSumId = data.DESIGNID;
				PURISWORK=data.PURISWORK;
				CONISWORK=data.CONISWORK;
				ISFREEACCRUED = data.ISFREEACCRUED;
	            $("#remark").val(data.REMARK);
	            if (ISFREEACCRUED != null && ISFREEACCRUED ==1){
	                $("#isFreeAccrued")[0].checked = true;
	                manageHourPrice = 0;//若开启了免计提则梗死管理工时单价为0
					accruedHour = 0;//工时也为0
	            }else {
	                manageHourPrice = pricesArr['公司管理工时'];
	                accruedHour = data.DESIGN.WORKHOUR
                        +data.DESIGN.TRIPHOUR
                        +data.DESIGN.MANAGEHOUR
                        +data.PUR.WORKHOUR
                        +data.PUR.TRIPHOUR
                        +data.PUR.MANAGEHOUR
                        +data.CONST.WORKHOUR
                        +data.CONST.TRIPHOUR
                        +data.CONST.MANAGEHOUR
                        +data.MNG.MANAGEWORKHOUR
                        +data.MNG.MANAGEHOUR
                        +data.MNG.TRIPHOUR
                        +data.UNPREDICTABLEHOUR
	            }
			}
		});
		var data = [{type:"设计预算",hour:'设计工作工时',sumHour:data.DESIGN.WORKHOUR,price:pricesArr['设计工作工时']*data.DESIGN.WORKHOUR},
		      {type:"设计预算",hour:'设计管理工时',sumHour:data.DESIGN.MANAGEHOUR,price:pricesArr['设计管理工时']*data.DESIGN.MANAGEHOUR},
		      {type:"设计预算",hour:'设计出差工时',sumHour:data.DESIGN.TRIPHOUR,price:pricesArr['设计出差工时']*data.DESIGN.TRIPHOUR},			     
		      {type:"采购预算",hour:'采购工作工时',sumHour:data.PUR.WORKHOUR,price:pricesArr['采购工作工时']*data.PUR.WORKHOUR},
		      {type:"采购预算",hour:'采购管理工时',sumHour:data.PUR.MANAGEHOUR,price:pricesArr['采购管理工时']*data.PUR.MANAGEHOUR},
		      {type:"采购预算",hour:'采购出差工时',sumHour:data.PUR.TRIPHOUR,price:pricesArr['采购出差工时']*data.PUR.TRIPHOUR},			     
		      {type:"施工预算",hour:'施工工作人工时',sumHour:data.CONST.WORKHOUR,price:pricesArr['施工工作工时']*data.CONST.WORKHOUR},
		      {type:"施工预算",hour:'施工管理人工时',sumHour:data.CONST.MANAGEHOUR,price:pricesArr['施工管理工时']*data.CONST.MANAGEHOUR},
		      {type:"施工预算",hour:'施工出差人工时',sumHour:data.CONST.TRIPHOUR,price:pricesArr['施工出差工时']*data.CONST.TRIPHOUR},
		      {type:"项目管理人工成本预算",hour:'项目管理工作工时',sumHour:data.MNG.MANAGEWORKHOUR,price:pricesArr['项目管理工作工时']*data.MNG.MANAGEWORKHOUR},
			  {type:"项目管理人工成本预算",hour:'项目管理工时',sumHour:data.MNG.MANAGEHOUR,price:pricesArr['项目管理工时']*data.MNG.MANAGEHOUR},
		      {type:"项目管理人工成本预算",hour:'项目管理出差工时',sumHour:data.MNG.TRIPHOUR,price:pricesArr['施工出差工时']*data.MNG.TRIPHOUR},
		      {type:"其他人工成本预算",hour:'人工费不可预算工时预算',sumHour:data.UNPREDICTABLEHOUR,price:pricesArr['不可预算工时']*data.UNPREDICTABLEHOUR},
		      {hour:'奖励工时预算',sumHour:data.REWARDHOUR,price:pricesArr['奖励工时']*data.REWARDHOUR},
		      {hour:'市场费用预算',sumHour:data.MARKETINGCOST,price:pricesArr['市场费用工时']*data.MARKETINGCOST},
		      // {type:"公司计提管理费用",hour:'公司计提管理费用',sumHour:accruedHour,price:manageHourPrice*accruedHour},
		          {type:"",hour:'合计',sumHour:(
		        		  +data.DESIGN.WORKHOUR
			        	  +data.DESIGN.TRIPHOUR
			        	  +data.DESIGN.MANAGEHOUR
			        	  +data.PUR.WORKHOUR
			        	  +data.PUR.TRIPHOUR
			        	  +data.PUR.MANAGEHOUR
			        	  +data.CONST.WORKHOUR
			        	  +data.CONST.TRIPHOUR
			        	  +data.CONST.MANAGEHOUR
                          +data.MNG.MANAGEWORKHOUR
			        	  +data.MNG.MANAGEHOUR
			        	  +data.MNG.TRIPHOUR
			        	  +data.UNPREDICTABLEHOUR
			        	  +data.REWARDHOUR
			        	  +data.MARKETINGCOST
		        	  )+accruedHour
					  ,price:(pricesArr['设计工作工时']*data.DESIGN.WORKHOUR
		        			  +pricesArr['设计管理工时']*data.DESIGN.MANAGEHOUR
		        			  +pricesArr['设计出差工时']*data.DESIGN.TRIPHOUR
		        			  +pricesArr['采购工作工时']*data.PUR.WORKHOUR
		        			  +pricesArr['采购管理工时']*data.PUR.MANAGEHOUR
		        			  +pricesArr['采购出差工时']*data.PUR.TRIPHOUR
		        			  +pricesArr['施工工作工时']*data.CONST.WORKHOUR
		        			  +pricesArr['施工管理工时']*data.CONST.MANAGEHOUR
		        			  +pricesArr['施工出差工时']*data.CONST.TRIPHOUR
						      +pricesArr['项目管理工作工时']*data.MNG.MANAGEWORKHOUR
		        			  +pricesArr['项目管理工时']*data.MNG.MANAGEHOUR
		        			  +pricesArr['施工出差工时']*data.MNG.TRIPHOUR
		        			  +pricesArr['不可预算工时']*data.UNPREDICTABLEHOUR
		        			  +pricesArr['奖励工时']*data.REWARDHOUR
		        			  +pricesArr['市场费用工时']*data.MARKETINGCOST
		        			)+(manageHourPrice*accruedHour)
		        	  }
		      ];
		$("#planHourGrid").datagrid("loadData",data);
	};

	return {
		
		init : function(){
			// 页面初始化
			initPage();
			if (ISFREEACCRUED !== 1){
                freeAccrued(designSumId,1);
			}
		},
		loadDatas : function(){
			// 页面初始化
			loadDatas();
		}
	};
}();
//免计提
function isFreeAccrued(obj){
    if(obj.checked){
    	freeAccrued(designSumId,1);
	}else {
    	freeAccrued(designSumId,0);
	}

};

function freeAccrued(id,isChcked) {
    $.ajax({
        url: basePath+"/manHour/freeAccrued",
        data: {manHourSumId: id,isChcked: isChcked},
        type: "post",
        beforeSend: function() {
            MyMessager.prog.show("提示","请等待","数据处理中...");
        },
        complete: function() {
            MyMessager.prog.close();
        },
        success: function (obj) {
        	planManHourMain.loadDatas();
        }
    });
}
// 加载页面列表数据
var loadDatas = function(){
    var manageHourPrice = pricesArr['公司管理工时'];
    var data;
    $.ajax({
        url : basePath+"/manHour/summary",
        data:{pbsVersionId:pbsVersionId,projectId:projectId},
        type:'post',
        async:false,
        beforeSend:function() {
            MyMessager.prog.show("提示","请等待","数据处理中...");
        },
        complete:function() {
            MyMessager.prog.close();
        },
        error:function(jqXHR, textStatus, errorThrown) {
            MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
        },
        success:function(obj){
            data = obj;
            //console.log(data);
            designSumId = data.DESIGNID;
            PURISWORK=data.PURISWORK;
            CONISWORK=data.CONISWORK;
            
        }
    });
    var data = [{type:"设计预算",hour:'设计工作工时',sumHour:data.DESIGN.WORKHOUR,price:pricesArr['设计工作工时']*data.DESIGN.WORKHOUR},
	      {type:"设计预算",hour:'设计管理工时',sumHour:data.DESIGN.MANAGEHOUR,price:pricesArr['设计管理工时']*data.DESIGN.MANAGEHOUR},
	      {type:"设计预算",hour:'设计出差工时',sumHour:data.DESIGN.TRIPHOUR,price:pricesArr['设计出差工时']*data.DESIGN.TRIPHOUR},			     
	      {type:"采购预算",hour:'采购工作工时',sumHour:data.PUR.WORKHOUR,price:pricesArr['采购工作工时']*data.PUR.WORKHOUR},
	      {type:"采购预算",hour:'采购管理工时',sumHour:data.PUR.MANAGEHOUR,price:pricesArr['采购管理工时']*data.PUR.MANAGEHOUR},
	      {type:"采购预算",hour:'采购出差工时',sumHour:data.PUR.TRIPHOUR,price:pricesArr['采购出差工时']*data.PUR.TRIPHOUR},			     
	      {type:"施工预算",hour:'施工工作人工时',sumHour:data.CONST.WORKHOUR,price:pricesArr['施工工作工时']*data.CONST.WORKHOUR},
	      {type:"施工预算",hour:'施工管理人工时',sumHour:data.CONST.MANAGEHOUR,price:pricesArr['施工管理工时']*data.CONST.MANAGEHOUR},
	      {type:"施工预算",hour:'施工出差人工时',sumHour:data.CONST.TRIPHOUR,price:pricesArr['施工出差工时']*data.CONST.TRIPHOUR},
	      {type:"项目管理人工成本预算",hour:'项目管理工作工时',sumHour:data.MNG.MANAGEWORKHOUR,price:pricesArr['项目管理工作工时']*data.MNG.MANAGEWORKHOUR},
		  {type:"项目管理人工成本预算",hour:'项目管理工时',sumHour:data.MNG.MANAGEHOUR,price:pricesArr['项目管理工时']*data.MNG.MANAGEHOUR},
	      {type:"项目管理人工成本预算",hour:'项目管理出差工时',sumHour:data.MNG.TRIPHOUR,price:pricesArr['施工出差工时']*data.MNG.TRIPHOUR},
	      {type:"其他人工成本预算",hour:'人工费不可预算工时预算',sumHour:data.UNPREDICTABLEHOUR,price:pricesArr['不可预算工时']*data.UNPREDICTABLEHOUR},
	      {hour:'奖励工时预算',sumHour:data.REWARDHOUR,price:pricesArr['奖励工时']*data.REWARDHOUR},
	      {hour:'市场费用预算',sumHour:data.MARKETINGCOST,price:pricesArr['市场费用工时']*data.MARKETINGCOST},
	      /*{type:"公司计提管理费用",hour:'公司计提管理费用',sumHour:(
        		  +data.DESIGN.WORKHOUR
	        	  +data.DESIGN.TRIPHOUR
	        	  +data.DESIGN.MANAGEHOUR
	        	  +data.PUR.WORKHOUR
	        	  +data.PUR.TRIPHOUR
	        	  +data.PUR.MANAGEHOUR
	        	  +data.CONST.WORKHOUR
	        	  +data.CONST.TRIPHOUR
	        	  +data.CONST.MANAGEHOUR
                  +data.MNG.MANAGEWORKHOUR
	        	  +data.MNG.MANAGEHOUR
	        	  +data.MNG.TRIPHOUR
	        	  +data.UNPREDICTABLEHOUR			        	  
        	  ),price:manageHourPrice*(
	        		  +data.DESIGN.WORKHOUR
		        	  +data.DESIGN.TRIPHOUR
		        	  +data.DESIGN.MANAGEHOUR
		        	  +data.PUR.WORKHOUR
		        	  +data.PUR.TRIPHOUR
		        	  +data.PUR.MANAGEHOUR
		        	  +data.CONST.WORKHOUR
		        	  +data.CONST.TRIPHOUR
		        	  +data.CONST.MANAGEHOUR
                      +data.MNG.MANAGEWORKHOUR
		        	  +data.MNG.MANAGEHOUR
		        	  +data.MNG.TRIPHOUR
		        	  +data.UNPREDICTABLEHOUR
	          )},*/
	          {type:"",hour:'合计',sumHour:(
	        		  +data.DESIGN.WORKHOUR
		        	  +data.DESIGN.TRIPHOUR
		        	  +data.DESIGN.MANAGEHOUR
		        	  +data.PUR.WORKHOUR
		        	  +data.PUR.TRIPHOUR
		        	  +data.PUR.MANAGEHOUR
		        	  +data.CONST.WORKHOUR
		        	  +data.CONST.TRIPHOUR
		        	  +data.CONST.MANAGEHOUR
                      +data.MNG.MANAGEWORKHOUR
		        	  +data.MNG.MANAGEHOUR
		        	  +data.MNG.TRIPHOUR
		        	  +data.UNPREDICTABLEHOUR
		        	  +data.REWARDHOUR
		        	  +data.MARKETINGCOST
	        	  )+(
		        		  +data.DESIGN.WORKHOUR
			        	  +data.DESIGN.TRIPHOUR
			        	  +data.DESIGN.MANAGEHOUR
			        	  +data.PUR.WORKHOUR
			        	  +data.PUR.TRIPHOUR
			        	  +data.PUR.MANAGEHOUR
			        	  +data.CONST.WORKHOUR
			        	  +data.CONST.TRIPHOUR
			        	  +data.CONST.MANAGEHOUR
                          +data.MNG.MANAGEWORKHOUR
			        	  +data.MNG.MANAGEHOUR
			        	  +data.MNG.TRIPHOUR
			        	  +data.UNPREDICTABLEHOUR			        	  
		        	  ),price:(pricesArr['设计工作工时']*data.DESIGN.WORKHOUR
	        			  +pricesArr['设计管理工时']*data.DESIGN.MANAGEHOUR
	        			  +pricesArr['设计出差工时']*data.DESIGN.TRIPHOUR
	        			  +pricesArr['采购工作工时']*data.PUR.WORKHOUR
	        			  +pricesArr['采购管理工时']*data.PUR.MANAGEHOUR
	        			  +pricesArr['采购出差工时']*data.PUR.TRIPHOUR
	        			  +pricesArr['施工工作工时']*data.CONST.WORKHOUR
	        			  +pricesArr['施工管理工时']*data.CONST.MANAGEHOUR
	        			  +pricesArr['施工出差工时']*data.CONST.TRIPHOUR
                          +pricesArr['项目管理工作工时']*data.MNG.MANAGEWORKHOUR
	        			  +pricesArr['项目管理工时']*data.MNG.MANAGEHOUR
	        			  +pricesArr['施工出差工时']*data.MNG.TRIPHOUR
	        			  +pricesArr['不可预算工时']*data.UNPREDICTABLEHOUR
	        			  +pricesArr['奖励工时']*data.REWARDHOUR
	        			  +pricesArr['市场费用工时']*data.MARKETINGCOST
	        			)+(manageHourPrice*(
				        		  +data.DESIGN.WORKHOUR
					        	  +data.DESIGN.TRIPHOUR
					        	  +data.DESIGN.MANAGEHOUR
					        	  +data.PUR.WORKHOUR
					        	  +data.PUR.TRIPHOUR
					        	  +data.PUR.MANAGEHOUR
					        	  +data.CONST.WORKHOUR
					        	  +data.CONST.TRIPHOUR
					        	  +data.CONST.MANAGEHOUR
                                  +data.MNG.MANAGEWORKHOUR
					        	  +data.MNG.MANAGEHOUR
					        	  +data.MNG.TRIPHOUR
					        	  +data.UNPREDICTABLEHOUR
				          )
				     )
	        	  }
	      ];
    $("#planHourGrid").datagrid("loadData",data);
};

function mergeCells(obj){
	$(obj).datagrid('mergeCells',{
	     index: 0,
	     field: 'type',
	     width : 100, 
	     rowspan: 3,
	});
	$(obj).datagrid('mergeCells',{
	     index: 3,
	     field: 'type',
	     width : 100, 
	     rowspan: 3,
	});
	$(obj).datagrid('mergeCells',{
	     index: 6,
	     field: 'type',
	     width : 100, 
	     rowspan: 3,
	});
	$(obj).datagrid('mergeCells',{
	     index: 9,
	     field: 'type',
	     width : 100, 
	     rowspan: 3,
	});
	$(obj).datagrid('mergeCells',{
	     index: 12,
	     field: 'type',
	     width : 100, 
	     rowspan: 3,
	});
    $(obj).datagrid('mergeCells',{
        index: 15,
        field: 'type',
        width : 100,
        colspan: 2,
    });
}


function getRs(rs){
	$.messager.progress('close');
	if(rs == 0){
		planManHourMain.init();
		$.messager.show({
			title : '提示',
			msg : '保存成功！',
			timeout : 3000,
			showType : 'slide'
		});
	}else{
		$.messager.alert("错误", "操作失败");
	}	
}


$(function(){
	planManHourMain.init();
});

//附件管理DIALOG
function manageFiles(){
	if ($("#isFreeAccrued")[0].checked){
        $('#file-mng-dialog').dialog({
            title:'附件管理',
            width: 800,
            content:'<div  class="bdst-button" style="margin-bottom:5px;">'+
            '<a class="easyui-linkbutton f_easyui_linkbutton" data-options="iconCls:\'icon-cloud-upload\'" onclick="attachmentUpload();">上传</a>'+
            '</div>'+
            '<div id="file_list"><table id="plan_file_list" style="min-height:250px;"></table></div>',
            closed: false,
            cache: false,
            modal: true,
            buttons: [
                {
                    text:'关闭',
                    iconCls:'icon-remove',
                    handler:function(){
                        $('#file-mng-dialog').dialog("close");
                    }
                }
            ]
        });
        queryPlanFiles();
	}
}
//附件检索
function queryPlanFiles(){
    $('#plan_file_list').datagrid({
        url:basePath+'/pbsCommonController/queryAttachment',
        width:'100%',
        idField: 'ID',
        columns:[[
            {field:'fileName',title:'文件名',halign:'center',width:'50%'},
            {field:'handle',title:'操作',halign:'center',width:'50%',formatter:function(value,row,index){
                return '<button type="button" onclick="downAttachment(\''+row.filePath+'\',\''+row.fileName+'\',\''+row.id+'\');" class="btn btn-default"><i class="icon-download"></i>下载</button>'+'<button type="button" onclick="delAttachment(\''+row.id+'\')" class="btn btn-default"><i class="icon-trash"></i>删除</button>'
            }}
        ]],
        queryParams:{
            targetId:function(){
                return pbsVersionId;
            },
            targetType:13,
        }
    });
}
//附件上传
function attachmentUpload(){
    WebFilesUploader({
            _title:'文件上传',
            _width:800,
            _height:200,
            _webuploader:{
                server:'/enfi-pbs/fileUpload', //上传到服务器的地址【"/"+项目部署名称+"/fileUpload"】
                swf:'../resources/js/fileupload/webfilesuploader/Uploader.swf',//上传用的flash控件
                multiple:false,//否开起同时选择多个文件能力
                //accept:{extensions:'gif,jpg,jpeg,bmp,png'},//允许文件的后缀
                //fileNumLimit:3 //允许加入上传队列的文件个数
                //TODO 1.3.0-RELEASE配置参数
                //chunkSize:1024*1024,                       //断点续传参数【分片的大小】
                //allowMinBreakPointResumeSize:1024*1024*10, //断点续传参数【文件大小超过此值的要进行断点续传】
                //verifyChunk:'/cpm-web/verifyChunk',        //断点续传参数【文件的整体Md5验证路径】【"/"+项目部署名称+"/verifyChunk"】
                //verify:'/cpm-web/verify',                  //断点续传参数【分片的Md5验证路径】【"/"+项目部署名称+"/verify"】
                //merger:'/cpm-web/merger'                   //断点续传参数【合并文件的处理路径】【"/"+项目部署名称+"/merger"】
            }
        },
        function(jsons){
            var fileIds="";
            for(var i=0;i<jsons.length;i++){
                if(i!=0){
                    fileIds=fileIds+","+jsons[i].UUID
                }else{
                    fileIds =jsons[i].UUID;
                }
            }
            $.ajax({
                url:basePath+'/pbsCommonController/uploadAttachment',
                type : "POST",
                dataType : "json",
                beforeSend:function() {
                    MyMessager.prog.show("提示","请等待","数据处理中...");
                },
                complete:function() {
                    MyMessager.prog.close();
                },
                error:function(jqXHR, textStatus, errorThrown) {
                    MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
                },
                data : {
                    fileIds : fileIds,
                    targetId:function(){
                        return pbsVersionId;
                    },
                    targetType:13,
                },
                success:function(data) {
                    $('#plan_file_list').datagrid('reload');
                    MyMessager.slide.show("提示", data.info);
                }
            });

        });
}
//附件下载
function downAttachment(path,fileName,fileId){
    path = encodeURI(path);
    fileName = encodeURI(fileName);
    window.location.href = basePath+"/pbsCommonController/downloadAttachment?path="+path+"&fileName="+fileName+"&fileId="+fileId;
}
//附件删除
function delAttachment(fileId){
    $.messager.confirm('提示','你确定要删除该附件信息？',function(r){
        if (r){
            $.ajax({
                url:basePath+'/pbsCommonController/deleteAttachment',
                type:'POST',
                beforeSend:function() {
                    MyMessager.prog.show("提示","请等待","数据处理中...");
                },
                complete:function() {
                    MyMessager.prog.close();
                },
                error:function(jqXHR, textStatus, errorThrown) {
                    MyMessager.alert.show("提示", textStatus + ":" + jqXHR.responseText);
                },
                data:{ids:fileId},
                success:function(data){
                    $('#plan_file_list').datagrid('reload');
                    MyMessager.slide.show("提示","数据处理成功！");
                }
            });
        }
    });
}
