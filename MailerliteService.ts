declare const UrlFetchApp: any;
declare const PropertiesService: any;
declare const Session: any;

export class MailerliteService {

    subscribe() {
        try {
            var formData = {
                'email': Session.getEffectiveUser().getEmail()
            };
            var options = {
                'method': 'post',
                'payload': formData,
                'headers': {
                    'X-MailerLite-ApiKey': PropertiesService.getScriptProperties().getProperty('mailerlitekey')
                }
            };
            var response = JSON.parse(UrlFetchApp.fetch(PropertiesService.getScriptProperties().getProperty('mailerliteURL'), options));
        }
        catch (e) {
            console.log('Mailerlite Subscribe error.' + e);
        }
    }

}