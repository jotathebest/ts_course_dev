import { MainService } from "./MainService";

declare const Logger: any;
declare const CacheService: any;
declare const ContentService: any;
declare const HtmlService: any;
declare const PropertiesService: any;

var mainService = new MainService();


function getAuthType() {
    var ans = mainService.getAuthType();
    Logger.log("authType ans: ")
    Logger.log(ans)
    return ans
}

function isAuthValid() {
    var ans = mainService.isAuthValid();
    Logger.log("isAuthValid ans: ")
    Logger.log(ans)
    return ans
}

function resetAuth() {
    var ans = mainService.resetAuth();
    Logger.log("resetAuth ans: ")
    Logger.log(ans)
    return ans
}

function get3PAuthorizationUrls() {
    var ans = mainService.get3PAuthorizationUrls();
    Logger.log("get3PAuthorizationUrls ans: ")
    Logger.log(ans)
    return ans
}

function authCallback(request: any) {
    Logger.log("authCallback request: ")
    Logger.log(request)
    var ans = mainService.authCallback(request);
    Logger.log("authCallback ans: ")
    Logger.log(ans)
    return ans
}

function isAdminUser() {
    var ans = mainService.isAdminUser();
    Logger.log("isAdminUser ans: ")
    Logger.log(ans)
    return ans
}

function getConfig(request: any) {
    Logger.log("getConfig request: ")
    Logger.log(request);
    var ans = mainService.getConfig(request);
    Logger.log("getConfig ans: ")
    Logger.log(ans)
    return ans;
}

function getSchema(request: any) {
    Logger.log("getSchema request: ")
    Logger.log(request);
    var ans = mainService.getSchema(request);
    Logger.log("getSchema ans: ")
    Logger.log(ans)
    return ans;
}

function getData(request: any) {
    Logger.log("getData request: ")
    Logger.log(request);
    var ans = mainService.getData(request);
    Logger.log("getData ans: ")
    Logger.log(ans)
    return ans;
}
function doGet(e) {
    // https://script.google.com/macros/s/AKfycbwMXnr5uMY-5oKO4a-Ez17Twm_ZO7QM7oCEr1Xk_WafYXEjKSVO81D74aWr6fvTolKoGA/exec?q=resetAuth
    // https://script.google.com/a/macros/portermetrics.com/s/AKfycbwMXnr5uMY-5oKO4a-Ez17Twm_ZO7QM7oCEr1Xk_WafYXEjKSVO81D74aWr6fvTolKoGA/exec?q=resetAuth
    // https://developers.google.com/apps-script/guides/web#new-editor
    //Logger.log(e);
    if (e.parameter.q == "resetAuth") {
        var resetAuth = mainService.resetAuth();
        Logger.log(resetAuth);
    }
    //var textOutput = ContentService.createTextOutput("Hello World! Welcome to the web app.")
    // var textOutput = ContentService.createTextOutput("Reset succesfully done!")
    //var textOutput = ContentService.createTextOutput(JSON.stringify(e)) 
    //var output = HtmlService.createHtmlOutput('<b>Reset succesfully done!</b>');
    var output = HtmlService.createHtmlOutput('<script>if (window.top) { window.top.close() }</script>');
    //output.append('<script>if (window.top) { window.top.close() }</script>');
    return output;
}