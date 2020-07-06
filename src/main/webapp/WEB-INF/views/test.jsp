<%--
  Created by IntelliJ IDEA.
  User: zhkw
  Date: 2020/7/6
  Time: 16:46
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%
    String path = request.getContextPath();
    String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<html>
<head>
    <title>Title</title>
    <link rel="shortcut icon" href="<%=basePath%>resources/images/favicon.ico" />

    <link rel="stylesheet" href="<%=basePath%>resources/css/base.css" type="text/css"/>
    <link rel="stylesheet" href="<%=basePath%>resources/css/layout.css" type="text/css"/>
    <link rel="stylesheet" href="<%=basePath%>resources/css/style.css" type="text/css"/>
    <!-- jquery -->
    <script type="text/javascript" src="<%=basePath%>resources/plugin/jquery/jquery-1.10.2.min.js"></script>
    <script type="text/javascript" src="<%=basePath%>resources/plugin/jquery/jquery.easing.1.3.js"></script>

    <!-- easyui -->
    <script type="text/javascript" src="<%=basePath%>resources/plugin/jquery-easyui-1.5/jquery.easyui.min.js"></script>
    <script type="text/javascript" src="<%=basePath%>resources/plugin/jquery-easyui-1.5/locale/easyui-lang-zh_CN.js"></script>
    <link rel="stylesheet" href="<%=basePath%>resources/plugin/jquery-easyui-1.5/themes/metro/easyui.css" type="text/css"/>
    <link rel="stylesheet" href="<%=basePath%>resources/plugin/jquery-easyui-1.5/themes/icon.css" type="text/css"/>
    <link rel="stylesheet" href="<%=basePath%>resources/plugin/jquery-easyui-1.5/themes/color.css" type="text/css"/>
    <script type="text/javascript" src="<%=basePath%>resources/plugin/jquery-easyui-1.5/src/jquery.combobox.js"></script>

    <!-- extension -->
    <script type="text/javascript" src="<%=basePath%>resources/js/json.js"></script>
    <script type="text/javascript" src="<%=basePath%>resources/js/dataFormatter.js"></script>
    <script type="text/javascript" src="<%=basePath%>resources/js/dateFormat.js"></script>
    <script type="text/javascript" src="<%=basePath%>resources/js/extension.js"></script>

    <!-- font&icon -->
    <link rel="stylesheet" href="<%=basePath%>resources/css/font-awesome.min.css" type="text/css" />

    <!-- custom easyui -->
    <link rel="stylesheet" href="<%=basePath%>resources/css/easyui-modification.css" type="text/css"/>

    <script type="text/javascript" src="<%=basePath%>resources/js/Utils.js"></script>

    <script type="text/javascript" src = "<%=basePath%>resources/js/zkwtest/zkwtest1.js"></script>

</head>
<body>
<table id="cxdm"></table>

<%--<table id="tt" class="easyui-datagrid" style="width:400px;height:auto;">
    <thead>
    <tr>
        <th field="name1" width="50">Col 1</th>
        <th field="name2" width="50">Col 2</th>
        <th field="name3" width="50">Col 3</th>
        <th field="name4" width="50">Col 4</th>
        <th field="name5" width="50">Col 5</th>
        <th field="name6" width="50">Col 6</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>Data 3</td>
        <td>Data 4</td>
        <td>Data 5</td>
        <td>Data 6</td>
    </tr>
    <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>Data 3</td>
        <td>Data 4</td>
        <td>Data 5</td>
        <td>Data 6</td>
    </tr>
    <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>Data 3</td>
        <td>Data 4</td>
        <td>Data 5</td>
        <td>Data 6</td>
    </tr>
    <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>Data 3</td>
        <td>Data 4</td>
        <td>Data 5</td>
        <td>Data 6</td>
    </tr>
    </tbody>
</table>--%>
</body>
</html>
