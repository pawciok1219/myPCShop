public with sharing class MS_ContentDistributionLinks {
    @AuraEnabled
    public static string getContentDownloadUrl(String contentVersionId){
        String contentDownloadUrlString = '';
        List<ContentDistribution> contentDownloadUrl = [SELECT ContentDownloadUrl FROM ContentDistribution WHERE ContentVersionId =:contentVersionId];
        for(ContentDistribution tempContentDistribution  : contentDownloadUrl){
            contentDownloadUrlString = tempContentDistribution.ContentDownloadUrl;
        }
        return contentDownloadUrlString;
    }
}
