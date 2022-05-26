public with sharing class filePreviewAndDownloadController {
    @AuraEnabled(cacheable=true)
      public static Map<ID, ContentVersion> getRelatedFilesByRecordId(String recordId) {    
            List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recordId];
            List<ID> fileIDs = new List<ID>();
            for (ContentDocumentLink docLink : files) {
                fileIDs.add(docLink.ContentDocumentId);
            }
     
            List<ContentVersion> docs = [SELECT Id,ContentDocumentId, FileExtension, Title 
                FROM ContentVersion WHERE ContentDocumentId IN : fileIDs];
            Map<Id, ContentVersion> mapIdTitle = new Map<Id, ContentVersion>(docs);
            return mapIdTitle;
     }

    @AuraEnabled
      public static void deleteContentDocument(String recordId) {Database.delete(recordId);}

    @AuraEnabled
      public static void updateDisplayURL(String recordId, String url){
         try {
            Product2 product = [SELECT Id, DisplayUrl  
                FROM Product2 
                WHERE Id= :recordId
                LIMIT 1];

            product.DisplayUrl = url;
            update product; 
         } catch (Exception e) {
             throw new AuraHandledException(e.getMessage());
         }
     }

    @AuraEnabled
      public static void deleteAllFilesByRecordId(String recordId){
        List<ContentDocumentLink> files = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recordId];
        if(files.size() > 0) {
            delete files; 
        }  
     }

     @AuraEnabled
     public static String getStandardPricebookId(){
          Pricebook2 pricebook = [SELECT Id FROM Pricebook2 WHERE Name='Standard Price Book' LIMIT 1];
          return pricebook.Id;
     }
}