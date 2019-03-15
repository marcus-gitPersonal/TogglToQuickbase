function TimeEntry(client, startDate, duration) {
  this.client = client;
  this.startDate = startDate;
  this.duration = duration;
}

function TogglRepository(apiToken, requests, logger) {
  this.apiToken = apiToken;
  this.requests = requests;
  this.logger = logger;
}

TogglRepository.prototype.detailedReport = detailedReport;
TogglRepository.prototype.report = report;

function detailedReport(workspaceId, since, until) {

  result = [];

  var report = this.report(workspaceId, since, until);

  this.logger.log("total count: " + report.total_count + " - per page: " + report.per_page);
  var numberOfPages = Math.ceil(report.total_count/ report.per_page);
  this.logger.log("number of pages: " + numberOfPages);
  
  var page = 1;
  
  do {
    for (var i = 0; i < report.data.length; i++) {
      var timeEntry = report.data[i];

      result.push(new TimeEntry(timeEntry.client, parseISODateTime(timeEntry.start), timeEntry.dur));
    }

    ++page;
    report = this.report(workspaceId, since, until, page);
  } while (page <= numberOfPages);

  return result;
}

function report(workspaceId, since, until, page) {
  
  var usernamePassword = this.apiToken + ":api_token";
  var digest = "Basic " + Utilities.base64Encode(usernamePassword);
  
  
  var url = "https://www.toggl.com/reports/api/v2/details";
  var queryString = "workspace_id=" + workspaceId + "&user_agent=GoogleSheet" + "&since=" + since + "&until=" + until;
  if (page) {
    queryString = queryString + "&page=" + page;
  }
  this.logger.log("querystring: " + queryString);
  var response = this.requests.get(url, queryString, { 'Authorization': digest });
  var responseBody = response.getContentText();
  var result = JSON.parse(responseBody);
  return result;
}

