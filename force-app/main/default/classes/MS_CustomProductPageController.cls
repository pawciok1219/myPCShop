public without sharing class MS_CustomProductPageController {

    @AuraEnabled(cacheable=true)
    public static List<ContentDocumentLink> getProductImages(String recordId){
        String query = 'SELECT Id, LinkedEntityId, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId = :recordId';
        return Database.query(query);
    }

    @AuraEnabled
    public static List<ProductReview__c> getAllReviews(String productId) {
        return [
            SELECT
                Id,
                Name,
                Comment__c,
                Rating__c,
                LastModifiedDate,
                CreatedDate,
                CreatedBy.Name,
                CreatedBy.PictureUrl__c,
                CreatedBy.SmallPhotoUrl
            FROM
                ProductReview__c
            WHERE
                Product__c =:productId AND Accepted__c = True
            ORDER BY
                CreatedDate DESC
        ];
    }

    // @AuraEnabled(cacheable=true)
    // public static Boolean checkUserHaveProductReview(Id userID, Id productId){
    //     List<ProductReview__c> userReviews = [SELECT Id, CreatedBy.Id FROM ProductReview__c WHERE CreatedBy.Id = :userID AND Product__c = :productId];
    //     if(userReviews.size() > 0){
    //         return true;
    //     }
    //     return false;
    // }

    @AuraEnabled(cacheable=true)
    public static List<ProductReview__c> checkUserHaveProductReview(Id userID, Id productId){
        return [SELECT Id, CreatedBy.Id, Accepted__c FROM ProductReview__c WHERE CreatedBy.Id = :userID AND Product__c = :productId];
 
    }

    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getProductOverallRating(String recordId){
        return [SELECT COUNT(Id) numberOfReviews, AVG(Rating__c) overallAverage FROM ProductReview__c WHERE Product__c = :recordId AND Accepted__c = True];
    }

    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getProductPrice(String recordId){
        return  [SELECT UnitPrice FROM PricebookEntry WHERE Product2Id =:recordId];
    }

}