public with sharing class MS_CustomSearchProduct {

    @AuraEnabled(cacheable = true)
    public static List<Product2> getProducts(String productName, String model, String productCode, String producer, String family){
        List<String> conditions = new List<String>();
        String query = 'SELECT Id, Name, Model__c, Producer__c, ProductCode, Available__c, Family FROM Product2 ';
        if (String.isNotBlank(productName)) {
            conditions.add('Name LIKE ' + '\'' + String.escapeSingleQuotes(productName) + '%\'');
        }
        if (String.isNotBlank(model)) {
            conditions.add('Model__c LIKE ' + '\'' + String.escapeSingleQuotes(model) + '%\'');
        }
        if (String.isNotBlank(productCode)) {
            conditions.add('ProductCode LIKE ' + '\'' + String.escapeSingleQuotes(productCode) + '%\'');
        }
        if (String.isNotBlank(producer) && producer != 'Other') {
            conditions.add('Producer__c LIKE ' + '\'' + String.escapeSingleQuotes(producer) + '%\'');
        }
        if (String.isNotBlank(family) && family != 'None') {
            conditions.add('Family LIKE ' + '\'' + String.escapeSingleQuotes(family) + '%\'');
        }

        if (conditions.size() > 0) {
            query += 'WHERE ' + conditions[0];
            for (Integer i = 1; i < conditions.size(); i++) {
                query += ' AND ' + conditions[i];
            }
        }
        return Database.query(query);
    }
}