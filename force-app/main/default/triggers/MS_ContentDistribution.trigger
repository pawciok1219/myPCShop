trigger MS_ContentDistribution on ContentVersion (after insert) {
    for(ContentVersion tempVersion : Trigger.New){
        insert new ContentDistribution(Name = tempVersion.Title, 
        ContentVersionId = tempVersion.Id,
        PreferencesAllowViewInBrowser= true);
    }

    // Set<Id> contentDocumentIds = new Set<Id>();

    // for(ContentVersion content : Trigger.New) {
    //     contentDocumentIds.add(content.ContentDocumentId);
    // }

    // List<ContentDocumentLink> CDLList = [Select Id,
    // LinkedEntityId,
    // ContentDocumentId,
    // ShareType,
    // Visibility
    // FROM ContentDocumentLink WHERE ContentDocumentId IN :contentDocumentIds];
    // for(ContentDocumentLink documentLink : CDLList){
    //     documentLink.ShareType = 'C';
    // }

    // update CDLList;

    // for(ContentDocumentLink documentLink : CDLList){
    //     documentLink.Visibility = 'AllUsers';
    // }

    // update CDLList;

}