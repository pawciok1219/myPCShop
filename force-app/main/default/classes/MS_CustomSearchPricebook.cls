public with sharing class MS_CustomSearchPricebook {
    @AuraEnabled(cacheable = true)
    public static List<Pricebook2> getPricebook(String pricebookName, Boolean isActive, Date startDatetime, Date endDatetime){
        List<String> conditions = new List<String>();
        String query = 'SELECT Id, Name, IsActive, Start_Date__c, End_Date__c FROM Pricebook2 ';
        if (String.isNotBlank(pricebookName)) {
            conditions.add('Name LIKE ' + '\'' + String.escapeSingleQuotes(pricebookName) + '%\'');
        }
        if (isActive != null) {
            conditions.add('IsActive = ' + isActive + ' ');
        }
        if (startDatetime != null) {
            conditions.add('Start_Date__c = ' + String.valueOf(startDatetime) + ' ');
        }
        if (endDatetime != null) {
            conditions.add('End_Date__c = ' + String.valueOf(endDatetime) + ' ');
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
