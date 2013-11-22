window.ELISMON = {};

$(function () {
    var launchDate = '20130430';

    var metricList = [
        { title: 'cloudguides-acs.metrics.time_total', treshold: 0.64, target: 'impresys.cloudguides-acs-api.metrics.time_total', alert: 'cloudguides_acs_metrics_alert'},
        { title: 'cloudguides-analytics-service', treshold: 0.18, target: 'impresys.cloudguides-analytics-service.latency', alert: 'cloudguides_analytics_svc_alert'},
        { title: 'cloudguides-elis-service', treshold: 2.36, target: 'impresys.cloudguides-elis-service.latency', alert: 'cloudguides_elis_svc_alert'},
        { title: 'cloudguides-h5p-service', treshold: 0.52, target: 'impresys.cloudguides-h5p-service.latency', alert: 'cloudguides_h5p_svc_alert'},
        { title: 'cloudguides-ignite-page', treshold: 0.18, target: 'impresys.cloudguides-ignite-page.latency', alert: 'cloudguides_ignite_page_alert'},
        { title: 'cloudguides-storage-blob', treshold: 0.36, target: 'impresys.cloudguides-storage-blob.latency', alert: 'cloudguides_azure_storage_alert'},
        { title: 'cloudguides-storage-private-blob', treshold: 0.4, target: 'impresys.cloudguides-storage-private-blob.latency', alert: 'cloudguides_azure_private_storage_alert'},
        { title: 'cloudguides-storage-service', treshold: 0.38, target: 'impresys.cloudguides-storage-service.latency', alert: 'cloudguides_storage_svc_alert'},
        { title: 'cloudguides-user-service', treshold: 0.56, target: 'impresys.cloudguides-user-service.cookie.latency', alert: 'cloudguides_user_svc_cookie_alert'}
    ];

    var projects = [
        { projectName: 'Office Ignite', target: 'impresys.ignite-project.all-up', projectLaunchDate: launchDate },
        { projectName: 'ELIS - State of Florida', target: 'impresys.elis-project.all-up', projectLaunchDate: launchDate }
    ];

    var pendingIoRequests = [];

    ELISMON.abortPendingIoRequests = function() {
        var pendingIoItem = pendingIoRequests.pop();
        while (pendingIoItem !== undefined) {
            pendingIoItem.abort();
            pendingIoItem = pendingIoRequests.pop();
        }
    };

    ELISMON.loadProjectLines = function(projectNdx) {
        var nodeSrvProjectUrl = '/monitor/projectmetrics' + '?target=' + projects[projectNdx].target;
        nodeSrvProjectUrl += '&from=' + $('#metricRange').data('daterangepicker').startDate.toString('yyyyMMdd');
        nodeSrvProjectUrl += '&until=' + $('#metricRange').data('daterangepicker').endDate.toString('yyyyMMdd');
        nodeSrvProjectUrl += '&launchdate=' + projects[projectNdx].projectLaunchDate;

        var pendingCallBack = $.ajax({
            url: nodeSrvProjectUrl,
            cache: false
        }).done(function(data) {
                var rowValues = JSON.parse(data);
                var tr = $('<tr class="results"/>');
                getTdHtml(projects[projectNdx].projectName).appendTo(tr);
                getTdHtml(rowValues.availInPeriod).addClass('center-align').appendTo(tr);
                getTdHtml(rowValues.availSinceLaunch).addClass('center-align').appendTo(tr);
                tr.appendTo('#summaryTable');
            });

        pendingIoRequests.push(pendingCallBack);
    };

    ELISMON.loadTableData = function() {
        ELISMON.abortPendingIoRequests();
        $('#metricsTable').find('tr:gt(0)').remove();
        $('#summaryTable').find('tr:gt(0)').remove();

        for (var i = 0; i < projects.length; i++) {
            ELISMON.loadProjectLines(i);
        }

        for (var j = 0; j < metricList.length; j++) {
            ELISMON.loadServiceMetricsLines(j);
        }
    };

    ELISMON.loadServiceMetricsLines = function(metricNdx) {
        var nodeSrvMetricsUrl = '/monitor/servicemetrics' + '?target=' + metricList[metricNdx].target;
        nodeSrvMetricsUrl += '&from=' + $('#metricRange').data('daterangepicker').startDate.toString('yyyyMMdd');
        nodeSrvMetricsUrl += '&until=' + $('#metricRange').data('daterangepicker').endDate.toString('yyyyMMdd');
        nodeSrvMetricsUrl += '&alert=' + metricList[metricNdx].alert + '&treshold=' + metricList[metricNdx].treshold;

        var pendingCallBack = $.ajax({
            url: nodeSrvMetricsUrl,
            cache: false
        }).done(function(data) {
            var rowValues = JSON.parse(data);
            var tr = $('<tr class="results"/>');
            ELISMON.nameWithGraphiteUri(rowValues.graphiteQry, metricNdx).appendTo(tr);
            getTdHtml(rowValues.timeSinceOutage).addClass('center-align').appendTo(tr);
            getTdHtml(rowValues.successfulProbesPercent).addClass('center-align').appendTo(tr);
            getTdHtml(rowValues.aboveThresholdPercent).addClass('center-align').appendTo(tr);
            getTdHtml(rowValues.avgLatency).addClass('center-align').appendTo(tr);
            getTdHtml(rowValues.incidentCount).addClass('center-align').appendTo(tr);
            tr.appendTo('#metricsTable');
        });

        pendingIoRequests.push(pendingCallBack);
    };

    ELISMON.nameWithGraphiteUri = function (graphiteQryStr, metricNdx) {
        var epochStart = $('#metricRange').data('daterangepicker').startDate.getTime()/1000;
        var epochUntil = $('#metricRange').data('daterangepicker').endDate.getTime()/1000;
        var widthInMins = (epochUntil - epochStart) / 60;

        var graphiteLink = graphiteQryStr.replace('&format=json', '') + '&width=' + widthInMins + '&height=' + window.innerHeight;
        graphiteLink += '&title=' + metricList[metricNdx].title;
        return $('<td/>').html('<a href=' + graphiteLink + ' target="_blank" >' + metricList[metricNdx].title + '</a>');
    };

    $('#metricRange').daterangepicker(
        {
        ranges: {
            // 'today'/today() is zero hours at the start of today
            'Today': ['today', Date.today().add({ days: 1 }) ],
            'Yesterday': [Date.today().add({ days: -1 }), 'today'],
            'Last 7 Days': [Date.today().add({ days: -7 }), 'today'],
            'Last 30 Days': [Date.today().add({ days: -29 }), 'today'],
            'This Month': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth()],
            'Last Month': [Date.today().moveToFirstDayOfMonth().add({ months: -1 }), Date.today().moveToFirstDayOfMonth().add({ days: -1 })]
        },
        buttonClasses: ['btn-danger'],
        showDropdowns: true,
        minDate: launchDate,
        maxDate: '12/31/2013'
        },
        function(start, end) {
            $('#metricRange').find('span').html(' ' + start.toString('MMMM d, yyyy') + ' - ' + end.toString('MMMM d, yyyy' + ' '));
            ELISMON.loadTableData();
        }
    );

    //Set the initial state of the picker label - belt and suspenders...
    $('#metricRange').data('daterangepicker').startDate = Date.today().add({ days: -7 });
    $('#metricRange').data('daterangepicker').endDate = Date.today();
    $('#metricRange').find('span').html(' ' + Date.today().add({ days: -7 }).toString('MMMM d, yyyy') + ' - ' + Date.today().toString('MMMM d, yyyy') + ' ');

    // this UI component should not be part of the overall layout template...
    $('#notify').hide();
    $(".nav").find('> li:nth-child(2)').addClass('active');


    ELISMON.loadTableData();

});