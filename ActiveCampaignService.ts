declare const UrlFetchApp: any;
declare const PropertiesService: any;
declare const Session: any;
declare const UserManager: any;

export class ActiveCampaignService {

    subscribe() {
        const userEmail = Session.getEffectiveUser().getEmail();
        const apiToken = PropertiesService.getScriptProperties().getProperty('activeCampaignApiToken');
        const connectorListID = parseInt(PropertiesService.getScriptProperties().getProperty('activeCampaignListId'));
        const host = PropertiesService.getScriptProperties().getProperty('activeCampaignHost');
        const contactsUrl = host + '/api/3/contacts';
        const contactListUrl = host + '/api/3/contactLists';

        try {
            const contactExistUrl = contactsUrl + '?email=' + userEmail
            var requestOptions = {
                'method': 'get',
                'headers': {
                    'Api-Token': apiToken
                }
            };
            var contactExistResponse = JSON.parse(UrlFetchApp.fetch(contactExistUrl, requestOptions));
            var activeCampaignContactId = null
            if (contactExistResponse['contacts'].length > 0) {
                activeCampaignContactId = parseInt(contactExistResponse['contacts'][0]['id']);
            } else {
                var payload2 = {
                    "contact": {
                        "email": userEmail
                    }
                };
                var payloadStringify2 = JSON.stringify(payload2);
                var requestOptions2 = {
                    'method': 'post',
                    'payload': payloadStringify2,
                    'contentType': 'application/json',
                    'headers': {
                        'Api-Token': apiToken
                    }
                };
                var addContactResponse = JSON.parse(UrlFetchApp.fetch(contactsUrl, requestOptions2));
                activeCampaignContactId = parseInt(addContactResponse['contact']['id']);
            }

            if (activeCampaignContactId != null) {
                var payload3 = {
                    "contactList": {
                        "list": connectorListID,
                        "contact": activeCampaignContactId,
                        "status": 1
                    }
                };
                var payloadStringify3 = JSON.stringify(payload3);
                var requestOptions3 = {
                    'method': 'post',
                    'payload': payloadStringify3,
                    'headers': {
                        'Api-Token': apiToken
                    }
                };
                var addToListResponse = JSON.parse(UrlFetchApp.fetch(contactListUrl, requestOptions3));
            } else {
                console.log('Error adicionando el contecto a la lista.');
            }
        }
        catch (e) {
            console.log('ActiveCampaign Subscribe error.' + e);
        }
    }
}