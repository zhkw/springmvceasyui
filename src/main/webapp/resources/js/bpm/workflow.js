function graphTrace(pid) {
	var ctx = '/enfi-pbs'

    // 获取图片资源
    var imageUrl = ctx + "/workflow/view-his-img?processInstanceId=" + pid;
    $.getJSON(ctx + '/workflow/process/trace?pid=' + pid, function(infos) {
        var positionHtml = "";

     // 生成图片
        var varsArray = new Array();
        $.each(infos, function(i, v) {
        	if(v.x>=0&&v.y>=0){
        		var $positionDiv = $('<div/>', {
        			'class': 'activity-attr'
        		}).css({
        			position: 'absolute',
        			left: (v.x - 1+10),
        			top: (v.y - 1),
        			width: (v.width),
        			height: (v.height),
        			backgroundColor: 'black',
        			opacity: 0,
        			zIndex: 9999
        		});
        		$positionDiv.attr("data-toggle","popover")
        		.attr("data-trigger","hover")
        		.attr("data-placement","right")
        		
        		// 节点边框
        		var $border = $('<div/>', {
        			'class': 'activity-attr-border'
        		}).css({
        			position: 'absolute',
        			left: (v.x - 1),
        			top: (v.y - 1),
        			width: (v.width - 4),
        			height: (v.height - 3),
        			zIndex: 9
        		});
        		positionHtml += $positionDiv.outerHTML() + $border.outerHTML();
        		varsArray[varsArray.length] = v.vars;
        	}
        });

        if ($('#workflowTraceDialog').length == 0) {
            $('<div/>', {
                id: 'workflowTraceDialog',
                html: "<div style='position:relative;'><img src='" + imageUrl + "' style='position:relative; left:0px; top:0px;' />" +
                "<div id='processImageBorder' >" +
                positionHtml +
                "</div>" +
                "</div>"
            }).appendTo('#jscanv');
        } else {
            $('#workflowTraceDialog img').attr('src', imageUrl);
            $('#workflowTraceDialog #processImageBorder').html(positionHtml);
        }

        // 设置每个节点的data
        $('#workflowTraceDialog .activity-attr').each(function(i, v) {
            $(this).data('vars', varsArray[i]);
            var vars = $(this).data('vars');
            var tipContent = "<table class='table'>";
            var title = "";
            $.each(vars, function(varKey, varValue) {
                if (varValue&&varKey!='节点名称') {
                    tipContent += "<tr><td>" + varKey + "</td><td>" + varValue + "<td/></tr>";
                }
                else if(varValue&&varKey=='节点名称'){
            	   title = varValue;
                }
            });
            tipContent += "</table>";
            $(this).attr("data-content",tipContent);
            $(this).attr("title",title);
        });

        $("[data-toggle='popover']").popover({html : true });
    });
}
