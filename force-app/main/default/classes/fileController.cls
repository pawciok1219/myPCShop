public with sharing class fileController {
    @AuraEnabled(cacheable=true)
    public static List<ContentVersion> getVersionFiles(String recordId){
            return [
		SELECT
		Id,
        Title,
        ContentDocumentId,
        FileType, 
		ContentSize,
		FileExtension,
		VersionNumber,
		CreatedDate,
		VersionData,
                FirstPublishLocationId
		FROM ContentVersion
		WHERE FirstPublishLocationId =:recordId
			ORDER BY CreatedDate DESC
		];
    }

    @AuraEnabled
    public static Boolean haveDisplayUrl(String recordId, String url){
            List <Product2> tempProduct = [SELECT DisplayUrl FROM Product2 WHERE Id =:recordId AND DisplayUrl =:url];
            if(tempProduct.isEmpty()){
                return false;
            }else {
                return true;
            }
    }
}