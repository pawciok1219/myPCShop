public without sharing class MS_CaseFormController {

    @AuraEnabled(cacheable = true)
    public static Map<Id, String> getProductsForUser(Id userId){
        Map<Id, String> mapOfProducts = new Map<Id, String>();
        List<Order> orderList = MS_ShoppingCartController.getUserOrders(userId);
        if(orderList.size() != 0){
            List<OrderItem> orderItemList = new List<OrderItem>();
            orderItemList = [ SELECT Product2.Id, Product2.Name FROM OrderItem WHERE OrderId IN :orderList ];
            for(OrderItem tempItem : orderItemList){
                mapOfProducts.put(tempItem.Product2.Id, tempItem.Product2.Name);
            }
            return mapOfProducts;
        }
        else{
            return mapOfProducts;
        }
    }

    @AuraEnabled
    public static void addFilesToCase(Id caseId, List<Id> filesId){
        List<ContentDocumentLink> contentVersionList = [SELECT Id, LinkedEntityId FROM ContentDocumentLink WHERE Id IN :filesId];
        for(ContentDocumentLink tempContent : contentVersionList){
            tempContent.LinkedEntityId = caseId;
        }
        Database.update(contentVersionList);
    }

    @AuraEnabled
    public static String uploadFile(String base64, String filename, String recordId) {
          ContentVersion cv = createContentVersion(base64, filename);
          ContentDocumentLink cdl = createContentLink(cv.Id, recordId);
          if (cv == null || cdl == null) { return null; }
          return cdl.Id;
    }

    private static ContentVersion createContentVersion(String base64, String filename) {
          ContentVersion cv = new ContentVersion();
          cv.VersionData = EncodingUtil.base64Decode(base64);
          cv.Title = filename;
          cv.PathOnClient = filename;
          try {
             insert cv;
             return cv;
           } catch(DMLException e) {
             return null;
           }
      }

    private static ContentDocumentLink createContentLink(String contentVersionId, String recordId) {
        if (contentVersionId == null || recordId == null) { return null; }
            ContentDocumentLink cdl = new ContentDocumentLink();
            cdl.ContentDocumentId = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: contentVersionId].ContentDocumentId;
            cdl.LinkedEntityId = recordId;
            cdl.ShareType = 'V';
        try {
            insert cdl;
            return cdl;
            } catch(DMLException e) {
                return null;
            }
    }

    @AuraEnabled
    public static void CaseAssign(Id CaseIds) {
            Database.DMLOptions dmo = new Database.DMLOptions();
            dmo.assignmentRuleHeader.useDefaultRule= true;          
            Case caseTemp=[select Id from Case where Id = :CaseIds];
            caseTemp.setOptions(dmo);
            update caseTemp;
    }

    @AuraEnabled(cacheable = true)
    public static List<Knowledge__DataCategorySelection> getQuestions(){
        return [SELECT Id, ParentId, Parent.Title, DataCategoryGroupName,Parent.Summary,Parent.Answer__c 
        FROM Knowledge__DataCategorySelection];
    }

}
