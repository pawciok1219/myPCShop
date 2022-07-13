trigger MS_ContentDocumentShareSetByRecord on ContentDocumentLink (after insert) {
    // List <ContentDocumentLink> contentDocumentLinkList = new List<ContentDocumentLink>();

    // Id documentId;
    
    // for(ContentDocumentLink documentLink: Trigger.New){
    //     documentId = documentLink.Id;
    // }

    // ContentDocumentLink contentDocumentLinkObject = [SELECT Id, ShareType, Visibility FROM ContentDocumentLink WHERE Id =: documentId];

    // contentDocumentLinkObject.ShareType = 'V';
    // contentDocumentLinkObject.Visibility = 'AllUsers';

    // update contentDocumentLinkObject;
}