public without sharing class MS_ProductCustomerPortal {

    @AuraEnabled(cacheable = true)
    public static List<PricebookEntry> getLatestProducts(Integer offsetNumber) {
         return [SELECT Product2.Id, Product2.Name, Product2.Model__c, Product2.Family, Product2.Producer__c, Product2.DisplayUrl, Product2.CreatedDate, Product2.IsActive, Product2.Available__c, UnitPrice FROM PricebookEntry
         WHERE Product2.CreatedDate >= LAST_N_DAYS:30 AND Product2.IsActive=true LIMIT 3 OFFSET :offsetNumber];
    }

    @AuraEnabled(cacheable = true)
    public static List<AggregateResult> getNumberOfRecords() {
         return [SELECT COUNT(Id) totalRecords FROM Product2 WHERE CreatedDate >= LAST_N_DAYS:30 AND Product2.IsActive=true];
    }

}